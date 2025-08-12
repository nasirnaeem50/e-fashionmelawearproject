import React, { useState, useEffect } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { FiTruck, FiSave } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

const Shipping = () => {
    // Get contexts for data, actions, and permissions
    const { settings, updateSettings, loading } = useSettings();
    const { can, loading: authLoading } = useAuth();
    
    const [localZones, setLocalZones] = useState([]);

    useEffect(() => {
        if (settings && settings.shippingZones) {
            setLocalZones(settings.shippingZones);
        }
    }, [settings]);

    const handleRateChange = (id, newRate) => {
        setLocalZones(zones => zones.map(zone => zone.id === id ? { ...zone, rate: parseInt(newRate, 10) || 0 } : zone));
    };

    const handleToggle = (id) => {
        setLocalZones(zones => zones.map(zone => zone.id === id ? { ...zone, enabled: !zone.enabled } : zone));
    };
    
    // The updateSettings function in the context is already permission-aware
    const handleSave = async () => {
        await updateSettings({ ...settings, shippingZones: localZones });
    };

    // --- Page Guards ---
    if (authLoading || loading) {
        return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-red-500 text-3xl" /></div>;
    }

    // Since shipping is a core store setting, we use 'setting_manage' to protect it.
    if (!can('setting_manage')) {
        return <AccessDenied permission="setting_manage" />;
    }

    return (
        <PageTransition>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FiTruck className="mr-2" /> Shipping Configuration</h1>
                <p className="text-gray-600 mb-6">Manage shipping zones and the rates for each region.</p>
                <div className="space-y-4">
                    {localZones.map(zone => (
                        <div key={zone.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border rounded-lg">
                            <div className="font-medium">{zone.name}</div>
                            <div className="flex items-center">
                                <span className="text-gray-500 mr-2">Rs</span>
                                <input type="number" value={zone.rate}
                                    onChange={(e) => handleRateChange(zone.id, e.target.value)}
                                    // --- NEW: Conditionally disable input fields ---
                                    disabled={!can('setting_edit')}
                                    className="w-full md:w-32 p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                />
                            </div>
                            <div className="flex items-center justify-start md:justify-end">
                                <label htmlFor={`toggle-${zone.id}`} className={`flex items-center ${can('setting_edit') ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                    <div className="relative">
                                        <input type="checkbox" id={`toggle-${zone.id}`} className="sr-only" 
                                            checked={zone.enabled} 
                                            onChange={() => handleToggle(zone.id)}
                                            // --- NEW: Conditionally disable toggle ---
                                            disabled={!can('setting_edit')}
                                        />
                                        <div className={`block w-14 h-8 rounded-full transition-colors ${zone.enabled ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${zone.enabled ? 'transform translate-x-full' : ''}`}></div>
                                    </div>
                                    <div className="ml-3 text-gray-700 text-sm font-medium">{zone.enabled ? 'Enabled' : 'Disabled'}</div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 border-t pt-6 flex justify-end">
                    {/* --- NEW: Conditionally disable the 'Save' button --- */}
                    <button 
                        onClick={handleSave} 
                        disabled={!can('setting_edit')}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        <FiSave className="mr-2" /> Save Changes
                    </button>
                </div>
            </div>
        </PageTransition>
    );
};
export default Shipping;