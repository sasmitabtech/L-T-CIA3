const express = require('express');
const { register, login } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { validateRegistration, validateLogin } = require('../middleware/validate');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, message: 'Too many authentication attempts. Try again later.', errorCode: 'AUTH_RATE_LIMITED' } });

router.post('/register', authLimiter, validateRegistration, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', authenticate, (req, res) => res.json({ success: true, data: { user: req.user } }));

module.exports = router;
