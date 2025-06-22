

const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const userRoutes = require('../routes/userRoutes');

const app = require('express')();
const db = require('./db'); // Assuming db.js handles MongoDB connection
app.use(require('express').json());
app.use('/api/users', userRoutes);

beforeAll(async () => {
  await db.connect('mongodb://localhost:27017/devconnect_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await db.closeDatabase();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Follow/Unfollow Endpoints', () => {
  let userA, userB, tokenA, tokenB;

  beforeEach(async () => {
    // Register users
    const registerA = await request(app)
      .post('/api/users/register')
      .send({ username: 'userA', email: 'userA@example.com', password: 'passA' });
    expect(registerA.statusCode).toBe(201);

    const registerB = await request(app)
      .post('/api/users/register')
      .send({ username: 'userB', email: 'userB@example.com', password: 'passB' });
    expect(registerB.statusCode).toBe(201);

    // Login users
    const loginA = await request(app)
      .post('/api/users/login')
      .send({ email: 'userA@example.com', password: 'passA' });
    tokenA = loginA.body.token;
    expect(tokenA).toBeDefined();
    userA = await User.findOne({ email: 'userA@example.com' });
    expect(userA).toBeDefined();

    console.log('User A:', userA);
    const loginB = await request(app)
      .post('/api/users/login')
      .send({ email: 'userB@example.com', password: 'passB' });
    tokenB = loginB.body.token;
    expect(tokenB).toBeDefined();
    userB = await User.findOne({ email: 'userB@example.com' });
    expect(userB).toBeDefined();
    console.log('User B:', userB);
  });

  it('should allow a user to follow another user', async () => {
    const res = await request(app)
      .post(`/api/users/${userB._id}/follow`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(200);

    // Check DB: userA is following userB, userB has userA as follower
    const updatedA = await User.findById(userA._id);
    const updatedB = await User.findById(userB._id);
    expect(updatedA.following.map(id => id.toString())).toContain(userB._id.toString());
    expect(updatedB.followers.map(id => id.toString())).toContain(userA._id.toString());
  });

  it('should not allow a user to follow themselves', async () => {
    const res = await request(app)
      .post(`/api/users/${userA._id}/follow`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(400);
  });

  it('should not allow duplicate follows', async () => {
    await request(app)
      .post(`/api/users/${userB._id}/follow`)
      .set('Authorization', `Bearer ${tokenA}`);
    const res = await request(app)
      .post(`/api/users/${userB._id}/follow`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(400);
  });

  it('should allow a user to unfollow another user', async () => {
    await request(app)
      .post(`/api/users/${userB._id}/follow`)
      .set('Authorization', `Bearer ${tokenA}`);
    const res = await request(app)
      .post(`/api/users/${userB._id}/unfollow`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(200);

    // Check DB: userA is no longer following userB, userB no longer has userA as follower
    const updatedA = await User.findById(userA._id);
    const updatedB = await User.findById(userB._id);
    expect(updatedA.following.map(id => id.toString())).not.toContain(userB._id.toString());
    expect(updatedB.followers.map(id => id.toString())).not.toContain(userA._id.toString());
  });

  it('should not allow a user to unfollow themselves', async () => {
    const res = await request(app)
      .post(`/api/users/${userA._id}/unfollow`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(400);
  });

  it('should not allow unfollow if not already following', async () => {
    const res = await request(app)
      .post(`/api/users/${userB._id}/unfollow`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(400);
  });

  it('should return 404 for non-existent user', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/users/${fakeId}/follow`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(404);
  });
});
