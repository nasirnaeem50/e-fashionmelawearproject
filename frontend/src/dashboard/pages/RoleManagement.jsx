// frontend/src/dashboard/pages/RoleManagement.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../../components/shared/PageTransition';
import { FiKey, FiEdit, FiSave, FiX, FiLoader, FiTrash2, FiPlus } from 'react-icons/fi';
import AccessDenied from '../../components/shared/AccessDenied';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// The modal's grouping logic is dynamic and will automatically create sections
// for "Newsletter" and "Contact" based on the new permissions from the API.
const PermissionsModal = ({ role, onClose, onSave, allPermissions }) => {
    const [selectedPermissions, setSelectedPermissions] = useState(role.permissions || []);
    
    const groupedPermissions = useMemo(() => {
        if (!allPermissions) return {};
        
        return allPermissions.reduce((acc, permission) => {
            const groupName = permission.split('_')[0]; 
            const formattedGroup = groupName.charAt(0).toUpperCase() + groupName.slice(1); 
            
            if (!acc[formattedGroup]) {
                acc[formattedGroup] = [];
            }
            acc[formattedGroup].push(permission);
            return acc;
        }, {});
    }, [allPermissions]);

    const handleCheckboxChange = (permission, isChecked) => {
        if (isChecked) {
            setSelectedPermissions([...selectedPermissions, permission]);
        } else {
            setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
        }
    };

    const handleSave = () => {
        onSave(role._id, { permissions: selectedPermissions });
        onClose();
    };

    const isCoreRole = role.name === 'admin' || role.name === 'user';

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Edit Permissions for '{role.name}'</h2>
                    <button onClick={onClose}><FiX /></button>
                </div>
                {isCoreRole ? (
                     <div className="p-6 text-center flex-grow flex items-center justify-center">
                        <p className="text-gray-600">The permissions for the core '{role.name}' role cannot be modified.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow overflow-y-auto">
                            {Object.keys(groupedPermissions).sort().map(groupName => (
                                <div key={groupName} className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                                    <h3 className="font-bold text-md text-gray-800 border-b pb-2 mb-2">{groupName}</h3>
                                    <div className="space-y-2">
                                        {groupedPermissions[groupName].map(permission => (
                                            <label key={permission} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
                                                <input type="checkbox" className="form-checkbox h-5 w-5 text-red-600 rounded focus:ring-red-500" 
                                                    checked={selectedPermissions.includes(permission)} 
                                                    onChange={(e) => handleCheckboxChange(permission, e.target.checked)} 
                                                />
                                                <span className="text-gray-700 capitalize">
                                                    {permission.replace(/_/g, ' ')}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-end">
                            <button onClick={handleSave} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700">
                                <FiSave /> Save Changes
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// The rest of the component remains unchanged as its logic is correct.
const CreateRoleModal = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await onCreate({ name, permissions: [] });
        if (success) onClose();
    };
    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center"><h2 className="text-lg font-bold">Create New Role</h2><button type="button" onClick={onClose}><FiX /></button></div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '_'))} placeholder="e.g., content_manager" className="w-full p-2 border rounded-md" required />
                         <p className="text-xs text-gray-500 mt-1">Use lowercase letters and underscores only.</p>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end"><button type="submit" className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2"><FiPlus /> Create Role</button></div>
            </form>
        </div>
    );
}

const RoleManagement = () => {
    const { can, loading: authLoading } = useAuth();
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRole, setEditingRole] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const fetchData = useCallback(async () => {
        if (!can('user_manage')) { setLoading(false); return; }
        try {
            const [rolesRes, permissionsRes] = await Promise.all([ apiClient.get('/roles'), apiClient.get('/roles/permissions') ]);
            setRoles(rolesRes.data.data || []);
            setAllPermissions(permissionsRes.data.data || []);
        } catch (err) {
            if(err.response?.status !== 401) toast.error("Could not fetch data from the server.");
            console.error(err);
        } finally { setLoading(false); }
    }, [can]);
    useEffect(() => { if (!authLoading) { fetchData(); } }, [authLoading, fetchData]);
    const handleCreateRole = async (roleData) => {
        try {
            await apiClient.post('/roles', roleData);
            toast.success(`Role '${roleData.name}' created successfully!`);
            await fetchData();
            return true;
        } catch (err) {
            if (err.response?.status !== 401) { toast.error(err.response?.data?.error || "Failed to create role."); }
            return false;
        }
    };
    const handleSavePermissions = async (roleId, data) => {
        try {
            await apiClient.put(`/roles/${roleId}`, data);
            toast.success("Role updated successfully!");
            await fetchData();
        } catch (err) {
            if(err.response?.status !== 401) toast.error(err.response?.data?.error || "Failed to update role.");
        }
    };
    const handleDeleteRole = async (role) => {
        if (role.name === 'admin' || role.name === 'user') {
            toast.error(`The core '${role.name}' role cannot be deleted.`); return;
        }
        const { isConfirmed } = await Swal.fire({ title: `Delete '${role.name}' role?`, text: "This action cannot be undone. Ensure no users are assigned this role.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
        if (isConfirmed) {
            try {
                await apiClient.delete(`/roles/${role._id}`);
                toast.warn(`Role '${role.name}' has been deleted.`);
                await fetchData();
            } catch (err) {
                if (err.response?.status !== 401) { toast.error(err.response?.data?.error || "Failed to delete role."); }
            }
        }
    };
    if (authLoading || loading) { return <PageTransition><div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-red-500 text-4xl" /></div></PageTransition>; }
    if (!can('user_manage')) { return <AccessDenied permission="user_manage" />; }
    return (
        <PageTransition>
            {editingRole && <PermissionsModal role={editingRole} onClose={() => setEditingRole(null)} onSave={handleSavePermissions} allPermissions={allPermissions} />}
            {isCreateModalOpen && <CreateRoleModal onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateRole} />}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center"><FiKey className="mr-2" /> Role Management</h1>
                    <button onClick={() => setIsCreateModalOpen(true)} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition-colors"><FiPlus /> Create New Role</button>
                </div>
                <div className="space-y-2">
                    {roles.length > 0 ? roles.map(role => (
                        <div key={role._id} className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-50">
                            <div>
                                <p className="font-bold capitalize">{role.name}</p>
                                <p className="text-xs text-gray-500">{(role.permissions || []).length} permissions granted</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setEditingRole(role)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"><FiEdit /> Edit Permissions</button>
                                <button onClick={() => handleDeleteRole(role)} className="p-2 text-red-600 rounded-md hover:bg-red-100 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed" title={`Delete '${role.name}' role`} disabled={role.name === 'admin' || role.name === 'user'}><FiTrash2 size={18} /></button>
                            </div>
                        </div>
                    )) : ( <p className="text-center text-gray-500 py-4">No roles found.</p> )}
                </div>
            </div>
        </PageTransition>
    );
};

export default RoleManagement;