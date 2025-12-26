// File: routes/index.js
const express = require('express');
const router = express.Router();

// Import the specific route files
const userAuthRoutes = require('./user/auth');
const adminAuthRoutes = require('./admin/auth');
const adminQuestionRoutes = require('./admin/question'); // This is the file you just created!

// Connect them to URLs
router.use('/user/auth', userAuthRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/admin/question', adminQuestionRoutes);

module.exports = router;