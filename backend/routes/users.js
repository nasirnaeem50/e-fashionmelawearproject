// routes/users.js (Complete and Corrected File)

const express = require('express');
const router = express.Router(); // ✅ ADDED: The missing router definition

const { 
    getUsers, getUser, createUser, updateUser, deleteUser,
    toggleWishlist, toggleCompare, clearCompare,
    updateMyDetails, updateMyPassword
} = require('../controllers/users');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { check, body } = require('express-validator');
const { validate } = require('../middleware/validator');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');

// Validation rule definitions
const createUserRules = [
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('role', 'Role is required').not().isEmpty(),
    check('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
];
const updateUserRules = [
    check('name', 'Name must be a non-empty string').optional().not().isEmpty().trim().escape(),
    check('email', 'Please provide a valid email').optional().isEmail().normalizeEmail(),
    check('role', 'Role must be a valid ID').optional().isMongoId()
];
const updateMyDetailsRules = [
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('email', 'Please provide a valid email').isEmail().normalizeEmail()
];
const updateMyPasswordRules = [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 6 characters long').isLength({ min: 6 }),
    body('newPassword').custom((value, { req }) => {
        if (value === req.body.currentPassword) {
            throw new Error('New password cannot be the same as the current password.');
        }
        return true;
    })
];
const productInteractionRules = [
    check('productId', 'A valid product ID is required').isMongoId()
];

// Route Definitions
router.use(protect);

// --- ROUTES FOR THE CURRENTLY LOGGED-IN USER ---
router.route('/wishlist').post(productInteractionRules, validate, toggleWishlist);
router.route('/compare').post(productInteractionRules, validate, toggleCompare);
router.route('/compare/clear').delete(clearCompare);

router.route('/updatemydetails').put(updateMyDetailsRules, validate, updateMyDetails);
router.route('/updatemypassword').put(updateMyPasswordRules, validate, updateMyPassword);


// --- ADMIN & STAFF ROUTES FOR USER MANAGEMENT ---
router.route('/')
    .get(authorize('user_view', 'user_manage'), advancedResults(User, 'role'), getUsers)
    .post(authorize('user_create', 'user_manage'), createUserRules, validate, createUser);

router.route('/:id')
    .get(authorize('user_view', 'user_manage'), getUser)
    .put(authorize('user_edit', 'user_manage'), updateUserRules, validate, updateUser)
    .delete(authorize('user_delete', 'user_manage'), deleteUser);

module.exports = router;