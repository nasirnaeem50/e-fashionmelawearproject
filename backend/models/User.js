const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please add a name'] 
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    // --- THIS IS THE CRITICAL CHANGE ---
    // Instead of a simple string, 'role' is now a reference to a document in the 'Role' collection.
    role: {
        type: mongoose.Schema.ObjectId,
        ref: 'Role',
        required: true
    },
    // The 'permissions' array is now removed from the User model.
    // Permissions are derived directly from the user's assigned role.
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 8,
        select: false,
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
        ]
    },
    
    wishlist: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Product'
    }],
    compare: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Product'
    }],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Middleware to hash password before saving (Unchanged)
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to generate JWT (Unchanged)
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role, name: this.name }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Method to match entered password with hashed password (Unchanged)
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate password reset token (Unchanged)
UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

module.exports = mongoose.model('User', UserSchema);