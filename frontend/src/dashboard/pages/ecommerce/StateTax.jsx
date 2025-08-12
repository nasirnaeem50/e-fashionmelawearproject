import React from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { FiFileText } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

const StateTax = () => {
    // Get the `can` function for the page guard
    const { can } = useAuth();

    // --- Page Guard ---
    // Since this is a core setting, we protect it with 'setting_manage'
    if (!can('setting_manage')) {
        return <AccessDenied permission="setting_manage" />;
    }

    return (
        <PageTransition>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FiFileText className="mr-2" /> State Tax Settings</h1>
                <p className="text-gray-600">This feature is for country-specific tax regulations (like US states or Canadian provinces) and is not applicable for this store setup. The general tax rate will be used for all orders.</p>
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                    <h3 className="font-semibold">Developer Note:</h3>
                    <p className="text-sm">To implement this, you would create a list of states/provinces and allow an admin to set a specific tax rate for each, which would override the general tax rate.</p>
                </div>
            </div>
        </PageTransition>
    );
};

export default StateTax;