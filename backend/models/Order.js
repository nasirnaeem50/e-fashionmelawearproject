// backend/models/Order.js
const mongoose = require('mongoose');

// This schema is based on the data structure used throughout the frontend.
const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User is required for an order.'],
    },
    // The key is `orderItems` as used in the backend controller
    orderItems: [{
        _id: false, // Prevents Mongoose from creating an _id for subdocuments
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number }, // Not required, can be absent
        selectedSize: { type: String },  // Not required, can be absent
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: [true, 'A product reference is required for each order item.'],
        },
        cartItemId: { type: String, required: true }
    }],
    shippingInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        address: { type: String, required: true },
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cod', 'bank', 'easypaisa'],
    },
    paymentStatus: {
        type: String,
        required: true,
    },
    subtotal: { type: Number, required: true },
    campaignDiscount: { type: Number },
    couponCode: { type: String },
    couponDiscount: { type: Number },
    taxAmount: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
        type: String,
        required: true,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    },
    returnStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', null],
        default: null
    },
    returnReason: {
        type: String,
        trim: true,
        default: ''
    },

    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (document, returnedObject) => {
            returnedObject.id = returnedObject._id.toString();
            delete returnedObject._id;
            delete returnedObject.__v;
        }
    }
});

// ✅ NEW: Added a compound index for performance.
// This tells MongoDB to optimize queries that filter by 'user' and sort by 'date',
// which is exactly what our new "Top Customers" report does. This will make
// the report extremely fast, even with millions of orders.
OrderSchema.index({ user: 1, date: -1 });


module.exports = mongoose.model('Order', OrderSchema);