// controllers/settings.js (Complete and Refactored File)

const Setting = require('../models/Setting');
const initialContent = require('../utils/initialCMSContent');
const ErrorResponse = require('../utils/errorResponse'); // ✅ ADDED: Import our custom ErrorResponse
const asyncHandler = require('../middleware/async'); // ✅ ADDED: Import our asyncHandler
const { logAction } = require('../services/auditLogService'); // <<<--- 1. IMPORT THE SERVICE

// @desc    Get site settings (CMS Content)
// @route   GET /api/settings
// @access  Public
exports.getSettings = asyncHandler(async (req, res, next) => {
    let settings = await Setting.findOne({ key: 'siteContent' });

    // If settings don't exist in the DB at all, create them with initial content.
    if (!settings) {
        try {
            settings = await Setting.create({ key: 'siteContent', value: initialContent });
            return res.status(200).json({ success: true, data: settings.value });
        } catch (err) {
            console.error('Failed to create initial site settings:', err);
            return next(new ErrorResponse('Could not initialize site content', 500));
        }
    }

    // If settings exist, merge them with the default content to add any new fields.
    const currentContent = settings.value || {};
    const mergedContent = { ...initialContent, ...currentContent };
    
    // If the merged content is different, save the updated version back to the DB.
    if (JSON.stringify(currentContent) !== JSON.stringify(mergedContent)) {
        settings.value = mergedContent;
        await settings.save();
    }

    res.status(200).json({ success: true, data: mergedContent });
});

// @desc    Update site settings (CMS Content)
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = asyncHandler(async (req, res, next) => {
    // findOneAndUpdate with upsert:true is the most efficient way to handle this.
    const settings = await Setting.findOneAndUpdate(
        { key: 'siteContent' },
        { value: req.body },
        { new: true, upsert: true, runValidators: true }
    );

    // --- 2. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'UPDATE_SETTINGS',
        entity: 'Settings',
        entityId: settings._id,
        details: 'Admin updated site content settings.'
    });
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: settings.value });
    // Note: Any validation errors from the model during the update
    // will be caught and handled automatically by our system.
});