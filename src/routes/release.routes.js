import express from "express";
import releaseSchema from "../models/release.js";
import sendResponse from "../utils/sendResponse.js";

const router = express.Router();

// ============================== CRUD ====================================== //

// Create a release
router.post("/release", async (req, res) => {
    try {
        const release = new releaseSchema(req.body);
        const savedRelease = await release.save();
        return sendResponse(res, 201, "Release created successfully.", savedRelease);
    } catch (error) {
        return sendResponse(res, 500, "Failed to create release.", error);
    }
});

// Get all releases
router.get("/release", async (req, res) => {
    try {
        const releases = await releaseSchema.find();
        return sendResponse(res, 200, "Releases retrieved successfully.", releases);
    } catch (error) {
        return sendResponse(res, 500, "Failed to retrieve releases.", error);
    }
});

// Get release by ID
router.get("/release/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const release = await releaseSchema.findById(id);
        return sendResponse(res, 200, "Release retrieved successfully.", release);
    } catch (error) {
        return sendResponse(res, 500, "Failed to retrieve release.", error);
    }
});


// Get all releases for a repository from repositoryID
router.get("/release/repository/:repositoryID", async (req, res) => {
    const { repositoryID } = req.params;
    try {
        const releases = await releaseSchema.find({ repositoryID });
        return sendResponse(res, 200, "Releases retrieved successfully.", releases);
    } catch (error) {
        return sendResponse(res, 500, "Failed to retrieve releases for repository.", error);
    }
});

// Delete a release
router.delete("/release/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await releaseSchema.deleteOne({ _id: id });
        return sendResponse(res, 200, "Release deleted successfully.", result);
    } catch (error) {
        return sendResponse(res, 500, "Failed to delete release.", error);
    }
});

// Update release fields
router.put("/release/:id", async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const result = await releaseSchema.updateOne(
            { _id: id }, 
            { $set: updateData }
        );
        return sendResponse(res, 200, "Release updated successfully.", result);
    } catch (error) {
        return sendResponse(res, 500, "Failed to update release.", error);
    }
});

// =========================== Status/Verification ========================== //

// Add status to release
router.post("/releases/:id/statuses", async (req, res) => {
    try {
        const release = await releaseSchema.findById(req.params.id);
        release.statuses.push(req.body);
        const updated = await release.save();
        return sendResponse(res, 200, "Status added to release.", updated);
    } catch (error) {
        return sendResponse(res, 500, "Failed to add status.", error);
    }
});

// Push new status
router.post("/release/:id/status", async (req, res) => {
    try {
        const updated = await releaseSchema.findOneAndUpdate(
            { _id: req.params.id },
            { $push: { statuses: req.body } },
            { new: true }
        );
        return sendResponse(res, 200, "Status added to release.", updated);
    } catch (error) {
        return sendResponse(res, 500, "Failed to add status to release.", error);
    }
});

// Get status ID by reviewer
router.get("/release/:releaseId/:reviewerId/status", async (req, res) => {
    try {
        const release = await releaseSchema.findById(req.params.releaseId);
        if (!release) return sendResponse(res, 404, "Release not found.");
        const status = release.statuses.find(s => s.reviewerID === req.params.reviewerId);
        if (!status) return sendResponse(res, 404, "Status not found.");
        return sendResponse(res, 200, "Status retrieved successfully.", { statusId: status._id });
    } catch (error) {
        return sendResponse(res, 500, "Failed to retrieve status.", error);
    }
});



// NEEDS REVIEW

// Update specific status inside a release (includes verification logic)
router.put("/release/:id/status/:statusId", async (req, res) => {
    try {
        const release = await releaseSchema.findOne({ _id: req.params.id });
        const status = release.statuses.id(req.params.statusId);
        status.set(req.body);

        // Case: Mayority rejects the verification
        const countRejected = release.statuses.reduce(
            (sum, s) => sum + (s.isReviewed && !s.isSafe ? 1 : 0), 0
        );
        if (countRejected > release.statuses.length / 2) {
            await releaseSchema.deleteOne({ _id: req.params.id });
            return sendResponse(res, 200, "Release deleted due to majority rejection.");
        }

        // Case: Majority aproves the verification
        const countSafe = release.statuses.reduce((sum, s) => sum + (s.isSafe ? 1 : 0), 0);
        release.verified = countSafe > release.statuses.length / 2;

        const updated = await release.save();
        return sendResponse(res, 200, "Status updated and verification evaluated.", updated);
    } catch (error) {
        return sendResponse(res, 500, "Failed to update status.", error);
    }
});



// Get latest verified release of a repository
router.get("/release/latest/:repositoryID", async (req, res) => {
    try {
        const latest = await releaseSchema
            .findOne({ verified: true, repositoryID: req.params.repositoryID })
            .sort({ created_at: -1 });
        return sendResponse(res, 200, "Latest verified release retrieved.", latest);
    } catch (error) {
        return sendResponse(res, 500, "Failed to retrieve latest verified release.", error);
    }
});

export default router;
