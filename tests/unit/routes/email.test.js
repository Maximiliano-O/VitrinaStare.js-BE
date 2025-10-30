import request from "supertest";
import express from "express";
import sendResponse from "../../../src/utils/sendResponse.js";

// ===== Mock dependencies BEFORE importing router =====
jest.mock("../../../src/utils/sendResponse.js", () => ({
  __esModule: true,
  default: jest.fn((res, status, message, data) => res.status(status).json({ message, data })),
}));

// Mock Google OAuth2
const mockGetAccessToken = jest.fn();
const mockSetCredentials = jest.fn();
jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn(() => ({
        setCredentials: mockSetCredentials,
        getAccessToken: mockGetAccessToken,
      })),
    },
  },
}));

// Mock Nodemailer
const mockSendMail = jest.fn().mockResolvedValue({ accepted: ["a@example.com"] });
const mockCreateTransport = jest.fn(() => ({ sendMail: mockSendMail }));
jest.mock("nodemailer", () => ({
  createTransport: mockCreateTransport,
}));

describe("Email Routes", () => {
  let app;

  beforeAll(async () => {
    jest.setTimeout(15000);

    await jest.isolateModulesAsync(async () => {
      const emailRouter = (await import("../../../src/routes/email.routes.js")).default;
      app = express();
      app.use(express.json());
      app.use("/", emailRouter);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return 400 if emails or repositoryLink are missing", async () => {
    jest.setTimeout(10000);
    await request(app).post("/send-emails").send({ emails: [], repositoryLink: "" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      "Missing email list or repository link."
    );
  });

  it("should return 500 if access token retrieval fails", async () => {
    mockGetAccessToken.mockResolvedValue({ token: null });

    await request(app)
      .post("/send-emails")
      .send({ emails: ["a@example.com"], repositoryLink: "https://repo.link" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Failed to retrieve access token"
    );
  });

  it("should send emails successfully", async () => {
    mockGetAccessToken.mockResolvedValue({ token: "mock_token" });
    mockSendMail.mockResolvedValue({ accepted: ["a@example.com"] });

    await request(app)
      .post("/send-emails")
      .send({
        emails: ["a@example.com", "b@example.com"],
        repositoryLink: "https://repo.link",
      });

    expect(mockCreateTransport).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledTimes(2);
    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.stringMatching(/Emails sent:/),
      expect.objectContaining({ failures: expect.any(Array) })
    );
  });

  it("should handle internal server error", async () => {
    mockGetAccessToken.mockRejectedValue(new Error("Network fail"));

    await request(app)
      .post("/send-emails")
      .send({ emails: ["a@example.com"], repositoryLink: "https://repo.link" });

    expect(sendResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      "Internal server error.",
      expect.any(Error)
    );
  });
});
