import mongoose from 'mongoose';
import Repository from '../../../src/models/repository.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

describe('Repository Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterEach(async () => {
    await Repository.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('should create a repository with required fields', async () => {
    const data = {
      userID: 'user_1',
      author: 'Author 1',
      title: 'Repo Title',
      repositoryUrl: 'http://github.com/repo1',
    };

    const repo = new Repository(data);
    const saved = await repo.save();

    expect(saved._id).toBeDefined();
    expect(saved.userID).toBe(data.userID);
    expect(saved.author).toBe(data.author);
    expect(saved.title).toBe(data.title);
    expect(saved.repositoryUrl).toBe(data.repositoryUrl);

    expect(saved.imageURL).toBe('');
    expect(saved.totalComments).toBe(0);
    expect(saved.totalRating).toBe(0);
    expect(saved.repositoryName).toBe('');
    expect(saved.repositoryDesc).toBe('');
    expect(saved.repositoryDoc).toBe('');
    expect(saved.license).toBe('None');
    expect(saved.verified).toBe(false);
    expect(saved.technology).toEqual([]);
    expect(saved.tags).toEqual([]);
    expect(saved.ratings).toEqual([]);
  });

  it('should throw validation error if required fields are missing', async () => {
    const repo = new Repository({});
    let err;

    try {
      await repo.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe('ValidationError');
    expect(err.errors.userID).toBeDefined();
    expect(err.errors.author).toBeDefined();
    expect(err.errors.title).toBeDefined();
    expect(err.errors.repositoryUrl).toBeDefined();
  });

  it('should allow ratings array with proper validation', async () => {
    const data = {
      userID: 'user_2',
      author: 'Author 2',
      title: 'Repo 2',
      repositoryUrl: 'http://github.com/repo2',
      ratings: [{ userId: 'user_1', rating: 4 }],
    };

    const repo = new Repository(data);
    const saved = await repo.save();

    expect(saved.ratings.length).toBe(1);
    expect(saved.ratings[0].userId).toBe('user_1');
    expect(saved.ratings[0].rating).toBe(4);
  });

  it('should enforce rating min/max constraints', async () => {
    const data = {
      userID: 'user_3',
      author: 'Author 3',
      title: 'Repo 3',
      repositoryUrl: 'http://github.com/repo3',
      ratings: [{ userId: 'user_2', rating: 6 }],
    };

    const repo = new Repository(data);
    let err;

    try {
      await repo.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe('ValidationError');
    expect(err.errors['ratings.0.rating']).toBeDefined();
  });
});
