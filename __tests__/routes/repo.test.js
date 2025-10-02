import sinon from 'sinon';
import supertest from 'supertest';
import repositorySchema from '../../src/models/repository.js';
import router from '../../src/routes/repository.routes.js';
import express from 'express';
const app = express()

app.use(express.json());
app.use('/', router);

const fakeData = {
    contributorID: 'contributor_1',
    author: 'author_1',
    title: 'title1',
    imageURL: 'http://example.com/image.jpg',
    tags: ['tag1', 'tag2'],
    totalComments: 5,
    ratings: [{ userId: 'user1', rating: 4 }],
    totalRating: 4,
    repositoryName: 'repo1',
    repositoryDesc: 'This is a test repository',
    repositoryDoc: 'http://example.com/doc.pdf',
    license: 'MIT',
    repositoryUrl: 'http://example.com/repo1'
};

describe('repository Routes', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('POST /repository', async () => {
        const stubSave = sinon.stub(repositorySchema.prototype, 'save').resolves(fakeData);
        const res = await supertest(app).post('/repository').send(fakeData);

        expect(res.status).toEqual(201);
        expect(stubSave.calledOnce).toEqual(true);
    });

    it('GET /repository', async () => {
        const repoStub = sinon.stub(repositorySchema, 'find').resolves([fakeData]);
        const res = await supertest(app).get('/repository');

        expect(res.status).toEqual(200);
        expect(repoStub.calledOnce).toEqual(true);
    });

    it('GET /repository/:id', async () => {
        const repoStub = sinon.stub(repositorySchema, 'findById').resolves(fakeData);
        const res = await supertest(app).get('/repository/id1');

        expect(res.status).toEqual(200);
        expect(repoStub.calledOnce).toEqual(true);
    });

    it('PUT /repository/:id', async () => {
        const updateStub = sinon.stub(repositorySchema, 'findOneAndUpdate').resolves(fakeData);
        const res = await supertest(app).put('/repository/id1').send(fakeData);

        expect(res.status).toEqual(200);
        expect(res.body.result).toMatchObject(fakeData);
        expect(updateStub.calledOnce).toEqual(true);
    });

    it('GET /unique-tags', async () => {
        const uniqueTagStub = sinon.stub(repositorySchema, 'aggregate').resolves([fakeData.tags]);
        const res = await supertest(app).get('/unique-tags');

        expect(res.status).toEqual(200);
        expect(uniqueTagStub.calledOnce).toEqual(true);
    });

    it('POST /repository/:id/ratings', async () => {
        const fakeRepoDoc = {
            ...fakeData,
            ratings: [{ userId: 'user1', rating: 4 }],
            save: sinon.stub().resolvesThis()
        };
        const ratingStub = sinon.stub(repositorySchema, 'findById').resolves(fakeRepoDoc);
        const res = await supertest(app).post('/repository/id1/ratings').send({ userId: 'user1', rating: 4 });

        expect(res.status).toEqual(200);
        expect(ratingStub.calledOnce).toEqual(true);
    });

    it('DELETE /repository/:id/ratings', async () => {
        const fakeRepoDoc = {
            ...fakeData,
            ratings: [{ userId: 'user1', rating: 4 }],
            save: sinon.stub().resolvesThis()
        };
        const ratingStub = sinon.stub(repositorySchema, 'findById').resolves(fakeRepoDoc);
        const res = await supertest(app).delete('/repository/id1/ratings').send({ userId: 'user1' });

        expect(res.status).toEqual(200);
        expect(ratingStub.calledOnce).toEqual(true);
    });

    it('GET /repository/:id/ratings', async () => {
        const ratingStub = sinon.stub(repositorySchema, 'findById').resolves(fakeData);
        const res = await supertest(app).get('/repository/id1/ratings');

        expect(res.status).toEqual(200);
        expect(ratingStub.calledOnce).toEqual(true);
    });
});