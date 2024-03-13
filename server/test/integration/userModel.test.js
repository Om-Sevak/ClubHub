const mongoose = require("mongoose");
const request = require("supertest");
const app = require('../../app');
var session = require('supertest-session');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require("../../models/userModel");

// Loading in environment variables
// dotenv.config({path:'../../config/.env'})

let testSession = null;


// Example test
describe("Testing User Mongo Model", () => {
    
    // Connecting to the database before each test
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI_TEST);
    });
    
    // Closing database connection after each test
    afterAll(async () => {
        const user = await User.deleteOne({email: "alice@example.com"});
        await mongoose.connection.close();
    });
  
    test('Should create a new user succesfully', async () => {

        const response = await request(app)
              .put('/register')
              .send({
                  firstName: 'Alice',
                  lastName: 'Smith',
                  email: 'alice@example.com',
                  password: 'password'
              });

          expect(response.status).toBe(200);
          expect(response.body.message).toBe('User created successfully');

          const user = await User.findOne({email: 'alice@example.com'});
          expect(user.firstName).toBe("Alice");
    });

    test('Should login with created user succesfully', async () => {

        const response = await request(app)
            .post('/login')
            .send({
                email: 'alice@example.com',
                password: 'password'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');

    });
});