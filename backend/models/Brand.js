// backend/models/Brand.js
const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a brand name'],
        unique: true,
        trim: true,
    },
    logo: {
        type: String,
        required: [true, 'Please add a logo URL'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Brand', BrandSchema);