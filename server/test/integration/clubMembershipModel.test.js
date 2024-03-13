const mongoose = require("mongoose");
const request = require("supertest");
const app = require('../../app');
var session = require('supertest-session');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require("../../models/userModel");
const Club = require("../../models/clubModel");
const ClubMembership = require("../../models/clubMembershipsModel");

// Loading in environment variables
dotenv.config({path:'../../config/.env'})

let testSession = null;

//Connecting to the database before each test
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const user = new User({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john2@example.com',
    passwordHash: await bcrypt.hash('password', 12)
  });

  const club = new Club({
    name: 'testing',
    description: 'test',
    email: 'test@test.com',
    interest: 'test,test,test,test,test'
  })

  await user.save();
  await club.save();
});

// Closing database connection after each test
afterAll(async () => {
    await User.deleteOne({email: "john2@example.com"});
    await Club.deleteOne({name: "testing"});
    await ClubMembership.deleteOne({role: "member"});
    await mongoose.connection.close();
});

describe("Testing ClubMembership Mongo Model", () => {
    
    test('Should create a new club role succesfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john2@example.com", password: 'password' });

        const req = await testSession.post('/role/testing')
            .send({role: "member"})
            .expect(200);
        
        const membership = await ClubMembership.findOne({role: "member"});
        expect(membership.role).toBe("member");
    });

    test('Should delete club role succesfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john2@example.com", password: 'password' });

        const req = await testSession.delete('/role/testing')
            .expect(200);
        
        const membership = await ClubMembership.findOne({role: "member"});
        expect(membership).toBe(null)
    });
});