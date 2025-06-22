// const request = require('supertest');
// // const mongoose = require('mongoose');
// const User = require('../models/User');
// const Post = require('../models/Post'); // Assuming Post model exists
// const postRoutes = require('../routes/postRoutes'); // Assuming postRoutes exists

// const app = require('express')();
// app.use(require('express').json());
// app.use('/api/posts', postRoutes);
// const db = require('./db'); // Assuming db.js handles MongoDB connection
// // Connect to test DB before all tests
// beforeAll(async () => {
//   await db.connect();
// });

// // Clean up DB after all tests
// afterAll(async () => {
//   await db.closeDatabase();
// });

// // Clean users and posts after each test
// afterEach(async () => {
//   await User.deleteMany({});
//   await Post.deleteMany({});
// });

// describe('Posts Endpoints', () => {
//   let token;
//   let userId;

//   beforeEach(async () => {
//     // Register and login a user to get a token
//     await request(app)
//       .post('/api/users/register')
//       .send({ username: 'postuser', email: 'post@example.com', password: 'postpass' });

//     const res = await request(app)
//       .post('/api/users/login')
//       .send({ email: 'post@example.com', password: 'postpass' });

//     token = res.body.token;
//     userId = res.body.user.id;
//   });

//   it('should create a post', async () => {
//     const res = await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ content: 'This is a test post' });

//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty('content', 'This is a test post');
//     expect(res.body).toHaveProperty('author');
//   });

//   it('should not create a post without content', async () => {
//     const res = await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ content: '' });

//     expect(res.statusCode).toBe(400);
//   });

//   it('should update own post', async () => {
//     // Create post first
//     const postRes = await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ content: 'Original content' });

//     const postId = postRes.body._id;

//     // Update post
//     const updateRes = await request(app)
//       .put(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send({ content: 'Updated content' });

//     expect(updateRes.statusCode).toBe(200);
//     expect(updateRes.body).toHaveProperty('content', 'Updated content');
//   });

//   it('should not update others post', async () => {
//     // Create post with one user
//     const postRes = await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ content: 'User1 post' });

//     const postId = postRes.body._id;

//     // Register and login another user
//     await request(app)
//       .post('/api/users/register')
//       .send({ username: 'otheruser', email: 'other@example.com', password: 'otherpass' });

//     const loginRes = await request(app)
//       .post('/api/users/login')
//       .send({ email: 'other@example.com', password: 'otherpass' });

//     const otherToken = loginRes.body.token;

//     // Try to update post
//     const updateRes = await request(app)
//       .put(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${otherToken}`)
//       .send({ content: 'Hacked content' });

//     expect(updateRes.statusCode).toBe(403);
//   });

//   it('should delete own post', async () => {
//     // Create post
//     const postRes = await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ content: 'Delete me' });

//     const postId = postRes.body._id;

//     // Delete post
//     const deleteRes = await request(app)
//       .delete(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(deleteRes.statusCode).toBe(200);
//   });

//   it('should not delete others post', async () => {
//     // Create post with one user
//     const postRes = await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ content: 'User1 post' });

//     const postId = postRes.body._id;

//     // Register and login another user
//     await request(app)
//       .post('/api/users/register')
//       .send({ username: 'otheruser', email: 'other@example.com', password: 'otherpass' });

//     const loginRes = await request(app)
//       .post('/api/users/login')
//       .send({ email: 'other@example.com', password: 'otherpass' });

//     const otherToken = loginRes.body.token;

//     // Try to delete post
//     const deleteRes = await request(app)
//       .delete(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${otherToken}`);

//     expect(deleteRes.statusCode).toBe(403);
//   });

//   it('should like a post', async () => {
//     // Create post
//     const postRes = await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ content: 'Like me' });

//     const postId = postRes.body._id;

//     // Like post
//     const likeRes = await request(app)
//       .post(`/api/posts/${postId}/like`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(likeRes.statusCode).toBe(200);
//     expect(likeRes.body).toHaveProperty('likesCount');
//   });

//   it('should not like a post twice', async () => {
//     // Create post
//     const postRes = await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ content: 'Like me twice' });

//     const postId = postRes.body._id;

//     // Like post twice
//     await request(app)
//       .post(`/api/posts/${postId}/like`)
//       .set('Authorization', `Bearer ${token}`);

//     const likeAgainRes = await request(app)
//       .post(`/api/posts/${postId}/like`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(likeAgainRes.statusCode).toBe(400);
//   });

//   it('should fetch all posts', async () => {
//     // Create two posts
//     await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ content: 'Post 1' });

//     await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ content: 'Post 2' });

//     const res = await request(app)
//       .get('/api/posts')
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.length).toBeGreaterThanOrEqual(2);
//   });
// });
