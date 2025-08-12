import React, { useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import PageTransition from '../../../components/shared/PageTransition';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiArrowLeft, FiTag, FiPlusCircle, FiLoader } from 'react-icons/fi';
import MediaSelectionModal from '../../components/MediaSelectionModal';
import ImageUploaderWithLibrary from '../../components/ImageUploaderWithLibrary';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ChildCategoriesTableSkeleton = () => (
     <div className="overflow-x-auto"><table className="min-w-full bg-white"><thead className="bg-gray-100"><tr><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Image</th><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th><th className="text-center py-3 px-4 uppercase font-semibold text-sm">Actions</th></tr></thead><tbody className="text-gray-700">{[...Array(2)].map((_, i) => (<tr key={i} className="border-b border-gray-200"><td className="py-2 px-4"><div className="h-12 w-12 bg-gray-200 rounded-md animate-pulse"></div></td><td className="py-2 px-4"><div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div></td><td className="py-2 px-4"><div className="flex items-center justify-center space-x-2"><div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div><div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div></div></td></tr>))}</tbody></table></div>
);


const ChildCategories = () => {
    const query = useQuery();
    const parent = query.get('parent');
    const subId = query.get('subId');
    const subName = query.get('subName');
    
    // Get contexts for data, actions, and permissions
    const { categories, addChildCategory, deleteChildCategory, loading: shopLoading } = useShop();
    const { can, loading: authLoading } = useAuth();
    
    const [newChildData, setNewChildData] = useState({ name: '', image: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    const childCategories = useMemo(() => {
        if (!parent || !subId || !categories[parent]) return [];
        const subCategory = categories[parent].find(sc => sc.id === subId);
        return subCategory?.children || [];
    }, [parent, subId, categories]);

    // The addChildCategory function in the context is already permission-aware
    const handleAddChild = async (e) => {
        e.preventDefault();
        if (!newChildData.name || !newChildData.image) { return toast.error("Please provide both a name and an image."); }
        if (isUploading || isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (parent && subId) {
                await addChildCategory(subId, parent, newChildData);
                setNewChildData({ name: '', image: '' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // The deleteChildCategory function in the context is already permission-aware
    const handleDeleteChild = (childName) => {
        if (parent && subId) {
            deleteChildCategory(subId, parent, childName);
        }
    };
    
    const handleImageChange = (imageUrl) => {
        setNewChildData(prev => ({ ...prev, image: imageUrl }));
    };
    
    // --- Page Guards ---
    if (authLoading || shopLoading) {
        return <PageTransition><div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500"/></div></PageTransition>;
    }

    if (!parent || !subId || !subName) {
        return ( <PageTransition><div className="bg-white p-6 rounded-lg shadow-sm text-center"><p className="text-gray-600">Invalid link. A parent and sub-category must be selected.</p><Link to="/admin/categories" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline"><FiArrowLeft/> Go back to Parent Categories</Link></div></PageTransition> );
    }

    // Since editing child categories is a form of editing, we use 'category_edit'.
    if (!can('category_edit')) {
        return <AccessDenied permission="category_edit" />;
    }

    return (
        <>
            {isMediaModalOpen && ( <MediaSelectionModal onClose={() => setIsMediaModalOpen(false)} onSelect={handleImageChange} /> )}
            <PageTransition>
                <Link to={`/admin/categories/sub?parent=${encodeURIComponent(parent)}`} className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4 font-medium"><FiArrowLeft/> Back to '{parent}' Sub-Categories</Link>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h1 className="text-xl font-bold text-gray-800 mb-4">Add Child Category to <span className="text-red-600">{subName}</span></h1>
                        <form onSubmit={handleAddChild} className="grid md:grid-cols-2 gap-x-6 gap-y-4 items-start">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Child Category Name</label>
                                <input type="text" value={newChildData.name} onChange={(e) => setNewChildData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Formal, Casual" className="w-full p-2 border border-gray-300 rounded-md" required disabled={isUploading}/>
                            </div>
                            <ImageUploaderWithLibrary onImageChange={handleImageChange} currentImageUrl={newChildData.image} isUploading={isUploading} setIsUploading={setIsUploading}/>
                            <div className="md:col-span-2 pt-2">
                                <button type="submit" disabled={isUploading || isSubmitting} className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed">
                                    {isUploading ? <><FiLoader className="animate-spin" /> Uploading...</> : isSubmitting ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiPlus /> Add Child Category</>}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="font-bold text-lg mb-4">Existing Child Categories in <span className="text-red-600">{subName}</span></h2>
                        {shopLoading ? (<ChildCategoriesTableSkeleton />) : childCategories.length > 0 ? (<div className="overflow-x-auto"><table className="min-w-full bg-white"><thead className="bg-gray-100"><tr><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Image</th><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th><th className="text-center py-3 px-4 uppercase font-semibold text-sm">Actions</th></tr></thead><tbody className="text-gray-700">{childCategories.map((child) => (<tr key={child.name} className="border-b border-gray-200 hover:bg-gray-50"><td className="py-2 px-4"><img src={child.image} alt={child.name} className="h-12 w-12 object-cover rounded-md" onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.jpg'}}/></td><td className="py-2 px-4 font-medium">{child.name}</td><td className="py-2 px-4"><div className="flex items-center justify-center space-x-2">
                            {/* --- Conditionally render 'Add Product' link --- */}
                            {can('product_create') && <Link to="/admin/products/add" state={{ parent: parent, sub: subName, child: child.name }} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600" title="Add a product with this category"><FiPlusCircle size={16} /></Link>}
                            {/* --- Conditionally render 'Delete' button --- */}
                            <button onClick={() => handleDeleteChild(child.name)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600" title="Delete Child Category"><FiTrash2 size={16} /></button></div></td></tr>))}</tbody></table></div>) : (<div className="text-center py-8 bg-gray-50 rounded-lg"><FiTag className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">No child categories found</h3><p className="mt-1 text-sm text-gray-500">Get started by creating a new child category above.</p></div>)}
                    </div>
                </div>
            </PageTransition>
        </>
    );
};

export default ChildCategories;