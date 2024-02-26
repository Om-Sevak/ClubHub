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
        await user.save();
    });
    
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    describe('POST /club', () => {
        test('Should create a new club succesfully', async () => {

            testSession = session(app);

            const res = await testSession.post('/login')
                .send({ email: 'john@example.com', password: 'password' })
                .expect(200);

            // This returns a 403, the session does not persist
            const resone = await testSession.post('/club')
                .send({name: 'test club', descirption: 'Test description', email: 'johnny@example.com'})
                .expect(200);
        });
    })
})