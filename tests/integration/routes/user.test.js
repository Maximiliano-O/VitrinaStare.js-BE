import sinon from 'sinon';
import bcrypt from 'bcrypt';
import supertest from 'supertest';
import userSchema from '../../../src/models/user.js';
import router from '../../../src/routes/user.routes.js';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/', router);

const fakeUser = {
    email: 'user1@mail.com',
    password: 'userpassword',
    contrInfo: {
        username: 'User1',
        imageURL: 'http://userimg.com',
        latestPost: '',
        profileURL: 'http://userprofile.com',
        totalComments: 0,
        totalRating: 0
    }
};

describe('User Routes', () => {

    afterEach(() => {
        sinon.restore();
    });

/*
    it('should hash the user password before saving', async () => {
        const user = new userSchema(fakeUser);

        const saveSpy = sinon.spy(user, 'save');
        const hashSpy = sinon.spy(bcrypt, 'hash');

        await user.save();

        sinon.assert.calledOnce(saveSpy);
        sinon.assert.calledOnce(hashSpy);

        bcrypt.hash.restore();
    },  10000);
*/
    it('POST /users', async () => {
        const stubSave = sinon.stub(userSchema.prototype, 'save').resolves(fakeUser);
        const res = await supertest(app).post('/users').send(fakeUser);

        expect(res.status).toEqual(201);
        expect(stubSave.calledOnce).toEqual(true);
    });

    it('GET /users', async () => {
        sinon.stub(userSchema, 'find').resolves([fakeUser]);
        const res = await supertest(app).get('/users');

        expect(res.status).toEqual(200);
    });

    it('GET /users/:id', async () => {
        sinon.stub(userSchema, 'findById').resolves(fakeUser);
        const res = await supertest(app).get('/users/id1');

        expect(res.status).toEqual(200);
    });

    it('DELETE /users/:id', async () => {
        sinon.stub(userSchema, 'findByIdAndDelete').resolves({ deletedCount: 1 });
        const res = await supertest(app).delete('/users/id1');

        expect(res.status).toEqual(200);
    });

    it('PUT /users/:id', async () => {
        sinon.stub(userSchema, 'findByIdAndUpdate').resolves(fakeUser);
        const res = await supertest(app).put('/users/id1').send(fakeUser);

        expect(res.status).toEqual(200);
    });

    /*
    it.only('POST /login', async () => {
        const stubFindOne = sinon.stub(userSchema, 'findOne').resolves(fakeUser);
        console.log('findOne stub:', stubFindOne); // Log the findOne stub

        const stubCompare = sinon.stub(bcrypt, 'compare').callsFake((sentPassword, userPassword, callback) => {
            const isMatch = sentPassword === userPassword;
            console.log('compare stub:', isMatch); // Log the result of the compare stub
            callback(null, isMatch);
        });

        const res = await supertest(app).post('/login').send({ email: fakeUser.email, password: fakeUser.password });

        console.log('Response:', res.body); // Log the response body
        expect(res.status).toEqual(200);
        expect(stubFindOne.calledOnce).toEqual(true);
        expect(stubCompare.calledOnce).toEqual(true);
    }, 10000);


     */


    it('POST /login', async () => {
        const stubFindOne = sinon.stub(userSchema, 'findOne').resolves(fakeUser);
        console.log('findOne stub:', stubFindOne); // Log the findOne stub

        const stubCompare = sinon.stub(bcrypt, 'compare').callsFake((sentPassword, userPassword) => {
            const isMatch = sentPassword === userPassword;
            console.log('compare stub:', isMatch); // Log the result of the compare stub
            return Promise.resolve(isMatch);
        });

        const res = await supertest(app).post('/login').send({ email: fakeUser.email, password: fakeUser.password });

        console.log('Response:', res.body); // Log the response body
        expect(res.status).toEqual(200);
        expect(stubFindOne.calledOnce).toEqual(true);
        expect(stubCompare.calledOnce).toEqual(true);
    }, 10000);


    it('should handle error during user creation', async () => {
        const errorMessage = 'Error saving user';

        sinon.stub(userSchema.prototype, 'save').rejects(new Error(errorMessage));

        const res = await supertest(app).post('/users').send(fakeUser);

        expect(res.status).toEqual(500);
        expect(res.body.message).toEqual("Failed to create user.");
    });
});