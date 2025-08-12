import React, { useState } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { FiTag, FiEdit, FiTrash2, FiPlus, FiChevronRight, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

const CategoriesTableSkeleton = () => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
                <tr>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th>
                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Sub-Categories</th>
                    <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                </tr>
            </thead>
            <tbody className="text-gray-700">
                {[...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-200">
                        <td className="py-2 px-4"><div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div></td>
                        <td className="py-2 px-4"><div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div></td>
                        <td className="py-2 px-4">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const Categories = () => {
    // Get contexts for data, actions, and permissions
    const { categories, addParentCategory, deleteParentCategory, loading: shopLoading } = useShop();
    const { can, loading: authLoading } = useAuth();
  
    const [newParentCategory, setNewParentCategory] = useState('');

    // The addParentCategory function in the context is already permission-aware
    const handleAddParent = (e) => {
        e.preventDefault();
        if (newParentCategory.trim()) {
            addParentCategory(newParentCategory.trim());
            setNewParentCategory('');
        }
    };

    // --- Page Guards ---
    if (authLoading || shopLoading) {
        return (
            <PageTransition>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800 mb-4 h-7 w-1/2 bg-gray-200 rounded-md animate-pulse"></h1>
                    <CategoriesTableSkeleton />
                </div>
            </PageTransition>
        );
    }
    
    // This is a management page, so we require the broad 'category_manage' permission to view it.
    if (!can('category_manage')) {
        return <AccessDenied permission="category_manage" />;
    }

    return (
        <PageTransition>
            <div className="space-y-6">
                {/* --- NEW: Conditionally render the 'Add Parent' form --- */}
                {can('category_create') && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FiTag className="mr-2" /> Manage Parent Categories
                        </h1>
                        <form onSubmit={handleAddParent} className="flex gap-4 mb-6">
                            <input
                                type="text"
                                value={newParentCategory}
                                onChange={(e) => setNewParentCategory(e.target.value)}
                                placeholder="e.g., Kids, Accessories"
                                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                            />
                            <button type="submit" className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md flex items-center gap-2 hover:bg-red-700 transition-colors">
                                <FiPlus /> Add Parent
                            </button>
                        </form>
                        <p className="text-xs text-gray-500 -mt-4">
                            A parent category is permanently saved to the database once you add its first sub-category.
                        </p>
                    </div>
                )}

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="font-bold text-lg mb-4">Existing Parent Categories</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th>
                                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Sub-Categories</th>
                                    <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {Object.keys(categories).map((parentName) => (
                                    <tr key={parentName} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-2 px-4 font-medium">{parentName}</td>
                                        <td className="py-2 px-4">
                                            <Link 
                                                to={`/admin/categories/sub?parent=${encodeURIComponent(parentName)}`}
                                                className="flex items-center text-blue-600 hover:underline"
                                            >
                                                {categories[parentName].length} (Manage <FiChevronRight className="inline ml-1"/>)
                                            </Link>
                                        </td>
                                        <td className="py-2 px-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button disabled className="p-2 bg-gray-300 text-white rounded-md cursor-not-allowed" title="Parent categories cannot be edited directly."><FiEdit size={16} /></button>
                                                {/* --- NEW: Conditionally render the Delete button --- */}
                                                {can('category_delete') && (
                                                    <button onClick={() => deleteParentCategory(parentName)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600" title="Delete"><FiTrash2 size={16} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {Object.keys(categories).length === 0 && !shopLoading && (
                                    <tr><td colSpan="3" className="text-center py-6 text-gray-500">No parent categories found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Categories;