// controllers/contact.js (Complete and Updated File)

const ContactMessage = require('../models/ContactMessage');
const { createNotificationForRole } = require('../services/notificationService');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService'); // <<<--- 1. IMPORT THE SERVICE

// @desc    Submit a new contact form message
// @route   POST /api/contact
// @access  Public
// This function remains unchanged as it is a public-facing action.
exports.submitContactForm = asyncHandler(async (req, res, next) => {
    const { name, email, subject, message } = req.body;
    const contactMessage = await ContactMessage.create({ name, email, subject, message });

    createNotificationForRole('admin', {
        title: 'New Contact Message',
        message: `You have a new message from ${name} regarding "${subject}".`,
        link: '/admin/inbox'
    }).catch(err => console.error('Failed to create notification for new contact message:', err));

    res.status(201).json({ success: true, data: contactMessage });
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (Admin)
// ✅ MODIFIED: Simplified to use middleware results
exports.getContactMessages = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Mark a message as read
// @route   PUT /api/contact/:id/read
// @access  Private (Admin)
// This function is now updated with logging.
exports.markAsRead = asyncHandler(async (req, res, next) => {
    let message = await ContactMessage.findById(req.params.id);

    if (!message) {
        return next(new ErrorResponse(`Message not found with id of ${req.params.id}`, 404));
    }
    
    // Only log if the message is being marked as read for the first time
    const wasAlreadyRead = message.isRead;

    message.isRead = true;
    await message.save();

    // --- 2. ADD THIS LOGGING CODE ---
    if (!wasAlreadyRead) {
        await logAction({
            user: req.user,
            action: 'CONTACT_UPDATE', // Uses the action type from permissions.js
            entity: 'ContactMessage',
            entityId: message._id,
            details: `Admin marked message from '${message.name}' (Subject: "${message.subject}") as read.`
        });
    }
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: message });
});