import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../api'; // <-- ADDED
import { useAuth } from './AuthContext';

const MediaContext = createContext();
export const useMedia = () => useContext(MediaContext);

// The API_URL constant is no longer needed.
// const API_URL = `${import.meta.env.VITE_API_BASE_URL}/media`;

export const MediaProvider = ({ children }) => {
    const { user, loading: authLoading, can } = useAuth();
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMedia = useCallback(async () => {
        if (authLoading) {
            return;
        }
        
        if (!can('media_view')) {
            setLoading(false);
            setMediaItems([]);
            return;
        }

        setLoading(true);
        try {
            // Use apiClient with a relative path. Token is handled automatically.
            const { data } = await apiClient.get('/media'); // <-- CHANGED
            if (data.success) {
                setMediaItems(Array.isArray(data.data) ? data.data : []);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error("Failed to load media library.");
            }
            console.error("Media fetch error:", error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    }, [authLoading, can]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const addMedia = async (files) => {
        if (!files || files.length === 0) return;
        
        if (!can('media_upload')) {
            toast.error("You do not have permission to upload media.");
            return;
        }

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        
        const toastId = toast.loading(`Uploading ${files.length} file(s)...`);

        try {
            // Use apiClient. It will automatically handle headers for FormData.
            const { data } = await apiClient.post('/media/upload', formData); // <-- CHANGED & SIMPLIFIED

            if (data.success) {
                toast.update(toastId, { 
                    render: `Successfully uploaded ${data.data.length} file(s)`, 
                    type: "success", 
                    isLoading: false,
                    autoClose: 3000 
                });
                setMediaItems(prev => [...data.data, ...prev]);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                const errorMsg = error.response?.data?.error || 'Upload failed';
                toast.update(toastId, { 
                    render: errorMsg, 
                    type: "error", 
                    isLoading: false,
                    autoClose: 4000 
                });
            }
        }
    };

    const deleteMedia = async (publicId) => {
        if (!can('media_delete')) {
            toast.error("You do not have permission to delete media.");
            return;
        }
        
        if (!publicId.startsWith('e_fashion_mela/')) {
            toast.error("Cannot delete files outside the designated folder");
            return;
        }

        if (window.confirm("Permanently delete this file? This action cannot be undone.")) {
            try {
                // Use apiClient. Token is handled automatically.
                await apiClient.delete('/media', { data: { public_id: publicId } }); // <-- CHANGED
                toast.success("File deleted");
                setMediaItems(prev => prev.filter(item => item.id !== publicId));
            } catch (error) {
                if (error.response?.status !== 401) {
                    toast.error(error.response?.data?.error || "Deletion failed");
                }
            }
        }
    };

    const value = { mediaItems, loading, addMedia, deleteMedia, fetchMedia };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};