import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { Navigate } from 'react-router-dom'; // This was unused
import PageTransition from '../../components/shared/PageTransition';
import StatCard from '../../dashboard/components/StatCard';
import { useAuth } from '../../context/AuthContext';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../../api'; // <-- ADDED
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FiUsers, FiTrash2, FiShield, FiX, FiPlus, FiUserCheck, FiLoader } from 'react-icons/fi';
import AccessDenied from '../../components/shared/AccessDenied';

// The CreateStaffModal component remains unchanged as it correctly calls the `onCreate` prop.
const CreateStaffModal = ({ onClose, onCreate, roles }) => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: roles.find(r => r.name !== 'admin')?._id || ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.role) { toast.error("Please select a role."); return; }
        const success = await onCreate(formData); 
        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center"><h2 className="text-lg font-bold">Create New Staff Member</h2><button type="button" onClick={onClose}><FiX /></button></div>
                <div className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" name="name" onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" name="password" onChange={handleChange} className="w-full p-2 border rounded-md" required minLength="6" /></div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded-md">
                            <option value="">Select a role...</option>
                            {roles.filter(r => r.name !== 'user').map(role => (
                                <option key={role._id} value={role._id}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end"><button type="submit" className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2"><FiPlus /> Create Account</button></div>
            </form>
        </div>
    );
};


const UserManagement = () => {
    const { user: currentUser, can, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (!can('user_view')) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Use apiClient for all calls. It will send the token.
            const [usersRes, rolesRes] = await Promise.all([
                apiClient.get('/users'), // <-- CHANGED
                apiClient.get('/roles')   // <-- CHANGED
            ]);
            setUsers(usersRes.data.data.filter(u => u.role?.name !== 'user'));
            setRoles(rolesRes.data.data || []);
        } catch (err) {
            if(err.response?.status !== 401) toast.error("Failed to fetch user management data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [can]);

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading, fetchData]);

    const staffStats = useMemo(() => {
        const adminCount = users.filter(u => u.role?.name === 'admin').length;
        return { total: users.length, admins: adminCount, others: users.length - adminCount };
    }, [users]);
    
    const handleCreateUser = async (userData) => {
        if (!can('user_create')) { toast.error("Permission Denied."); return false; }
        try {
            await apiClient.post('/users', userData); // <-- CHANGED
            toast.success(`Staff member ${userData.name} created!`);
            await fetchData();
            return true;
        } catch (err) {
            if(err.response?.status !== 401) toast.error(err.response?.data?.error || "Failed to create staff member.");
            return false;
        }
    };
    
    const handleUpdateUser = async (userId, data) => {
        if (!can('user_edit')) { toast.error("Permission Denied."); return; }
        try {
            await apiClient.put(`/users/${userId}`, data); // <-- CHANGED
            toast.success("User updated successfully!");
            await fetchData();
        } catch (err) {
            if(err.response?.status !== 401) toast.error(err.response?.data?.error || "Failed to update user.");
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!can('user_delete')) { toast.error("Permission Denied."); return; }
        if (currentUser?._id === userId) { toast.error("You cannot delete your own account."); return; }
        const { isConfirmed } = await Swal.fire({
            title: `Delete ${userName}?`, text: "This action cannot be undone.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete it!'
        });
        if (isConfirmed) {
            try {
                await apiClient.delete(`/users/${userId}`); // <-- CHANGED
                toast.warn("Staff member deleted.");
                await fetchData();
            } catch (err) {
                if(err.response?.status !== 401) toast.error(err.response?.data?.error || "Failed to delete user.");
            }
        }
    };

    const handleRoleChange = (userId, newRoleId) => {
        if (currentUser?._id === userId) { toast.error("You cannot change your own role."); return; }
        handleUpdateUser(userId, { role: newRoleId });
    };

    if (authLoading || loading) {
        return <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500" /></div>;
    }
    
    if (!can('user_view')) {
        return <AccessDenied permission="user_view" />;
    }

    // The rest of your JSX component is perfect and remains unchanged.
    return (
        <PageTransition>
            {isCreateModalOpen && <CreateStaffModal onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateUser} roles={roles} />}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard icon={<FiUsers size={20} />} title="Total Staff" value={staffStats.total} color="blue" />
                <StatCard icon={<FiShield size={20} />} title="Administrators" value={staffStats.admins} color="red" />
                <StatCard icon={<FiUserCheck size={20} />} title="Other Staff Roles" value={staffStats.others} color="green" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center"><FiUsers className="mr-2" /> Staff Management</h1>
                    {can('user_create') && (
                        <button onClick={() => setIsCreateModalOpen(true)} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition-colors">
                            <FiPlus /> Create New Staff
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Role</th>
                                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {users.map((staff) => (
                                <tr key={staff._id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4">{staff.name}</td>
                                    <td className="py-3 px-4">{staff.email}</td>
                                    <td className="py-3 px-4">
                                        <select 
                                            value={staff.role?._id || ''} 
                                            onChange={(e) => handleRoleChange(staff._id, e.target.value)} 
                                            disabled={!can('user_edit') || currentUser?._id === staff._id} 
                                            className="p-2 text-sm border rounded-md appearance-none bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
                                        >
                                            {roles.filter(r => r.name !== 'user').map(role => (
                                                <option key={role._id} value={role._id}>{role.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            {can('user_delete') && (
                                                <button 
                                                    onClick={() => handleDeleteUser(staff._id, staff.name)} 
                                                    disabled={currentUser?._id === staff._id} 
                                                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed" 
                                                    title="Delete User"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
};

export default UserManagement;