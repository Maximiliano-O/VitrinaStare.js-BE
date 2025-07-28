import express from "express";
import commentSchema from "../models/comment.js";
import sendResponse from "../utils/sendResponse.js";

const router = express.Router();

// ============================== CRUD ============================== //

// Create a comment
router.post("/comments", async (req, res) => {
  try {
    const comment = new commentSchema(req.body);
    const savedComment = await comment.save();
    return sendResponse(res, 201, "Comment created successfully.", savedComment);
  } catch (error) {
    return sendResponse(res, 500, "Failed to create comment.", error);
  }
});

// Get all comments
router.get("/comments", async (req, res) => {
  try {
    const comments = await commentSchema.find();
    return sendResponse(res, 200, "Comments retrieved successfully.", comments);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve comments.", error);
  }
});

// Get a comment by ID
router.get("/comments/:id", async (req, res) => {
  try {
    const comment = await commentSchema.findById(req.params.id);
    if (!comment) {
      return sendResponse(res, 404, `Comment with ID ${req.params.id} not found.`);
    }
    return sendResponse(res, 200, "Comment retrieved successfully.", comment);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve comment.", error);
  }
});

// Get comments by repository ID
router.get("/comments/repository/:repositoryID", async (req, res) => {
  try {
    const comments = await commentSchema.find({ repositoryID: req.params.repositoryID });
    return sendResponse(res, 200, "Comments for repository retrieved successfully.", comments);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve comments for repository.", error);
  }
});

// Get comments by author ID
router.get("/comments/user/:userID", async (req, res) => {
  try {
    const comments = await commentSchema.find({ authorID: req.params.authorID });
    return sendResponse(res, 200, "Comments by user ID retrieved successfully.", comments);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve comments by author.", error);
  }
});

// Delete a comment by ID
router.delete("/comments/:id", async (req, res) => {
  try {
    const deletedComment = await commentSchema.findByIdAndDelete(req.params.id);
    if (!deletedComment) {
      return sendResponse(res, 404, `Comment with ID ${req.params.id} not found.`);
    }
    return sendResponse(res, 200, "Comment deleted successfully.", deletedComment);
  } catch (error) {
    return sendResponse(res, 500, "Failed to delete comment.", error);
  }
});

// Update a comment by ID
router.put("/comments/:id", async (req, res) => {
  try {
    const { authorID, repositoryID, repoName, username, body } = req.body;
    const updatedComment = await commentSchema.findByIdAndUpdate(
      req.params.id,
      { authorID, repositoryID, repoName, username, body },
      { new: true }
    );
    if (!updatedComment) {
      return sendResponse(res, 404, `Comment with ID ${req.params.id} not found.`);
    }
    return sendResponse(res, 200, "Comment updated successfully.", updatedComment);
  } catch (error) {
    return sendResponse(res, 500, "Failed to update comment.", error);
  }
});

export default router;
