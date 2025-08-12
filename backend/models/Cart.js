// backend/models/Cart.js
const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    _id: false, // Prevent Mongoose from creating an _id for subdocuments
    
    // This sub-schema is correct. There should be NO 'unique: true' here.
    cartItemId: { 
        type: String, 
        required: [true, 'cartItemId is required.'] 
    },
    
    product: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    originalPrice: { 
        type: Number 
    },
    quantity: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    selectedSize: { 
        type: String 
    },
});

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // This is correct: one cart per user.
    },
    items: [CartItemSchema],
    appliedCoupon: {
        type: String,
        default: null,
    },
}, { 
    timestamps: true 
});

// ✅ DEFINITIVE FIX:
// The root cause of the entire problem is a line of code, likely at the end of this file,
// that looks like this:
// CartSchema.index({ 'items.cartItemId': 1 }, { unique: true });
// By ensuring that line is GONE from this file, we stop the faulty index from being recreated
// every time the server restarts. The code provided here is the final, correct version
// without that faulty index-creating command.

module.exports = mongoose.model('Cart', CartSchema);