const request = require("supertest");
var session = require('supertest-session');
const app = require('../app');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

let mongoServer;
let testSession = null;


describe('Club Endpoints', () => {

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        await User.deleteMany();
            // Create a user
            const user = new User({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                passwordHash: await bcrypt.hash('password', 12)
            });

            const anotherUser = new User({
                firstName: 'test',
                lastName: 'test',
                email: 'test@example.com',
                passwordHash: await bcrypt.hash('password', 12)
            });

        await user.save();
        await anotherUser.save();
    });
    
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    describe('POST /club', () => {
        test('Should create a new club succesfully', async () => {

            testSession = session(app);

            const loginRes = await testSession.post('/login')
                .send({ email: 'john@example.com', password: 'password' })
                .expect(200);

            const createClubRes = await testSession.post('/club')
                .send({name: 'test club', descirption: 'Test description', email: 'johnny@example.com', interest: "Coding,Sports,Technology,Art,Science"})
                .expect(200);
        });

        test('Should fail to create a new club if a user is not signed in', async () => {

            testSession = session(app);

            const createClubRes = await testSession.post('/club')
                .send({name: 'test club', descirption: 'Test description', email: 'johnny@example.com'})
                .expect(403);
        });

        test('Should fail to create a new club if a club with the requested name already exists', async () => {

            testSession = session(app);

            const loginRes = await testSession.post('/login')
                .send({ email: 'john@example.com', password: 'password' })
                .expect(200);

            const createClubFail = await testSession.post('/club')
                .send({name: 'test club', descirption: 'Test description', email: 'johnny@example.com'})
                .expect(400);
        });

        test('Should fail to create a new club if the email format provided is incorrect', async () => {

            testSession = session(app);

            const loginRes = await testSession.post('/login')
                .send({ email: 'john@example.com', password: 'password' })
                .expect(200);

            const createClubFail = await testSession.post('/club')
                .send({name: 'test', descirption: 'Test description', email: 'johnnyexample.com'})
                .expect(400);
        });

        test('Should fail to create a new club if there are less than 5 interests provided', async () => {

            testSession = session(app);

            const loginRes = await testSession.post('/login')
                .send({ email: 'john@example.com', password: 'password' })
                .expect(200);

            const createClubFail = await testSession.post('/club')
                .send({name: 'test', descirption: 'Test description', email: 'johnny@example.com', interest: "Coding,Sports"})
                .expect(400);
        });
    })

    describe('GET /club/:clubName', () => {
        
        test('Should get club successfully', async () => {

            testSession = session(app);

            const getClubRes = await testSession.get('/club/test club')
                .expect(200);
        });

        test('Should fail to get club that doesnt exist', async () => {

            testSession = session(app);

            const getClubRes = await testSession.get('/club/Dne club')
                .expect(404);
        });
    })

    describe('PUT /club/:clubName', () => {
        
        test('Should edit club successfully', async () => {

            testSession = session(app);

            const loginRes = await testSession.post('/login')
                .send({ email: 'john@example.com', password: 'password' })
                .expect(200);

            const editClubRes = await testSession.put('/club/test club')
                .send({name: 'test club', descirption: 'testing editing', email: 'johnny@example.ca', interest: ["Coding","Sports","Business"]})
                .expect(201);
        });

        test('Should fail to edit club name if the email format is invalid', async () => {

            testSession = session(app);

            const loginRes = await testSession.post('/login')
                .send({ email: 'john@example.com', password: 'password' })
                .expect(200);

                const editClubRes = await testSession.put('/club/test club')
                .send({name: 'test club', descirption: 'testing editing', email: 'johnny@example'})
                .expect(400);
        });

        test('Should fail to edit club name if the club name already exists', async () => {

            testSession = session(app);

            const loginRes = await testSession.post('/login')
                .send({ email: 'john@example.com', password: 'password' })
                .expect(200);

            const createClubRes = await testSession.post('/club/')
                .send({name: 'new club', descirption: 'testing editing', email: 'johnny@example.ca', interest: "Coding,Sports,Technology,Art,Science"})
                .expect(200);
            
            const editClubRes = await testSession.put('/club/test club')
                .send({name: 'new club', descirption: 'testing editing', email: 'johnny@example.ca'})
                .expect(400);
        });

        test('Should fail to edit a club that does not exist', async () => {

            testSession = session(app);

            const loginRes = await testSession.post('/login')
                .send({ email: 'john@example.com', password: 'password' })
                .expect(200);

            const editClubRes = await testSession.put('/club/fake club')
                .send({name: 'fake club', descirption: 'testing editing', email: 'johnny@example.com'})
                .expect(404);
        });

        test('Should fail to edit if the user is not signed in', async () => {

            testSession = session(app);

            const editClubRes = await testSession.put('/club/test club')
                .send({name: 'test club', descirption: 'testing editing', email: 'johnny@example.com'})
                .expect(403);
        });

        test('Should fail to edit if the user is not an admin', async () => {

            testSession = session(app);

            const loginRes = await testSession.post('/login')
                .send({ email: 'test@example.com', password: 'password' })
                .expect(200);

            const editClubRes = await testSession.put('/club/test club')
                .send({name: 'test club', descirption: 'testing editing', email: 'johnny@example.com'})
                .expect(403);
        });

        test('Should fail to edit club name if there are less than 3 interests', async () => {

            testSession = session(app);

            const loginRes = await testSession.post('/login')
                .send({ email: 'john@example.com', password: 'password' })
                .expect(200);

                const editClubRes = await testSession.put('/club/test club')
                .send({name: 'test club', descirption: 'testing editing', email: 'johnny@example.com', interest: ["Coding","Sports"]})
                .expect(400);
        });
    })
})