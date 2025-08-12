// controllers/users.js (Complete and Updated File)

const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService'); // <<<--- 1. IMPORT THE SERVICE

// @desc    Get all users (for admin panel)
// @route   GET /api/users
// @access  Private (Requires 'user_view' permission)
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get a single user
// @route   GET /api/users/:id
// @access  Private (Requires 'user_view' permission)
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).populate('role');
    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: user });
});

// @desc    Create a user (typically for admin creating staff)
// @route   POST /api/users
// @access  Private (Requires 'user_create' permission)
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
});

// @desc    Update user details (for admin panel)
// @route   PUT /api/users/:id
// @access  Private (Requires 'user_edit' permission)
exports.updateUser = asyncHandler(async (req, res, next) => {
    // Find the user first to get their current role for logging
    const userToUpdate = await User.findById(req.params.id).populate('role');
    if (!userToUpdate) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    const oldRoleName = userToUpdate.role ? userToUpdate.role.name : 'none';

    const fieldsToUpdate = {};
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.email) fieldsToUpdate.email = req.body.email;
    if (req.body.role) fieldsToUpdate.role = req.body.role;

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, { 
        new: true, 
        runValidators: true 
    }).populate('role');

    // --- 2. ADD THIS LOGGING CODE ---
    // Log only if the role was part of the request and it actually changed
    if (req.body.role && oldRoleName !== user.role.name) {
        await logAction({
            user: req.user,
            action: 'UPDATE_USER_ROLE',
            entity: 'User',
            entityId: user._id,
            details: `Admin changed role for user '${user.email}' from '${oldRoleName}' to '${user.role.name}'.`
        });
    }
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: user });
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Requires 'user_delete' permission)
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Prevent admin from deleting themselves
    if (user._id.equals(req.user.id)) {
        return next(new ErrorResponse('Admins cannot delete their own account.', 400));
    }

    const userEmailForLog = user.email; // Store details for logging
    const userIdForLog = user._id;

    await user.deleteOne();

    // --- 3. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'DELETE_USER',
        entity: 'User',
        entityId: userIdForLog,
        details: `Admin deleted user account: '${userEmailForLog}'.`
    });
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: {} });
});


// --- User Profile Management (No logging needed for these user-initiated actions) ---
exports.updateMyDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    }).populate('role');

    res.status(200).json({ success: true, data: user });
});

exports.updateMyPassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
        return next(new ErrorResponse('Incorrect current password', 401));
    }

    user.password = newPassword;
    await user.save();
    
    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, token });
});


// --- Wishlist & Compare Controllers ---
exports.toggleWishlist = asyncHandler(async (req, res, next) => {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) { return next(new ErrorResponse('User not found', 404)); }

    const index = user.wishlist.indexOf(productId);
    if (index === -1) { user.wishlist.push(productId); } 
    else { user.wishlist.splice(index, 1); }
    await user.save();
    res.status(200).json({ success: true, data: user.wishlist });
});

exports.toggleCompare = asyncHandler(async (req, res, next) => {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) { return next(new ErrorResponse('User not found', 404)); }
    
    const index = user.compare.indexOf(productId);
    if (index === -1) {
        if (user.compare.length >= 4) {
            return next(new ErrorResponse('You can only compare up to 4 items.', 400));
        }
        user.compare.push(productId);
    } else { 
        user.compare.splice(index, 1); 
    }
    await user.save();
    res.status(200).json({ success: true, data: user.compare });
});

exports.clearCompare = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) { return next(new ErrorResponse('User not found', 404)); }
    user.compare = [];
    await user.save();
    res.status(200).json({ success: true, data: user.compare });
});