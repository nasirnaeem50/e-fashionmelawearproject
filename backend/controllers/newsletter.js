// F:\React projects\e-fashionmela project\backend\controllers\newsletter.js (Complete and Updated File)

const NewsletterSubscription = require('../models/NewsletterSubscription');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService'); // <<<--- 1. IMPORT THE SERVICE

// @desc    Subscribe a user to the newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
// This function remains unchanged as it is a public-facing action.
exports.subscribeToNewsletter = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorResponse('Please provide an email address.', 400));
    }

    const existingSubscription = await NewsletterSubscription.findOne({ email });

    if (existingSubscription) {
        return res.status(200).json({ success: true, message: "You are already subscribed to our newsletter!" });
    }

    await NewsletterSubscription.create({ email });

    res.status(201).json({ success: true, message: "Thank you for subscribing to our newsletter!" });
});

// @desc    Get all newsletter subscriptions
// @route   GET /api/newsletter
// @access  Private/Admin
// ✅ MODIFIED: Simplified to use middleware results
exports.getAllSubscriptions = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Delete a newsletter subscription
// @route   DELETE /api/newsletter/:id
// @access  Private/Admin
// This function is now updated with logging.
exports.deleteSubscription = asyncHandler(async (req, res, next) => {
    const subscription = await NewsletterSubscription.findById(req.params.id);

    if (!subscription) {
        return next(new ErrorResponse(`Subscription not found with id of ${req.params.id}`, 404));
    }

    const subEmailForLog = subscription.email; // Store details for logging
    const subIdForLog = subscription._id;

    await subscription.deleteOne();

    // --- 2. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'NEWSLETTER_DELETE', // We need to add this action
        entity: 'NewsletterSubscription',
        entityId: subIdForLog,
        details: `Admin deleted newsletter subscription for: '${subEmailForLog}'.`
    });
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: {} });
});

// @desc    Delete all newsletter subscriptions
// @route   DELETE /api/newsletter/clear
// @access  Private/Admin
// This function remains unchanged. A bulk delete is harder to log individually.
exports.clearAllSubscriptions = asyncHandler(async (req, res, next) => {
    await NewsletterSubscription.deleteMany({});
    res.status(200).json({ success: true, message: 'All subscriptions have been cleared.' });
});