// const request = require('supertest');
// // const mongoose = require('mongoose');
// const User = require('../models/User');
// const Post = require('../models/Post');
// const app = require('../index'); // Make sure your Express app is exported as 'app'
// const db = require('./db'); // Assuming db.js handles MongoDB connection
// let tokenA, tokenB, userA, userB, postId, commentId;

// beforeAll(async () => {
//   await db.connect('mongodb://localhost:27017/devconnect_test', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
// });

// afterAll(async () => {
//   await db.closeDatabase();
// });

// beforeEach(async () => {
//   await User.deleteMany({});
//   await Post.deleteMany({});

//   // Register two users
//   await request(app).post('/api/users/register').send({ username: 'userA', email: 'a@example.com', password: 'passA' });
//   await request(app).post('/api/users/register').send({ username: 'userB', email: 'b@example.com', password: 'passB' });

//   // Login both users
//   const resA = await request(app).post('/api/users/login').send({ email: 'a@example.com', password: 'passA' });
//   const resB = await request(app).post('/api/users/login').send({ email: 'b@example.com', password: 'passB' });
//   tokenA = resA.body.token;
//   tokenB = resB.body.token;

//   userA = resA.body.user;
//   userB = resB.body.user;

//   // Create a post as userA
//   const postRes = await request(app)
//     .post('/api/posts')
//     .set('Authorization', `Bearer ${tokenA}`)
//     .send({ content: 'Hello World!', media: [] });
//   postId = postRes.body._id;
// });

// describe('Post CRUD', () => {
//   it('should create a post', async () => {
//     const res = await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${tokenA}`)
//       .send({ content: 'Test post', media: [] });
//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty('content', 'Test post');
//     expect(res.body).toHaveProperty('author');
//   });

//   it('should get all posts', async () => {
//     const res = await request(app).get('/api/posts');
//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//     expect(res.body.length).toBeGreaterThan(0);
//   });

//   it('should update own post', async () => {
//     const res = await request(app)
//       .put(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${tokenA}`)
//       .send({ content: 'Updated content' });
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('content', 'Updated content');
//   });

//   it('should not update others post', async () => {
//     const res = await request(app)
//       .put(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${tokenB}`)
//       .send({ content: 'Hacked content' });
//     expect(res.statusCode).toBe(403);
//   });

//   it('should delete own post', async () => {
//     const res = await request(app)
//       .delete(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${tokenA}`);
//     expect(res.statusCode).toBe(200);
//   });

//   it('should not delete others post', async () => {
//     const res = await request(app)
//       .delete(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${tokenB}`);
//     expect(res.statusCode).toBe(403);
//   });
// });

// describe('Likes', () => {
//   it('should like a post', async () => {
//     const res = await request(app)
//       .post(`/api/posts/${postId}/like`)
//       .set('Authorization', `Bearer ${tokenB}`);
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('likesCount', 1);
//   });

//   it('should not like a post twice', async () => {
//     await request(app)
//       .post(`/api/posts/${postId}/like`)
//       .set('Authorization', `Bearer ${tokenB}`);
//     const res = await request(app)
//       .post(`/api/posts/${postId}/like`)
//       .set('Authorization', `Bearer ${tokenB}`);
//     expect(res.statusCode).toBe(400);
//   });
// });

// describe('Comments', () => {
//   it('should add a comment', async () => {
//     const res = await request(app)
//       .post(`/api/posts/${postId}/comment`)
//       .set('Authorization', `Bearer ${tokenB}`)
//       .send({ content: 'Nice post!' });
//     expect(res.statusCode).toBe(201);
//     expect(res.body.comments.length).toBe(1);
//     commentId = res.body.comments[0]._id;
//   });

//   it('should not add empty comment', async () => {
//     const res = await request(app)
//       .post(`/api/posts/${postId}/comment`)
//       .set('Authorization', `Bearer ${tokenB}`)
//       .send({ content: '' });
//     expect(res.statusCode).toBe(400);
//   });
// });

// describe('Moderation', () => {
//   it('should report a post', async () => {
//     const res = await request(app)
//       .post(`/api/moderation/post/${postId}`)
//       .set('Authorization', `Bearer ${tokenB}`)
//       .send({ reason: 'Spam' });
//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty('message', 'Post reported successfully.');
//   });

//   it('should not report a post without reason', async () => {
//     const res = await request(app)
//       .post(`/api/moderation/post/${postId}`)
//       .set('Authorization', `Bearer ${tokenB}`)
//       .send({ reason: '' });
//     expect(res.statusCode).toBe(400);
//   });
// });
