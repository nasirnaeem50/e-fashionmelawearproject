// backend/models/Coupon.js
const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please add a coupon code'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['Percentage', 'Fixed'],
    },
    value: {
        type: Number,
        required: [true, 'Please add a discount value'],
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
    scope: {
        type: {
            type: String,
            enum: ['all', 'parent-category', 'category', 'product'],
            default: 'all',
        },
        target: {
            type: [mongoose.Schema.Types.Mixed], // Can be strings (names) or ObjectIds (products)
            default: [],
        },
    },
    display: {
        type: String,
        enum: ['standard', 'popup'],
        default: 'standard',
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
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

module.exports = mongoose.model('Coupon', CouponSchema);