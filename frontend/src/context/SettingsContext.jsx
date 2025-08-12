import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../api'; // <-- ADDED
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

// The API_URL constant is no longer needed. The endpoint is /configuration
// const API_URL = `${import.meta.env.VITE_API_BASE_URL}/configuration`;

const SettingsContext = createContext();
export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const { can } = useAuth();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    // This is a public action. Using apiClient is fine; it won't send a token if the user isn't logged in.
    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            // Use apiClient with a relative path.
            const { data } = await apiClient.get('/configuration'); // <-- CHANGED
            if (data.success) {
                setSettings(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch store configuration:", error);
            // We don't check for 401 here since it's a public route and a failure is a real error.
            toast.error("Could not load store configuration.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // This is a privileged action. It will now send the token automatically.
    const updateSettings = async (newSettingsData) => {
        if (!can('setting_edit')) {
            toast.error("You do not have permission to update configuration.");
            return false;
        }

        try {
            // Destructuring to remove fields that shouldn't be sent back. This is good practice.
            const { _id, __v, ...payload } = newSettingsData;
            
            // Use apiClient. It will automatically include the Authorization header.
            const { data } = await apiClient.put('/configuration', payload); // <-- CHANGED
            
            if (data.success) {
                setSettings(data.data);
                toast.success("Configuration updated successfully!");
            }
            return data.success;
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Failed to update configuration.");
            }
            return false;
        }
    };

    const activeShippingCost = useMemo(() => {
        if (!settings || !settings.shippingZones) return 0;
        const activeZone = settings.shippingZones.find(zone => zone.enabled);
        return activeZone ? activeZone.rate : 0;
    }, [settings]);

    const value = {
        settings,
        loading,
        updateSettings,
        activeShippingCost,
        refetchSettings: fetchSettings,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};