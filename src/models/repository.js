import mongoose from "mongoose";

// Schema for visualization repositories in the system
const repositorySchema = new mongoose.Schema({
  // ID of the user who submitted the repository
  userID: {
    type: String,
    required: true,
  },

  // Name of the repository author (can differ from the user)
  author: {
    type: String,
    required: true,
  },

  // Title of the visualization project
  title: {
    type: String,
    required: true,
  },

  // Optional preview image URL
  imageURL: {
    type: String,
    default: "",
  },

  // Tags for filtering and categorizing the repository
  tags: [
    {
      type: String,
    },
  ],

  // Number of comments made on this repository
  totalComments: {
    type: Number,
    default: 0,
  },

  // Ratings provided by users (1–5 stars)
  ratings: [
    {
      userId: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
    },
  ],

  // Average rating value for the repository
  totalRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },

  // Internal name of the repository
  repositoryName: {
    type: String,
    required: true,
  },

  // Short description of the repository
  repositoryDesc: {
    type: String,
    default: "",
  },

  // Full documentation (e.g., markdown text)
  repositoryDoc: {
    type: String,
    default: "",
  },

  // License type (e.g., MIT, GPL, None)
  license: {
    type: String,
    default: "None",
  },

  // Public URL to the source code repository (e.g., GitHub)
  repositoryUrl: {
    type: String,
    required: true,
  },

  // Whether the repository has passed verification
  verified: {
    type: Boolean,
    default: false,
  },

  // Technologies used in the project (e.g., D3.js, Three.js)
  technology: {
    type: [String],
    default: [],
  },

  // Timestamp of the latest release (regardless of verification)
  latestReleaseDate: {
    type: Date,
  },

  // Timestamp of the latest verified release
  latestVerifiedReleaseDate: {
    type: Date,
  },
}, { timestamps: true });

export default mongoose.model("Repository", repositorySchema);
