import sinon from 'sinon';
import supertest from 'supertest';
import commentSchema from '../../../src/models/comment.js';
import router from '../../../src/routes/comment.routes.js';
import express from 'express';
const app = express()

app.use(express.json());
app.use('/', router);

const fakeData = {
    authorID: 'author_1',
    repositoryID: 'repo_1',
    repoName: 'repository 1',
    username: 'user1',
    body: 'Some comment'
};

describe('Comments Routes', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('POST /comments', async () => {
        const stubSave = sinon.stub(commentSchema.prototype, 'save').resolves(fakeData);
        const res = await supertest(app).post('/comments').send(fakeData);

        expect(res.status).toEqual(201);
        expect(stubSave.calledOnce).toEqual(true);
    });

    it('GET /comments', async () => {
        const commentsStub = sinon.stub(commentSchema, 'find').resolves([fakeData]);
        const res = await supertest(app).get('/comments');

        expect(res.status).toEqual(200);
        expect(commentsStub.calledOnce).toEqual(true);
    });

    it('GET /comments/:id', async () => {
        const commentStub = sinon.stub(commentSchema, 'findById').resolves(fakeData);
        const res = await supertest(app).get('/comments/id1');

        expect(res.status).toEqual(200);
        expect(commentStub.calledOnce).toEqual(true);
    });

    it('GET /comments/repository/:repositoryID', async () => {
        const commentsOnRepoStub = sinon.stub(commentSchema, 'find').resolves([fakeData]);
        const res = await supertest(app).get('/comments/repository/repo_1');

        expect(res.status).toEqual(200);
        expect(commentsOnRepoStub.calledOnce).toEqual(true);
    });

    it('GET /comments/author/:authorID', async () => {
        const commentsByAuthorStub = sinon.stub(commentSchema, 'find').resolves([fakeData]);
        const res = await supertest(app).get('/comments/user/author_1');

        expect(res.status).toEqual(200);
        expect(commentsByAuthorStub.calledOnce).toEqual(true);
    });

    it('DELETE /comments/:id', async () => {
        const removeStub = sinon.stub(commentSchema, 'findByIdAndDelete').resolves({ deletedCount: 1 });
        const res = await supertest(app).delete('/comments/id1');
        expect(res.status).toEqual(200);
        expect(removeStub.calledOnce).toEqual(true);
    });

    it('PUT /comments/:id', async () => {
        const updateStub = sinon.stub(commentSchema, 'findByIdAndUpdate').resolves(fakeData);
        const res = await supertest(app).put('/comments/id1').send(fakeData);
        console.log(res.body);  // Print the response body
        expect(res.status).toEqual(200);
        expect(res.body.result).toMatchObject(fakeData);
        expect(updateStub.calledOnce).toEqual(true);
    });
});