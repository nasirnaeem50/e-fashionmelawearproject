const express = require('express');
const router = express.Router();
const { getCoupons, createCoupon, updateCoupon, deleteCoupon, getActivePublicCoupons } = require('../controllers/coupons');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');
const advancedResults = require('../middleware/advancedResults');
const Coupon = require('../models/Coupon');

// Validation rules
const createCouponRules = [
    check('code', 'Coupon code is required').not().isEmpty().trim().toUpperCase(),
    check('type', 'Coupon type must be either Percentage or Fixed').isIn(['Percentage', 'Fixed']),
    check('value', 'Coupon value must be a positive number').isFloat({ gt: 0 }),
    // ✅ CORRECTED: Changed isISO86-01() to isISO8601()
    check('startDate', 'Start date must be a valid date').isISO8601().toDate(),
    // ✅ CORRECTED: Changed isISO86-01() to isISO8601()
    check('endDate', 'End date must be a valid date and after the start date').isISO8601().toDate()
        .custom((endDate, { req }) => {
            if (new Date(endDate) <= new Date(req.body.startDate)) {
                throw new Error('End date must be after start date.');
            }
            return true;
        }),
    check('scope.type', 'Scope type is required').not().isEmpty(),
    check('scope.target', 'Scope target must be an array').optional().isArray()
];
const updateCouponRules = [
    check('status', 'Status must be either Active or Inactive').isIn(['Active', 'Inactive'])
];

// The public '/active' route uses advancedResults for pagination
router.route('/active').get(advancedResults(Coupon), getActivePublicCoupons);

// These are your protected admin routes
router.route('/')
    .get(protect, authorize('coupon_view', 'coupon_manage'), advancedResults(Coupon), getCoupons)
    .post(protect, authorize('coupon_create', 'coupon_manage'), createCouponRules, validate, createCoupon);

router.route('/:id')
    .put(protect, authorize('coupon_edit', 'coupon_manage'), updateCouponRules, validate, updateCoupon)
    .delete(protect, authorize('coupon_delete', 'coupon_manage'), deleteCoupon);

module.exports = router;