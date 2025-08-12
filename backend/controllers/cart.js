// controllers/cart.js (Complete and Corrected File)

const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// This helper function is unchanged.
const calculateCartTotals = async (cart) => {
    if (!cart || !cart.items || cart.items.length === 0) {
        return { subtotal: 0, discountAmount: 0 };
    }
    let subtotal = 0;
    for (const item of cart.items) {
        subtotal += item.price * item.quantity;
    }
    let discountAmount = 0;
    if (cart.appliedCoupon) {
        const coupon = await Coupon.findOne({ code: cart.appliedCoupon, status: 'Active' });
        if (coupon && new Date(coupon.endDate) >= new Date()) {
            if (coupon.scope.type === 'all') {
                if (coupon.type === 'Percentage') {
                    discountAmount = subtotal * (coupon.value / 100);
                } else {
                    discountAmount = coupon.value;
                }
            } else {
                const productIdsInCart = cart.items.map(item => item.product);
                const productsInCart = await Product.find({ '_id': { $in: productIdsInCart } });
                const productMap = new Map(productsInCart.map(p => [p._id.toString(), p]));
                let applicableSubtotal = 0;
                for (const item of cart.items) {
                    const productDetails = productMap.get(item.product.toString());
                    if (!productDetails) continue;
                    let isItemApplicable = false;
                    const { type: scopeType, target: scopeTarget } = coupon.scope;
                    if (scopeType === 'product' && scopeTarget.includes(productDetails._id.toString())) { isItemApplicable = true; }
                    if (scopeType === 'category' && scopeTarget.includes(productDetails.category)) { isItemApplicable = true; }
                    if (scopeType === 'parent-category' && scopeTarget.includes(productDetails.gender)) { isItemApplicable = true; }
                    if (isItemApplicable) {
                        applicableSubtotal += item.price * item.quantity;
                    }
                }
                if (coupon.type === 'Percentage') {
                    discountAmount = applicableSubtotal * (coupon.value / 100);
                } else {
                    discountAmount = Math.min(coupon.value, applicableSubtotal);
                }
            }
        }
    }
    discountAmount = Math.min(discountAmount, subtotal);
    return { subtotal, discountAmount: Math.round(discountAmount) };
};

exports.getCart = asyncHandler(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return res.status(200).json({
            success: true,
            data: { items: [], appliedCoupon: null, subtotal: 0, discountAmount: 0 }
        });
    }
    const { subtotal, discountAmount } = await calculateCartTotals(cart);
    res.status(200).json({
        success: true,
        data: {
            items: cart.items,
            appliedCoupon: cart.appliedCoupon,
            subtotal,
            discountAmount,
        },
    });
});

exports.addItemToCart = asyncHandler(async (req, res, next) => {
    const { cartItemId, product, name, image, price, originalPrice, quantity, selectedSize } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
    }
    const existingItem = cart.items.find(i => i.cartItemId === cartItemId);
    if (existingItem) {
        existingItem.quantity += (quantity || 1);
    } else {
        cart.items.push({ cartItemId, product, name, image, price, originalPrice, quantity: (quantity || 1), selectedSize });
    }
    await cart.save();
    const { subtotal, discountAmount } = await calculateCartTotals(cart);
    res.status(200).json({
        success: true,
        data: {
            items: cart.items,
            appliedCoupon: cart.appliedCoupon,
            subtotal,
            discountAmount,
        },
    });
});

exports.updateItemQuantity = asyncHandler(async (req, res, next) => {
    const { quantity } = req.body;
    const { cartItemId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) { return next(new ErrorResponse('Cart not found', 404)); }
    const itemIndex = cart.items.findIndex(i => i.cartItemId === cartItemId);
    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        const { subtotal, discountAmount } = await calculateCartTotals(cart);
        res.status(200).json({ success: true, data: { items: cart.items, appliedCoupon: cart.appliedCoupon, subtotal, discountAmount } });
    } else {
        return next(new ErrorResponse('Item not found in cart', 404));
    }
});

exports.removeItemFromCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) { return next(new ErrorResponse('Cart not found', 404)); }
    cart.items = cart.items.filter(item => item.cartItemId !== req.params.cartItemId);
    if (cart.items.length === 0) {
        cart.appliedCoupon = null;
    }
    await cart.save();
    const { subtotal, discountAmount } = await calculateCartTotals(cart);
    res.status(200).json({ success: true, data: { items: cart.items, appliedCoupon: cart.appliedCoupon, subtotal, discountAmount } });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
    await Cart.findOneAndUpdate(
        { user: req.user.id },
        { $set: { items: [], appliedCoupon: null } },
        { new: true, upsert: true }
    );
    res.status(200).json({
        success: true,
        data: { items: [], appliedCoupon: null, subtotal: 0, discountAmount: 0 }
    });
});

