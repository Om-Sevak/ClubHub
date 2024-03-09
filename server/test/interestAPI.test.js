const request = require("supertest");
const app = require('../app');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

let mongoServer;

describe('Interest Endpoints', () => {

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

    describe('GET /', () => {
        it('should return 200', async () => {
          const res = await request(app)
            .get(`/interest`)
    
          expect(res.status).toBe(200);
        });
    });
});