const mongoose = require("mongoose");
const request = require("supertest");
const app = require('../../app');
var session = require('supertest-session');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require("../../models/userModel");
const Club = require("../../models/clubModel");
const ClubMembership = require("../../models/clubMembershipsModel");
const ClubEvent = require("../../models/clubEventModel");

// // Loading in environment variables
// dotenv.config({path:'../../config/.env'})

let testSession = null;
let eventID = null;

//Connecting to the database before each test
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const user = new User({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john3@example.com',
    passwordHash: await bcrypt.hash('password', 12)
  });

  await user.save();
});

// Closing database connection after each test
afterAll(async () => {
    await User.deleteOne({email: "john3@example.com"});
    await Club.deleteOne({name: "testingg"});
    await mongoose.connection.close();
});

beforeEach(() => {
    jest.setTimeout(100000);
  });


describe("Testing ClubMembership Mongo Model", () => {
    
    test('Should create a new club event succesfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john3@example.com", password: 'password' });

        const createClubRes = await testSession.post('/club')
            .send({name: 'testingg', descirption: 'Test description', email: 'johnny@example.com', interest: "Coding,Sports,Technology,Art,Science"})
            .expect(200);

        const req = await testSession.post('/club/testingg/event')
            .send({title: "test", description: "test", date: "2022-02-02", location: "test"})
            .expect(200);
        
        const event = await ClubEvent.findOne({title: "test"});
        eventID = event.id;
        expect(event.title).toBe("test");
    });

    test('Should edit a club event succesfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john3@example.com", password: 'password' });

        const req = await testSession.put(`/club/testingg/event/${eventID}`)
            .send({title: "testing", description: "test", date: "2022-02-02", location: "test"})
            .expect(201);
        
        const event = await ClubEvent.findOne({title: "testing"});
        expect(event.title).toBe("testing");
    });

    test('Should delete a club event succesfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john3@example.com", password: 'password' });

        const req = await testSession.delete(`/club/testingg/event/${eventID}`)
            .expect(200);
        
        const event = await ClubEvent.findOne({title: "testing"});
        expect(event).toBe(null);
    });
});