const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// POST /api/users/register
router.post('/register', userController.register);

module.exports = router;

// POST /api/users/login
router.post('/login', userController.login);

// GET /api/users/profile
router.get('/profile', auth, userController.getProfile);

// PUT /api/users/profile
router.put('/profile', auth, userController.updateProfile);

// Follow a user
router.post('/:id/follow', auth, userController.followUser);

// Unfollow a user
router.post('/:id/unfollow', auth, userController.unfollowUser);

// Get followers of a user
router.get('/:id/followers', userController.getFollowers);

// Get users a user is following
router.get('/:id/following', userController.getFollowing);