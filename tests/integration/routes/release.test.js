// tests/integration/release.integration.test.js
import sinon from "sinon";
import supertest from "supertest";
import express from "express";
import releaseRouter from "../../../src/routes/release.routes.js";
import Release from "../../../src/models/release.js";
import sendResponse from "../../../src/utils/sendResponse.js";

// Mock sendResponse
jest.mock("../../../src/utils/sendResponse.js", () => ({
  __esModule: true,
  default: jest.fn((res, status, message, data) =>
    res.status(status).json({ message, result: data })
  ),
}));

const app = express();
app.use(express.json());
app.use("/", releaseRouter);

const fakeRelease = {
  _id: "1",
  repositoryID: "1",
  name: "Release1",
  description: "Description1",
  created_at: Date.now(),
  codesandbox_URL: "http://localhost",
  verified: false,
  statuses: [],
};

describe("Release Routes - Integration Expanded", () => {
  afterEach(() => {
    sinon.restore();
    jest.clearAllMocks();
  });

  // ---------------- CRUD Básico ----------------
  it("POST /release - success", async () => {
    sinon.stub(Release.prototype, "save").resolves(fakeRelease);
    const res = await supertest(app).post("/release").send(fakeRelease);
    expect(res.status).toEqual(201);
    expect(res.body.result).toMatchObject(fakeRelease);
  });

  it("POST /release - failure", async () => {
    sinon.stub(Release.prototype, "save").rejects(new Error("DB Error"));
    const res = await supertest(app).post("/release").send(fakeRelease);
    expect(res.status).toEqual(500);
    expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to create release.", expect.any(Error));
  });

  it("GET /release - success", async () => {
    sinon.stub(Release, "find").resolves([fakeRelease]);
    const res = await supertest(app).get("/release");
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual([fakeRelease]);
  });

  it("GET /release/:id - found", async () => {
    sinon.stub(Release, "findById").resolves(fakeRelease);
    const res = await supertest(app).get("/release/1");
    expect(res.status).toEqual(200);
    expect(res.body.result).toMatchObject(fakeRelease);
  });

  // ---------------- Status ----------------
  it("POST /releases/:id/statuses - success", async () => {
    const releaseMock = { statuses: [], save: sinon.stub().resolves(fakeRelease) };
    sinon.stub(Release, "findById").resolves(releaseMock);
    const res = await supertest(app).post("/releases/1/statuses").send({ reviewerID: "r1" });
    expect(releaseMock.statuses.length).toBe(1);
    expect(res.status).toEqual(200);
    expect(res.body.result).toMatchObject(fakeRelease);
  });

  // ---------------- Nuevo: GET status por reviewer ----------------
  it("GET /release/:releaseId/:reviewerId/status - found", async () => {
    const statusMock = { _id: "s1", reviewerID: "r1" };
    const releaseMock = { statuses: [statusMock] };
    sinon.stub(Release, "findById").resolves(releaseMock);

    const res = await supertest(app).get("/release/1/r1/status");

    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual({ statusId: "s1" });
  });

  it("GET /release/:releaseId/:reviewerId/status - status not found", async () => {
    const releaseMock = { statuses: [] };
    sinon.stub(Release, "findById").resolves(releaseMock);

    const res = await supertest(app).get("/release/1/r1/status");

    expect(res.status).toEqual(404);
  });

  // ---------------- Nuevo: PUT status/:statusId ----------------
  describe("PUT /release/:id/status/:statusId", () => {
    let releaseMock, status1, status2;

    beforeEach(() => {
      status1 = { _id: "s1", isSafe: true, isReviewed: true, set: sinon.stub() };
      status2 = { _id: "s2", isSafe: true, isReviewed: true, set: sinon.stub() };
      const statuses = [status1, status2];
      statuses.id = (id) => statuses.find((s) => s._id === id);

      releaseMock = {
        _id: "1",
        statuses,
        verified: false,
        save: sinon.stub().resolves(fakeRelease),
      };
      sinon.stub(Release, "findOne").resolves(releaseMock);
      sinon.stub(Release, "deleteOne").resolves(fakeRelease);
    });

    it("should mark verified on majority approval", async () => {
      const res = await supertest(app).put("/release/1/status/s1").send({ isSafe: true });
      expect(status1.set.called).toBe(true);
      expect(res.status).toEqual(200);
    });

    it("should delete on majority rejection", async () => {
      status1.isSafe = false;
      status2.isSafe = false;
      const res = await supertest(app).put("/release/1/status/s1").send({ isSafe: false });
      expect(Release.deleteOne.calledWith({ _id: "1" })).toBe(true);
      expect(res.status).toEqual(200);
    });
  });

  // ---------------- Nuevo: GET latest verified release ----------------
  it("GET /release/latest/:repositoryID - error", async () => {
    sinon.stub(Release, "findOne").returns({ sort: sinon.stub().rejects(new Error("fail")) });
    const res = await supertest(app).get("/release/latest/1");
    expect(res.status).toEqual(500);
  });

  it("GET /release/latest/:repositoryID - not found", async () => {
    sinon.stub(Release, "findOne").returns({ sort: sinon.stub().resolves(null) });
    const res = await supertest(app).get("/release/latest/1");
    expect(res.status).toEqual(404);
  });
});
