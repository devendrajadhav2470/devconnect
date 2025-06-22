const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// GET /api/protected/test
router.get('/test', auth, (req, res) => {
  res.json({ message: 'Protected route accessed!', user: req.user });
});

module.exports = router;
