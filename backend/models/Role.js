const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a role name'],
        unique: true,
        trim: true,
        lowercase: true
    },
    permissions: {
        type: [String],
        // This 'required: true' is the key change. It forces Mongoose to save
        // the 'permissions' field, even if it's an empty array.
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Role', RoleSchema);