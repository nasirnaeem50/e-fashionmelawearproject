// controllers/auth.js (Complete and Refactored File)

const crypto = require('crypto');
const User = require('../models/User');
const Role = require('../models/Role');
const sendEmail = require('../utils/sendEmail');
const welcomeEmailTemplate = require('../templates/welcomeEmail');
const { createNotificationForRole } = require('../services/notificationService');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService'); // <<<--- 1. IMPORT THE SERVICE

// Helper function to send JWT token
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    const userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
        // This is a critical server configuration error, not a user error.
        console.error("FATAL ERROR: Default 'user' role not found in database.");
        return next(new ErrorResponse('Server misconfiguration: Default role not found.', 500));
    }

    const user = await User.create({ name, email, password, role: userRole._id });

    // After user is created, send a notification to all admins.
    // This runs in the background and doesn't need to block the response.
    createNotificationForRole('admin', {
        title: 'New User Registered',
        message: `A new user "${user.name}" (${user.email}) has signed up.`,
        link: `/admin/customers`
    }).catch(err => console.error('Failed to create notification for new user:', err)); // Log error if notification fails

    // --- SEND WELCOME EMAIL ---
    try {
        await sendEmail({
            email: user.email,
            subject: 'Welcome to Fashion Mela!',
            html: welcomeEmailTemplate(user.name, process.env.FRONTEND_URL)
        });
        console.log(`Welcome email sent to ${user.email}`);
    } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // We don't block the registration if email fails, just log it.
    }
    // --- End of Email Logic ---

    sendTokenResponse(user, 201, res);
    // Note: If email is a duplicate, Mongoose throws error code 11000.
    // Our asyncHandler catches it, and our errorHandler formats a clean "Duplicate field" response.
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Populate the role to check if it's an admin/moderator
    const user = await User.findOne({ email }).select('+password').populate('role');

    if (!user || !(await user.matchPassword(password))) {
        // --- Optional: Log failed admin login attempts ---
        if (user && ['admin', 'moderator'].includes(user.role?.name)) {
            await logAction({
                user: user,
                action: 'LOGIN_FAIL',
                entity: 'Auth',
                details: `Failed login attempt for admin user: '${user.email}'.`
            });
        }
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // --- 2. ADD THIS LOGGING CODE for successful admin/moderator login ---
    if (user.role && ['admin', 'moderator'].includes(user.role.name)) {
        await logAction({
            user: user,
            action: 'LOGIN_SUCCESS',
            entity: 'Auth',
            details: `Admin user '${user.email}' (Role: ${user.role.name}) logged in.`
        });
    }
    // --- END OF LOGGING CODE ---

    sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
// Note: This function is synchronous, so asyncHandler isn't strictly necessary but is good practice for consistency.
exports.getMe = asyncHandler(async (req, res, next) => {
    // req.user is populated by the 'protect' middleware
    res.status(200).json({ success: true, data: req.user });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested a password reset. Please click the following link, or paste it into your browser to complete the process within 15 minutes:\n\n${resetUrl}`;

    try {
        await sendEmail({ email: user.email, subject: 'Password Reset Request', message });
        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.error("Forgot password email error:", err);
        // If email fails, clear the token so the user can try again without waiting for it to expire
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token from URL
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid or expired token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});