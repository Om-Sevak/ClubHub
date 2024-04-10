const mongoose = require("mongoose");
const request = require("supertest");
const app = require('../../app');
var session = require('supertest-session');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require("../../models/userModel");
const Club = require("../../models/clubModel");
const ClubMembership = require("../../models/clubMembershipsModel");
const ClubPost = require("../../models/clubPostModel");

// Loading in environment variables
// dotenv.config({path:'../../config/.env'})

let testSession = null;
let postID = null;

//Connecting to the database before each test
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const user = new User({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john4@example.com',
    passwordHash: await bcrypt.hash('password', 12)
  });

  await user.save();
});

// Closing database connection after each test
afterAll(async () => {
    await User.deleteOne({email: "john4@example.com"});
    await Club.deleteOne({name: "testinggg"});
    await ClubPost.deleteOne({title: "testing"});
    await mongoose.connection.close();
});

beforeEach(() => {
    jest.setTimeout(100000);
  });


describe("Testing ClubMembership Mongo Model", () => {
    
    test('Should create a new club post succesfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john4@example.com", password: 'password' });

        const createClubRes = await testSession.post('/club')
            .send({name: 'testinggg', descirption: 'Test description', email: 'johnny@example.com', interest: "Coding,Sports,Technology,Art,Science"})
            .expect(200);

        const req = await testSession.post('/post/testinggg')
            .send({title: "test", content: "test", date: "2022-02-02" })
            .expect(200);
        
        const post = await ClubPost.findOne({title: "test"});
        postID = post.id;
        expect(post.title).toBe("test");
    });

    test('Should edit a club post succesfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john4@example.com", password: 'password' });

        const req = await testSession.put(`/post/testinggg/${postID}`)
            .send({title: "testing", description: "test", date: "2022-02-02", location: "test"})
            .expect(201);
        
        const post = await ClubPost.findOne({title: "testing"});
        expect(post.title).toBe("testing");
    });

    test('Should delete a club post succesfully', async () => {

        testSession = session(app);

        await testSession.post('/login')
          .send({ email: "john4@example.com", password: 'password' });

        const req = await testSession.delete(`/post/testinggg/${postID}`)
            .expect(200);
        
        const post = await ClubPost.findOne({title: "testing"});
        expect(post).toBe(null);
    });
});