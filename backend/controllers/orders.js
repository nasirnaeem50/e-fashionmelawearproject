const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationEmailTemplate } = require('../templates/emailTemplates');
const colors = require('colors');
const { createNotificationForRole } = require('../services/notificationService');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService');

exports.addOrder = asyncHandler(async (req, res, next) => {
    const {
        orderItems, shippingInfo, paymentMethod, subtotal, campaignDiscount,
        couponCode, couponDiscount, taxAmount, shippingCost, total
    } = req.body;
    
    if (!orderItems || orderItems.length === 0) { return next(new ErrorResponse('No order items provided', 400)); }
    if (!shippingInfo || !shippingInfo.address || !shippingInfo.phone || !paymentMethod || total === undefined) { return next(new ErrorResponse('Missing required order or shipping information.', 400)); }

    const bulkOps = orderItems.map(item => ({
        updateOne: {
            filter: { _id: item.product, stock: { $gte: item.quantity } },
            update: { 
                $inc: { 
                    stock: -item.quantity,
                    sold: +item.quantity 
                } 
            }
        }
    }));

    const bulkResult = await Product.bulkWrite(bulkOps);

    if (bulkResult.modifiedCount !== orderItems.length) {
        console.error('CRITICAL: Stock update failed for an order. Not all products had sufficient stock.'.red.bold);
        return next(new ErrorResponse('One or more items in your cart are no longer in stock. Please review your cart and try again.', 409));
    }

    const newOrder = new Order({
        user: req.user.id, orderItems, shippingInfo, paymentMethod, subtotal,
        campaignDiscount, couponCode, couponDiscount, shippingCost,
        taxAmount: Math.round(taxAmount || 0),
        total: Math.round(total || 0),
        status: 'Processing',
        paymentStatus: req.body.paymentMethod === 'cod' ? 'Pending' : 'Awaiting Payment',
        date: new Date(),
    });

    const createdOrder = await newOrder.save();
    const populatedOrder = await Order.findById(createdOrder._id).populate('user', 'name email');
    
    if (!populatedOrder) {
        console.error(`FATAL: Order ${createdOrder._id} was created but could not be found immediately after.`.red.bold);
        return next(new ErrorResponse('Order created, but failed to retrieve for processing.', 500));
    }
    
    createNotificationForRole('admin', {
        title: 'New Order Received',
        message: `Order #${populatedOrder.id.slice(-6).toUpperCase()} for Rs ${populatedOrder.total} was placed by ${populatedOrder.user.name}.`,
        link: `/admin/orders/details/${populatedOrder._id}`
    }).catch(err => console.error('Failed to create admin notification for new order:', err));
    
    const emailOrderData = JSON.parse(JSON.stringify(populatedOrder));
    emailOrderData.shippingInfo = {
        name: populatedOrder.shippingInfo.name || '',
        address: populatedOrder.shippingInfo.address || '',
        city: populatedOrder.shippingInfo.city || '',
        state: populatedOrder.shippingInfo.state || '',
        postalCode: populatedOrder.shippingInfo.postalCode || '',
        country: populatedOrder.shippingInfo.country || '',
        phone: populatedOrder.shippingInfo.phone || '',
        phoneNo: populatedOrder.shippingInfo.phone || '',
        email: populatedOrder.shippingInfo.email || '',
    };
    
    try {
        await sendEmail({
            email: emailOrderData.user.email,
            subject: `Your Fashion Mela Order #${emailOrderData.id.slice(-6).toUpperCase()} is Confirmed!`,
            html: orderConfirmationEmailTemplate(emailOrderData.user.name, emailOrderData, process.env.FRONTEND_URL) 
        });
        await sendEmail({
            email: 'nasirnaeem50@gmail.com',
            subject: `[New Order] - Order #${emailOrderData.id.slice(-6).toUpperCase()} has been placed!`,
            html: orderConfirmationEmailTemplate(emailOrderData.user.name, emailOrderData, process.env.FRONTEND_URL, true) 
        });
    } catch (emailError) {
        console.error('Failed to send order emails (order was still saved):', emailError);
    }
    
    res.status(201).json({ success: true, data: populatedOrder });
});

exports.getMyOrders = asyncHandler(async (req, res, next) => {
    const filter = { user: req.user.id };
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Order.countDocuments(filter);
    const results = await Order.find(filter)
      .sort(req.query.sort ? req.query.sort.split(',').join(' ') : '-date')
      .skip(startIndex)
      .limit(limit);
    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }
    res.status(200).json({
      success: true,
      count: results.length,
      pagination,
      total,
      data: results
    });
});

exports.getOrderById = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: order });
});

exports.getOrders = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) { return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)); }

    const oldStatus = order.status;
    
    order.status = req.body.status;
    if (req.body.status === 'Delivered') { order.paymentStatus = 'Paid'; }

    const updatedOrder = await order.save();
    
    await logAction({
        user: req.user,
        action: 'UPDATE_ORDER_STATUS',
        entity: 'Order',
        entityId: order._id,
        details: `Admin updated status for order #${order.id.slice(-6).toUpperCase()} from '${oldStatus}' to '${order.status}'.`
    });

    res.status(200).json({ success: true, data: updatedOrder });
});

exports.deleteOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) { 
        return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)); 
    }

    const orderIdentifier = order.id.slice(-6).toUpperCase();
    
    // <<<--- ✅ FIX: Replaced .remove() with the correct .deleteOne() method ---<<<
    await order.deleteOne();

    await logAction({
        user: req.user,
        action: 'DELETE_ORDER',
        entity: 'Order',
        entityId: order._id,
        details: `Admin deleted order #${orderIdentifier}.`
    });
    
    res.status(200).json({ success: true, data: {} });
});

exports.clearAllOrders = asyncHandler(async (req, res, next) => {
    await Order.deleteMany({ status: { $ne: 'Cancelled' } });
    res.status(200).json({ success: true, message: 'All transactions cleared.' });
});

exports.requestReturn = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) { return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)); }
    if (order.user.toString() !== req.user.id) { return next(new ErrorResponse('Not authorized to access this order', 401)); }
    if (order.status !== 'Delivered') { return next(new ErrorResponse('Returns can only be requested for delivered orders.', 400)); }
    if (order.returnStatus) { return next(new ErrorResponse('A return has already been requested for this order.', 400)); }
    const { reason } = req.body;
    if (!reason) { return next(new ErrorResponse('A reason for the return is required.', 400)); }
    order.returnStatus = 'Pending';
    order.returnReason = reason;
    const updatedOrder = await order.save();
    createNotificationForRole('admin', {
        title: 'Return Request Submitted',
        message: `A return has been requested for Order #${order.id.slice(-6).toUpperCase()}.`,
        link: `/admin/orders/details/${order._id}`
    }).catch(err => console.error('Failed to create notification for return request:', err));
    res.status(200).json({ success: true, data: updatedOrder });
});

exports.updateReturnStatus = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) { return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)); }
    const { returnStatus } = req.body;
    if (!['Approved', 'Rejected'].includes(returnStatus)) { return next(new ErrorResponse('Invalid return status provided.', 400)); }
    order.returnStatus = returnStatus;
    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: updatedOrder });
});