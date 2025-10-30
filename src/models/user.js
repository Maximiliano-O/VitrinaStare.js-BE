import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Schema for user accounts in the system
const userSchema = new mongoose.Schema({
  // User's email address (must be unique and valid)
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },

  // Hashed password
  password: {
    type: String,
    required: true,
  },

  // Unique display name for the user
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },

  // Optional profile image URL
  imageURL: {
    type: String,
    trim: true,
  },

  // Most recent post content or status update by the user
  latestPost: {
    type: String,
    default: "",
  },

  // Link to the user’s GitHub profile
  urlGithubProfile: {
    type: String,
    trim: true,
  },

  // Short user bio or description
  description: {
    type: String,
    trim: true,
  },

  // Total number of comments posted by the user
  totalComments: {
    type: Number,
    default: 0,
    min: 0,
  },

  // User role (e.g., 'admin', 'user')
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
}, { timestamps: true });

// Hash password before saving (on create or password update)
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt); // missing await fixed
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model("User", userSchema);
