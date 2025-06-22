const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create a post
router.post('/', auth, postController.createPost);

// Get all posts
router.get('/', postController.getAllPosts);

// Update a post
router.put('/:id', auth, postController.updatePost);

// Delete a post
router.delete('/:id', auth, postController.deletePost);

// Like a post
router.post('/:id/like', auth, postController.likePost);

// Add a comment
router.post('/:id/comment', auth, postController.addComment);

module.exports = router;

// Upload media for a post (single file example)
router.post('/upload', (req, res, next) => {
  const auth = require('../middleware/auth');
  const upload = require('../middleware/upload').single('media');
  auth(req, res, function(err) {
    if (err) return res.status(401).json({ message: 'Unauthorized.' });
    upload(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        return res.status(400).json({ message: err.message });
      } else if (err) {
        // Other errors (file type, etc.)
        return res.status(400).json({ message: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }
      res.status(201).json({ url: `/uploads/${req.file.filename}` });
    });
  });
});
