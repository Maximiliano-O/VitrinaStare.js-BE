import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import sendResponse from "./utils/sendResponse.js";

import commentRoutes from "./routes/comment.routes.js";
import emailRoutes from "./routes/email.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import releaseRoutes from "./routes/release.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import userRoutes from "./routes/user.routes.js";
import githubRoute from "./routes/github.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

// Middlewares
app.use(cors());
app.use(express.json());

// Mount routers under /api
app.use("/api", commentRoutes);
app.use("/api", emailRoutes);
app.use("/api", verificationRoutes);
app.use("/api", releaseRoutes);
app.use("/api", repositoryRoutes);
app.use("/api", userRoutes);
app.use("/api", githubRoute);

// 404 handler for unknown /api routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return sendResponse(res, 404, "API endpoint not found");
  }
  next();
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

// Async function to connect to DB and start the server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    app.listen(port, () => {
      console.log("Server listening on port", port);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit process with failure
  }
}

startServer();
