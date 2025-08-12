import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiLock, FiLoader } from 'react-icons/fi';

const UpdatePasswordForm = () => {
    const { updatePasswordContext } = useAuth();
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }
        if (passwords.newPassword.length < 6) {
             toast.error('Password must be at least 6 characters long.');
            return;
        }
        setLoading(true);
        try {
            await updatePasswordContext(passwords.currentPassword, passwords.newPassword);
            toast.success('Password changed successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear form
        } catch (error) {
            toast.error(error.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" id="currentPassword" name="currentPassword" value={passwords.currentPassword} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500" required />
            </div>
            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" id="newPassword" name="newPassword" value={passwords.newPassword} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500" required />
            </div>
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={passwords.confirmPassword} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500" required />
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={loading}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400">
                    {loading ? <FiLoader className="animate-spin mr-2" /> : <FiLock className="mr-2" />}
                    {loading ? 'Changing...' : 'Change Password'}
                </button>
            </div>
        </form>
    );
};

export default UpdatePasswordForm;