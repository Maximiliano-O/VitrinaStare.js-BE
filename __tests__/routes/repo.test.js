const sinon = require('sinon');
const supertest = require('supertest');
const repoV2Schema = require('../../src/models/repoV2');
const router = require('../../src/routes/repoV2');
const express = require('express');
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

describe('RepoV2 Routes', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('POST /repoV2', async () => {
        const stubSave = sinon.stub(repoV2Schema.prototype, 'save').resolves(fakeData);
        const res = await supertest(app).post('/repoV2').send(fakeData);

        expect(res.status).toEqual(200);
        expect(stubSave.calledOnce).toEqual(true);
    });

    it('GET /repoV2', async () => {
        const repoStub = sinon.stub(repoV2Schema, 'find').resolves([fakeData]);
        const res = await supertest(app).get('/repoV2');

        expect(res.status).toEqual(200);
        expect(repoStub.calledOnce).toEqual(true);
    });

    it('GET /repoV2/:id', async () => {
        const repoStub = sinon.stub(repoV2Schema, 'findById').resolves(fakeData);
        const res = await supertest(app).get('/repoV2/id1');

        expect(res.status).toEqual(200);
        expect(repoStub.calledOnce).toEqual(true);
    });

    it('PUT /repoV2/:id', async () => {
        const updateStub = sinon.stub(repoV2Schema, 'findOneAndUpdate').resolves(fakeData);
        const res = await supertest(app).put('/repoV2/id1').send(fakeData);

        expect(res.status).toEqual(200);
        expect(JSON.parse(res.text)).toMatchObject(fakeData);
        expect(updateStub.calledOnce).toEqual(true);
    });

    it('GET /unique-tags', async () => {
        const uniqueTagStub = sinon.stub(repoV2Schema, 'aggregate').resolves([fakeData.tags]);
        const res = await supertest(app).get('/unique-tags');

        expect(res.status).toEqual(200);
        expect(uniqueTagStub.calledOnce).toEqual(true);
    });

    it('POST /repoV2/:id/ratings', async () => {
        const ratingStub = sinon.stub(repoV2Schema, 'findById').resolves(fakeData);
        const res = await supertest(app).post('/repoV2/id1/ratings').send({ userId: 'user1', rating: 4 });

        expect(res.status).toEqual(200);
        expect(ratingStub.calledOnce).toEqual(true);
    });

    it('DELETE /repoV2/:id/ratings', async () => {
        const ratingStub = sinon.stub(repoV2Schema, 'findById').resolves(fakeData);
        const res = await supertest(app).delete('/repoV2/id1/ratings').send({ userId: 'user1' });

        expect(res.status).toEqual(200);
        expect(ratingStub.calledOnce).toEqual(true);
    });

    it('GET /repoV2/:id/ratings', async () => {
        const ratingStub = sinon.stub(repoV2Schema, 'findById').resolves(fakeData);
        const res = await supertest(app).get('/repoV2/id1/ratings');

        expect(res.status).toEqual(200);
        expect(ratingStub.calledOnce).toEqual(true);
    });
});