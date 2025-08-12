// backend/routes/contact.js

const express = require('express');
const router = express.Router();

// ✅ EXACT MATCH: Importing only the functions that exist in your controller.
const { 
    submitContactForm, 
    getContactMessages, 
    markAsRead 
} = require('../controllers/contact');

// Import middleware (This was already correct)
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');
const advancedResults = require('../middleware/advancedResults');
const ContactMessage = require('../models/ContactMessage');

// Validation rules (This was already correct)
const contactFormRules = [
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    check('subject', 'Subject is required').not().isEmpty().trim().escape(),
    check('message', 'Message is required').not().isEmpty().trim().escape()
];


// --- PUBLIC ROUTE ---
// This route is for any visitor to submit the form.
router.route('/')
    .post(contactFormRules, validate, submitContactForm);


// --- PROTECTED ROUTES ---
// Apply user authentication to all routes below this line.
router.use(protect);

// This GET route fetches all messages for authorized staff.
// It uses advancedResults for pagination/sorting and is protected by the 'contact_view' permission.
router.route('/')
    .get(authorize('contact_view', 'contact_manage'), advancedResults(ContactMessage), getContactMessages);

// This PUT route marks a specific message as read.
// It is protected by the 'contact_update' permission.
router.route('/:id/read')
    .put(authorize('contact_update', 'contact_manage'), markAsRead);


module.exports = router;