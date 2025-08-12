const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes by verifying JWT and loading user with permissions
exports.protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }
    // You could also check for token in cookies here as a fallback
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user and populate their role information.
        // This is the crucial step to get the permissions associated with the user's role.
        req.user = await User.findById(decoded.id).populate('role');

        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
        }
        
        // Check if the user has a role assigned. This is vital for permission checks.
        if (!req.user.role) {
            return res.status(403).json({ success: false, error: 'Forbidden: User has no role assigned.' });
        }

        next();
    } catch (err) {
        // Log the error for debugging purposes on the server side
        console.error(err);
        return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
};

// The old role-based authorize function is now removed from this file.
// It will be replaced by a new, more powerful permission-based `authorize` middleware
// in the `backend/middleware/authorize.js` file, which you will provide next.