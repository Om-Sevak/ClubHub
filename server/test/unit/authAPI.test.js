const request = require("supertest");
const app = require('../../app');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Authentication Endpoints', () => {

  describe('POST /login', () => {
      test('Should log in existing user with correct credentials', async () => {
          await User.deleteMany();
          // Create a user
          const user = new User({
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              passwordHash: await bcrypt.hash('password', 12)
          });
          await user.save();

          // Log in with correct credentials
          const response = await request(app)
              .post('/login')
              .send({
                  email: 'john@example.com',
                  password: 'password'
              });

          expect(response.status).toBe(200);
          expect(response.body.message).toBe('Login successful');
      });

      test('Should return 401 for non-existent user', async () => {
          // Log in with incorrect credentials
          const response = await request(app)
              .post('/login')
              .send({
                  email: 'nonexistent@example.com',
                  password: 'password'
              });

          expect(response.status).toBe(401);
          expect(response.body.message).toBe('Unauthorized: Invalid email or password');
      });

      test('Should return 401 for incorrect password', async () => {
          // Log in with incorrect password
          const response = await request(app)
              .post('/login')
              .send({
                  email: 'john@example.com',
                  password: 'wrongpassword'
              });

          expect(response.status).toBe(401);
          expect(response.body.message).toBe('Unauthorized: Invalid email or password');
      });
  });

  describe('POST /register', () => {
      test('Should register a new user', async () => {

          // Register a new user
          await User.deleteMany();
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
      });

      test('Should return 400 for existing user', async () => {
          // Register an existing user
          const response = await request(app)
              .put('/register')
              .send({
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'alice@example.com',
                  password: 'password'
              });

          expect(response.status).toBe(400);
          expect(response.body.message).toBe('Bad Request: User already exists');
      });

      test('Should return 400 for invalid email format', async () => {
          // Register with invalid email format
          const response = await request(app)
              .put('/register')
              .send({
                  firstName: 'Bob',
                  lastName: 'Johnson',
                  email: 'invalidemail',
                  password: 'password'
              });

          expect(response.status).toBe(400);
          expect(response.body.message).toBe('Bad Request: Invalid email format');
      });

      test('Should return 400 for short password', async () => {
          // Register with short password
          const response = await request(app)
              .put('/register')
              .send({
                  firstName: 'Emily',
                  lastName: 'Brown',
                  email: 'emily@example.com',
                  password: 'pass'
              });

          expect(response.status).toBe(400);
          expect(response.body.message).toBe('Bad Request: Password must be at least 8 characters long');
      });
  });
});