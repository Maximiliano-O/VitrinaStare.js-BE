import express from "express";
import verificationSchema from "../models/verification.js";
import sendResponse from "../utils/sendResponse.js";

const router = express.Router();

// =========================== CRUD ================================ //

// Create a verification entry
router.post("/verification", async (req, res) => {
  try {
    const verification = new verificationSchema(req.body);
    const savedVerification = await verification.save();
    return sendResponse(res, 201, "Verification entry created successfully.", savedVerification);
  } catch (error) {
    return sendResponse(res, 500, "Failed to create verification entry.", error);
  }
});

// Get all verification entries
router.get("/verification", async (req, res) => {
  try {
    const verifications = await verificationSchema.find();
    return sendResponse(res, 200, "Verification entries retrieved successfully.", verifications);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve verification entries.", error);
  }
});

// Get a specific verification entry by ID
router.get("/verification/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const verification = await verificationSchema.findById(id);
    if (!verification) {
      return sendResponse(res, 404, `Verification entry with ID ${id} not found.`);
    }
    return sendResponse(res, 200, "Verification entry retrieved successfully.", verification);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve verification entry.", error);
  }
});

// Delete a verification entry by ID
router.delete("/verification/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await verificationSchema.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return sendResponse(res, 404, `Verification entry with ID ${id} not found.`);
    }
    return sendResponse(res, 200, "Verification entry deleted successfully.", result);
  } catch (error) {
    return sendResponse(res, 500, "Failed to delete verification entry.", error);
  }
});

export default router;
