import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../api'; // <-- ADDED
import { useAuth } from './AuthContext';

const CMSContext = createContext();
export const useCMS = () => useContext(CMSContext);

// API URL is no longer needed here. All calls target `/settings`.
// const API_URL = `${import.meta.env.VITE_API_BASE_URL}/settings`;

export const CMSProvider = ({ children }) => {
    const { can } = useAuth();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchContent = useCallback(async () => {
        setLoading(true);
        try {
            // Use apiClient. It will send a token if available.
            const { data } = await apiClient.get('/settings'); // <-- CHANGED
            if (data.success && data.data) {
                setContent(data.data);
            }
        } catch (error) {
            // The global 401 handler will catch session errors.
            // This toast will show for other errors (e.g., server down).
            if (error.response?.status !== 401) {
                toast.error("Failed to load site content from the server.");
            }
            console.error("Failed to fetch CMS content", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    // This function only modifies local state, so it remains unchanged.
    const updateContent = (section, key, value) => {
        setContent(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            }
        }));
    };

    // This privileged action now correctly sends the auth token.
    const saveChanges = async () => {
        if (!can('setting_edit')) {
            toast.error("You do not have permission to save these changes.");
            return;
        }

        if (!content) {
            toast.error("Content not loaded yet, cannot save.");
            return;
        }
        
        const toastId = toast.loading("Saving changes...");
        try {
            // Use apiClient. Token is automatically included.
            await apiClient.put('/settings', content); // <-- CHANGED
            toast.update(toastId, {
                render: "Content saved successfully!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });
        } catch (error) {
            if (error.response?.status !== 401) {
                const errorMsg = error.response?.data?.error || "Failed to save content.";
                toast.update(toastId, {
                    render: errorMsg,
                    type: "error",
                    isLoading: false,
                    autoClose: 4000
                });
            }
            console.error("Failed to save CMS content", error);
        }
    };

    const value = { content, loading, updateContent, saveChanges };

    return (
        <CMSContext.Provider value={value}>
            {!loading && children}
        </CMSContext.Provider>
    );
};