const mongoose = require("mongoose");
const request = require("supertest");
const app = require('../../app');
var session = require('supertest-session');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require("../../models/userModel");
const Club = require("../../models/clubModel");
const ClubInterest = require("../../models/clubInterestsModel");
const Interest = require("../../models/interestModel");

// Loading in environment variables
// dotenv.config({path:'../../config/.env'})

let testSession = null;
let clubId = null

// Connecting to the database before each test
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const user = new User({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john5@example.com',
    passwordHash: await bcrypt.hash('password', 12)
  });

  const interest = new Interest({
    name: "Coding"
  })
  const interest1 = new Interest({
    name: "Sports"
  })
  const interest2 = new Interest({
    name: "Technology"
  })
  const interest3 = new Interest({
    name: "Art"
  })
  const interest4 = new Interest({
    name: "Science"
  })
  const interest5 = new Interest({
    name: "Business"
  })

  await user.save();
  await interest.save();
  await interest1.save();
  await interest2.save();
  await interest3.save();
  await interest4.save();
  await interest5.save();
});

// Closing database connection after each test
afterAll(async () => {
    await User.deleteOne({email: "john5@example.com"});
    await Interest.deleteOne({name: "Coding"})
    await Interest.deleteOne({name: "Sports"})
    await Interest.deleteOne({name: "Technology"})
    await Interest.deleteOne({name: "Art"})
    await Interest.deleteOne({name: "Science"})
    await Interest.deleteOne({name: "Business"})
    await ClubInterest.deleteMany({club: clubId});
    await Club.deleteOne({name: "testingggg"})
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
          .send({ email: "john5@example.com", password: 'password' });

        const createClubRes = await testSession.post('/club')
            .send({name: 'testingggg', descirption: 'Test description', email: 'johnny@example.com', interest: "Coding,Sports,Technology,Art,Science"})
            .expect(200);
        
        const club = await Club.findOne({name: "testingggg"});
        clubId = club.id;
        const clubInterest = await ClubInterest.find({club: club._id})
        expect(clubInterest.length).toBe(5);
    });

    test('Should edit club successfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john5@example.com", password: 'password' });

        const editClubRes = await testSession.put('/club/testingggg')
            .send({name: 'testingggg', descirption: 'testing editing', email: 'johnny@example.ca', interest: ["Coding","Sports","Business","Art","Science"]})
            .expect(201);
        
        const club = await Club.findOne({name: "test club"});
        const clubInterest = await ClubInterest.find({club: clubId})
        expect(clubInterest.length).toBe(3);
    });

    test('Should edit club successfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john5@example.com", password: 'password' });

        const deleteClubRes = await testSession.delete('/club/testingggg')
            .expect(200);
        
        const clubInterest = await ClubInterest.find({club: clubId})
        expect(clubInterest.length).toBe(0);
    });
});