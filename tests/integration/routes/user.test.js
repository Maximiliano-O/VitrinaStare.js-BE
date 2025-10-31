import sinon from "sinon";
import bcrypt from "bcrypt";
import supertest from "supertest";
import mongoose from "mongoose";
import userSchema from "../../../src/models/user.js";
import router from "../../../src/routes/user.routes.js";
import express from "express";

const app = express();
app.use(express.json());
app.use("/", router);

const fakeUser = {
  _id: new mongoose.Types.ObjectId(),
  email: "user1@mail.com",
  password: "userpassword",
  username: "User1",
  imageURL: "http://userimg.com",
  latestPost: "",
  urlGithubProfile: "http://userprofile.com",
  totalComments: 0,
  totalRating: 0,
  role: "user",
};

// Helper para extraer datos reales
const getResponseData = (body) =>
  body.data || body.result || body.payload || body.user || body;

describe("User Integration Tests (Full Coverage)", () => {
  beforeEach(() => {
    sinon.stub(bcrypt, "hash").resolves("hashed_password");
    sinon.stub(bcrypt, "genSalt").resolves("salt");
    sinon.stub(bcrypt, "compare").resolves(true);
  });

  afterEach(() => sinon.restore());

  // ================= POST /users =================
  it("should create a user successfully and remove password in response", async () => {
    const saveStub = sinon.stub(userSchema.prototype, "save").resolves({
      ...fakeUser,
      toObject: function () { return { ...this, password: undefined }; },
    });

    const res = await supertest(app).post("/users").send(fakeUser);
    const data = getResponseData(res.body);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/created/i);
    expect(data.email).toBe(fakeUser.email);
    expect(data.password).toBeUndefined();
    expect(saveStub.calledOnce).toBe(true);
  });

  it("should assign admin role if email matches", async () => {
    const saveStub = sinon.stub(userSchema.prototype, "save").resolves({
      ...fakeUser,
      email: "vitrina.stare@gmail.com",
      role: "admin",
      toObject: function () { return { ...this, password: undefined }; },
    });

    const res = await supertest(app)
      .post("/users")
      .send({ ...fakeUser, email: "vitrina.stare@gmail.com" });
    const data = getResponseData(res.body);

    expect(res.status).toBe(201);
    expect(data.role).toBe("admin");
    expect(saveStub.calledOnce).toBe(true);
  });

  it("should handle DB save error gracefully", async () => {
    sinon.stub(userSchema.prototype, "save").rejects(new Error("DB Error"));
    const res = await supertest(app).post("/users").send(fakeUser);
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/failed/i);
  });

  // ================= GET /users =================
  it("should retrieve all users", async () => {
    sinon.stub(userSchema, "find").resolves([fakeUser]);
    const res = await supertest(app).get("/users");
    const data = getResponseData(res.body);
    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].email).toBe(fakeUser.email);
  });

  it("should handle DB error on get all users", async () => {
    sinon.stub(userSchema, "find").throws(new Error("DB Error"));
    const res = await supertest(app).get("/users");
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/failed/i);
  });

  // ================= GET /users/:id =================
  it("should retrieve user by ID", async () => {
    sinon.stub(userSchema, "findById").resolves(fakeUser);
    const res = await supertest(app).get(`/users/${fakeUser._id}`);
    const data = getResponseData(res.body);
    expect(res.status).toBe(200);
    expect(data.email).toBe(fakeUser.email);
  });

  it("should return 404 if user not found by ID", async () => {
    sinon.stub(userSchema, "findById").resolves(null);
    const res = await supertest(app).get(`/users/${fakeUser._id}`);
    expect(res.status).toBe(404);
  });

  it("should handle invalid ObjectId", async () => {
    const res = await supertest(app).get(`/users/invalid-id`);
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/failed/i);
  });

  // ================= PUT /users/:id =================
  it("should update user successfully", async () => {
    const updatedUser = { ...fakeUser, username: "UpdatedUser" };
    sinon.stub(userSchema, "findByIdAndUpdate").resolves(updatedUser);
    const res = await supertest(app)
      .put(`/users/${fakeUser._id}`)
      .send(updatedUser);
    const data = getResponseData(res.body);
    expect(res.status).toBe(200);
    expect(data.username).toBe("UpdatedUser");
  });

  it("should return 404 if updating non-existent user", async () => {
    sinon.stub(userSchema, "findByIdAndUpdate").resolves(null);
    const res = await supertest(app)
      .put(`/users/${fakeUser._id}`)
      .send(fakeUser);
    expect(res.status).toBe(404);
  });

  // ================= DELETE /users/:id =================
  it("should delete user successfully", async () => {
    sinon.stub(userSchema, "findByIdAndDelete").resolves(fakeUser);
    const res = await supertest(app).delete(`/users/${fakeUser._id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("should return 404 if deleting non-existent user", async () => {
    sinon.stub(userSchema, "findByIdAndDelete").resolves(null);
    const res = await supertest(app).delete(`/users/${fakeUser._id}`);
    expect(res.status).toBe(404);
  });

  // ================= POST /login =================
  it("should login successfully", async () => {
    sinon.stub(userSchema, "findOne").resolves(fakeUser);
    const res = await supertest(app)
      .post("/login")
      .send({ email: fakeUser.email, password: fakeUser.password });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/login/i);
  });

  it("should return 404 if email not found", async () => {
    sinon.stub(userSchema, "findOne").resolves(null);
    const res = await supertest(app)
      .post("/login")
      .send({ email: fakeUser.email, password: fakeUser.password });
    expect(res.status).toBe(404);
  });

  it("should return 401 if password incorrect", async () => {
    sinon.stub(userSchema, "findOne").resolves(fakeUser);
    bcrypt.compare.restore();
    sinon.stub(bcrypt, "compare").resolves(false);
    const res = await supertest(app)
      .post("/login")
      .send({ email: fakeUser.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  // ================= GET /users/email/:email =================
  it("should find by email", async () => {
    const selectStub = sinon.stub().resolves(fakeUser);
    sinon.stub(userSchema, "findOne").returns({ select: selectStub });
    const res = await supertest(app).get(`/users/email/${fakeUser.email}`);
    const data = getResponseData(res.body);
    expect(res.status).toBe(200);
    expect(data.email).toBe(fakeUser.email);
  });

  it("should return 404 if email not found", async () => {
    const selectStub = sinon.stub().resolves(null);
    sinon.stub(userSchema, "findOne").returns({ select: selectStub });
    const res = await supertest(app).get(`/users/email/${fakeUser.email}`);
    expect(res.status).toBe(404);
  });

  it("should handle DB error in email check", async () => {
    sinon.stub(userSchema, "findOne").throws(new Error("DB Error"));
    const res = await supertest(app).get(`/users/email/${fakeUser.email}`);
    expect(res.status).toBe(500);
  });

  // ================= GET /users/github/:githubUrl =================
  it("should find user by GitHub URL", async () => {
    sinon.stub(userSchema, "findOne").resolves(fakeUser);
    const encoded = encodeURIComponent(fakeUser.urlGithubProfile);
    const res = await supertest(app).get(`/users/github/${encoded}`);
    expect(res.status).toBe(200);
  });

  it("should return 404 if GitHub URL not found", async () => {
    sinon.stub(userSchema, "findOne").resolves(null);
    const encoded = encodeURIComponent(fakeUser.urlGithubProfile);
    const res = await supertest(app).get(`/users/github/${encoded}`);
    expect(res.status).toBe(404);
  });

  it("should handle invalid URL decode gracefully", async () => {
    const originalDecode = global.decodeURIComponent;
    global.decodeURIComponent = jest.fn(() => { throw new Error("Decode Error"); });
    const res = await supertest(app).get("/users/github/%");
    expect(res.status).toBe(500);
    global.decodeURIComponent = originalDecode;
  });

  // ================= GET /users/:id/urlGithubProfile =================
  it("should fetch GitHub profile URL", async () => {
    sinon.stub(userSchema, "findById").resolves(fakeUser);
    const res = await supertest(app).get(`/users/${fakeUser._id}/urlGithubProfile`);
    expect(res.status).toBe(200);
  });

  it("should return 404 if user not found for GitHub URL", async () => {
    sinon.stub(userSchema, "findById").resolves(null);
    const res = await supertest(app).get(`/users/${fakeUser._id}/urlGithubProfile`);
    expect(res.status).toBe(404);
  });

  it("should handle DB error for GitHub URL fetch", async () => {
    sinon.stub(userSchema, "findById").rejects(new Error("DB Error"));
    const res = await supertest(app).get(`/users/${fakeUser._id}/urlGithubProfile`);
    expect(res.status).toBe(500);
  });

  // ================= GET /users/random/:id/:n =================
  it("should fetch random users", async () => {
    sinon.stub(userSchema, "aggregate").resolves([fakeUser]);
    const res = await supertest(app).get(`/users/random/${fakeUser._id}/1`);
    const data = getResponseData(res.body);
    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("should handle DB error in random users", async () => {
    sinon.stub(userSchema, "aggregate").rejects(new Error("DB Error"));
    const res = await supertest(app).get(`/users/random/${fakeUser._id}/1`);
    expect(res.status).toBe(500);
  });

  it("should handle invalid n parameter in random users", async () => {
    const res = await supertest(app).get(`/users/random/${fakeUser._id}/abc`);
    expect(res.status).toBe(500);
  });
});
