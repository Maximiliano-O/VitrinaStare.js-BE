import mongoose from "mongoose";

// Schema for individual comments linked to a repository
const commentSchema = new mongoose.Schema({
  // ID of the user who wrote the comment
  userID: {
    type: String,
    required: true,
  },

  // ID of the repository the comment is associated with
  repositoryID: {
    type: String,
    required: true,
  },

  // Name of the repository
  repoName: {
    type: String,
    required: true,
  },

  // Display username of the commenter
  username: {
    type: String,
    required: true,
  },

  // Optional profile picture or avatar URL for the commenter
  usernameImageURL: {
    type: String,
    default: "",
  },

  // Date the comment was posted
  date: {
    type: Date,
    default: Date.now,
  },

  // Actual text content of the comment
  body: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("Comment", commentSchema);
