import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../../../src/models/user.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

describe('User Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('should create a user with required fields and hash the password', async () => {
    const data = {
      email: 'testuser@mail.com',
      password: 'mypassword',
      username: 'TestUser',
    };

    const user = new User(data);
    const saved = await user.save();

    expect(saved._id).toBeDefined();
    expect(saved.email).toBe(data.email.toLowerCase());
    expect(saved.username).toBe(data.username);
    expect(saved.latestPost).toBe('');
    expect(saved.totalComments).toBe(0);
    expect(saved.role).toBe('user');

    // Password hashed
    expect(saved.password).not.toBe(data.password);
    const isMatch = await bcrypt.compare(data.password, saved.password);
    expect(isMatch).toBe(true);
  });

  it('should throw validation error if required fields are missing', async () => {
    const user = new User({});
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe('ValidationError');
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
    expect(err.errors.username).toBeDefined();
  });

  it('should enforce username length constraints', async () => {
    const data = {
      email: 'a@mail.com',
      password: '123456',
      username: 'ab', // too short
    };

    const user = new User(data);
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.username).toBeDefined();
  });

  it('should enforce valid email format', async () => {
    const data = {
      email: 'invalidemail',
      password: '123456',
      username: 'ValidName',
    };

    const user = new User(data);
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it('should allow optional fields to be empty', async () => {
    const data = {
      email: 'optuser@mail.com',
      password: '123456',
      username: 'OptUser',
    };

    const user = new User(data);
    const saved = await user.save();

    expect(saved.imageURL).toBeUndefined();
    expect(saved.urlGithubProfile).toBeUndefined();
    expect(saved.description).toBeUndefined();
  });

  it('should call next without hashing if password is not modified', async () => {
    const data = {
      email: 'existing@mail.com',
      password: '123456',
      username: 'ExistingUser',
    };

    const user = new User(data);
    await user.save();

    // Save again without changing password
    user.latestPost = 'Updated post';
    const saved = await user.save();

    // Password should remain the same
    expect(saved.password).toBe(user.password);
    expect(saved.latestPost).toBe('Updated post');
  });

  // Nuevo test para cubrir el catch del pre('save')
  it('should call next with error if bcrypt.hash fails', async () => {
    const data = {
      email: 'fail@mail.com',
      password: '123456',
      username: 'FailUser',
    };

    // Hacer que bcrypt.hash lance un error
    const hashSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
      throw new Error('Hashing failed');
    });

    const user = new User(data);
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.message).toBe('Hashing failed');

    hashSpy.mockRestore();
  });
});
