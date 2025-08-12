// Filename: backend/controllers/notifications.js (Complete and Updated File)

const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get notifications for the currently logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
// ✅ MODIFIED: This function now works WITH the advancedResults middleware.
exports.getNotifications = asyncHandler(async (req, res, next) => {
    // The advancedResults middleware has already run and attached its data to res.advancedResults.
    // However, it doesn't know about the current user. We need to override its query
    // and re-run the logic for this specific user.

    // --- We will rebuild the query here to ensure it's scoped to the user ---
    let query;

    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Add the user filter to the query
    reqQuery.user = req.user.id;

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Notification.find(JSON.parse(queryStr));

    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15; // A smaller default limit for notifications
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Notification.countDocuments({ user: req.user.id });

    query = query.skip(startIndex).limit(limit);

    const results = await query;
    const pagination = {};

    if (endIndex < total) {
        pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
        pagination.prev = { page: page - 1, limit };
    }
    // --- End of rebuilt query ---


    // Also get a count of only the unread notifications for the specific user
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    res.status(200).json({
        success: true,
        count: results.length,
        pagination,
        total,
        unreadCount, // Keep the custom unreadCount
        data: results
    });
});

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:id
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        return next(new ErrorResponse('Notification not found or you do not have permission to view it.', 404));
    }

    res.status(200).json({ success: true, data: notification });
});


/**
 * @desc    Mark all of the user's notifications as read
 * @route   PUT /api/notifications/mark-all-read
 * @access  Private
 */
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
    await Notification.updateMany(
        { user: req.user.id, isRead: false },
        { isRead: true }
    );
    
    res.status(200).json({ success: true, data: { message: "All notifications marked as read." } });
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user.id });

    if (!notification) {
        return next(new ErrorResponse('Notification not found or you do not have permission to delete it.', 404));
    }

    await notification.remove();

    res.status(200).json({ success: true, data: {} });
});