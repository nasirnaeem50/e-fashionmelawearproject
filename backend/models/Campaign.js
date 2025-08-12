// backend/models/Campaign.js
const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a campaign name'],
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    discount: {
        type: {
            type: String,
            required: true,
            enum: ['percentage', 'fixed'],
        },
        value: {
            type: Number,
            required: true,
        },
    },
    scope: {
        type: {
            type: String,
            enum: ['all', 'parent-category', 'category', 'child-category', 'product'],
            default: 'all',
        },
        target: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
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

module.exports = mongoose.model('Campaign', CampaignSchema);