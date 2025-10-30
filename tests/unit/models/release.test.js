import mongoose from 'mongoose';
import Release from '../../../src/models/release.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

describe('Release Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterEach(async () => {
    await Release.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('should create a release with required fields', async () => {
    const data = {
      repositoryID: 'repo_1',
      name: 'Release 1',
      verified: true,
    };

    const release = new Release(data);
    const saved = await release.save();

    expect(saved._id).toBeDefined();
    expect(saved.repositoryID).toBe(data.repositoryID);
    expect(saved.name).toBe(data.name);
    expect(saved.verified).toBe(true);

    // Defaults
    expect(saved.description).toBe('');
    expect(saved.codesandbox_URL).toBe('');
    expect(saved.created_at).toBeInstanceOf(Date);
    expect(saved.statuses).toEqual([]);
  });

  it('should throw validation error if required fields are missing', async () => {
    const release = new Release({});
    let err;

    try {
      await release.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe('ValidationError');
    expect(err.errors.repositoryID).toBeDefined();
    expect(err.errors.name).toBeDefined();
    // no verificamos `verified` porque tiene default
  });

  it('should allow statuses array to contain verification subdocuments', async () => {
    const verificationData = {
      releaseID: 'release_2',
      reviewerID: 'admin1',
      isReviewed: true,
      isSafe: true,
      additionalComments: 'Approved'
    };

    const data = {
      repositoryID: 'repo_2',
      name: 'Release 2',
      verified: false,
      statuses: [verificationData],
    };

    const release = new Release(data);
    const saved = await release.save();

    expect(saved.statuses.length).toBe(1);
    expect(saved.statuses[0].releaseID).toBe(verificationData.releaseID);
    expect(saved.statuses[0].reviewerID).toBe(verificationData.reviewerID);
    expect(saved.statuses[0].isReviewed).toBe(true);
    expect(saved.statuses[0].isSafe).toBe(true);
    expect(saved.statuses[0].additionalComments).toBe('Approved');
  });
});
