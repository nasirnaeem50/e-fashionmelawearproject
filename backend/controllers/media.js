// controllers/media.js (Complete and Corrected File)

const { cloudinary } = require('../config/cloudinary');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService'); // <<<--- 1. IMPORT THE SERVICE

const CLOUDINARY_FOLDER = 'e_fashion_mela';

// @desc    Get all media
// @route   GET /api/media
// @access  Private
// ✅ MODIFIED: Added Cloudinary's cursor-based pagination
exports.getMedia = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 50;
    const next_cursor = req.query.next_cursor || null;

    const { resources, next_cursor: new_cursor } = await cloudinary.api.resources({
        type: 'upload',
        prefix: CLOUDINARY_FOLDER,
        max_results: limit,
        next_cursor: next_cursor
    });

    const mediaItems = resources.map(file => ({
        id: file.public_id,
        name: file.public_id.split('/').pop(),
        url: file.secure_url,
        uploadedAt: file.created_at
    }))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    const pagination = {
        next_cursor: new_cursor || null
    };

    res.status(200).json({ success: true, count: mediaItems.length, pagination, data: mediaItems });
});

// @desc    Upload media
exports.uploadMedia = asyncHandler(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(new ErrorResponse('No files uploaded', 400));
    }
    const uploadedFiles = req.files.map(file => ({
        id: file.public_id,
        url: file.path,
        name: file.originalname,
        uploadedAt: new Date().toISOString()
    }));
    res.status(201).json({ success: true, data: uploadedFiles });
});

// @desc    Delete media
exports.deleteMedia = asyncHandler(async (req, res, next) => {
    const { public_id } = req.body;
    if (!public_id) {
        return next(new ErrorResponse('No file ID provided', 400));
    }
    if (!public_id.startsWith(`${CLOUDINARY_FOLDER}/`)) {
        return next(new ErrorResponse('Deletion is not allowed for this resource', 403));
    }
    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === 'ok') {
        // --- 2. ADD THIS LOGGING CODE ---
        // Since we don't have a Mongoose model ID, we log the action without an entityId.
        // The public_id in the details is sufficient.
        await logAction({
            user: req.user,
            action: 'DELETE_MEDIA', // We need to add this to permissions.js
            entity: 'Media',
            details: `Admin deleted media file: '${public_id}'.`
        });
        // --- END OF LOGGING CODE ---
        
        res.status(200).json({ success: true, data: { id: public_id } });
    } else {
        return next(new ErrorResponse('File not found on Cloudinary', 404));
    }
});