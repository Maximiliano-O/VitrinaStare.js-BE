// tests/unit/routes/verification.test.js
import request from "supertest";
import express from "express";
import verificationRouter from "../../../src/routes/verification.routes.js";
import Verification from "../../../src/models/verification.js";
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
app.use("/", verificationRouter);

describe("Verification Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // ==================== POST /verification ====================
  describe("POST /verification", () => {
    it("should create a verification entry successfully", async () => {
      const data = { releaseID: "r1", reviewerID: "u1" };
      jest.spyOn(Verification.prototype, "save").mockResolvedValue({ ...data, _id: "v1" });

      await request(app).post("/verification").send(data);

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        201,
        "Verification entry created successfully.",
        expect.objectContaining(data)
      );
    });

    it("should handle DB errors", async () => {
      jest.spyOn(Verification.prototype, "save").mockRejectedValue(new Error("DB Error"));
      await request(app).post("/verification").send({ releaseID: "r1", reviewerID: "u1" });

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        500,
        "Failed to create verification entry.",
        expect.any(Error)
      );
    });
  });

  // ==================== GET /verification ====================
  describe("GET /verification", () => {
    it("should retrieve all verification entries", async () => {
      jest.spyOn(Verification, "find").mockResolvedValue([{ _id: "v1", releaseID: "r1" }]);
      await request(app).get("/verification");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        200,
        "Verification entries retrieved successfully.",
        expect.any(Array)
      );
    });

    it("should handle DB errors", async () => {
      jest.spyOn(Verification, "find").mockRejectedValue(new Error("DB Error"));
      await request(app).get("/verification");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        500,
        "Failed to retrieve verification entries.",
        expect.any(Error)
      );
    });
  });

  // ==================== GET /verification/:id ====================
  describe("GET /verification/:id", () => {
    it("should retrieve verification entry by ID", async () => {
      jest.spyOn(Verification, "findById").mockResolvedValue({ _id: "v1", releaseID: "r1" });
      await request(app).get("/verification/v1");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        200,
        "Verification entry retrieved successfully.",
        expect.any(Object)
      );
    });

    it("should return 404 if entry not found", async () => {
      jest.spyOn(Verification, "findById").mockResolvedValue(null);
      await request(app).get("/verification/v2");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        404,
        "Verification entry with ID v2 not found."
      );
    });

    it("should handle DB errors", async () => {
      jest.spyOn(Verification, "findById").mockRejectedValue(new Error("DB Error"));
      await request(app).get("/verification/v3");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        500,
        "Failed to retrieve verification entry.",
        expect.any(Error)
      );
    });
  });

  // ==================== DELETE /verification/:id ====================
  describe("DELETE /verification/:id", () => {
    it("should delete verification entry successfully", async () => {
      jest.spyOn(Verification, "deleteOne").mockResolvedValue({ deletedCount: 1 });
      await request(app).delete("/verification/v1");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        200,
        "Verification entry deleted successfully.",
        expect.objectContaining({ deletedCount: 1 })
      );
    });

    it("should return 404 if entry not found", async () => {
      jest.spyOn(Verification, "deleteOne").mockResolvedValue({ deletedCount: 0 });
      await request(app).delete("/verification/v2");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        404,
        "Verification entry with ID v2 not found."
      );
    });

    it("should handle DB errors", async () => {
      jest.spyOn(Verification, "deleteOne").mockRejectedValue(new Error("DB Error"));
      await request(app).delete("/verification/v3");

      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        500,
        "Failed to delete verification entry.",
        expect.any(Error)
      );
    });
  });
});
