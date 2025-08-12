const mongoose = require('mongoose');

const ConfigurationSchema = new mongoose.Schema({
    // Store Settings
    maintenanceMode: { type: Boolean, default: false },
    newnessDurationDays: { type: Number, default: 7 },
    storePhone: { type: String, default: '0341 9169022' },
    storeEmail: { type: String, default: 'info@fashionmelawear.com' },
    // Shipping Settings
    shippingZones: [{
        _id: false,
        id: Number,
        name: String,
        rate: Number,
        enabled: Boolean,
    }],
    // Payment Gateway Settings
    paymentGateways: {
        cod: { enabled: Boolean },
        bank: { enabled: Boolean },
        easypaisa: { enabled: Boolean },
        stripe: { enabled: Boolean },
    },
    // Tax & Currency Settings
    taxRate: { type: Number, default: 17 },
    currencies: [{
        _id: false,
        id: Number,
        name: String,
        code: String,
        symbol: String,
        primary: Boolean,
    }]
}, {
    // This ensures we only ever have one configuration document
    capped: { size: 1024, max: 1 },
});

module.exports = mongoose.model('Configuration', ConfigurationSchema);