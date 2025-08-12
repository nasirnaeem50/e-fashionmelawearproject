// frontend/src/dashboard/components/ImageUploaderWithLibrary.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FiUploadCloud, FiImage, FiX, FiLoader } from 'react-icons/fi';

// ✅ DEFINITIVE FIX: The filename in the import statement is corrected.
// It should be 'MediaSelectionModal', not 'MediaLibraryModal'.
import MediaSelectionModal from './MediaSelectionModal';

import { toast } from 'react-toastify';

const ImageUploaderWithLibrary = ({ onImageChange, currentImageUrl, isUploading, setIsUploading }) => {
    const [imagePreview, setImagePreview] = useState(currentImageUrl);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    // This effect ensures the preview updates if the parent component clears the image URL
    useEffect(() => {
        setImagePreview(currentImageUrl);
    }, [currentImageUrl]);

    const handleImageUploadAPI = async (file) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            toast.error("Cloudinary environment variables are not configured!");
            return null;
        }
        if (!file) return null;
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image is too large! Max 5MB.");
            return null;
        }

        setIsUploading(true);
        const toastId = toast.loading("Uploading image...");
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || 'Upload failed.');
            }
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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            const imageUrl = await handleImageUploadAPI(file);
            if (imageUrl) {
                onImageChange(imageUrl);
            } else {
                setImagePreview(null);
                onImageChange('');
                if (fileInputRef.current) fileInputRef.current.value = null;
            }
        }
    };

    const handleSelectFromLibrary = (imageUrl) => {
        setImagePreview(imageUrl);
        onImageChange(imageUrl);
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        onImageChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    return (
        <>
            {isMediaModalOpen && (
                // This now correctly calls the MediaSelectionModal component
                <MediaSelectionModal 
                    onClose={() => setIsMediaModalOpen(false)}
                    onSelect={handleSelectFromLibrary} // Note: The prop is onSelect
                />
            )}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <button 
                        type="button" 
                        onClick={() => setIsMediaModalOpen(true)}
                        className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1"
                    >
                        <FiImage size={14} /> Choose from Library
                    </button>
                </div>
                {!imagePreview ? (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor={fileInputRef.current?.id || 'file-upload'} className={`relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}>
                                    <span>Upload a file</span>
                                    <input id={fileInputRef.current?.id || 'file-upload'} name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" ref={fileInputRef} disabled={isUploading}/>
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
                                <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ImageUploaderWithLibrary;