exports.applyCoupon = asyncHandler(async (req, res, next) => {
    const { couponCode } = req.body;
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), status: 'Active' });
    if (!coupon || new Date(coupon.endDate) < new Date()) { return next(new ErrorResponse('Invalid or expired coupon code.', 400)); }
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) { return next(new ErrorResponse('Your cart is empty.', 400)); }
    if (coupon.scope.type !== 'all') {
        const productIdsInCart = cart.items.map(item => item.product);
        const productsInCart = await Product.find({ '_id': { $in: productIdsInCart } });
        const productMap = new Map(productsInCart.map(p => [p._id.toString(), p]));
        let isApplicableToAnyItem = false;
        for (const item of cart.items) {
            const productDetails = productMap.get(item.product.toString());
            if (!productDetails) continue;
            const { type: scopeType, target: scopeTarget } = coupon.scope;
            if (scopeType === 'product' && scopeTarget.includes(productDetails._id.toString())) { isApplicableToAnyItem = true; break; }
            if (scopeType === 'category' && scopeTarget.includes(productDetails.category)) { isApplicableToAnyItem = true; break; }
            if (scopeType === 'parent-category' && scopeTarget.includes(productDetails.gender)) { isApplicableToAnyItem = true; break; }
        }
        if (!isApplicableToAnyItem) { return next(new ErrorResponse('This coupon is not valid for the items in your cart.', 400)); }
    }
    cart.appliedCoupon = coupon.code;
    await cart.save();
    const { subtotal, discountAmount } = await calculateCartTotals(cart);
    res.status(200).json({ success: true, data: { items: cart.items, appliedCoupon: cart.appliedCoupon, subtotal, discountAmount } });
});

exports.removeCoupon = asyncHandler(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) { return next(new ErrorResponse('Cart not found', 404)); }
    cart.appliedCoupon = null;
    await cart.save();
    const { subtotal, discountAmount } = await calculateCartTotals(cart);
    res.status(200).json({ success: true, data: { items: cart.items, appliedCoupon: cart.appliedCoupon, subtotal, discountAmount } });
});

// @desc    Get all abandoned carts (for Admin)
// @route   GET /api/cart/abandoned
// @access  Private/Admin
// ✅ MODIFIED: Added manual pagination logic for aggregation pipeline
exports.getAbandonedCarts = asyncHandler(async (req, res, next) => {
    const threshold = new Date(Date.now() - 30 * 60 * 1000); 
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const aggregationPipeline = [
        { $match: { updatedAt: { $lt: threshold }, 'items.0': { $exists: true } } },
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userDetails' } },
        { $unwind: '$userDetails' },
        { $addFields: { totalValue: { $reduce: { input: '$items', initialValue: 0, in: { $add: ['$$value', { $multiply: ['$$this.price', '$$this.quantity'] }] } } }, totalQuantity: { $sum: '$items.quantity' } } },
        { $project: { _id: 1, user: { _id: '$userDetails._id', name: '$userDetails.name', email: '$userDetails.email' }, items: 1, totalValue: 1, totalQuantity: 1, updatedAt: 1 } },
        { $sort: { updatedAt: -1 } }
    ];
    
    const countPipeline = [...aggregationPipeline, { $count: 'total' }];
    const totalResults = await Cart.aggregate(countPipeline);
    const total = totalResults.length > 0 ? totalResults[0].total : 0;

    const paginatedPipeline = [...aggregationPipeline, { $skip: skip }, { $limit: limit }];
    const abandonedCarts = await Cart.aggregate(paginatedPipeline);

    const endIndex = page * limit;
    const pagination = {};
    if (endIndex < total) { pagination.next = { page: page + 1, limit }; }
    if (skip > 0) { pagination.prev = { page: page - 1, limit }; }

    res.status(200).json({ success: true, count: abandonedCarts.length, pagination, total, data: abandonedCarts });
});

exports.deleteCartById = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findByIdAndDelete(req.params.cartId);
    if (!cart) {
        return next(new ErrorResponse(`Cart not found with id of ${req.params.cartId}`, 404));
    }
    res.status(204).json({ success: true, data: {} });
});