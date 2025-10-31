// This test is only to deal with the hash in the user schema and keeping the integration tests clean

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../../../src/models/user.js"; // tu modelo
import bcrypt from "bcrypt";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User model pre-save hook (hash password)", () => {
  it("should hash the password before saving", async () => {
    const plainPassword = "mysecret";
    const user = new User({ email: "test@user.com", username: "testuser", password: plainPassword });
    
    await user.save();

    // password en DB NO debe ser igual a la original
    expect(user.password).not.toBe(plainPassword);

    // bcrypt.compare debería validar la contraseña
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    expect(isMatch).toBe(true);
  });
});
