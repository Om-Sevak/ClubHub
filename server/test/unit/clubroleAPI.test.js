const request = require('supertest');
const app = require('../../app');
const Club = require('../../models/clubModel');
const User = require('../../models/userModel');
const ClubMemberships = require('../../models/clubMembershipsModel');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
var session = require('supertest-session');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { login } = require('../../controllers/authController');

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

describe('Club Role Routes', () => {
  let user;
  let club;

  beforeEach(async () => {
    // Create a user
    user = await User.create({firstName:'Om', lastName:'Sevak', email: 'test@example.com', passwordHash: bcrypt.hashSync('password', 12) });

    // Create a club
    club = await Club.create({ name: 'Om testing club', email: 'omtesting@email.com' });
  });

  afterEach(async () => {
    // Clean up created documents after each test
    await User.deleteMany({});
    await Club.deleteMany({});
    await ClubMemberships.deleteMany({});
  });

  describe('POST /:name', () => {
    it('should return 403 if user is not logged in', async () => {
      testsession = session(app);

      const res = await testsession
        .post(`/role/${club.name}`)
        .send({ role: 'admin' });
  
      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Unauthorized');
    });

    it('should return 403 if user is not an admin', async () => {
      testsession = session(app);
      const res = await testsession
        .post(`/role/${club.name}`)
        .set('Cookie', [`email=${user.email}`])
        .send({ role: 'admin' });
  
      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Unauthorized');
    });

    it('should return 400 if user already has a role in the club', async () => {
      // Create a club membership for the user
      await ClubMemberships.create({ user: user._id, club: club._id, role: 'member' });
      testsession = session(app);
      // Log in the user
      await testsession.post('/login')
        .send({ email: user.email, password: 'password' });
    
      const res = await testsession
        .post(`/role/${club.name}`)
        .send({ role: 'admin' });
    
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('already a member');
    });

    it('should return 500 if an invalid role is provided', async () => {
      testsession = session(app);
      // Log in the user
      await testsession.post('/login')
        .send({ email: user.email, password: 'password' });
  
      const res = await testsession
        .post(`/role/${club.name}`)
        .send({ role: 'invalid_role' });
  
      expect(res.status).toBe(500);

    });

    it('should return 400 if trying to create an admin role where an admin already exists', async () => {
      // Create an admin role for the user
      await ClubMemberships.create({ user: user._id, club: club._id, role: 'admin' });
      const user2 = await User.create({firstName:'user2', lastName:'user', email: 'user2#example.com', passwordHash: bcrypt.hashSync('password', 12) });
      testsession = session(app);
      // Log in the user
      await testsession.post('/login')
        .send({ email: user2.email, password: 'password' });
  
      const res = await testsession
        .post(`/role/${club.name}`)
        .send({ role: 'admin' });
  
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('An admin already exists');
    });
    

  });


  describe('DELETE /:name', () => {
    it('should return 403 if user is not logged in', async () => {
      testsession = session(app);
      const res = await testsession
        .delete(`/role/${club.name}`);
  
      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Unauthorized');
    });
    
    it('should return 400 if trying to delete a role where the user is not a member', async () => {
      testsession = session(app);
      // Log in the user
      await testsession.post('/login')
        .send({ email: user.email, password: 'password' });
  
      const res = await testsession
        .delete(`/role/${club.name}`);
  
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('not a member');
    });
  
    it('should return 400 if trying to delete an admin role', async () => {
      // Create an admin role for the user
      await ClubMemberships.create({ user: user._id, club: club._id, role: 'admin' });
      testsession = session(app);
      // Log in the user
      await testsession.post('/login')
        .send({ email: user.email, password: 'password' });
  
      const res = await testsession
        .delete(`/role/${club.name}`);
  
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Admin can not leave the club');
    });
  
    it('should return 200 and delete the role successfully', async () => {
      // Create a club membership for the user
      await ClubMemberships.create({ user: user._id, club: club._id, role: 'member' });
      testsession = session(app);
      // Log in the user
      await testsession.post('/login')
        .send({ email: user.email, password: 'password' });
  
      const res = await testsession
        .delete(`/role/${club.name}`);
  
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Left Club Succesfully');
    });
  });
  

  describe('GET /:name', () => {

    it('should return 404 if role not found for the user and club', async () => {
      // Log in the user
      testsession = session(app);
      await testsession
        .post('/login')
        .send({ email: user.email, password: 'password' });
  
      const res = await testsession
        .get('/role/NonExistingClub');
  
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Not Found');
    });

    it('should return 200 and the role of the user in the club', async () => {
      // Create a club membership for the user
      await ClubMemberships.create({ user: user._id, club: club._id, role: 'member' });
      testsession = session(app);
      // Log in the user
      await testsession
        .post('/login')
        .send({ email: user.email, password: 'password' });
  
      const res = await testsession
        .get(`/role/${club.name}`);
  
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('is part of');
      expect(res.body.data.role).toBe('member');
    });
  

  });
  

});

