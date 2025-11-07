const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, getProfile, updateProfile, logoutAll } = require('../controllers/auth');
const { authenticate } = require('../middleware/authorize');
const { validateRegister, validateLogin, sanitizeInput } = require('../middleware/validation');

// Public routes
router.post('/register', sanitizeInput, validateRegister, register);
router.post('/login', sanitizeInput, validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, sanitizeInput, updateProfile);
router.post('/logout-all', authenticate, logoutAll);

module.exports = router;
