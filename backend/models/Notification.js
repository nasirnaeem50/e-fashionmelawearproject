// Filename: backend/models/Notification.js

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
    },
    link: { 
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Notification', NotificationSchema);