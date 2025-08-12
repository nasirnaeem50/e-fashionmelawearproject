import React, { useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import PageTransition from '../../../components/shared/PageTransition';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiArrowLeft, FiChevronRight, FiImage, FiLoader } from 'react-icons/fi';
import MediaSelectionModal from '../../components/MediaSelectionModal';
import ImageUploaderWithLibrary from '../../components/ImageUploaderWithLibrary';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const SubCategoriesTableSkeleton = () => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white"><thead className="bg-gray-100"><tr><th className="py-3 px-4 text-left uppercase font-semibold text-sm">Image</th><th className="py-3 px-4 text-left uppercase font-semibold text-sm">Name</th><th className="py-3 px-4 text-left uppercase font-semibold text-sm">Child Categories</th><th className="py-3 px-4 text-center uppercase font-semibold text-sm">Actions</th></tr></thead><tbody className="text-gray-700">{[...Array(3)].map((_, i) => (<tr key={i} className="border-b border-gray-200"><td className="py-2 px-4"><div className="h-12 w-12 bg-gray-200 rounded-md animate-pulse"></div></td><td className="py-2 px-4"><div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div></td><td className="py-2 px-4"><div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div></td><td className="py-2 px-4"><div className="flex items-center justify-center space-x-2"><div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div><div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div></div></td></tr>))}</tbody></table>
    </div>
);


const SubCategories = () => {
    const query = useQuery();
    const parent = query.get('parent');
    
    // Get contexts for data, actions, and permissions
    const { categories, addSubCategory, deleteSubCategory, loading: shopLoading } = useShop();
    const { can, loading: authLoading } = useAuth();
    
    const [newSubCategory, setNewSubCategory] = useState({ name: '', image: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    const subCategories = useMemo(() => {
        return parent && categories[parent] ? categories[parent] : [];
    }, [parent, categories]);
    
    // The addSubCategory function in the context is already permission-aware
    const handleAddSub = async (e) => {
        e.preventDefault();
        if (!newSubCategory.name || !newSubCategory.image) { return toast.error("Please provide both a name and an image."); }
        if (isUploading || isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (parent) {
                const success = await addSubCategory(parent, newSubCategory);
                if (success) { setNewSubCategory({ name: '', image: '' }); }
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleImageChange = (imageUrl) => {
        setNewSubCategory(prev => ({ ...prev, image: imageUrl }));
    };
    
    // --- Page Guards ---
    if (authLoading || shopLoading) {
        return <PageTransition><div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500"/></div></PageTransition>;
    }

    if (!parent) {
        return ( <PageTransition><div className="bg-white p-6 rounded-lg shadow-sm text-center"><p className="text-gray-600">Please select a parent category to manage its sub-categories.</p><Link to="/admin/categories" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline"><FiArrowLeft/> Go back to Parent Categories</Link></div></PageTransition> );
    }

    // This is a management page, so we require the broad 'category_manage' permission to view it.
    if (!can('category_manage')) {
        return <AccessDenied permission="category_manage" />;
    }

    return (
        <>
            {isMediaModalOpen && ( <MediaSelectionModal onClose={() => setIsMediaModalOpen(false)} onSelect={handleImageChange} /> )}
            <PageTransition>
                <Link to="/admin/categories" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4"><FiArrowLeft/> Back to Parent Categories</Link>
                <div className="space-y-6">
                    {/* --- NEW: Conditionally render the 'Add Sub-Category' form --- */}
                    {can('category_create') && (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h1 className="text-xl font-bold text-gray-800 mb-4">Add Sub-Category to <span className="text-red-600">{parent}</span></h1>
                            <form onSubmit={handleAddSub} className="grid md:grid-cols-2 gap-x-6 gap-y-4 items-start">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input type="text" value={newSubCategory.name} onChange={(e) => setNewSubCategory(p => ({ ...p, name: e.target.value }))} placeholder="Sub-category name" className="w-full p-2 border border-gray-300 rounded-md" required disabled={isUploading}/>
                                </div>
                                <ImageUploaderWithLibrary onImageChange={handleImageChange} currentImageUrl={newSubCategory.image} isUploading={isUploading} setIsUploading={setIsUploading}/>
                                <div className="md:col-span-2 pt-2">
                                    <button type="submit" className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed" disabled={isUploading || isSubmitting}>
                                        {isUploading ? <><FiLoader className="animate-spin" /> Uploading...</> : isSubmitting ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiPlus /><span>Add Sub-Category</span></>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="font-bold text-lg mb-4">Existing Sub-Categories in <span className="text-red-600">{parent}</span></h2>
                        {shopLoading ? (<SubCategoriesTableSkeleton />) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-3 px-4 text-left uppercase font-semibold text-sm">Image</th>
                                            <th className="py-3 px-4 text-left uppercase font-semibold text-sm">Name</th>
                                            <th className="py-3 px-4 text-left uppercase font-semibold text-sm">Child Categories</th>
                                            <th className="py-3 px-4 text-center uppercase font-semibold text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700">
                                        {subCategories.length > 0 ? subCategories.map((sc) => (
                                            <tr key={sc.id} className="border-b hover:bg-gray-50">
                                                <td className="py-2 px-4">
                                                    <img src={sc.image} alt={sc.name} className="h-12 w-12 object-cover rounded-md" onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.jpg'}}/>
                                                </td>
                                                <td className="py-2 px-4 font-medium">{sc.name}</td>
                                                <td className="py-2 px-4">
                                                    <Link to={`/admin/categories/child?parent=${encodeURIComponent(parent)}&subId=${sc.id}&subName=${encodeURIComponent(sc.name)}`} className="flex items-center text-blue-600 hover:underline">
                                                        {sc.children?.length || 0} (Manage <FiChevronRight className="inline ml-1"/>)
                                                    </Link>
                                                </td>
                                                <td className="py-2 px-4">
                                                    <div className="flex justify-center space-x-2">
                                                        <button disabled className="p-2 bg-gray-300 text-white rounded-md cursor-not-allowed" title="Edit (Coming Soon)"><FiEdit size={16} /></button>
                                                        {/* --- NEW: Conditionally render the Delete button --- */}
                                                        {can('category_delete') && (
                                                            <button onClick={() => deleteSubCategory(sc.id, parent)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600" title="Delete"><FiTrash2 size={16} /></button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="text-center py-6 text-gray-500">No sub-categories found for '{parent}'.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </PageTransition>
        </>
    );
};

export default SubCategories;