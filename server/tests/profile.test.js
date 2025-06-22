// const request = require('supertest');
// // const mongoose = require('mongoose');
// const User = require('../models/User');
// const userRoutes = require('../routes/userRoutes');

// const app = require('express')();
// app.use(require('express').json());
// app.use('/api/users', userRoutes);
// const db = require('./db'); // Assuming db.js handles MongoDB connection
// // Connect to test DB before all tests
// beforeAll(async () => {
//   await db.connect('mongodb://localhost:27017/devconnect_test', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
// });

// // Clean up DB after all tests
// afterAll(async () => {
//   await db.closeDatabase();
// });

// // Clean users after each test
// afterEach(async () => {
//   await User.deleteMany({});
// });

// describe('User Profile Endpoints', () => {
//   let token;

//   beforeEach(async () => {
//     // Register and login a user to get a token
//     await request(app)
//       .post('/api/users/register')
//       .send({ username: 'profileuser', email: 'profile@example.com', password: 'profilepass' });

//     const res = await request(app)
//       .post('/api/users/login')
//       .send({ email: 'profile@example.com', password: 'profilepass' });

//     token = res.body.token;
//   });

//   it('should fetch the user profile', async () => {
//     const res = await request(app)
//       .get('/api/users/profile')
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('username', 'profileuser');
//     expect(res.body).toHaveProperty('email', 'profile@example.com');
//     expect(res.body).not.toHaveProperty('password');
//   });

//   it('should update the user profile', async () => {
//     const updateData = {
//       bio: 'Updated bio',
//       image: 'https://example.com/image.jpg',
//       skills: ['Node.js', 'Express']
//     };

//     const res = await request(app)
//       .put('/api/users/profile')
//       .set('Authorization', `Bearer ${token}`)
//       .send(updateData);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.user).toMatchObject(updateData);
//     expect(res.body).toHaveProperty('message', 'Profile updated successfully.');
//   });

//   it('should not update profile without auth', async () => {
//     const res = await request(app)
//       .put('/api/users/profile')
//       .send({ bio: 'No auth update' });

//     expect(res.statusCode).toBe(401);
//   });

//   it('should return 404 if user not found on update', async () => {
//     // Delete user to simulate not found
//     await User.deleteMany({});

//     const res = await request(app)
//       .put('/api/users/profile')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ bio: 'Should fail' });

//     expect(res.statusCode).toBe(404);
//   });
// });
