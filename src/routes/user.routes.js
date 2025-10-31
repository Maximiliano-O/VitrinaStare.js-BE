import express from "express";
import userSchema from "../models/user.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import sendResponse from "../utils/sendResponse.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ============================== CRUD ====================================== //


// Create user
router.post("/users", async (req, res) => {
  try {
    const { email } = req.body;

    // Force role assignment based on email
    if (email && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
      req.body.role = "admin";
    } else {
      req.body.role = "user"; // just in case someone tries to inject role in the request
    }

    const user = new userSchema(req.body);
    const savedUser = await user.save();

    // Remove password before sending back the response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    return sendResponse(res, 201, "User created successfully.", savedUser);
  } catch (error) {
    return sendResponse(res, 500, "Failed to create user.", error);
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const userList = await userSchema.find();
    return sendResponse(res, 200, "User list retrieved successfully.", userList);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve users.", error);
  }
});

// Get a user by ID
router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userSchema.findById(id);
    if (!user) {
      return sendResponse(res, 404, "User not found.");
    }
    return sendResponse(res, 200, "User retrieved successfully.", user);
  } catch (error) {
    return sendResponse(res, 500, "Failed to retrieve user.", error);
  }
});

// Delete a user by ID
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userSchema.findByIdAndDelete(id);
    if (!result) {
      return sendResponse(res, 404, "User not found.");
    }
    return sendResponse(res, 200, "User deleted successfully.", result);
  } catch (error) {
    return sendResponse(res, 500, "Failed to delete user.", error);
  }
});

// Update a user by ID
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await userSchema.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      return sendResponse(res, 404, "User not found.");
    }
    return sendResponse(res, 200, "User updated successfully.", updatedUser);
  } catch (error) {
    return sendResponse(res, 500, "Failed to update user.", error);
  }
});

// ============================= Auth ======================================= //

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userSchema.findOne({ email });
    if (!user) {
      return sendResponse(res, 404, "No user found with that email.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      return sendResponse(res, 200, "Login successful.", user);
    } else {
      return sendResponse(res, 401, "Incorrect password.");
    }
  } catch (error) {
    return sendResponse(res, 500, "Login failed due to server error.", error);
  }
});

// =================== GitHub/Email Utilities =============================== //

// Fetch GitHub URL for a specific user by ID
router.get("/users/:id/urlGithubProfile", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userSchema.findById(id, "urlGithubProfile");
    if (user) {
      return sendResponse(res, 200, "GitHub profile URL retrieved successfully.", user.urlGithubProfile);
    } else {
      return sendResponse(res, 404, "User not found.");
    }
  } catch (error) {
    return sendResponse(res, 500, "Failed to fetch GitHub profile URL.", error);
  }
});

// Check if a GitHub URL is used by a user
router.get("/users/github/:githubUrl", async (req, res) => {
  const githubUrl = decodeURIComponent(req.params.githubUrl);
  try {
    const user = await userSchema.findOne({ urlGithubProfile: githubUrl });
    if (user) {
      return sendResponse(res, 200, "GitHub URL is in use by a user.", user);
    } else {
      return sendResponse(res, 404, "No user found with that GitHub URL.");
    }
  } catch (error) {
    return sendResponse(res, 500, "Failed to check GitHub URL.", error);
  }
});

// Check if an email is used by a user
router.get("/users/email/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await userSchema.findOne({ email }).select("-password");
    if (user) {
      return sendResponse(res, 200, "Email is associated with a user.", user);
    } else {
      return sendResponse(res, 404, "No user found with that email.");
    }
  } catch (error) {
    return sendResponse(res, 500, "Failed to check email.", error);
  }
});

// ==================== Verification-related ================================ //

// Fetch a random sample of users, excluding one
router.get("/users/random/:id/:n", async (req, res) => {
  const { id, n } = req.params;
  try {
    const userList = await userSchema.aggregate([
      { $match: { _id: { $ne: mongoose.Types.ObjectId(id) } } },
      { $sample: { size: Number.parseInt(n) } },
    ]);
    return sendResponse(res, 200, "Random user sample retrieved.", userList);
  } catch (error) {
    return sendResponse(res, 500, "Failed to fetch random users.", error);
  }
});

export default router;
