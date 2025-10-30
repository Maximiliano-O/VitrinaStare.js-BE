// user.routes.test.js
import request from "supertest";
import express from "express";
import bcrypt from "bcrypt";
import userRouter from "../../../src/routes/user.routes.js";
import User from "../../../src/models/user.js";
import sendResponse from "../../../src/utils/sendResponse.js";
import mongoose from "mongoose";

// Mock sendResponse
jest.mock("../../../src/utils/sendResponse.js", () => ({
  __esModule: true,
  default: jest.fn((res, status, message, data) =>
    res.status(status).json({ message, data })
  ),
}));



// Setup express app
const app = express();
app.use(express.json());
app.use("/", userRouter);

describe("User Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // ==================== POST /users ====================
  describe("POST /users", () => {
    it("should create a user with role 'user'", async () => {
      const userData = { email: "user@test.com", password: "pass123", username: "user1" };
      jest.spyOn(User.prototype, "save").mockResolvedValue({
        ...userData,
        _id: "u1",
        role: "user",
        toObject: function() { return { ...this }; },
      });


      await request(app).post("/users").send(userData);
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 201, "User created successfully.", expect.objectContaining({ role: "user" }));
    });

    it("should create a user with role 'admin' if email matches", async () => {
      const userData = { email: "vitrina.stare@gmail.com", password: "pass123", username: "admin1" };
      jest.spyOn(User.prototype, "save").mockResolvedValue({
        ...userData,
        _id: "u2",
        role: "admin",
        toObject: function() { return { ...this }; }, // <--- agregar esto
      });

      await request(app).post("/users").send(userData);
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 201, "User created successfully.", expect.objectContaining({ role: "admin" }));
    });

    it("should handle DB errors", async () => {
      jest.spyOn(User.prototype, "save").mockRejectedValue(new Error("DB Error"));
      await request(app).post("/users").send({ email: "x@test.com", password: "123", username: "x" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to create user.", expect.any(Error));
    });
  });

  // ==================== GET /users ====================
  describe("GET /users", () => {
    it("should retrieve all users", async () => {
      jest.spyOn(User, "find").mockResolvedValue([{ username: "user1" }]);
      await request(app).get("/users");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "User list retrieved successfully.", expect.any(Array));
    });

    it("should handle DB errors", async () => {
      jest.spyOn(User, "find").mockRejectedValue(new Error("DB Error"));
      await request(app).get("/users");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to retrieve users.", expect.any(Error));
    });
  });

  // ==================== GET /users/:id ====================
  describe("GET /users/:id", () => {
    it("should retrieve a user by ID", async () => {
      jest.spyOn(User, "findById").mockResolvedValue({ username: "user1" });
      await request(app).get("/users/u1");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "User retrieved successfully.", expect.any(Object));
    });

    it("should return 404 if user not found", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(null);
      await request(app).get("/users/u2");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 404, "User not found.");
    });

    it("should handle DB errors", async () => {
      jest.spyOn(User, "findById").mockRejectedValue(new Error("DB Error"));
      await request(app).get("/users/u3");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to retrieve user.", expect.any(Error));
    });
  });

  // ==================== DELETE /users/:id ====================
  describe("DELETE /users/:id", () => {
    it("should delete a user successfully", async () => {
      jest.spyOn(User, "findByIdAndDelete").mockResolvedValue({ username: "user1" });
      await request(app).delete("/users/u1");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "User deleted successfully.", expect.any(Object));
    });

    it("should return 404 if user not found", async () => {
      jest.spyOn(User, "findByIdAndDelete").mockResolvedValue(null);
      await request(app).delete("/users/u2");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 404, "User not found.");
    });

    it("should handle DB errors", async () => {
      jest.spyOn(User, "findByIdAndDelete").mockRejectedValue(new Error("DB Error"));
      await request(app).delete("/users/u3");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to delete user.", expect.any(Error));
    });
  });

  // ==================== PUT /users/:id ====================
  describe("PUT /users/:id", () => {
    it("should update a user successfully", async () => {
      jest.spyOn(User, "findByIdAndUpdate").mockResolvedValue({ username: "userUpdated" });
      await request(app).put("/users/u1").send({ username: "userUpdated" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "User updated successfully.", expect.any(Object));
    });

    it("should return 404 if user not found", async () => {
      jest.spyOn(User, "findByIdAndUpdate").mockResolvedValue(null);
      await request(app).put("/users/u2").send({ username: "x" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 404, "User not found.");
    });

    it("should handle DB errors", async () => {
      jest.spyOn(User, "findByIdAndUpdate").mockRejectedValue(new Error("DB Error"));
      await request(app).put("/users/u3").send({ username: "x" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to update user.", expect.any(Error));
    });
  });

  // ==================== POST /login ====================
  describe("POST /login", () => {
    it("should login successfully with correct password", async () => {
      const user = { password: "hashed", username: "user1" };
      jest.spyOn(User, "findOne").mockResolvedValue(user);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      await request(app).post("/login").send({ email: "x@test.com", password: "123" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Login successful.", user);
    });

    it("should return 401 if password incorrect", async () => {
      const user = { password: "hashed", username: "user1" };
      jest.spyOn(User, "findOne").mockResolvedValue(user);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      await request(app).post("/login").send({ email: "x@test.com", password: "wrong" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 401, "Incorrect password.");
    });

    it("should return 404 if email not found", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);
      await request(app).post("/login").send({ email: "x@test.com", password: "123" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 404, "No user found with that email.");
    });

    it("should handle DB errors", async () => {
      jest.spyOn(User, "findOne").mockRejectedValue(new Error("DB Error"));
      await request(app).post("/login").send({ email: "x@test.com", password: "123" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Login failed due to server error.", expect.any(Error));
    });
  });

  // ==================== GitHub URL / Email Checks ====================
  describe("GitHub and Email endpoints", () => {
    it("should fetch GitHub URL by ID", async () => {
      jest.spyOn(User, "findById").mockResolvedValue({ urlGithubProfile: "http://github.com/x" });
      await request(app).get("/users/u1/urlGithubProfile");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "GitHub profile URL retrieved successfully.", "http://github.com/x");
    });

    it("should return 404 if user not found for GitHub URL", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(null);
      await request(app).get("/users/u2/urlGithubProfile");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 404, "User not found.");
    });

    it("should check GitHub URL in use", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue({ username: "user1" });
      await request(app).get("/users/github/http%3A%2F%2Fgithub.com%2Fx");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "GitHub URL is in use by a user.", expect.any(Object));
    });

    it("should return 404 if GitHub URL not found", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);
      await request(app).get("/users/github/http%3A%2F%2Fgithub.com%2Fx");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 404, "No user found with that GitHub URL.");
    });

    it("should check email in use", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue({ username: "user1" });
      jest.spyOn(User, "findOne").mockImplementation((query) => ({ select: jest.fn().mockResolvedValue({ username: "user1" }) }));
      await request(app).get("/users/email/x@test.com");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Email is associated with a user.", expect.any(Object));
    });

    it("should return 404 if email not found", async () => {
      jest.spyOn(User, "findOne").mockImplementation((query) => ({ select: jest.fn().mockResolvedValue(null) }));
      await request(app).get("/users/email/x@test.com");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 404, "No user found with that email.");
    });
  });

  // ==================== Random sample ====================
  describe("GET /users/random/:id/:n", () => {
    it("should fetch random user sample", async () => {
      jest.spyOn(mongoose.Types, "ObjectId").mockImplementation((id) => id);
      jest.spyOn(User, "aggregate").mockResolvedValue([{ username: "user1" }]);
      await request(app).get("/users/random/u1/1");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Random user sample retrieved.", expect.any(Array));
    });

    it("should handle DB errors", async () => {
      jest.spyOn(User, "aggregate").mockRejectedValue(new Error("DB Error"));
      await request(app).get("/users/random/u1/1");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to fetch random users.", expect.any(Error));
    });
  });
});
