import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

/**
 * AdminRoute protects all dashboard routes.
 * It ensures that only authenticated users with an administrative or staff role can access the dashboard.
 * It replaces the old hardcoded role check with a more flexible system.
 */
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // 1. If authentication state is still loading, show a spinner.
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="text-red-500 text-5xl animate-spin" />
            </div>
        );
    }

    // 2. If the user is not logged in, redirect them to the login page.
    //    We save their intended destination ('from') so they can be redirected back after logging in.
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. If the user is logged in, check their role.
    //    The backend now provides a `role` object on the user. We check `user.role.name`.
    //    Any role other than 'user' (e.g., 'admin', 'manager', 'editor') is allowed.
    //    This prevents standard customers from accessing the dashboard.
    if (!user.role || user.role.name === 'user') {
        // If they are a standard user, redirect them to the site's homepage.
        return <Navigate to="/" replace />;
    }
    
    // 4. If all checks pass, render the protected component.
    return children;
};

export default AdminRoute;