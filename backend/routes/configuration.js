const express = require('express');
const router = express.Router();
const { getConfiguration, updateConfiguration } = require('../controllers/configuration');

// Import middleware
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
// ✅ ADDED: Import validation functions and our custom handler
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');

// ✅ ADDED: Define validation rules for updating the configuration
const updateConfigRules = [
    check('maintenanceMode', 'Maintenance mode must be a boolean value').optional().isBoolean(),
    check('newnessDurationDays', 'Newness duration must be a positive integer').optional().isInt({ gt: 0 }),
    check('storePhone', 'Store phone must be a string').optional().isString(),
    check('storeEmail', 'Store email must be a valid email').optional().isEmail(),
    check('shippingZones', 'Shipping zones must be an array').optional().isArray(),
    check('taxRate', 'Tax rate must be a number').optional().isNumeric(),
    check('currencies', 'Currencies must be an array').optional().isArray()
];


// --- Public Route ---
router.route('/').get(getConfiguration);

// --- Protected Admin Route ---
// ✅ MODIFIED: The PUT route now has the validation middleware chain.
// It is split into multiple lines for readability.
router.route('/').put(
    protect, 
    authorize('setting_edit', 'setting_manage'),
    updateConfigRules,
    validate, 
    updateConfiguration
);

module.exports = router;