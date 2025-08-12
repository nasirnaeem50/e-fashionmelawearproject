import React from 'react';
import PageTransition from '../../components/shared/PageTransition';
import UpdateDetailsForm from './UpdateDetailsForm';
import UpdatePasswordForm from './UpdatePasswordForm';

const ProfileSettings = () => {
    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Update Details Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Update Your Details</h2>
                        <UpdateDetailsForm />
                    </div>

                    {/* Update Password Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Change Your Password</h2>
                        <UpdatePasswordForm />
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default ProfileSettings;