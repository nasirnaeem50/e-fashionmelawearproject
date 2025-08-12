const express = require('express');
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    deleteParentCategories
} = require('../controllers/categories');
const router = express.Router();

// Import middleware
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');
const advancedResults = require('../middleware/advancedResults');
const Category = require('../models/Category');

const createCategoryRules = [
    check('name', 'Category name is required').not().isEmpty().trim().escape(),
    check('parentCategory', 'Parent category is required').not().isEmpty().trim().escape(),
    check('children', 'Children must be an array').optional().isArray(),
    // ✅ CORRECTED: We now validate the fields INSIDE each object in the array
    check('children.*.name', 'Each child must have a non-empty name').optional().not().isEmpty().isString().trim().escape(),
    check('children.*.image', 'Each child must have a valid image URL').optional().not().isEmpty().isURL()
];

// ✅ CORRECTED: The update rules now correctly validate an array of objects
const updateCategoryRules = [
    check('name', 'Category name must be a non-empty string').optional().not().isEmpty().trim().escape(),
    check('parentCategory', 'Parent category must be a non-empty string').optional().not().isEmpty().trim().escape(),
    check('children', 'Children must be an array').optional().isArray(),
    // We validate the fields INSIDE each object in the array using dot notation
    check('children.*.name', 'Each child must have a non-empty name').not().isEmpty().isString().trim().escape(),
    check('children.*.image', 'Each child must have a valid image URL').not().isEmpty().isURL()
];


// --- Public Route ---
router.route('/')
    .get(getCategories);

// --- Protected & Authorized Routes for Category Management ---
router.route('/')
    .post(protect, authorize('category_create', 'category_manage'), createCategoryRules, validate, createCategory);

router.route('/:id')
    .put(protect, authorize('category_edit', 'category_manage'), updateCategoryRules, validate, updateCategory)
    .delete(protect, authorize('category_delete', 'category_manage'), deleteCategory);

router.route('/parent/:parentName')
    .delete(protect, authorize('category_delete', 'category_manage'), deleteParentCategories);

module.exports = router;