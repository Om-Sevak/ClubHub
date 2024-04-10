const request = require('supertest');
const app = require('../../app'); // Assuming your Express app is exported from 'app.js'
const Club = require('../../models/clubModel');
const ClubPost = require('../../models/clubPostModel');
const User = require('../../models/userModel');
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

describe('Club Post Routes', () => {
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

    // Create a post for the club
    post = await ClubPost.create({
      title: 'Test Post',
      content: 'This is a test post',
      date: new Date(),
      imgUrl: 'https://example.com/image.jpg',
      club: club._id
    });
  });

  afterEach(async () => {
    // Clean up created documents after each test
    await User.deleteMany({});
    await Club.deleteMany({});
    await ClubPost.deleteMany({});
  });

  describe('POST /:name/post', () => {
    it('should create a new post for the club', async () => {
      const res = await testsession
        .post(`/club/${club.name}/post`)
        .send({
          title: 'New Post',
          contents: 'This is a new post',
          date: new Date(),
          imgUrl: 'https://example.com/new-image.jpg'
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Post created successfully');
    });
  
      it('should return 404 if the club does not exist', async () => {
  
        const res = await testsession
          .post('/club/doesnotexist/post')
          .send({ title: 'Test Post', contents: 'This is a test post', date: new Date(), imgUrl: 'https://example.com/test-image.jpg' });
  
        expect(res.status).toBe(404);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toContain('Not Found');
      });
      
  
    });

    describe('GET /:name/post', () => {
        it('should return all posts for the club', async () => {
          const res = await request(app)
            .get(`/club/${club.name}/post`);
      
          expect(res.status).toBe(200);
          expect(res.body.message).toBe('Posts found successfully');
          expect(res.body.posts.length).toBe(1);
          expect(res.body.posts[0].title).toBe('Test Post');
        });
      
        it('should return 404 if the club does not exist', async () => {
          const res = await request(app)
            .get('/club/nonexistentclub/post');
      
          expect(res.status).toBe(404);
          expect(res.body.status).toBe('fail');
          expect(res.body.message).toContain('Not Found');
        });
      
        it('should return an empty array if there are no posts', async () => {
          await ClubPost.deleteMany({});
      
          const res = await request(app)
            .get(`/club/${club.name}/post`);
      
          expect(res.status).toBe(200);
          expect(res.body.message).toBe('Posts found successfully');
          expect(res.body.posts.length).toBe(0);
        });
      });
      
      describe('GET /:name/post/:post', () => {
        it('should return a specific post for the club', async () => {
          const postId = post._id;
      
          const res = await testsession
            .get(`/club/${club.name}/post/${postId}`);
      
          expect(res.status).toBe(200);
          expect(res.body.message).toBe('Post Found Succesfully');
        });
      
      });
      
      describe('PUT /:name/post/:post', () => {
        it('should update a specific post for the club', async () => {
          const postId = post._id;
      
          const res = await testsession
            .put(`/club/${club.name}/post/${postId}`)
            .send({
              title: 'Updated Post',
              contents: 'This is an updated post'
            });
      
          expect(res.status).toBe(201);
          expect(res.body.status).toBe('success');
          expect(res.body.message).toBe('post modified');
        });
      
      });
      
      describe('DELETE /:name/post/:post', () => {
        it('should delete a specific post for the club', async () => {
          const postId = post._id;
      
          const res = await testsession
            .delete(`/club/${club.name}/post/${postId}`);
      
          expect(res.status).toBe(200);
          expect(res.body.status).toBe('success');
          expect(res.body.message).toBe('Post deleted successfully');
      
          // Check if the post has been deleted from the database
          const deletedPost = await ClubPost.findById(postId);
          expect(deletedPost).toBeNull();
        });
      
      });
  });

  

  
