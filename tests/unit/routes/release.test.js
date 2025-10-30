// tests/unit/routes/release.test.js
import request from "supertest";
import express from "express";
import releaseRouter from "../../../src/routes/release.routes.js";
import releaseSchema from "../../../src/models/release.js";
import sendResponse from "../../../src/utils/sendResponse.js";

// ------------------ Mock sendResponse ------------------
jest.mock("../../../src/utils/sendResponse.js", () => ({
  __esModule: true,
  default: jest.fn((res, status, message, data) =>
    res.status(status).json({ message, data })
  ),
}));

describe("Release Routes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/", releaseRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------ CRUD ------------------
  it("POST /release - success", async () => {
    jest.spyOn(releaseSchema.prototype, "save").mockResolvedValue("savedRelease");
    await request(app).post("/release").send({ name: "release1" });
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      201,
      "Release created successfully.",
      "savedRelease"
    );
  });

  it("POST /release - failure", async () => {
    jest.spyOn(releaseSchema.prototype, "save").mockRejectedValue(new Error("fail"));
    await request(app).post("/release").send({});
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Failed to create release.",
      expect.any(Error)
    );
  });

  it("GET /release - success", async () => {
    jest.spyOn(releaseSchema, "find").mockResolvedValue(["r1", "r2"]);
    await request(app).get("/release");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      "Releases retrieved successfully.",
      ["r1", "r2"]
    );
  });

  it("GET /release - failure", async () => {
    jest.spyOn(releaseSchema, "find").mockRejectedValue(new Error("fail"));
    await request(app).get("/release");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Failed to retrieve releases.",
      expect.any(Error)
    );
  });

  it("GET /release/:id - found", async () => {
    jest.spyOn(releaseSchema, "findById").mockResolvedValue("releaseById");
    await request(app).get("/release/1");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      "Release retrieved successfully.",
      "releaseById"
    );
  });

  it("GET /release/:id - not found", async () => {
    jest.spyOn(releaseSchema, "findById").mockResolvedValue(null);
    await request(app).get("/release/999");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      404,
      "Release not found."
    );
  });

  it("GET /release/:id - error", async () => {
    jest.spyOn(releaseSchema, "findById").mockRejectedValue(new Error("fail"));
    await request(app).get("/release/123");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Failed to retrieve release.",
      expect.any(Error)
    );
  });

  it("GET /release/repository/:repositoryID - success", async () => {
    jest.spyOn(releaseSchema, "find").mockResolvedValue(["r1"]);
    await request(app).get("/release/repository/1");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      "Releases retrieved successfully.",
      ["r1"]
    );
  });

  it("GET /release/repository/:repositoryID - failure", async () => {
    jest.spyOn(releaseSchema, "find").mockRejectedValue(new Error("fail"));
    await request(app).get("/release/repository/1");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Failed to retrieve releases for repository.",
      expect.any(Error)
    );
  });

  it("PUT /release/:id - success", async () => {
    jest.spyOn(releaseSchema, "updateOne").mockResolvedValue("updated");
    await request(app).put("/release/1").send({ name: "newName" });
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      "Release updated successfully.",
      "updated"
    );
  });

  it("PUT /release/:id - failure", async () => {
    jest.spyOn(releaseSchema, "updateOne").mockRejectedValue(new Error("fail"));
    await request(app).put("/release/1").send({});
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Failed to update release.",
      expect.any(Error)
    );
  });

  it("DELETE /release/:id - success", async () => {
    jest.spyOn(releaseSchema, "deleteOne").mockResolvedValue("deleted");
    await request(app).delete("/release/1");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      "Release deleted successfully.",
      "deleted"
    );
  });

  it("DELETE /release/:id - failure", async () => {
    jest.spyOn(releaseSchema, "deleteOne").mockRejectedValue(new Error("fail"));
    await request(app).delete("/release/1");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Failed to delete release.",
      expect.any(Error)
    );
  });

  // ------------------ Status ------------------
  it("POST /releases/:id/statuses - success", async () => {
    const releaseMock = { statuses: [], save: jest.fn().mockResolvedValue("updated") };
    jest.spyOn(releaseSchema, "findById").mockResolvedValue(releaseMock);
    await request(app).post("/releases/1/statuses").send({ reviewerID: "r1" });
    expect(releaseMock.statuses.length).toBe(1);
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      "Status added to release.",
      "updated"
    );
  });

  it("POST /releases/:id/statuses - not found", async () => {
    jest.spyOn(releaseSchema, "findById").mockResolvedValue(null);
    await request(app).post("/releases/1/statuses").send({});
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      404,
      "Release not found."
    );
  });

  it("POST /releases/:id/statuses - error", async () => {
    jest.spyOn(releaseSchema, "findById").mockRejectedValue(new Error("fail"));
    await request(app).post("/releases/1/statuses").send({});
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Failed to add status.",
      expect.any(Error)
    );
  });

  it("POST /release/:id/status - success", async () => {
    jest.spyOn(releaseSchema, "findOneAndUpdate").mockResolvedValue("updated");
    await request(app).post("/release/1/status").send({});
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      "Status added to release.",
      "updated"
    );
  });

  it("POST /release/:id/status - not found", async () => {
    jest.spyOn(releaseSchema, "findOneAndUpdate").mockResolvedValue(null);
    await request(app).post("/release/1/status").send({});
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      404,
      "Release not found."
    );
  });

  it("POST /release/:id/status - failure", async () => {
    jest.spyOn(releaseSchema, "findOneAndUpdate").mockRejectedValue(new Error("fail"));
    await request(app).post("/release/1/status").send({});
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Failed to add status.",
      expect.any(Error)
    );
  });

  it("GET /release/:releaseId/:reviewerId/status - found", async () => {
    const statusMock = { _id: "s1", reviewerID: "r1" };
    const releaseMock = { statuses: [statusMock] };
    jest.spyOn(releaseSchema, "findById").mockResolvedValue(releaseMock);
    await request(app).get("/release/1/r1/status");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      "Status retrieved successfully.",
      { statusId: "s1" }
    );
  });

  it("GET /release/:releaseId/:reviewerId/status - status not found", async () => {
    const releaseMock = { statuses: [] };
    jest.spyOn(releaseSchema, "findById").mockResolvedValue(releaseMock);
    await request(app).get("/release/1/r1/status");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      404,
      "Status not found."
    );
  });

  it("GET /release/:releaseId/:reviewerId/status - error", async () => {
    jest.spyOn(releaseSchema, "findById").mockRejectedValue(new Error("fail"));
    await request(app).get("/release/1/r1/status");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Failed to retrieve status.",
      expect.any(Error)
    );
  });

  // ------------------ Status Update & Verification ------------------
  describe("PUT /release/:id/status/:statusId", () => {
    let releaseMock, status1, status2;

    beforeEach(() => {
      status1 = { _id: "s1", isSafe: true, isReviewed: true, set: jest.fn() };
      status2 = { _id: "s2", isSafe: true, isReviewed: true, set: jest.fn() };
      const statuses = [status1, status2];
      statuses.id = (id) => statuses.find((s) => s._id === id);

      releaseMock = {
        statuses,
        save: jest.fn().mockResolvedValue("updated"),
        verified: false,
        _id: "1",
      };

      jest.spyOn(releaseSchema, "findOne").mockResolvedValue(releaseMock);
      jest.spyOn(releaseSchema, "deleteOne").mockResolvedValue("deleted");
    });

    it("should mark verified on majority approval", async () => {
      await request(app).put("/release/1/status/s1").send({ isSafe: true });
      expect(status1.set).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        200,
        "Status updated and verification evaluated.",
        expect.anything(),
      );
    });

    it("should delete on majority rejection", async () => {
      status1.isSafe = false;
      status2.isSafe = false;
      await request(app).put("/release/1/status/s1").send({ isSafe: false });
      expect(releaseSchema.deleteOne).toHaveBeenCalledWith({ _id: "1" });
      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        200,
        "Release deleted due to majority rejection."
      );
    });

    it("should handle missing release", async () => {
      jest.spyOn(releaseSchema, "findOne").mockResolvedValue(null);
      await request(app).put("/release/1/status/s1").send({});
      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        404,
        "Release not found."
      );
    });

    it("should handle missing status", async () => {
      releaseMock.statuses.id = () => null;
      await request(app).put("/release/1/status/unknown").send({});
      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        404,
        "Status not found."
      );
    });

    it("should handle error", async () => {
      jest.spyOn(releaseSchema, "findOne").mockRejectedValue(new Error("fail"));
      await request(app).put("/release/1/status/s1").send({});
      expect(sendResponse).toHaveBeenCalledWith(
        expect.anything(),
        500,
        "Failed to update status.",
        expect.any(Error)
      );
    });
  });

  // ------------------ Latest Verified Release ------------------
  it("GET /release/latest/:repositoryID - error", async () => {
    jest.spyOn(releaseSchema, "findOne").mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error("fail")),
    });

    await request(app).get("/release/latest/1");

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Failed to retrieve latest verified release.",
      expect.any(Error)
    );
  });


  it("GET /release/latest/:repositoryID - not found", async () => {
    jest
      .spyOn(releaseSchema, "findOne")
      .mockReturnValue({ sort: jest.fn().mockResolvedValue(null) });
    await request(app).get("/release/latest/1");
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      404,
      "No verified releases found."
    );
  });
});
