import express from "express";
import repositorySchema from "../models/repository.js";
import Release from "../models/release.js";
import sendResponse from "../utils/sendResponse.js";

const router = express.Router();

// ================================ CRUD ==================================== //

// Create repository
router.post("/repository", async (req, res) => {
  try {
    const { userID, author, title, repositoryUrl } = req.body;
    if (!userID || !author || !title || !repositoryUrl) {
      return sendResponse(res, 400, "Missing required fields.");
    }

    const repository = new repositorySchema(req.body);
    const savedRepo = await repository.save();
    return sendResponse(res, 201, "Repository created successfully.", savedRepo);
  } catch (error) {
    return sendResponse(res, 500, "Failed to create repository.", error);
  }
});

// Get all repositories
router.get("/repository", async (req, res) => {
  try {
    const repos = await repositorySchema.find();
    return sendResponse(res, 200, "Repositories retrieved successfully.", repos);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve repositories.", error);
  }
});

// Get a repository by ID
router.get("/repository/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const repo = await repositorySchema.findById(id);
    if (!repo) {
      return sendResponse(res, 404, `Repository with ID ${id} not found.`);
    }
    return sendResponse(res, 200, "Repository retrieved successfully.", repo);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve repository.", error);
  }
});

// Update repository
router.put("/repository/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedRepo = await repositorySchema.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true }
    );
    if (!updatedRepo) {
      return sendResponse(res, 404, `Repository with ID ${id} not found.`);
    }
    return sendResponse(res, 200, "Repository updated successfully.", updatedRepo);
  } catch (error) {
    return sendResponse(res, 500, "Failed to update repository.", error);
  }
});

// Get repositories by userID
router.get("/repository/user/:userID", async (req, res) => {
  const { userID } = req.params;
  try {
    const repos = await repositorySchema.find({ userID });
    return sendResponse(res, 200, "Repositories retrieved by user ID.", repos);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve repositories by user ID.", error);
  }
});

// ================================ Tags ==================================== //

// Get all unique tags from repositories
router.get("/unique-tags", async (req, res) => {
  try {
    const result = await repositorySchema.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: null, uniqueTags: { $addToSet: "$tags" } } },
    ]);
    return sendResponse(res, 200, "Unique tags retrieved.", result[0]?.uniqueTags || []);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve unique tags.", error);
  }
});

// ============================== Ratings =================================== //

// Add or update rating for a repository
router.post("/repository/:id/ratings", async (req, res) => {
  const { id } = req.params;
  const { userId, rating } = req.body;

  if (!userId || typeof rating !== "number") {
    return sendResponse(res, 400, "Missing or invalid rating data.");
  }

  try {
    const repository = await repositorySchema.findById(id);
    if (!repository) {
      return sendResponse(res, 404, `Repository with ID ${id} not found.`);
    }

    const existingIndex = repository.ratings.findIndex((r) => r.userId === userId);
    if (existingIndex !== -1) {
      repository.ratings.splice(existingIndex, 1);
    }

    repository.ratings.push({ userId, rating });

    const totalRating = repository.ratings.reduce((sum, r) => sum + r.rating, 0);
    repository.totalRating = totalRating / repository.ratings.length;

    await repository.save();
    return sendResponse(res, 200, "Rating added or updated successfully.", repository);
  } catch (error) {
    return sendResponse(res, 500, "Failed to add or update rating.", error);
  }
});

// Delete a rating from a repository
router.delete("/repository/:id/ratings", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return sendResponse(res, 400, "Missing userId for rating deletion.");
  }

  try {
    const repository = await repositorySchema.findById(id);
    if (!repository) {
      return sendResponse(res, 404, `Repository with ID ${id} not found.`);
    }

    const existingIndex = repository.ratings.findIndex((r) => r.userId === userId);
    if (existingIndex === -1) {
      return sendResponse(res, 404, "Rating not found for given userId.");
    }

    repository.ratings.splice(existingIndex, 1);

    const totalRating = repository.ratings.reduce((sum, r) => sum + r.rating, 0);
    repository.totalRating = repository.ratings.length > 0
      ? totalRating / repository.ratings.length
      : 0;

    await repository.save();
    return sendResponse(res, 200, "Rating deleted successfully.", repository);
  } catch (error) {
    return sendResponse(res, 500, "Failed to delete rating.", error);
  }
});

// Get all ratings for a repository
router.get("/repository/:id/ratings", async (req, res) => {
  const { id } = req.params;
  try {
    const repository = await repositorySchema.findById(id);
    if (!repository) {
      return sendResponse(res, 404, `Repository with ID ${id} not found.`);
    }
    return sendResponse(res, 200, "Ratings retrieved successfully.", repository.ratings);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve ratings.", error);
  }
});

// =========================== Verification ================================= //

// Verify repositories based on verified releases
router.post("/repository/verify", async (req, res) => {
  try {
    const verifiedReleases = await Release.find({ verified: true });
    if (!verifiedReleases.length) {
      return sendResponse(res, 400, "No verified releases found.");
    }

    const repositoryIDs = verifiedReleases.map((r) => r.repositoryID);
    await repositorySchema.updateMany(
      { _id: { $in: repositoryIDs }, verified: false },
      { $set: { verified: true } }
    );

    return sendResponse(res, 200, "Repositories verified successfully.");
  } catch (error) {
    console.error("Error verifying repositories:", error);
    return sendResponse(res, 500, "Failed to verify repositories.", error);
  }
});

export default router;
