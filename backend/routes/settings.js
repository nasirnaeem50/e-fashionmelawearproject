const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settings');

// Import middleware from their correct locations
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
// ✅ ADDED: Import validation functions and our custom handler
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');

// ✅ ADDED: Define validation rules for updating settings
const updateSettingsRules = [
    // This is a basic example. You can add more specific rules as needed.
    // For example, checking each property of the 'footer' object.
    check('footer.description', 'Footer description must be a string').optional().isString(),
    check('footer.socialLinks.facebook', 'Facebook link must be a valid URL').optional({ checkFalsy: true }).isURL(),
    check('footer.socialLinks.instagram', 'Instagram link must be a valid URL').optional({ checkFalsy: true }).isURL(),
    check('footer.socialLinks.twitter', 'Twitter link must be a valid URL').optional({ checkFalsy: true }).isURL(),
    check('header.topBar.message', 'Top bar message must be a string').optional().isString(),
    check('homepage.hero.title', 'Hero title must be a string').optional().isString(),
    check('contact.phone', 'Contact phone must be a string').optional().isString(),
    check('contact.email', 'Contact email must be a valid email').optional().isEmail(),
    check('contact.address', 'Contact address must be a string').optional().isString(),
    // Add more rules for other settings fields as your application grows
];


// Routes for application settings (e.g., CMS Content)
router.route('/')
    // GET remains public
    .get(getSettings)
    // ✅ MODIFIED: Added validation middleware to the PUT route
    .put(
        protect, 
        authorize('setting_edit', 'setting_manage'), 
        updateSettingsRules, 
        validate, 
        updateSettings
    );

module.exports = router;