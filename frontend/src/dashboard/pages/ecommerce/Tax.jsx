import React, { useState, useEffect } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../context/AuthContext';
import { FiFileText, FiSave } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import AccessDenied from '../../../components/shared/AccessDenied';

const Tax = () => {
    // Get contexts for data, actions, and permissions
    // --- FIX: Renamed 'loading' from useSettings to 'settingsLoading' to avoid conflict ---
    const { settings, updateSettings, loading: settingsLoading } = useSettings();
    const { can, loading: authLoading } = useAuth();
    
    const [localTaxRate, setLocalTaxRate] = useState(0);

    useEffect(() => {
        if (settings) {
            setLocalTaxRate(settings.taxRate || 0);
        }
    }, [settings]);

    const handleSave = async () => {
        await updateSettings({ ...settings, taxRate: localTaxRate });
    };

    // --- Page Guards ---
    if (authLoading || settingsLoading) {
        return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-red-500 text-3xl" /></div>;
    }
    
    if (!can('setting_manage')) {
        return <AccessDenied permission="setting_manage" />;
    }

    return (
        <PageTransition>
            <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FiFileText className="mr-2" /> General Tax Settings</h1>
                <p className="text-gray-600 mb-6">Set a general sales tax rate (like GST) that will apply to all orders in Pakistan.</p>
                
                <div>
                    <label htmlFor="tax-rate" className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                    <input id="tax-rate" type="number"
                        value={localTaxRate}
                        onChange={(e) => setLocalTaxRate(parseFloat(e.target.value) || 0)}
                        disabled={!can('setting_edit')}
                        className="p-2 border rounded-md w-full md:w-1/2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                </div>
                
                <div className="mt-8 border-t pt-6 flex justify-end">
                    <button 
                        onClick={handleSave} 
                        disabled={!can('setting_edit')}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        <FiSave className="mr-2" /> Save Settings
                    </button>
                </div>
            </div>
        </PageTransition>
    );
};
export default Tax;