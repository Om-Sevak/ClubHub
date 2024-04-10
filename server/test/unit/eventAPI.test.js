const request = require('supertest');
const app = require('../../app');
const Club = require('../../models/clubModel');
const User = require('../../models/userModel');
const ClubEvent = require('../../models/clubEventModel');
const ClubMemberships = require('../../models/clubMembershipsModel');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var session = require('supertest-session');



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

describe('Club Event Routes', () => {
  let user;
  let club;

  beforeEach(async () => {
    // Create a user
    user = await User.create({ firstName: 'Om', lastName: 'Sevak', email: 'test@example.com', passwordHash: bcrypt.hashSync('password', 12) });

    // Create a club
    club = await Club.create({ name: 'Om testing club', email: 'omtesting@email.com' });
  });

  afterEach(async () => {
    // Clean up created documents after each test
    await User.deleteMany({});
    await Club.deleteMany({});
    await ClubEvent.deleteMany({});
  });

  describe('POST /:name', () => {
    it('should return 403 if user is not logged in', async () => {
      const res = await request(app)
        .post(`/event/${club.name}`)
        .send({ title: 'Test Event', description: 'This is a test event', date: new Date(), location: 'Test Location' });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Unauthorized');
    });

    it('should return 403 if user is not an admin', async () => {
        
        const clubMembership = await ClubMemberships.create({ user: user._id, club: club._id, role: 'member' });
        const testsession = session(app);
        await testsession.post('/login').send({ email: user.email, password: 'password' });

        const res = await testsession
          .post(`/event/${club.name}`)
          .send({ title: 'Test Event', description: 'This is a test event', date: new Date(), location: 'Test Location' });

        expect(res.status).toBe(403);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toContain('Unauthorized');
    
    });

    it('should return 404 if the club does not exist', async () => {
      const testsession = session(app);
      await testsession.post('/login').send({ email: user.email, password: 'password' });

      const res = await testsession
        .post('/event/doesnotexist')
        .send({ title: 'Test Event', description: 'This is a test event', date: new Date(), location: 'Test Location' });

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Not Found');
    });
    

  });

  describe('GET /:name/event', () => {
    it('should return all events for the club', async () => {
      // Create an event
      await ClubEvent.create({ title: 'Test Event', description: 'This is a test event', date: new Date(), location: 'Test Location', club: club._id });

      const res = await request(app)
        .get(`/event/${club.name}`);

      expect(res.status).toBe(200);
      expect(res.body.events.length).toBe(1);
      expect(res.body.message).toBe('Events found successfully');
    });

    it('should return 404 if the club does not exist', async () => {
      const res = await request(app)
        .get('/event/doesnotexist');

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Not Found');
    });

    it('should return an empty array if there are no events', async () => {
      const res = await request(app)
        .get(`/event/${club.name}`);

      expect(res.status).toBe(200);
      expect(res.body.events.length).toBe(0);
      expect(res.body.message).toBe('Events found successfully');
    });

  });
});
