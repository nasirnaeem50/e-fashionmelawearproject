const express = require('express');
const router = express.Router();
const {
    addOrder, getMyOrders, getOrderById, getOrders,
    updateOrderStatus, deleteOrder, clearAllOrders,
    requestReturn, updateReturnStatus
} = require('../controllers/orders');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');
const advancedResults = require('../middleware/advancedResults');
const Order = require('../models/Order');

// Validation rules
const addOrderRules = [
    check('orderItems', 'Order items must be an array and not empty').isArray({ min: 1 }),
    check('orderItems.*.product', 'Each order item must have a product ID').isMongoId(),
    check('orderItems.*.name', 'Each order item must have a name').not().isEmpty(),
    check('orderItems.*.price', 'Each order item must have a price').isNumeric(),
    check('orderItems.*.quantity', 'Each order item must have a quantity').isInt({ gt: 0 }),
    check('shippingInfo', 'Shipping information is required').not().isEmpty(),
    check('shippingInfo.address', 'Shipping address is required').not().isEmpty(),
    check('shippingInfo.phone', 'Shipping phone number is required').not().isEmpty(),
    check('paymentMethod', 'Payment method is required').not().isEmpty(),
    check('total', 'Total amount is required').isNumeric()
];
const updateStatusRules = [
    check('status', 'A valid status is required').isIn(['Processing', 'Shipped', 'Delivered', 'Cancelled'])
];
const updateReturnStatusRules = [
    check('returnStatus', 'A valid return status is required').isIn(['Approved', 'Rejected'])
];
const requestReturnRules = [
    check('reason', 'A reason for the return is required').not().isEmpty().trim().escape()
];

router.use(protect);

// --- Admin & Staff Authorized Routes ---
router.route('/')
    .get(authorize('order_view', 'order_manage'), advancedResults(Order, { path: 'user', select: 'name' }), getOrders);

router.route('/:id/status')
    .put(authorize('order_edit_status', 'order_manage'), updateStatusRules, validate, updateOrderStatus);

router.route('/:id/return-status')
    .put(authorize('order_edit_status', 'order_manage'), updateReturnStatusRules, validate, updateReturnStatus);

router.route('/:id')
    .delete(authorize('order_delete', 'order_manage'), deleteOrder);

router.route('/clear')
    .delete(authorize('order_delete_all', 'order_manage'), clearAllOrders);


// --- Customer-Specific & Shared Routes ---
router.route('/')
    .post(addOrderRules, validate, addOrder);

// ✅ MODIFIED: The 'myorders' route now uses advancedResults for pagination
router.route('/myorders')
    .get(advancedResults(Order), getMyOrders);

router.route('/:id')
    .get(getOrderById);

router.route('/:id/request-return')
    .put(requestReturnRules, validate, requestReturn);

module.exports = router;