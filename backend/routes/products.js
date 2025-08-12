const express = require('express');
const {
    getProducts, getProduct, createProduct, updateProduct, deleteProduct,
    getProductReviews, createProductReview, getStockOutProducts, updateStock,
    searchProducts, getOnSaleProducts
} = require('../controllers/products');

const router = express.Router();

// Import middleware
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');
const advancedResults = require('../middleware/advancedResults');
const Product = require('../models/Product');
const Review = require('../models/Review');

// ✅ ADDED BACK: Full validation rules as they should be.
const productRules = [
    check('name', 'Product name is required').not().isEmpty().trim().escape(),
    check('description', 'Description is required').not().isEmpty().trim().escape(),
    check('price', 'Price must be a positive number').isFloat({ gt: 0 }),
    check('brand', 'Brand is required').not().isEmpty().trim().escape(),
    check('gender', 'Parent category (gender) is required').not().isEmpty(),
    check('category', 'Sub-category is required').not().isEmpty(),
    check('stock', 'Stock must be a non-negative integer').isInt({ gte: 0 }),
    check('image', 'A primary image URL is required').not().isEmpty().isURL(),
    check('images', 'Additional images must be an array of URLs').optional().isArray(),
    check('images.*', 'Each additional image must be a valid URL').isURL(),
    check('tags', 'Tags must be an array of strings').optional().isArray(),
    check('sizes', 'Sizes must be an array of strings').optional().isArray()
];

const reviewRules = [
    check('rating', 'Rating must be a number between 1 and 5').isFloat({ min: 1, max: 5 }),
    check('comment', 'A comment is required for the review').not().isEmpty().trim().escape(),
];

// This rule set is no longer used by any route but kept for reference
const updateStockRules = [
    check('items', 'Items must be a non-empty array').isArray({ min: 1 }),
    check('items.*.product', 'Each item must have a valid product ID').isMongoId(),
    check('items.*.quantity', 'Each item must have a quantity greater than 0').isInt({ gt: 0 }),
];


// --- Admin & Staff Product Management Routes ---
router.route('/stock-out')
    .get(protect, authorize('product_stock_view', 'product_manage'), advancedResults(Product), getStockOutProducts);

// ✅ REMOVED: This route was insecure and has been replaced by backend logic.
// The `updateStockRules` are no longer applied to any route.
// router.route('/update-stock')
//     .put(protect, authorize('product_edit_stock', 'product_manage'), updateStockRules, validate, updateStock);

router.route('/')
    .post(protect, authorize('product_create', 'product_manage'), productRules, validate, createProduct);

// --- Public Product Routes ---
router.route('/on-sale').get(advancedResults(Product), getOnSaleProducts);
router.route('/search').get(searchProducts);
router.route('/').get(advancedResults(Product), getProducts);

// --- DYNAMIC ROUTES (with :id or :productId) MUST BE LAST ---
router.route('/:productId/reviews')
    .get(advancedResults(Review, { path: 'user', select: 'name' }), getProductReviews)
    .post(protect, reviewRules, validate, createProductReview);

router.route('/:id')
    .get(getProduct)
    .put(protect, authorize('product_edit', 'product_manage'), productRules, validate, updateProduct)
    .delete(protect, authorize('product_delete', 'product_manage'), deleteProduct);

module.exports = router;