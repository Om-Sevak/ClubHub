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

    member = ClubMemberships.create({ user: user._id, club: club._id, role: 'admin' });

    testsession = session(app);

    const loginRes = await testsession.post('/login')
                .send({ email: 'test@example.com', password: 'password' })
                .expect(200);
  });

  afterEach(async () => {
    // Clean up created documents after each test
    await User.deleteMany({});
    await Club.deleteMany({});
    await ClubEvent.deleteMany({});
  });

  describe('POST /:name/event', () => {

    it('should create a new event for the club', async () => {

      const res = await testsession
        .post(`/club/${club.name}/event`)
        .send({
          title: 'New Event',
          description: 'This is a new Event',
          date: new Date(),
          location: 'event location'
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Event created successfully');
    });

    it('should return 403 if user is not logged in', async () => {
      const res = await request(app)
        .post(`/club/${club.name}/event`)
        .send({ title: 'Test Event', description: 'This is a test event', date: new Date(), location: 'Test Location' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Unauthorized');
    });


    it('should return 404 if the club does not exist', async () => {
      const res = await request(app)
        .post('/club/doesnotexist/event')
        .send({ title: 'Test Event', description: 'This is a test event', date: new Date(), location: 'Test Location' });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Not Found');
    });
    

  });

  describe('GET /:name/event', () => {
    it('should return all events for the club', async () => {
      // Create an event
      await ClubEvent.create({ title: 'Test Event', description: 'This is a test event', date: new Date(), location: 'Test Location', club: club._id });

      const res = await request(app)
        .get(`/club/${club.name}/event`);

      expect(res.status).toBe(200);
      expect(res.body.events.length).toBe(1);
      expect(res.body.message).toBe('Events found successfully');
    });

    it('should return 404 if the club does not exist', async () => {
      const res = await request(app)
        .get('/club/doesnotexist/event');

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Not Found');
    });

    it('should return an empty array if there are no events', async () => {
      const res = await request(app)
        .get(`/club/${club.name}/event`);

      expect(res.status).toBe(200);
      expect(res.body.events.length).toBe(0);
      expect(res.body.message).toBe('Events found successfully');
    });

  });

  describe('GET /:name/event/:event', () => {
    it('should return a specific event for the club', async () => {
      // Create an event
      const clubEvent = await ClubEvent.create({ title: 'Test Event', description: 'This is a test event', date: new Date(), location: 'Test Location', club: club._id });
  
      const res = await request(app)
        .get(`/club/${club.name}/event/${clubEvent._id}`);
  
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Test Event');
      expect(res.body.description).toBe('This is a test event');
      expect(res.body.location).toBe('Test Location');
      expect(res.body.message).toBe('Club Found Succesfully');
    });

  });
  
  describe('PUT /:name/event/:event', () => {
    it('should update a specific event for the club', async () => {
      // Create an event
      const clubEvent = await ClubEvent.create({ title: 'Test Event', description: 'This is a test event', date: new Date(), location: 'Test Location', club: club._id });
  
      const res = await testsession
        .put(`/club/${club.name}/event/${clubEvent._id}`)
        .send({
          title: 'Updated Event',
          description: 'This is an updated event',
          date: new Date(),
          location: 'Updated Location'
        });
  
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('event modified');
    });
  });
  
  describe('DELETE /:name/event/:event', () => {
    it('should delete a specific event for the club', async () => {
      // Create an event
      const clubEvent = await ClubEvent.create({ title: 'Test Event', description: 'This is a test event', date: new Date(), location: 'Test Location', club: club._id });
  
      const res = await testsession
        .delete(`/club/${club.name}/event/${clubEvent._id}`)
        .send({ email: 'test@example.com', password: 'password' });
  
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Event deleted successfully');
  
      // Check if the event has been deleted from the database
      const deletedEvent = await ClubEvent.findById(clubEvent._id);
      expect(deletedEvent).toBeNull();
    });
  });
});

