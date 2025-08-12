const express = require('express');
const router = express.Router();
const { getMedia, uploadMedia, deleteMedia } = require('../controllers/media');
const { upload } = require('../config/cloudinary'); // multer/cloudinary config

// Import middleware
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
// ✅ ADDED: Import validation functions and our custom handler
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');

// ✅ ADDED: Define validation rules for deleting media
const deleteMediaRules = [
    check('public_id', 'File public_id is required').not().isEmpty().trim()
];


// Protect all media routes
router.use(protect);

// Apply granular permissions to each route.
router.route('/')
    .get(authorize('media_view', 'media_manage'), getMedia)
    // ✅ MODIFIED: Added validation for deleting media
    .delete(authorize('media_delete', 'media_manage'), deleteMediaRules, validate, deleteMedia);

router.route('/upload')
    .post(
        authorize('media_upload', 'media_manage'), 
        upload.array('files', 10), 
        uploadMedia
    );

module.exports = router;