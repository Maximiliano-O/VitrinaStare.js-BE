const sinon = require('sinon');
const supertest = require('supertest');
const releaseSchema = require('../../src/models/release');
const router = require('../../src/routes/release');
const express = require('express');
const app = express()

app.use(express.json());
app.use('/', router);

const fakeData = {
    repositoryID: '1',
    name: 'Release1',
    description: 'Description1',
    created_at: Date.now(),
    codesandbox_URL: 'http://localhost',
    verified: false,
    statuses: [],
};

describe('Release Routes', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('POST /release', async () => {
        const stubSave = sinon.stub(releaseSchema.prototype, 'save').resolves(fakeData);
        const res = await supertest(app).post('/release').send(fakeData);

        expect(res.status).toEqual(200);
        expect(stubSave.calledOnce).toEqual(true);
    });

    it('GET /release', async () => {
        const releaseStub = sinon.stub(releaseSchema, 'find').resolves([fakeData]);
        const res = await supertest(app).get('/release');

        expect(res.status).toEqual(200);
        expect(releaseStub.calledOnce).toEqual(true);
    });

    it('GET /release/:id', async () => {
        const releaseStub = sinon.stub(releaseSchema, 'findById').resolves(fakeData);
        const res = await supertest(app).get('/release/id1');

        expect(res.status).toEqual(200);
        expect(releaseStub.calledOnce).toEqual(true);
    });

    it('GET /release/repository/:repositoryID', async () => {
        const releaseStub = sinon.stub(releaseSchema, 'find').resolves([fakeData]);
        const res = await supertest(app).get('/release/repository/1');

        expect(res.status).toEqual(200);
        expect(releaseStub.calledOnce).toEqual(true);
    });

    it('DELETE /release/:id', async () => {
        const releaseStub = sinon.stub(releaseSchema, 'remove').resolves(fakeData);
        const res = await supertest(app).delete('/release/id1');

        expect(res.status).toEqual(200);
        expect(releaseStub.calledOnce).toEqual(true);
    });

    it('PUT /release/:id', async () => {
        const releaseStub = sinon.stub(releaseSchema, 'updateOne').resolves(fakeData);
        const res = await supertest(app).put('/release/id1').send(fakeData);

        expect(res.status).toEqual(200);
        expect(releaseStub.calledOnce).toEqual(true);
    });

    it('POST /releases/:id/statuses', async () => {
        const releaseStub = sinon.stub(releaseSchema, 'findById').resolves(fakeData);
        const res = await supertest(app).post('/releases/id1/statuses').send(fakeData);

        expect(res.status).toEqual(200);
        expect(releaseStub.calledOnce).toEqual(true);
    });


    it('POST /release/:id/status', async () => {
        const fakeMongooseDocument = {
            ...fakeData,
            save: sinon.stub().resolves(this)
        };
        const releaseStub = sinon.stub(releaseSchema, 'findOneAndUpdate').resolves(fakeMongooseDocument);
        const newStatus = {
            releaseID: '1',
            reviewerID: 'reviewer1',
            isReviewed: true,
            isSafe: true,
            additionalComments: 'This is safe',
            reviewDate: Date.now()
        };
        const res = await supertest(app).post('/release/id1/status').send(newStatus);
        console.log(res.body); // Log the response body
        expect(res.status).toEqual(200);
        expect(releaseStub.calledOnce).toEqual(true);
    });
});