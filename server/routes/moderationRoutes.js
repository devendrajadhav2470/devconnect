const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const auth = require('../middleware/auth');

// Report a post
router.post('/post/:postId', auth, moderationController.reportPost);

// Report a comment
router.post('/post/:postId/comment/:commentId', auth, moderationController.reportComment);

// Get all reports (admin only - auth assumed)
router.get('/', auth, moderationController.getReports);

// Resolve a report (admin only - auth assumed)
router.put('/:reportId/resolve', auth, moderationController.resolveReport);

module.exports = router;
