// tests/integration/routes/repository.integration.test.js
import request from "supertest";
import express from "express";
import repositoryRouter from "../../../src/routes/repository.routes.js";
import Repository from "../../../src/models/repository.js";
import Release from "../../../src/models/release.js";
import sendResponse from "../../../src/utils/sendResponse.js";

// Mock sendResponse para que siempre devuelva { message, data }
jest.mock("../../../src/utils/sendResponse.js", () => ({
    __esModule: true,
    default: jest.fn((res, status, message, data) =>
        res.status(status).json({ message, data })
    ),
}));

const app = express();
app.use(express.json());
app.use("/", repositoryRouter);

const fakeData = {
    contributorID: "contributor_1",
    userID: "user1",
    author: "author_1",
    title: "title1",
    imageURL: "http://example.com/image.jpg",
    tags: ["tag1", "tag2"],
    totalComments: 5,
    ratings: [{ userId: "user1", rating: 4 }],
    totalRating: 4,
    repositoryName: "repo1",
    repositoryDesc: "This is a test repository",
    repositoryDoc: "http://example.com/doc.pdf",
    license: "MIT",
    repositoryUrl: "http://example.com/repo1"
};

describe("Repository Integration Tests (Full Coverage)", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    // ==================== POST /repository ====================
    it("POST /repository - success", async () => {
        jest.spyOn(Repository.prototype, "save").mockResolvedValue(fakeData);
        const res = await request(app).post("/repository").send(fakeData);
        expect(res.status).toBe(201);
        expect(res.body.data).toMatchObject(fakeData);
    });

    it("POST /repository - missing required fields", async () => {
        const res = await request(app).post("/repository").send({ title: "Only title" });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Missing required fields/);
    });

    it("POST /repository - DB error", async () => {
        jest.spyOn(Repository.prototype, "save").mockRejectedValue(new Error("DB Error"));
        const res = await request(app).post("/repository").send(fakeData);
        expect(res.status).toBe(500);
    });

    it("POST /repository - invalid repositoryUrl", async () => {
        const invalidData = { ...fakeData, repositoryUrl: 12345 };
        const res = await request(app).post("/repository").send(invalidData);
        expect(res.status).toBe(400);
    });

    it("POST /repository - invalid tags type", async () => {
        const invalidData = { ...fakeData, tags: "not-an-array" };
        const res = await request(app).post("/repository").send(invalidData);
        expect(res.status).toBe(400);
    });

    // ==================== GET /repository/:id ====================
    it("GET /repository/:id - success", async () => {
        jest.spyOn(Repository, "findById").mockResolvedValue(fakeData);
        const res = await request(app).get("/repository/id1");
        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe(fakeData.title);
    });

    it("GET /repository/:id - not found", async () => {
        jest.spyOn(Repository, "findById").mockResolvedValue(null);
        const res = await request(app).get("/repository/id1");
        expect(res.status).toBe(404);
    });

    it("GET /repository/:id - DB error", async () => {
        jest.spyOn(Repository, "findById").mockRejectedValue(new Error("DB Error"));
        const res = await request(app).get("/repository/id1");
        expect(res.status).toBe(500);
    });

    // ==================== PUT /repository/:id ====================
    it("PUT /repository/:id - success", async () => {
        jest.spyOn(Repository, "findOneAndUpdate").mockResolvedValue({ ...fakeData, title: "Updated" });
        const res = await request(app).put("/repository/id1").send({ title: "Updated" });
        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe("Updated");
    });

    it("PUT /repository/:id - not found", async () => {
        jest.spyOn(Repository, "findOneAndUpdate").mockResolvedValue(null);
        const res = await request(app).put("/repository/id1").send({ title: "Updated" });
        expect(res.status).toBe(404);
    });

    it("PUT /repository/:id - DB error", async () => {
        jest.spyOn(Repository, "findOneAndUpdate").mockRejectedValue(new Error("DB Error"));
        const res = await request(app).put("/repository/id1").send({ title: "Updated" });
        expect(res.status).toBe(500);
    });

    it("PUT /repository/:id - update non-existent field", async () => {
        jest.spyOn(Repository, "findOneAndUpdate").mockResolvedValue({ ...fakeData });
        const res = await request(app).put("/repository/id1").send({ nonExistentField: "test" });
        expect(res.status).toBe(200);
        expect(res.body.data.nonExistentField).toBeUndefined();
    });


    // ==================== GET /repository/user/:userID ====================
    it("GET /repository/user/:userID - success", async () => {
        jest.spyOn(Repository, "find").mockResolvedValue([fakeData]);
        const res = await request(app).get("/repository/user/user1");
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
    });

    it("GET /repository/user/:userID - empty", async () => {
        jest.spyOn(Repository, "find").mockResolvedValue([]);
        const res = await request(app).get("/repository/user/user1");
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    it("GET /repository/user/:userID - DB error", async () => {
        jest.spyOn(Repository, "find").mockRejectedValue(new Error("DB Error"));
        const res = await request(app).get("/repository/user/user1");
        expect(res.status).toBe(500);
    });

    // ==================== Ratings ====================
    it("POST /repository/:id/ratings - add rating", async () => {
        const repo = { ratings: [], save: jest.fn().mockResolvedValue(true) };
        jest.spyOn(Repository, "findById").mockResolvedValue(repo);
        const res = await request(app).post("/repository/id1/ratings").send({ userId: "user1", rating: 4 });
        expect(res.status).toBe(200);
        expect(repo.save).toHaveBeenCalled();
    });

    it("DELETE /repository/:id/ratings - delete rating", async () => {
        const repo = { ratings: [{ userId: "user1", rating: 4 }], save: jest.fn().mockResolvedValue(true) };
        jest.spyOn(Repository, "findById").mockResolvedValue(repo);
        const res = await request(app).delete("/repository/id1/ratings").send({ userId: "user1" });
        expect(res.status).toBe(200);
        expect(repo.save).toHaveBeenCalled();
    });

    it("POST /repository/:id/ratings - rating out of range", async () => {
        const res = await request(app).post("/repository/id1/ratings").send({ userId: "user1", rating: 6 });
        expect(res.status).toBe(400);
    });

    it("POST /repository/:id/ratings - user adds rating twice", async () => {
        const repo = { ratings: [{ userId: "user1", rating: 4 }], save: jest.fn().mockResolvedValue(true) };
        jest.spyOn(Repository, "findById").mockResolvedValue(repo);
        const res = await request(app).post("/repository/id1/ratings").send({ userId: "user1", rating: 5 });
        expect(res.status).toBe(200);
        expect(repo.ratings).toHaveLength(1); // debería reemplazar, no duplicar
        expect(repo.ratings[0].rating).toBe(5);
    });


    // ==================== POST /repository/verify ====================
    it("POST /repository/verify - success", async () => {
        jest.spyOn(Release, "find").mockResolvedValue([{ repositoryID: "r1" }]);
        jest.spyOn(Repository, "updateMany").mockResolvedValue({ modifiedCount: 1 });
        const res = await request(app).post("/repository/verify");
        expect(res.status).toBe(200);
    });

    it("POST /repository/verify - no verified releases", async () => {
        jest.spyOn(Release, "find").mockResolvedValue([]);
        const res = await request(app).post("/repository/verify");
        expect(res.status).toBe(400);
    });

    // ==================== /unique-tags ====================
    it("GET /unique-tags - returns tags", async () => {
        jest.spyOn(Repository, "aggregate").mockResolvedValue([{ uniqueTags: ["tag1", "tag2"] }]);
        const res = await request(app).get("/unique-tags");
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(["tag1", "tag2"]);
    });

    it("GET /unique-tags - empty result", async () => {
        jest.spyOn(Repository, "aggregate").mockResolvedValue([]);
        const res = await request(app).get("/unique-tags");
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    it("GET /unique-tags - all tags null or empty", async () => {
        jest.spyOn(Repository, "aggregate").mockResolvedValue([{ uniqueTags: [] }]);
        const res = await request(app).get("/unique-tags");
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });


    // ==================== Ratings POST invalid ====================
    it("POST /repository/:id/ratings - missing rating data", async () => {
        const res = await request(app).post("/repository/id1/ratings").send({ userId: "user1" });
        expect(res.status).toBe(400);
    });

    it("POST /repository/:id/ratings - repository not found", async () => {
        jest.spyOn(Repository, "findById").mockResolvedValue(null);
        const res = await request(app).post("/repository/id1/ratings").send({ userId: "user1", rating: 5 });
        expect(res.status).toBe(404);
    });

    // ==================== Ratings DELETE invalid ====================
    it("DELETE /repository/:id/ratings - missing userId", async () => {
        const res = await request(app).delete("/repository/id1/ratings").send({});
        expect(res.status).toBe(400);
    });

    it("DELETE /repository/:id/ratings - rating not found", async () => {
        const repo = { ratings: [], save: jest.fn().mockResolvedValue(true) };
        jest.spyOn(Repository, "findById").mockResolvedValue(repo);
        const res = await request(app).delete("/repository/id1/ratings").send({ userId: "user1" });
        expect(res.status).toBe(404);
    });

    // ==================== Ratings POST/DELETE DB error ====================
    it("POST /repository/:id/ratings - DB error", async () => {
        jest.spyOn(Repository, "findById").mockRejectedValue(new Error("DB Error"));
        const res = await request(app).post("/repository/id1/ratings").send({ userId: "user1", rating: 5 });
        expect(res.status).toBe(500);
    });

    it("DELETE /repository/:id/ratings - DB error", async () => {
        jest.spyOn(Repository, "findById").mockRejectedValue(new Error("DB Error"));
        const res = await request(app).delete("/repository/id1/ratings").send({ userId: "user1" });
        expect(res.status).toBe(500);
    });

    it("DELETE /repository/:id/ratings - repository has no ratings array", async () => {
        const repo = { ratings: null, save: jest.fn().mockResolvedValue(true) };
        jest.spyOn(Repository, "findById").mockResolvedValue(repo);
        const res = await request(app).delete("/repository/id1/ratings").send({ userId: "user1" });
        expect(res.status).toBe(404);
    });


    // ==================== Verification POST DB error ====================
    it("POST /repository/verify - DB error", async () => {
        jest.spyOn(Release, "find").mockRejectedValue(new Error("DB Error"));
        const res = await request(app).post("/repository/verify");
        expect(res.status).toBe(500);
    });

});
