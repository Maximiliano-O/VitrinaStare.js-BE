import mongoose from "mongoose";

// Schema for tracking verification status of a release by a specific reviewer
const verificationSchema = new mongoose.Schema({
  // The ID of the release being reviewed
  releaseID: {
    type: String,
    required: true,
  },

  // The ID of the user assigned to review the release
  reviewerID: {
    type: String,
    required: true,
  },

  // Has the reviewer already reviewed the release?
  isReviewed: {
    type: Boolean,
    default: false,
    required: true,
  },

  // Did the reviewer mark the release as safe?
  isSafe: {
    type: Boolean,
    default: false,
    required: true,
  },

  // Optional comments provided by the reviewer
  additionalComments: {
    type: String,
    default: "",
  },

  // When the review was submitted
  reviewDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Export schema for embedding
export { verificationSchema };

export default mongoose.model("Verification", verificationSchema);
