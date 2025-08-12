import React, { useState, useEffect } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { FiDollarSign, FiSave, FiCheck } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

const Currency = () => {
    // Get contexts for data, actions, and permissions
    const { settings, updateSettings, loading } = useSettings();
    const { can, loading: authLoading } = useAuth();
    
    const [localCurrencies, setLocalCurrencies] = useState([]);

    useEffect(() => {
        if (settings && settings.currencies) {
            setLocalCurrencies(settings.currencies);
        }
    }, [settings]);

    const setAsPrimary = (id) => {
        setLocalCurrencies(
            localCurrencies.map(c => ({ ...c, primary: c.id === id }))
        );
    };
    
    // The updateSettings function in the context is already permission-aware
    const handleSave = async () => {
        await updateSettings({ ...settings, currencies: localCurrencies });
    };

    // --- Page Guards ---
    if (authLoading || loading) {
        return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-red-500 text-3xl" /></div>;
    }

    // Since currency is a core store setting, we use 'setting_manage' to protect it.
    if (!can('setting_manage')) {
        return <AccessDenied permission="setting_manage" />;
    }

    return (
        <PageTransition>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FiDollarSign className="mr-2" /> Currency Settings</h1>
                <p className="text-gray-600 mb-6">Manage the currencies available in your store. The primary currency is used for all pricing.</p>
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Currency</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Code</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Symbol</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Primary</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {localCurrencies.map(c => (
                                <tr key={c.id} className="border-b">
                                    <td className="py-3 px-4 font-medium">{c.name}</td>
                                    <td className="py-3 px-4">{c.code}</td>
                                    <td className="py-3 px-4">{c.symbol}</td>
                                    <td className="py-3 px-4">
                                        {c.primary && <FiCheck className="text-green-500" size={20} />}
                                    </td>
                                    <td className="py-3 px-4">
                                        {!c.primary && (
                                            <button 
                                                onClick={() => setAsPrimary(c.id)} 
                                                // --- NEW: Conditionally disable the action button ---
                                                disabled={!can('setting_edit')}
                                                className="text-blue-600 hover:underline text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
                                            >
                                                Set as Primary
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="mt-8 border-t pt-6 flex justify-end">
                    <button 
                        onClick={handleSave} 
                        // --- NEW: Conditionally disable the 'Save' button ---
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
export default Currency;