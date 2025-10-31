import sinon from "sinon";
import supertest from "supertest";
import Comment from "../../../src/models/comment.js";
import router from "../../../src/routes/comment.routes.js";
import express from "express";
import sendResponse from "../../../src/utils/sendResponse.js";

const app = express();
app.use(express.json());
app.use("/", router);

// Mock sendResponse to intercept responses
jest.mock("../../../src/utils/sendResponse.js", () => {
  return jest.fn((res, status, message, data) => {
    res.status(status).json({ message, result: data });
  });
});

const fakeData = {
  authorID: "author_1",
  repositoryID: "repo_1",
  repoName: "repository 1",
  username: "user1",
  body: "Some comment",
};

describe("Comments Routes - Integration", () => {
  afterEach(() => {
    sinon.restore();
    jest.clearAllMocks();
  });

  // ============================== POST /comments ============================== //
  it("POST /comments - success", async () => {
    const stubSave = sinon.stub(Comment.prototype, "save").resolves(fakeData);

    const res = await supertest(app).post("/comments").send(fakeData);

    expect(res.status).toEqual(201);
    expect(res.body.result).toMatchObject(fakeData);
    expect(stubSave.calledOnce).toBe(true);
  });

  it("POST /comments - failure", async () => {
    const stubSave = sinon.stub(Comment.prototype, "save").rejects(new Error("DB Error"));

    const res = await supertest(app).post("/comments").send(fakeData);

    expect(res.status).toEqual(500);
    expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to create comment.", expect.any(Error));
    expect(stubSave.calledOnce).toBe(true);
  });

  // ============================== GET /comments ============================== //
  it("GET /comments - success", async () => {
    const stubFind = sinon.stub(Comment, "find").resolves([fakeData]);

    const res = await supertest(app).get("/comments");

    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual([fakeData]);
    expect(stubFind.calledOnce).toBe(true);
  });

  it("GET /comments - failure", async () => {
    const stubFind = sinon.stub(Comment, "find").rejects(new Error("DB Error"));

    const res = await supertest(app).get("/comments");

    expect(res.status).toEqual(500);
    expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to retrieve comments.", expect.any(Error));
    expect(stubFind.calledOnce).toBe(true);
  });

  // ============================== GET /comments/:id ============================== //
  it("GET /comments/:id - success", async () => {
    const stubFindById = sinon.stub(Comment, "findById").resolves(fakeData);

    const res = await supertest(app).get("/comments/id1");

    expect(res.status).toEqual(200);
    expect(res.body.result).toMatchObject(fakeData);
    expect(stubFindById.calledOnce).toBe(true);
  });

  it("GET /comments/:id - not found", async () => {
    sinon.stub(Comment, "findById").resolves(null);

    const res = await supertest(app).get("/comments/id1");

    expect(res.status).toEqual(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("GET /comments/:id - failure", async () => {
    sinon.stub(Comment, "findById").rejects(new Error("DB Error"));

    const res = await supertest(app).get("/comments/id1");

    expect(res.status).toEqual(500);
    expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to retrieve comment.", expect.any(Error));
  });

  // ============================== GET /comments/repository/:repositoryID ============================== //
  it("GET /comments/repository/:repositoryID - success", async () => {
    const stubFind = sinon.stub(Comment, "find").resolves([fakeData]);

    const res = await supertest(app).get("/comments/repository/repo_1");

    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual([fakeData]);
    expect(stubFind.calledOnce).toBe(true);
  });

  it("GET /comments/repository/:repositoryID - failure", async () => {
    sinon.stub(Comment, "find").rejects(new Error("DB Error"));

    const res = await supertest(app).get("/comments/repository/repo_1");

    expect(res.status).toEqual(500);
    expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to retrieve comments for repository.", expect.any(Error));
  });

  // ============================== GET /comments/user/:userID ============================== //
  it("GET /comments/user/:userID - success", async () => {
    const stubFind = sinon.stub(Comment, "find").resolves([fakeData]);

    const res = await supertest(app).get("/comments/user/author_1");

    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual([fakeData]);
    expect(stubFind.calledOnce).toBe(true);
  });

  it("GET /comments/user/:userID - failure", async () => {
    sinon.stub(Comment, "find").rejects(new Error("DB Error"));

    const res = await supertest(app).get("/comments/user/author_1");

    expect(res.status).toEqual(500);
    expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to retrieve comments by author.", expect.any(Error));
  });

  // ============================== DELETE /comments/:id ============================== //
  it("DELETE /comments/:id - success", async () => {
    const stubDelete = sinon.stub(Comment, "findByIdAndDelete").resolves(fakeData);

    const res = await supertest(app).delete("/comments/id1");

    expect(res.status).toEqual(200);
    expect(res.body.result).toMatchObject(fakeData);
    expect(stubDelete.calledOnce).toBe(true);
  });

  it("DELETE /comments/:id - not found", async () => {
    sinon.stub(Comment, "findByIdAndDelete").resolves(null);

    const res = await supertest(app).delete("/comments/id1");

    expect(res.status).toEqual(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("DELETE /comments/:id - failure", async () => {
    sinon.stub(Comment, "findByIdAndDelete").rejects(new Error("DB Error"));

    const res = await supertest(app).delete("/comments/id1");

    expect(res.status).toEqual(500);
    expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to delete comment.", expect.any(Error));
  });

  // ============================== PUT /comments/:id ============================== //
  it("PUT /comments/:id - success", async () => {
    const stubUpdate = sinon.stub(Comment, "findByIdAndUpdate").resolves(fakeData);

    const res = await supertest(app).put("/comments/id1").send(fakeData);

    expect(res.status).toEqual(200);
    expect(res.body.result).toMatchObject(fakeData);
    expect(stubUpdate.calledOnce).toBe(true);
  });

  it("PUT /comments/:id - not found", async () => {
    sinon.stub(Comment, "findByIdAndUpdate").resolves(null);

    const res = await supertest(app).put("/comments/id1").send(fakeData);

    expect(res.status).toEqual(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("PUT /comments/:id - failure", async () => {
    sinon.stub(Comment, "findByIdAndUpdate").rejects(new Error("DB Error"));

    const res = await supertest(app).put("/comments/id1").send(fakeData);

    expect(res.status).toEqual(500);
    expect(sendResponse).toHaveBeenCalledWith(expect.anything(), 500, "Failed to update comment.", expect.any(Error));
  });
});
