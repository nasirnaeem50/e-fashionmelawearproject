// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../api';

// ✅ UPDATED: The full list of permissions needs our new permission added.
export const ALL_PERMISSIONS = [
    'product_view', 'product_create', 'product_edit', 'product_delete', 'product_manage',
    'product_stock_view', 'product_edit_stock', 'order_view', 'order_edit_status',
    'order_delete', 'order_manage', 'order_delete_all', 'user_view', 'user_create',
    'user_edit', 'user_delete', 'user_manage', 'category_create', 'category_edit',
    'category_delete', 'category_manage', 'brand_create', 'brand_delete', 'brand_manage',
    'campaign_create', 'campaign_edit', 'campaign_delete', 'campaign_manage',
    'coupon_view', 'coupon_create', 'coupon_edit', 'coupon_delete', 'coupon_manage',
    'cart_abandoned_view', 'cart_delete', 'cart_manage', 'media_view', 'media_upload',
    'media_delete', 'media_manage', 'review_view', 'review_edit', 'review_delete',
    'review_manage', 'newsletter_view', 'newsletter_delete', 'newsletter_manage',
    'contact_view', 'contact_update', 'contact_delete', 'contact_manage', 
    'setting_edit', 'setting_manage', 'report_view', 'report_manage',
    // <<<--- THIS IS THE ONLY LINE WE ARE ADDING ---<<<
    'auditlog_view'
];

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await apiClient.get('/auth/me');
                setUser(res.data.data);
                return res.data.data;
            } catch (err) {
                logout(false); 
                return null;
            }
        }
        return null;
    }, []);

    const refreshUser = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        const loadUserFromToken = async () => {
            setLoading(true);
            await fetchUser();
            setLoading(false);
        };
        loadUserFromToken();
    }, [fetchUser]);

    const login = async (email, password) => {
        const res = await apiClient.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        const loggedInUser = await fetchUser();
        toast.success(`Welcome back, ${loggedInUser.name}!`);
        return true;
    };

    const register = async (name, email, password) => {
        try {
            await apiClient.post('/auth/register', { name, email, password });
            toast.success("Registration successful! Please log in.");
            return true;
        } catch (err) {
            const backendError = err.response?.data?.error || 'Registration failed.';
            if (backendError.includes('duplicate key') || backendError.includes('already exists')) {
                throw new Error('An account with this email already exists.');
            }
            throw new Error(backendError);
        }
    };

    const logout = (showToast = true) => {
        setUser(null);
        localStorage.removeItem('token');
        if (showToast) toast.info("You have been logged out.");
        navigate('/');
    };
    
    const forgotPassword = async (email) => {
        await apiClient.post('/auth/forgotpassword', { email });
        return true;
    };

    const resetPassword = async (resetToken, password) => {
        const res = await apiClient.put(`/auth/resetpassword/${resetToken}`, { password });
        localStorage.setItem('token', res.data.token);
        await fetchUser();
        toast.success('Password has been reset successfully!');
        return true;
    };
    
    const can = (permission) => {
        if (!user || !user.role) return false;
        if (user.role.name === 'admin') return true;
        
        if (Array.isArray(permission)) {
            return permission.some(p => user.role.permissions?.includes(p));
        }

        return user.role.permissions?.includes(permission) || false;
    };

    const toggleWishlist = useCallback(async (productId) => {
        if (!user) { toast.error("Please log in to manage your wishlist."); return; }
        try {
            const { data } = await apiClient.post('/users/wishlist', { productId });
            setUser(prevUser => ({ ...prevUser, wishlist: data.data }));
        } catch (err) {
            if(err.response?.status !== 401) toast.error(err.response?.data?.error || "Could not update wishlist.");
            await fetchUser();
        }
    }, [user, fetchUser]);

    const isInWishlist = useCallback((productId) => user?.wishlist?.includes(productId) || false, [user?.wishlist]);

    const toggleCompare = useCallback(async (productId) => {
        if (!user) { toast.error("Please log in to manage your compare list."); return; }
        try {
            if (!user.compare.includes(productId) && user.compare.length >= 4) {
                 toast.error('You can only compare up to 4 items.');
                 return;
            }
            const { data } = await apiClient.post('/users/compare', { productId });
            setUser(prevUser => ({ ...prevUser, compare: data.data }));
        } catch (err)
 {
            if(err.response?.status !== 401) toast.error(err.response?.data?.error || "Could not update compare list.");
            await fetchUser();
        }
    }, [user, fetchUser]);

    const isInCompare = useCallback((productId) => user?.compare?.includes(productId) || false, [user?.compare]);

    const updateUserContext = async (detailsToUpdate) => {
        try {
            const res = await apiClient.put('/users/updatemydetails', detailsToUpdate);
            setUser(res.data.data);
        } catch (err) {
            if(err.response?.status !== 401) {
                const message = err.response?.data?.error || 'Could not update details.';
                throw new Error(message);
            }
        }
    };

    const updatePasswordContext = async (currentPassword, newPassword) => {
        try {
            const res = await apiClient.put('/users/updatemypassword', { currentPassword, newPassword });
            localStorage.setItem('token', res.data.token);
            await fetchUser();
        } catch (err) {
            if(err.response?.status !== 401) {
                const message = err.response?.data?.error || 'Could not update password.';
                throw new Error(message);
            }
        }
    };
    
    const value = { 
        user, loading, login, register, logout, can,
        isAdmin: user?.role?.name === 'admin',
        forgotPassword, resetPassword, fetchUser, refreshUser,
        toggleWishlist, isInWishlist, 
        toggleCompare, isInCompare,
        updateUserContext, updatePasswordContext
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};