import React, { useState, useEffect } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { FiCreditCard, FiSave } from 'react-icons/fi';
import { FaMoneyBillWave, FaUniversity, FaSpinner } from 'react-icons/fa';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

const gatewayIcons = {
    cod: <FaMoneyBillWave className="h-6 w-6 mr-4 text-green-600"/>,
    bank: <FaUniversity className="h-6 w-6 mr-4 text-blue-700"/>,
    easypaisa: <img src="/images/easy.webp" alt="Easypaisa" className="h-6 mr-4"/>,
    stripe: <FiCreditCard className="h-6 w-6 mr-4 text-gray-400"/>,
};
const gatewayNames = { cod: 'Cash on Delivery', bank: 'Bank Transfer', easypaisa: 'Easypaisa', stripe: 'Credit Card (Stripe)' };

const Payment = () => {
    // Get contexts for data, actions, and permissions
    const { settings, updateSettings, loading } = useSettings();
    const { can, loading: authLoading } = useAuth();
    
    const [localGateways, setLocalGateways] = useState(null);

    useEffect(() => {
        if (settings && settings.paymentGateways) {
            setLocalGateways(settings.paymentGateways);
        }
    }, [settings]);

    const handleToggle = (key) => {
        setLocalGateways(prev => ({
            ...prev,
            [key]: { ...prev[key], enabled: !prev[key].enabled }
        }));
    };
    
    // The updateSettings function in the context is already permission-aware
    const handleSave = async () => {
        await updateSettings({ ...settings, paymentGateways: localGateways });
    };
    
    // --- Page Guards ---
    if (authLoading || loading || !localGateways) {
        return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-red-500 text-3xl" /></div>;
    }

    if (!can('setting_manage')) {
        return <AccessDenied permission="setting_manage" />;
    }

    return (
        <PageTransition>
            <div className="bg-white p-6 rounded-lg shadow-sm max-w-3xl mx-auto">
                <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FiCreditCard className="mr-2" /> Payment Gateway Settings</h1>
                <p className="text-gray-600 mb-6">Enable or disable the payment methods available to customers at checkout.</p>
                <div className="space-y-4">
                    {Object.keys(localGateways).map((key) => (
                         <div key={key} className="flex justify-between items-center p-4 border rounded-lg">
                            <div className="flex items-center">
                                {gatewayIcons[key]}
                                <span className="font-medium">{gatewayNames[key]}</span>
                            </div>
                            <label htmlFor={`toggle-${key}`} className={`flex items-center ${can('setting_edit') ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        id={`toggle-${key}`} 
                                        className="sr-only" 
                                        checked={localGateways[key].enabled} 
                                        onChange={() => handleToggle(key)} 
                                        // --- NEW: Conditionally disable the toggle ---
                                        disabled={!can('setting_edit')}
                                    />
                                    <div className={`block w-14 h-8 rounded-full transition-colors ${localGateways[key].enabled ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localGateways[key].enabled ? 'transform translate-x-full' : ''}`}></div>
                                </div>
                            </label>
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
export default Payment;