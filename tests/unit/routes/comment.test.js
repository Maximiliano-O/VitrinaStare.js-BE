import request from "supertest";
import express from "express";
import commentRoutes from "../../../src/routes/comment.routes.js";
import Comment from "../../../src/models/comment.js";
import sendResponse from "../../../src/utils/sendResponse.js";

jest.setTimeout(10000);

// Mock de sendResponse
jest.mock("../../../src/utils/sendResponse.js", () => {
  return jest.fn((res, status, message, data) => {
    res.status(status).json({ message, data });
  });
});

// Mock del modelo Comment
jest.mock("../../../src/models/comment.js");

const app = express();
app.use(express.json());
app.use("/", commentRoutes);

describe("Comment Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  // ============================== POST /comments ============================== //
  describe("POST /comments", () => {
    it("should create a comment successfully", async () => {
      const mockComment = { save: jest.fn().mockResolvedValue({ _id: "123", body: "Hello" }) };
      Comment.mockImplementation(() => mockComment);

      await request(app).post("/comments").send({ body: "Hello" });

      expect(mockComment.save).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        201,
        "Comment created successfully.",
        { _id: "123", body: "Hello" }
      );
    });

    it("should handle errors when creating a comment", async () => {
      const mockComment = { save: jest.fn().mockRejectedValue(new Error("DB Error")) };
      Comment.mockImplementation(() => mockComment);

      await request(app).post("/comments").send({ body: "Hello" });

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        500,
        "Failed to create comment.",
        expect.any(Error)
      );
    });
  });

  // ============================== GET /comments ============================== //
  describe("GET /comments", () => {
    it("should retrieve all comments", async () => {
      Comment.find.mockResolvedValue([{ _id: "1" }, { _id: "2" }]);

      await request(app).get("/comments");

      expect(Comment.find).toHaveBeenCalledWith();
      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        200,
        "Comments retrieved successfully.",
        [{ _id: "1" }, { _id: "2" }]
      );
    });

    it("should handle errors when retrieving comments", async () => {
      Comment.find.mockRejectedValue(new Error("DB Error"));

      await request(app).get("/comments");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        500,
        "Failed to retrieve comments.",
        expect.any(Error)
      );
    });
  });

  // ============================== GET /comments/:id ============================== //
  describe("GET /comments/:id", () => {
    it("should return a comment by ID", async () => {
      Comment.findById.mockResolvedValue({ _id: "123", body: "Test" });

      await request(app).get("/comments/123");

      expect(Comment.findById).toHaveBeenCalledWith("123");
      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        200,
        "Comment retrieved successfully.",
        { _id: "123", body: "Test" }
      );
    });

    it("should return 404 if comment not found", async () => {
      Comment.findById.mockResolvedValue(null);

      await request(app).get("/comments/123");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        404,
        "Comment with ID 123 not found."
      );
    });

    it("should handle errors", async () => {
      Comment.findById.mockRejectedValue(new Error("DB Error"));

      await request(app).get("/comments/123");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        500,
        "Failed to retrieve comment.",
        expect.any(Error)
      );
    });
  });

  // ============================== GET /comments/repository/:repositoryID ============================== //
  describe("GET /comments/repository/:repositoryID", () => {
    it("should return comments for a repository", async () => {
      Comment.find.mockResolvedValue([{ _id: "1" }]);

      await request(app).get("/comments/repository/repo123");

      expect(Comment.find).toHaveBeenCalledWith({ repositoryID: "repo123" });
      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        200,
        "Comments for repository retrieved successfully.",
        [{ _id: "1" }]
      );
    });

    it("should handle errors", async () => {
      Comment.find.mockRejectedValue(new Error("DB Error"));

      await request(app).get("/comments/repository/repo123");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        500,
        "Failed to retrieve comments for repository.",
        expect.any(Error)
      );
    });
  });

  // ============================== GET /comments/user/:userID ============================== //
  describe("GET /comments/user/:userID", () => {
    it("should return comments by user ID", async () => {
      Comment.find.mockResolvedValue([{ _id: "u1" }]);

      await request(app).get("/comments/user/user123");

      expect(Comment.find).toHaveBeenCalledWith({ authorID: "user123" });
      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        200,
        "Comments by user ID retrieved successfully.",
        [{ _id: "u1" }]
      );
    });

    it("should handle errors", async () => {
      Comment.find.mockRejectedValue(new Error("DB Error"));

      await request(app).get("/comments/user/user123");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        500,
        "Failed to retrieve comments by author.",
        expect.any(Error)
      );
    });
  });

  // ============================== DELETE /comments/:id ============================== //
  describe("DELETE /comments/:id", () => {
    it("should delete a comment successfully", async () => {
      Comment.findByIdAndDelete.mockResolvedValue({ _id: "del123" });

      await request(app).delete("/comments/del123");

      expect(Comment.findByIdAndDelete).toHaveBeenCalledWith("del123");
      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        200,
        "Comment deleted successfully.",
        { _id: "del123" }
      );
    });

    it("should return 404 if comment not found", async () => {
      Comment.findByIdAndDelete.mockResolvedValue(null);

      await request(app).delete("/comments/del123");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        404,
        "Comment with ID del123 not found."
      );
    });

    it("should handle errors", async () => {
      Comment.findByIdAndDelete.mockRejectedValue(new Error("DB Error"));

      await request(app).delete("/comments/del123");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        500,
        "Failed to delete comment.",
        expect.any(Error)
      );
    });
  });

  // ============================== PUT /comments/:id ============================== //
  describe("PUT /comments/:id", () => {
    it("should update a comment successfully", async () => {
      const updated = { _id: "upd123", body: "Updated" };
      Comment.findByIdAndUpdate.mockResolvedValue(updated);

      await request(app)
        .put("/comments/upd123")
        .send({ body: "Updated" });

      expect(Comment.findByIdAndUpdate).toHaveBeenCalledWith(
        "upd123",
        { authorID: undefined, repositoryID: undefined, repoName: undefined, username: undefined, body: "Updated" },
        { new: true }
      );
      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        200,
        "Comment updated successfully.",
        updated
      );
    });

    it("should return 404 if comment not found", async () => {
      Comment.findByIdAndUpdate.mockResolvedValue(null);

      await request(app)
        .put("/comments/upd123")
        .send({ body: "Updated" });

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        404,
        "Comment with ID upd123 not found."
      );
    });

    it("should handle errors", async () => {
      Comment.findByIdAndUpdate.mockRejectedValue(new Error("DB Error"));

      await request(app)
        .put("/comments/upd123")
        .send({ body: "Updated" });

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        500,
        "Failed to update comment.",
        expect.any(Error)
      );
    });
  });
});
