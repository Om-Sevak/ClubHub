/*********************************************************************************
    FileName: clubModel.test.js
    FileVersion: 1.0
    Core Feature(s): Unit Testing
    Purpose: This file contains integration tests for the Club model and its related routes. It utilizes Jest and Supertest for testing. The tests cover creating, getting, editing, and deleting clubs. Before each test, it connects to the test database and creates a test user. After each test, it deletes the test user and closes the database connection.
*********************************************************************************/

const mongoose = require("mongoose");
const request = require("supertest");
const app = require('../../app');
var session = require('supertest-session');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require("../../models/userModel");
const Club = require("../../models/clubModel");

// Loading in environment variables
// dotenv.config({path:'../../config/.env'})

let testSession = null;

// Connecting to the database before each test
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const user = new User({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    passwordHash: await bcrypt.hash('password', 12)
  });

  await user.save();
});

// Closing database connection after each test
afterAll(async () => {
    await User.deleteOne({email: "john@example.com"});
    await mongoose.connection.close();
});

beforeEach(() => {
  jest.setTimeout(100000);
});


// Example test
describe("Testing Club Mongo Model", () => {
    
    test('Should create a new club succesfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john@example.com", password: 'password' });

        const createClubRes = await testSession.post('/club')
            .send({name: 'test', descirption: 'Test description', email: 'johnny@example.com', interest: "Coding,Sports,Technology,Art,Science"})
            .expect(200);
        
        const club = await Club.findOne({name: "test"});
        expect(club.name).toBe("test");
        expect(club.email).toBe('johnny@example.com');
    });

    test("Get a specific club based on name.", async () => {
        
        const req = await request(app).get("/club/test")
            .expect(200)
        
        expect(req.body.name).toBe("test");
    });

    test('Should edit club successfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john@example.com", password: 'password' });

        const editClubRes = await testSession.put('/club/test')
            .send({name: 'test club', descirption: 'testing editing', email: 'johnny@example.ca', interest: "Coding,Sports,Business,Technology,Art"})
            .expect(201);
        
        const club = await Club.findOne({name: "test club"});
        expect(club.name).toBe("test club");
    });

    test('Should edit club successfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john@example.com", password: 'password' });

        const deleteClubRes = await testSession.delete('/club/test club')
            .expect(200);
        
        const club = await Club.findOne({name: "test club"});
        expect(club).toBe(null);
    });
});