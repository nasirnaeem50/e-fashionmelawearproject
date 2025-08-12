import React, { useState, useEffect } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { FiSave, FiSettings, FiClock, FiAlertTriangle, FiPhone, FiMail } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

const StoreSettings = () => {
    // Get contexts for data, actions, and permissions
    const { settings, updateSettings, loading } = useSettings();
    const { can, loading: authLoading } = useAuth();
    
    const [localSettings, setLocalSettings] = useState(null);

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handleSettingChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };
    
    // The updateSettings function in the context is already permission-aware
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (localSettings) {
            await updateSettings(localSettings);
        }
    };
    
    // --- Page Guards ---
    if (authLoading || loading || !localSettings) {
        return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-red-500 text-3xl" /></div>;
    }

    if (!can('setting_manage')) {
        return <AccessDenied permission="setting_manage" />;
    }

    return (
        <PageTransition>
            <div className="space-y-6">
                <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center"><FiSettings className="mr-2" /> Store Settings</h1>
                    <div className="space-y-6">
                        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
                            <label className="flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <FiAlertTriangle className="text-yellow-600" />
                                    <div>
                                        <span className="font-bold text-gray-800">Maintenance Mode</span>
                                        <p className="text-xs text-gray-500">Temporarily take the storefront offline.</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <input type="checkbox" className="sr-only"
                                        checked={localSettings.maintenanceMode}
                                        onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                                    />
                                    <div className={`block w-14 h-8 rounded-full transition-colors ${localSettings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.maintenanceMode ? 'transform translate-x-full' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><FiClock /> "New Product" Duration (in Days)</label>
                            <p className="text-xs text-gray-500 mb-2">Products added within this period will appear in "New Collections".</p>
                            <input id="duration" type="number"
                                value={localSettings.newnessDurationDays}
                                onChange={(e) => handleSettingChange('newnessDurationDays', parseInt(e.target.value, 10) || 1)}
                                min="1"
                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                        <div className="border-t pt-6 space-y-4">
                             <h2 className="text-md font-semibold text-gray-700">Store Contact Information</h2>
                            <div>
                                <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><FiPhone /> Store Phone Number</label>
                                <input id="storePhone" type="text"
                                    value={localSettings.storePhone}
                                    onChange={(e) => handleSettingChange('storePhone', e.target.value)}
                                    className="w-full max-w-md p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label htmlFor="storeEmail" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><FiMail /> Store Email Address</label>
                                <input id="storeEmail" type="email"
                                    value={localSettings.storeEmail}
                                    onChange={(e) => handleSettingChange('storeEmail', e.target.value)}
                                    className="w-full max-w-md p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-8 mt-6 border-t">
                         {/* --- NEW: Conditionally disable the 'Save' button --- */}
                         <button 
                            type="submit" 
                            disabled={!can('setting_edit')}
                            className="flex items-center justify-center px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 shadow-sm disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                            <FiSave className="mr-2"/>Save All Settings
                        </button>
                    </div>
                </form>
            </div>
        </PageTransition>
    );
};
export default StoreSettings;