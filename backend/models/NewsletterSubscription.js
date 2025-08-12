const mongoose = require('mongoose');

const NewsletterSubscriptionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email address.'],
        unique: true, // Ensures an email can only be subscribed once
        trim: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address.'
        ]
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    }
}, { 
    // Adds createdAt and updatedAt fields automatically
    timestamps: true 
});

module.exports = mongoose.model('NewsletterSubscription', NewsletterSubscriptionSchema);