// F:\React projects\e-fashionmela project\backend\routes\newsletter.js

const express = require('express');
const router = express.Router();
const { 
    subscribeToNewsletter, 
    getAllSubscriptions,
    deleteSubscription,
    clearAllSubscriptions
} = require('../controllers/newsletter');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');
const advancedResults = require('../middleware/advancedResults');
const NewsletterSubscription = require('../models/NewsletterSubscription');

// Validation rules
const subscribeRules = [
    check('email', 'Please provide a valid email address').isEmail().normalizeEmail()
];

// Public route for anyone to subscribe
router.route('/subscribe').post(subscribeRules, validate, subscribeToNewsletter);

// ✅ MODIFIED: Routes are now protected by the new specific permissions.
// The GET route uses advancedResults for pagination and searching.
router.route('/')
    .get(protect, authorize('newsletter_view', 'newsletter_manage'), advancedResults(NewsletterSubscription), getAllSubscriptions);

// Protected route to clear all subscriptions
router.route('/clear')
    .delete(protect, authorize('newsletter_delete', 'newsletter_manage'), clearAllSubscriptions);

// Protected route to delete a single subscription
router.route('/:id')
    .delete(protect, authorize('newsletter_delete', 'newsletter_manage'), deleteSubscription);

module.exports = router;