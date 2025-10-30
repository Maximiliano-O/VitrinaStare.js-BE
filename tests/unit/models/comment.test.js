import mongoose from 'mongoose';
import Comment from '../../../src/models/comment.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

describe('Comment Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterEach(async () => {
    await Comment.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('should create a comment with required fields', async () => {
    const data = {
      userID: 'user_1',
      repositoryID: 'repo_1',
      repoName: 'Test Repo',
      username: 'User1',
      body: 'This is a comment',
    };

    const comment = new Comment(data);
    const saved = await comment.save();

    expect(saved._id).toBeDefined();
    expect(saved.userID).toBe(data.userID);
    expect(saved.repositoryID).toBe(data.repositoryID);
    expect(saved.repoName).toBe(data.repoName);
    expect(saved.username).toBe(data.username);
    expect(saved.body).toBe(data.body);

    expect(saved.usernameImageURL).toBe('');
    expect(saved.date).toBeInstanceOf(Date);
  });

  it('should throw validation error if required fields are missing', async () => {
    const comment = new Comment({});
    let err;

    try {
      await comment.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe('ValidationError');
    expect(err.errors.userID).toBeDefined();
    expect(err.errors.repositoryID).toBeDefined();
    expect(err.errors.repoName).toBeDefined();
    expect(err.errors.username).toBeDefined();
    expect(err.errors.body).toBeDefined();
  });

  it('should allow optional fields to be empty', async () => {
    const data = {
      userID: 'user_2',
      repositoryID: 'repo_2',
      repoName: 'Another Repo',
      username: 'User2',
      body: 'Another comment',
    };

    const comment = new Comment(data);
    const saved = await comment.save();

    expect(saved.usernameImageURL).toBe('');
  });
});
