/**
 * New Permission-Based Authorization Middleware
 *
 * This middleware checks if the authenticated user has the required permissions to access a route.
 * It's designed to be used after the 'protect' middleware.
 *
 * @param {...string} requiredPermissions - A list of permissions required to access the route.
 *                                         A user only needs to have ONE of the permissions in the list.
 */
exports.authorize = (...requiredPermissions) => {
    return (req, res, next) => {
        // The 'protect' middleware has already populated `req.user` and `req.user.role`.
        const userRole = req.user.role;

        // 1. Ensure the user's role is properly loaded.
        if (!userRole) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: User role is not defined.'
            });
        }

        // 2. Implement a super-admin override. The 'admin' role has universal access.
        //    This is a common and highly effective practice.
        if (userRole.name === 'admin') {
            return next();
        }

        // 3. Check if the user has the necessary permissions.
        const userPermissions = userRole.permissions;

        if (!userPermissions || !Array.isArray(userPermissions)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: No permissions found for your role.'
            });
        }
        
        // Check if the user's permissions array contains at least ONE of the required permissions.
        const hasRequiredPermission = requiredPermissions.some(permission => userPermissions.includes(permission));

        if (!hasRequiredPermission) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You do not have the required permission to perform this action.'
            });
        }

        // If the user has at least one of the required permissions, grant access.
        next();
    };
};