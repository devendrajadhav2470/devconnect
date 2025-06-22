const request = require('supertest');
const express = require('express');
const homeRoutes = require('../routes/homeRoutes');
// const mongoose = require('mongoose');
const User = require('../models/User');
const userRoutes = require('../routes/userRoutes');

const app = express();
const db = require('./db');
app.use('/', homeRoutes);
app.use(express.json());
app.use('/api/users', userRoutes);


describe('GET /', () => {
  it('should return Hello World!', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello World!');
  });
});

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.closeDatabase();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Registration', () => {
  it('registers a user with valid data', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', email: 'testuser@example.com', password: 'testpass123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('username', 'testuser');
    expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
  });

  it('does not allow duplicate email', async () => {
    await request(app)
      .post('/api/users/register')
      .send({ username: 'user1', email: 'dupe@example.com', password: 'pass123' });
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'user2', email: 'dupe@example.com', password: 'pass123' });
    expect(res.statusCode).toBe(409);
  });

  it('does not allow missing fields', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ email: 'no_username@example.com', password: 'pass123' });
    expect(res.statusCode).toBe(400);
  });

  it('hashes the password', async () => {
    await request(app)
      .post('/api/users/register')
      .send({ username: 'hashuser', email: 'hash@example.com', password: 'plaintextpass' });
    const user = await User.findOne({ email: 'hash@example.com' });
    expect(user.password).not.toBe('plaintextpass');
  });
});

describe('User Login', () => {
  beforeEach(async () => {
    // Register a user for login tests
    await request(app)
      .post('/api/users/register')
      .send({ username: 'loginuser', email: 'login@example.com', password: 'mypassword' });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'login@example.com', password: 'mypassword' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('username', 'loginuser');
  });

  it('fails login with wrong password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'login@example.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });

  it('fails login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'nope@example.com', password: 'mypassword' });
    expect(res.statusCode).toBe(401);
  });
});


const protectedRoutes = require('../routes/protectedRoutes');
app.use('/api/protected', protectedRoutes);

describe('Protected Route', () => {
  let token;
  beforeEach(async () => {
    await request(app)
      .post('/api/users/register')
      .send({ username: 'jwtuser', email: 'jwt@example.com', password: 'jwtpass' });
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'jwt@example.com', password: 'jwtpass' });
    token = res.body.token;
  });

  it('allows access with valid JWT', async () => {
    const res = await request(app)
      .get('/api/protected/test')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
  });

  it('denies access without JWT', async () => {
    const res = await request(app)
      .get('/api/protected/test');
    expect(res.statusCode).toBe(401);
  });

  it('denies access with invalid JWT', async () => {
    const res = await request(app)
      .get('/api/protected/test')
      .set('Authorization', `Bearer invalidtoken`);
    expect(res.statusCode).toBe(401);
  });
});

