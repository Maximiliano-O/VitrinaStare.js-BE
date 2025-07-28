import mongoose from "mongoose";
import { verificationSchema } from "./verification.js";

// Schema for individual releases linked to a repository
const releaseSchema = new mongoose.Schema({
  // ID of the associated repository
  repositoryID: {
    type: String,
    required: true,
  },

  // Name or label for this release (e.g., "v1.0", "Initial draft")
  name: {
    type: String,
    required: true,
  },

  // Optional description of the release (changes, notes, etc.)
  description: {
    type: String,
    default: "",
  },

  // Date when the release was created (manual override)
  created_at: {
    type: Date,
    default: Date.now,
  },

  // Link to a live CodeSandbox instance for this release
  codesandbox_URL: {
    type: String,
    default: "",
  },

  // Whether this release has been verified by an admin or reviewer
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },

  // List of individual verification attempts and results
  statuses: [verificationSchema],

}, { timestamps: true });

export default mongoose.model("Release", releaseSchema);
