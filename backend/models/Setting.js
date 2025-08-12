const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: 'siteContent',
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);