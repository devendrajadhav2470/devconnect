// server/routes/homeRoutes.js

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// GET /
router.get('/', homeController.home);
module.exports = router;
