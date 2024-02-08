const mongoose = require("mongoose");
const request = require("supertest");
const app = require('../app');
const dotenv = require('dotenv');

// Loading in environment variables
dotenv.config({path:'./config/.env'})

// Connecting to the database before each test
beforeEach(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

// Closing database connection after each test
afterEach(async () => {
  await mongoose.connection.close();
});

// Example test
describe("GET /club/:name", () => {
    test("Get a specific club based on name.", async () => {
        await request(app).get("/club/test")
            .expect(200)
            .then((res) => {
                expect(res.statusCode).toEqual(200);
                expect(res.body.message).toEqual("Found club");
            });
    });
});