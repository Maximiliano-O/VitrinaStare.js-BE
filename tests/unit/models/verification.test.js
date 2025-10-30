import mongoose from 'mongoose';
import Verification from '../../../src/models/verification.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

describe('Verification Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterEach(async () => {
    await Verification.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('should create a verification with required fields', async () => {
    const data = {
      releaseID: 'release_1',
      reviewerID: 'user_1',
    };

    const verification = new Verification(data);
    const saved = await verification.save();

    expect(saved._id).toBeDefined();
    expect(saved.releaseID).toBe(data.releaseID);
    expect(saved.reviewerID).toBe(data.reviewerID);
    expect(saved.isReviewed).toBe(false);
    expect(saved.isSafe).toBe(false);
    expect(saved.additionalComments).toBe('');
    expect(saved.reviewDate).toBeInstanceOf(Date);
  });

  it('should throw validation error if required fields are missing', async () => {
    const verification = new Verification({});
    let err;
    try {
      await verification.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe('ValidationError');
    expect(err.errors.releaseID).toBeDefined();
    expect(err.errors.reviewerID).toBeDefined();
  });

  it('should allow optional additionalComments', async () => {
    const data = {
      releaseID: 'release_2',
      reviewerID: 'user_2',
      additionalComments: 'Looks good!',
    };

    const verification = new Verification(data);
    const saved = await verification.save();

    expect(saved.additionalComments).toBe('Looks good!');
  });
});
