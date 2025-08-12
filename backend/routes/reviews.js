const express = require('express');
const {
    getReviews,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews');

const router = express.Router();

// Import middleware
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');
const advancedResults = require('../middleware/advancedResults');
const Review = require('../models/Review');

// ✅ FIX: Removed validation for 'title' as it does not exist in the model.
const createReviewRules = [
    check('product', 'Product ID is required').isMongoId(),
    check('rating', 'Rating must be a number between 1 and 5').isFloat({ min: 1, max: 5 }),
    check('comment', 'Review comment is required').not().isEmpty().trim().escape()
];

const updateReviewRules = [
    check('status', 'Status must be one of: pending, approved, rejected').optional().isIn(['pending', 'approved', 'rejected']),
    check('title', 'Review title must be a non-empty string').optional().not().isEmpty().trim().escape(),
    check('comment', 'Review comment must be a non-empty string').optional().not().isEmpty().trim().escape()
];

// This route handles getting all reviews (for admin) and creating a new one (for users).
router.route('/')
    .get(
        protect, 
        authorize('review_view', 'review_manage'), 
        advancedResults(Review, [
            { path: 'user', select: 'name' },
            { path: 'product', select: 'name id' }
        ]), 
        getReviews
    )
    .post(protect, createReviewRules, validate, createReview);

// These routes are for a specific review, managed by authorized staff.
router.route('/:id')
    .put(protect, authorize('review_edit', 'review_manage'), updateReviewRules, validate, updateReview)
    .delete(protect, authorize('review_delete', 'review_manage'), deleteReview);

module.exports = router;