import React, { useState, useRef } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiStar, FiUploadCloud, FiX, FiLoader, FiImage } from 'react-icons/fi';
import MediaSelectionModal from '../../components/MediaSelectionModal';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

const BrandsList = () => {
    // Get contexts for data, actions, and permissions
    const { brands, addBrand, deleteBrand, loading } = useShop();
    const { can, loading: authLoading } = useAuth();

    const [newBrand, setNewBrand] = useState({ name: '', logo: '' });
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (file) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        if (!cloudName || !uploadPreset) { toast.error("Cloudinary environment variables are not configured!"); return null; }
        if (!file) return null;
        setIsUploading(true);
        const toastId = toast.loading("Uploading image...");
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error.message || 'Upload failed.'); }
            const data = await response.json();
            toast.update(toastId, { render: "Image uploaded!", type: "success", isLoading: false, autoClose: 2000 });
            return data.secure_url;
        } catch (error) {
            toast.update(toastId, { render: `Upload Failed: ${error.message}`, type: "error", isLoading: false, autoClose: 4000 });
            return null;
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleImageFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            const imageUrl = await handleImageUpload(file);
            if (imageUrl) {
                setNewBrand(prev => ({ ...prev, logo: imageUrl }));
            }
        }
    };

    const handleSelectFromLibrary = (imageUrl) => {
        setNewBrand(prev => ({ ...prev, logo: imageUrl }));
        setImagePreview(imageUrl);
    };
    
    const handleRemoveImage = () => {
        setImagePreview(null);
        setNewBrand(prev => ({ ...prev, logo: '' }));
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    // The addBrand function in the context is already permission-aware
    const handleAddBrand = async (e) => {
        e.preventDefault();
        if (!newBrand.name || !newBrand.logo) { return toast.error("Please provide both a brand name and a logo."); }
        if (isUploading || isSubmitting) return;
        setIsSubmitting(true);
        const success = await addBrand(newBrand);
        if (success) {
            setNewBrand({ name: '', logo: '' });
            handleRemoveImage();
        }
        setIsSubmitting(false);
    };
    
    // --- Page Guards ---
    if (authLoading || loading) {
        return <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500" /></div>;
    }

    // A user needs `brand_manage` to see this page because it combines create/delete actions.
    if (!can('brand_manage')) {
        return <AccessDenied permission="brand_manage" />;
    }

    return (
        <>
            {isMediaModalOpen && (
                <MediaSelectionModal
                    onClose={() => setIsMediaModalOpen(false)}
                    onSelect={handleSelectFromLibrary}
                />
            )}
            <PageTransition>
                <div className="space-y-6">
                    {/* --- NEW: Conditionally render the 'Add Brand' form --- */}
                    {can('brand_create') && (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FiStar /> Manage Brands</h1>
                            <form onSubmit={handleAddBrand} className="grid md:grid-cols-2 gap-x-6 gap-y-4 items-start">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                                    <input type="text" value={newBrand.name} onChange={(e) => setNewBrand(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Nike, Adidas" className="w-full p-2 border border-gray-300 rounded-md" required disabled={isUploading}/>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-gray-700">Brand Logo</label>
                                        <button type="button" onClick={() => setIsMediaModalOpen(true)} className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1">
                                            <FiImage size={14} /> Choose from Library
                                        </button>
                                    </div>
                                    {!imagePreview ? (
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                            <div className="space-y-1 text-center">
                                                <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label htmlFor="brand-logo-upload" className={`relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}>
                                                        <span>Upload a file</span>
                                                        <input id="brand-logo-upload" type="file" className="sr-only" onChange={handleImageFileChange} accept="image/*" ref={fileInputRef} disabled={isUploading}/>
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-center">
                                            <div className="relative group inline-block">
                                                <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto object-contain rounded-md border p-1" />
                                                {!isUploading && (
                                                    <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100">
                                                        <FiX size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <button type="submit" disabled={isUploading || isSubmitting} className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-red-700 disabled:bg-red-400">
                                        {isSubmitting ? <FiLoader className="animate-spin" /> : <FiPlus />}
                                        {isSubmitting ? 'Saving Brand...' : 'Add Brand'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="font-bold text-lg mb-4">Existing Brands</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left uppercase font-semibold text-sm">Logo</th>
                                        <th className="py-3 px-4 text-left uppercase font-semibold text-sm">Name</th>
                                        <th className="py-3 px-4 text-center uppercase font-semibold text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {brands.map(brand => (
                                        <tr key={brand._id} className="border-b hover:bg-gray-50">
                                            <td className="py-2 px-4"><img src={brand.logo} alt={brand.name} className="h-12 w-12 object-contain rounded-md bg-gray-50 p-1" /></td>
                                            <td className="py-2 px-4 font-medium">{brand.name}</td>
                                            <td className="py-2 px-4 text-center">
                                                {/* --- NEW: Conditionally render the Delete button --- */}
                                                {can('brand_delete') && (
                                                    <button onClick={() => deleteBrand(brand._id, brand.name)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600" title="Delete Brand">
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {brands.length === 0 && (
                                        <tr><td colSpan="3" className="text-center py-6 text-gray-500">No brands found. Add one above.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </PageTransition>
        </>
    );
};

export default BrandsList;