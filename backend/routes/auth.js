// routes/auth.js (Complete and Final Version for Validation)

const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');

const router = express.Router();

// --- Validation Rule Definitions ---

const registerRules = [
  check('name', 'Name is required').not().isEmpty().trim().escape(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
];

const loginRules = [
    check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').not().isEmpty()
];

const forgotPasswordRules = [
    check('email', 'Please provide a valid email').isEmail().normalizeEmail()
];

// ✅ ADDED: Define the validation rules for the reset password route
const resetPasswordRules = [
    check('password', 'New password must be at least 6 characters long').isLength({ min: 6 })
];


// --- Route Definitions ---

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);

router.get('/me', protect, getMe);

router.post('/forgotpassword', forgotPasswordRules, validate, forgotPassword);

// ✅ MODIFIED: The '/resetpassword' route now has its validation chain
router.put('/resetpassword/:resettoken', resetPasswordRules, validate, resetPassword);

module.exports = router;