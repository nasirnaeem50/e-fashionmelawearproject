// backend/controllers/reviews.js (Complete and Updated File)

const Review = require('../models/Review');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService'); // <<<--- 1. IMPORT THE SERVICE

// @desc    Get all reviews (for Admin)
// @route   GET /api/reviews
// @access  Private/Admin
// ✅ MODIFIED: This function is now simplified to use the middleware's results.
exports.getReviews = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (any logged-in user)
// This function remains unchanged as it's a user action, not an admin one.
exports.createReview = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;
    const { product, user } = req.body;

    const existingReview = await Review.findOne({ product, user });
    if (existingReview) {
        return next(new ErrorResponse('You have already submitted a review for this product', 400));
    }
    
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: review });
});

// @desc    Update a review (e.g., change status)
// @route   PUT /api/reviews/:id
// @access  Private/Admin
// This function is now updated with logging.
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
    }
    
    const oldStatus = review.status; // Get status before changing
    
    review.set(req.body);
    const updatedReview = await review.save();

    // --- 2. ADD THIS LOGGING CODE ---
    // Only log if the status was actually part of the update and it changed.
    if (req.body.status && oldStatus !== updatedReview.status) {
        await logAction({
            user: req.user,
            action: 'UPDATE_REVIEW_STATUS',
            entity: 'Review',
            entityId: review._id,
            details: `Admin changed review status from '${oldStatus}' to '${updatedReview.status}'.`
        });
    }
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: updatedReview });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
// This function is now updated with logging.
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
    }

    const reviewId = review._id; // Store ID for logging
    const reviewTitle = review.title || `Review for Product ID ${review.product}`; // Get a title for the log

    await review.deleteOne();

    // --- 3. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'DELETE_REVIEW',
        entity: 'Review',
        entityId: reviewId,
        details: `Admin deleted review: "${reviewTitle}".`
    });
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: {} });
});