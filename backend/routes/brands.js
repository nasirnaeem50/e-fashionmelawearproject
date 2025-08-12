const express = require('express');
const { getBrands, createBrand, deleteBrand, updateBrand } = require('../controllers/brands');
const router = express.Router();

// Import middleware
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');
const advancedResults = require('../middleware/advancedResults'); // ✅ ADDED
const Brand = require('../models/Brand'); // ✅ ADDED

// Validation rules
const brandRules = [
    check('name', 'Brand name is required').not().isEmpty().trim().escape(),
    check('logo', 'Brand logo URL is required').optional({ checkFalsy: true }).isURL()
];

// --- Public Route ---
// ✅ MODIFIED: The GET route now uses advancedResults for pagination
router.route('/')
    .get(advancedResults(Brand), getBrands);

// --- Protected & Authorized Routes ---
router.route('/')
    .post(protect, authorize('brand_create', 'brand_manage'), brandRules, validate, createBrand);

router.route('/:id')
    .delete(protect, authorize('brand_delete', 'brand_manage'), deleteBrand)
    .put(protect, authorize('brand_edit', 'brand_manage'), brandRules, validate, updateBrand); 

module.exports = router;