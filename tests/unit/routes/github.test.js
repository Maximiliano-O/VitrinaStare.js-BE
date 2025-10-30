import request from "supertest";
import express from "express";
import sendResponse from "../../../src/utils/sendResponse.js";
import axios from "axios";
import githubRouter, { extractUsername, extractRepoName } from "../../../src/routes/github.routes.js";


// Mock utils
jest.mock("../../../src/utils/sendResponse.js", () => ({
  __esModule: true,
  default: jest.fn((res, status, message, data) => res.status(status).json({ message, data })),
}));

// Mock axios
jest.mock("axios");

describe("GitHub Routes", () => {
  let app;

  // Aumentar timeout global para tests que usan supertest + axios
  jest.setTimeout(20000);

  beforeAll(async () => {
    const githubRouter = (await import("../../../src/routes/github.routes.js")).default;
    app = express();
    app.use(express.json());
    app.use("/", githubRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------
  // Tests checkUserExists
  // -----------------------
  it("should return 400 for invalid user URL", async () => {
    await request(app)
      .get("/checkUserExists")
      .query({ userUrl: "invalid-url" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      "Invalid GitHub user URL.",
      { success: false }
    );
  });

  it("should return 400 if hostname is not github.com", async () => {
    await request(app)
      .get("/checkUserExists")
      .query({ userUrl: "https://example.com/mockuser" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      "Invalid GitHub user URL.",
      { success: false }
    );
  });

  it("should return 200 if user exists", async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: { login: "mockuser" } }));

    await request(app)
      .get("/checkUserExists")
      .query({ userUrl: "https://github.com/mockuser" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      "The user exists.",
      { success: true, exists: true, userData: { login: "mockuser" } }
    );
  });

  it("should return 200 if user does not exist", async () => {
    const error = new Error("Not Found");
    error.response = { status: 404 };
    axios.get.mockImplementationOnce(() => Promise.reject(error));

    await request(app)
      .get("/checkUserExists")
      .query({ userUrl: "https://github.com/nonexistent" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      "User not found/doesn't exist",
      { success: true, exists: false }
    );
  });

  it("should return 500 on Axios network error", async () => {
    axios.get.mockImplementationOnce(() => Promise.reject(new Error("Network fail")));

    await request(app)
      .get("/checkUserExists")
      .query({ userUrl: "https://github.com/otheruser" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      { success: false, message: "Network fail" }
    );
  });

  // -----------------------
  // Tests checkRepoExistsAndMatchesUser
  // -----------------------
  it("should return 400 for invalid user or repo URL", async () => {
    await request(app)
      .get("/checkRepoExistsAndMatchesUser")
      .query({ userUrl: "invalid-url", repoUrl: "invalid-repo" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      "Invalid GitHub user or repository URL.",
      { success: false }
    );
  });

  it("should return 400 if repo URL has insufficient parts or username mismatch", async () => {
    // username mismatch
    await request(app)
      .get("/checkRepoExistsAndMatchesUser")
      .query({ userUrl: "https://github.com/mockuser", repoUrl: "https://github.com/otheruser/repo1" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      "Invalid GitHub user or repository URL.",
      { success: false }
    );

    // insufficient parts
    await request(app)
      .get("/checkRepoExistsAndMatchesUser")
      .query({ userUrl: "https://github.com/mockuser", repoUrl: "https://github.com/mockuser" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      "Invalid GitHub user or repository URL.",
      { success: false }
    );
  });

  it("should return 200 if repo exists and matches user", async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: { name: "repo1" } }));

    await request(app)
      .get("/checkRepoExistsAndMatchesUser")
      .query({ userUrl: "https://github.com/mockuser", repoUrl: "https://github.com/mockuser/repo1" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      "User is owner of the repository.",
      { success: true, exists: true, repoData: { name: "repo1" } }
    );
  });

  it("should return 200 if repo does not exist or user is not owner", async () => {
    const error = new Error("Not Found");
    error.response = { status: 404 };
    axios.get.mockImplementationOnce(() => Promise.reject(error));

    await request(app)
      .get("/checkRepoExistsAndMatchesUser")
      .query({ userUrl: "https://github.com/mockuser", repoUrl: "https://github.com/mockuser/nonexistent-repo" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      "User is not owner of the repo.",
      { success: true, exists: false }
    );
  });

  it("should return 500 on Axios network error for repo", async () => {
    axios.get.mockImplementationOnce(() => Promise.reject(new Error("Network fail")));

    await request(app)
      .get("/checkRepoExistsAndMatchesUser")
      .query({ userUrl: "https://github.com/mockuser", repoUrl: "https://github.com/mockuser/other-repo" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Failed to check repository existance and owner.",
      { success: false, message: "Network fail" }
    );
  });

  test("extractUsername returns null if hostname is not github.com", () => {
    expect(extractUsername("https://example.com/mockuser")).toBeNull();
  });

  test("extractUsername returns null if pathname is empty", () => {
    expect(extractUsername("https://github.com/")).toBeNull();
  });

  test("extractRepoName returns null if repo URL has insufficient parts", () => {
    expect(extractRepoName("https://github.com/mockuser", "mockuser")).toBeNull();
  });

  test("extractRepoName returns null if username does not match", () => {
    expect(extractRepoName("https://github.com/otheruser/repo1", "mockuser")).toBeNull();
  });
});
