const express = require('express');
const router = express.Router();
const {
    getCart, addItemToCart, updateItemQuantity, removeItemFromCart,
    clearCart, applyCoupon, removeCoupon, getAbandonedCarts, deleteCartById 
} = require('../controllers/cart');

// Import middleware
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
// ✅ ADDED: Import validation functions and our custom handler
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');

// ✅ ADDED: Define validation rules
const addItemRules = [
    check('cartItemId', 'Cart Item ID is required').not().isEmpty(),
    check('product', 'Product ID is required').isMongoId(),
    check('name', 'Product name is required').not().isEmpty(),
    check('price', 'Price must be a number').isNumeric(),
    check('quantity', 'Quantity must be an integer').isInt({ gt: 0 }),
    check('selectedSize', 'A size must be selected').not().isEmpty()
];

const updateQuantityRules = [
    check('quantity', 'Quantity must be a positive integer').isInt({ gt: 0 })
];

const applyCouponRules = [
    check('couponCode', 'Coupon code is required').not().isEmpty().trim().toUpperCase()
];


// Apply 'protect' middleware to all routes below.
router.use(protect);

// --- Admin-specific routes for cart management ---
router.route('/abandoned')
    .get(authorize('cart_abandoned_view', 'cart_manage'), getAbandonedCarts);

router.route('/:cartId')
    .delete(authorize('cart_delete', 'cart_manage'), deleteCartById);

// --- Routes for the authenticated user's own cart ---
// ✅ MODIFIED: Added validation for updating item quantity
router.route('/item/:cartItemId')
    .put(updateQuantityRules, validate, updateItemQuantity)
    .delete(removeItemFromCart);

// ✅ MODIFIED: Added validation for applying a coupon
router.route('/coupon')
    .post(applyCouponRules, validate, applyCoupon)
    .delete(removeCoupon);

// ✅ MODIFIED: Added validation for adding an item to the cart
router.route('/')
    .get(getCart)
    .post(addItemRules, validate, addItemToCart)
    .delete(clearCart);

module.exports = router;