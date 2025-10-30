// repository.routes.test.js
import request from "supertest";
import express from "express";
import repositoryRouter from "../../../src/routes/repository.routes.js";
import Repository from "../../../src/models/repository.js";
import Release from "../../../src/models/release.js";
import sendResponse from "../../../src/utils/sendResponse.js";

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
app.use("/", repositoryRouter);

describe("Repository Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // ==================== POST /repository ====================
  describe("POST /repository", () => {
    it("should create a repository successfully", async () => {
      const repoData = { userID: "u1", author: "Max", title: "Test Repo", repositoryUrl: "http://github.com/test" };
      jest.spyOn(Repository.prototype, "save").mockResolvedValue({ ...repoData, _id: "r1" });

      await request(app).post("/repository").send(repoData);

      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 201, "Repository created successfully.", expect.objectContaining(repoData));
    });

    it("should return 400 if required fields are missing", async () => {
      await request(app).post("/repository").send({ title: "Missing Fields" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 400, "Missing required fields.");
    });

    it("should handle DB errors", async () => {
      jest.spyOn(Repository.prototype, "save").mockRejectedValue(new Error("DB Error"));
      const repoData = { userID: "u1", author: "Max", title: "Test Repo", repositoryUrl: "http://github.com/test" };
      await request(app).post("/repository").send(repoData);
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to create repository.", expect.any(Error));
    });
  });

  // ==================== GET /repository ====================
  describe("GET /repository", () => {
    it("should retrieve all repositories", async () => {
      jest.spyOn(Repository, "find").mockResolvedValue([{ title: "Repo1" }]);
      await request(app).get("/repository");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Repositories retrieved successfully.", expect.any(Array));
    });

    it("should handle DB errors", async () => {
      jest.spyOn(Repository, "find").mockRejectedValue(new Error("DB Error"));
      await request(app).get("/repository");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to retrieve repositories.", expect.any(Error));
    });
  });

  // ==================== GET /repository/:id ====================
  describe("GET /repository/:id", () => {
    it("should retrieve repository by ID", async () => {
      jest.spyOn(Repository, "findById").mockResolvedValue({ title: "Repo1" });
      await request(app).get("/repository/r1");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Repository retrieved successfully.", expect.any(Object));
    });

    it("should return 404 if repo not found", async () => {
      jest.spyOn(Repository, "findById").mockResolvedValue(null);
      await request(app).get("/repository/r2");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 404, "Repository with ID r2 not found.");
    });

    it("should handle DB errors", async () => {
      jest.spyOn(Repository, "findById").mockRejectedValue(new Error("DB Error"));
      await request(app).get("/repository/r3");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to retrieve repository.", expect.any(Error));
    });
  });

  // ==================== PUT /repository/:id ====================
  describe("PUT /repository/:id", () => {
    it("should update repository successfully", async () => {
      jest.spyOn(Repository, "findOneAndUpdate").mockResolvedValue({ title: "Updated Repo" });
      await request(app).put("/repository/r1").send({ title: "Updated Repo" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Repository updated successfully.", expect.any(Object));
    });

    it("should return 404 if repo not found", async () => {
      jest.spyOn(Repository, "findOneAndUpdate").mockResolvedValue(null);
      await request(app).put("/repository/r2").send({ title: "Updated Repo" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 404, "Repository with ID r2 not found.");
    });

    it("should handle DB errors", async () => {
      jest.spyOn(Repository, "findOneAndUpdate").mockRejectedValue(new Error("DB Error"));
      await request(app).put("/repository/r3").send({ title: "Updated Repo" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to update repository.", expect.any(Error));
    });
  });

  // ==================== GET /repository/user/:userID ====================
  describe("GET /repository/user/:userID", () => {
    it("should retrieve repositories by userID", async () => {
      jest.spyOn(Repository, "find").mockResolvedValue([{ userID: "u1" }]);
      await request(app).get("/repository/user/u1");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Repositories retrieved by user ID.", expect.any(Array));
    });

    it("should handle DB errors", async () => {
      jest.spyOn(Repository, "find").mockRejectedValue(new Error("DB Error"));
      await request(app).get("/repository/user/u1");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to retrieve repositories by user ID.", expect.any(Error));
    });
  });

  // ==================== GET /unique-tags ====================
  describe("GET /unique-tags", () => {
    it("should retrieve unique tags", async () => {
      jest.spyOn(Repository, "aggregate").mockResolvedValue([{ uniqueTags: ["tag1", "tag2"] }]);
      await request(app).get("/unique-tags");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Unique tags retrieved.", ["tag1", "tag2"]);
    });

    it("should return empty array if no tags", async () => {
      jest.spyOn(Repository, "aggregate").mockResolvedValue([]);
      await request(app).get("/unique-tags");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Unique tags retrieved.", []);
    });

    it("should handle DB errors", async () => {
      jest.spyOn(Repository, "aggregate").mockRejectedValue(new Error("DB Error"));
      await request(app).get("/unique-tags");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to retrieve unique tags.", expect.any(Error));
    });
  });

  // ==================== Ratings ====================
  describe("POST /repository/:id/ratings", () => {
    it("should add a new rating", async () => {
      const repo = { ratings: [], save: jest.fn().mockResolvedValue(true) };
      jest.spyOn(Repository, "findById").mockResolvedValue(repo);

      await request(app).post("/repository/r1/ratings").send({ userId: "u1", rating: 4 });
      expect(repo.save).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Rating added or updated successfully.", repo);
    });

    it("should replace existing rating", async () => {
      const repo = { ratings: [{ userId: "u1", rating: 3 }], save: jest.fn().mockResolvedValue(true) };
      jest.spyOn(Repository, "findById").mockResolvedValue(repo);

      await request(app).post("/repository/r1/ratings").send({ userId: "u1", rating: 5 });
      expect(repo.ratings).toHaveLength(1);
      expect(repo.ratings[0].rating).toBe(5);
      expect(repo.save).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Rating added or updated successfully.", repo);
    });

    it("should return 400 if missing userId or rating", async () => {
      await request(app).post("/repository/r1/ratings").send({ rating: 3 });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 400, "Missing or invalid rating data.");
    });

    it("should return 404 if repo not found", async () => {
      jest.spyOn(Repository, "findById").mockResolvedValue(null);
      await request(app).post("/repository/r1/ratings").send({ userId: "u1", rating: 4 });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 404, "Repository with ID r1 not found.");
    });
  });

  describe("DELETE /repository/:id/ratings", () => {
    it("should delete rating successfully", async () => {
      const repo = { ratings: [{ userId: "u1", rating: 5 }], save: jest.fn().mockResolvedValue(true) };
      jest.spyOn(Repository, "findById").mockResolvedValue(repo);

      await request(app).delete("/repository/r1/ratings").send({ userId: "u1" });
      expect(repo.save).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Rating deleted successfully.", repo);
    });

    it("should handle deletion leaving 0 ratings", async () => {
      const repo = { ratings: [{ userId: "u1", rating: 5 }], save: jest.fn().mockResolvedValue(true) };
      jest.spyOn(Repository, "findById").mockResolvedValue(repo);

      await request(app).delete("/repository/r1/ratings").send({ userId: "u1" });
      expect(repo.totalRating).toBe(0);
    });

    it("should return 400 if missing userId", async () => {
      await request(app).delete("/repository/r1/ratings").send({});
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 400, "Missing userId for rating deletion.");
    });

    it("should return 404 if repo not found", async () => {
      jest.spyOn(Repository, "findById").mockResolvedValue(null);
      await request(app).delete("/repository/r1/ratings").send({ userId: "u1" });
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 404, "Repository with ID r1 not found.");
    });
  });

  describe("GET /repository/:id/ratings", () => {
    it("should get all ratings", async () => {
      const repo = { ratings: [{ userId: "u1", rating: 5 }] };
      jest.spyOn(Repository, "findById").mockResolvedValue(repo);

      await request(app).get("/repository/r1/ratings");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Ratings retrieved successfully.", repo.ratings);
    });

    it("should return 404 if repo not found", async () => {
      jest.spyOn(Repository, "findById").mockResolvedValue(null);
      await request(app).get("/repository/r1/ratings");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 404, "Repository with ID r1 not found.");
    });

    it("should handle DB errors", async () => {
      jest.spyOn(Repository, "findById").mockRejectedValue(new Error("DB Error"));
      await request(app).get("/repository/r1/ratings");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to retrieve ratings.", expect.any(Error));
    });
  });

  // ==================== POST /repository/verify ====================
  describe("POST /repository/verify", () => {
    beforeAll(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it("should verify repositories with verified releases", async () => {
      jest.spyOn(Release, "find").mockResolvedValue([{ repositoryID: "r1" }]);
      jest.spyOn(Repository, "updateMany").mockResolvedValue({ modifiedCount: 1 });

      await request(app).post("/repository/verify");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 200, "Repositories verified successfully.");
    });

    it("should return 400 if no verified releases", async () => {
      jest.spyOn(Release, "find").mockResolvedValue([]);
      await request(app).post("/repository/verify");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 400, "No verified releases found.");
    });

    it("should handle DB errors", async () => {
      jest.spyOn(Release, "find").mockRejectedValue(new Error("DB Error"));
      await request(app).post("/repository/verify");
      expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to verify repositories.", expect.any(Error));
    });
  });
});
