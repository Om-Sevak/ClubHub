const request = require("supertest");
var session = require('supertest-session');
const app = require('../../app');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const Club = require('../../models/clubModel')
const Interest = require('../../models/interestModel');
const interestsController = require('../../controllers/interestController');
const bcrypt = require('bcryptjs');

let mongoServer;
let testSession = null;


describe('Interest Controller', () => {

    const INTERESTS = ['Art', 'Science', 'Music', 'Tech', 'Stars', 'School', 'Movies', 'Fitness'];
    const USER_INTERESTS = ['Music', 'Tech', 'Stars', 'School', 'Movies'];

    let user;
    let userclubNoInterestsBadInput;

    let club;
    let clubNoInterestsBadInput;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        for (const interest of INTERESTS) {
            const newInterest = new Interest({
                name: interest
            })
            await newInterest.save();
        }

        await User.deleteMany();
        await Club.deleteMany();
        
        user = await User.create({ firstName: 'John', lastName: 'Doe', email: 'test@example.com', passwordHash: bcrypt.hashSync('password', 12) });
        userclubNoInterestsBadInput = await User.create({ firstName: 'Jim', lastName: 'Jenkins', email: 'testBad@example.com', passwordHash: bcrypt.hashSync('password', 12) });

        club = await Club.create({ name: 'Test Club', email: 'test@email.com' });
        clubNoInterestsBadInput = await Club.create({ name: 'Test Club With No Valid Interests', email: 'test@email.com' });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
    describe('Interests', () => {
        describe('GET /', () => {
            it('should return 200', async () => {
                const res = await request(app)
                    .get(`/interest`)

                expect(res.status).toBe(200);
                expect(res.body.interests).toEqual(expect.arrayContaining(INTERESTS));
            });
        });
    });

    describe('Club Interests', () => {
        describe('createClubInteressts', () => {
            it('Should be 200 - Get/Create club interests', async () => {
                const resCreate = await interestsController.createClubInterestsMiddleware(INTERESTS, club.name);
                const res = await request(app)
                    .get(`/interest/${club.name}`)

                expect(INTERESTS).toEqual(expect.arrayContaining(res.body.interests));
                expect(res.status).toBe(200);
            });
        })

        describe('GET /:name', () => {
            it('Should return clubs interests', async () => {
                const res = await request(app)
                    .get(`/interest/${club.name}`)

                expect(INTERESTS).toEqual(expect.arrayContaining(res.body.interests));
                expect(res.status).toBe(200);
            });

            it('Should fail to get interests as the club does not exist', async () => {
                const res = await request(app)
                    .get(`/interest/CLUB DNE`)

                expect(res.body.status).toEqual("fail");
                expect(res.status).toBe(404);
            });
        })

        describe('editClubInterestsMiddleware', () => {
            it('Should return SUCCESS, interest list should match edited list', async () => {
                const editedInterest = ['Art', 'Science', 'Music', 'Tech', 'Fitness'];
                const res = await interestsController.editClubInterestsMiddleware(editedInterest, club.name);

                const interestReturned = await request(app)
                    .get(`/interest/${club.name}`)

                expect(interestReturned.body.interests).toEqual(expect.arrayContaining(editedInterest));
            });
        })
    });

    describe('User Interests', () => {
        describe('createUserInterests', () => {
            test('Should be 200 - Get/Create user interests', async () => {
                testSession = session(app);

                const loginRes = await testSession.post('/login')
                .send({ email: user.email, password: 'password' })
                .expect(200);

                const resCreate = await interestsController.createUserInterestsMiddleware(USER_INTERESTS, user.email);
                
                const res = await testSession
                    .get(`/interest/user/${user.email}`)

                expect(res.body.interests).toEqual(expect.arrayContaining(USER_INTERESTS));
                expect(res.status).toBe(200);
            });


            it('Should get 401 to get interests as the user is not logged in', async () => {
                const res = await request(app)
                    .get(`/interest/user/${user.email}`)

                expect(res.body.status).toEqual("fail");
                expect(res.status).toBe(401);
            });
        })

        describe('editUserInterests', () => {
            it('Should be 200, interest list should match edited list', async () => {
                const editedInterest = ['Art', 'Science', 'Music', 'Tech', 'Fitness'];
                
                testSession = session(app);

                const loginRes = await testSession.post('/login')
                .send({ email: user.email, password: 'password' })
                .expect(200);

                const res = await testSession
                    .post(`/interest/save`)
                    .send({ interests: editedInterest});

                const interestReturned = await testSession
                    .get(`/interest/user/${user.email}`)

                expect(interestReturned.body.interests).toEqual(expect.arrayContaining(editedInterest));
            });

            it('Should return 401 - Not logged in', async () => {
                const editedInterest = ['Art', 'Science', 'Music', 'Tech', 'Fitness'];
                
                const res = await request(app)
                    .post(`/interest/save`)
                    .send({ interests: editedInterest});
                
                expect(res.body.status).toEqual("fail");
                expect(res.status).toBe(401);
            });

            it('Should return 400 - Not enough interests', async () => {
                const editedInterest = ['Art', 'Science'];
                
                testSession = session(app);

                const loginRes = await testSession.post('/login')
                .send({ email: user.email, password: 'password' })
                .expect(200);

                const res =await testSession
                    .post(`/interest/save`)
                    .send({ interests: editedInterest});
                
                expect(res.body.status).toEqual("fail");
                expect(res.status).toBe(400);
            });

            it('Should return 400 - Interests DNE', async () => {
                const editedInterest = ['Art', 'Science', 'test'];
                
                testSession = session(app);

                const loginRes = await testSession.post('/login')
                .send({ email: user.email, password: 'password' })
                .expect(200);

                const res = await testSession
                    .post(`/interest/save`)
                    .send({ interests: editedInterest});
                
                expect(res.body.status).toEqual("fail");
                expect(res.status).toBe(400);
            });

        })
    });
});