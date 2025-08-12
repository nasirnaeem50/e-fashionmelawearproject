import React, { useRef, useState } from 'react';
import { FiImage, FiUploadCloud, FiTrash2, FiLink } from 'react-icons/fi';
import MediaSelectionModal from '../../dashboard/components/MediaSelectionModal'; // Ensure this path is correct

const ImageUploader = ({ label, imageUrl, onImageChange, onImageRemove }) => {
    const fileInputRef = useRef(null);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            onImageChange(file); // Pass the raw File object up
        }
    };

    const handleUrlChange = (event) => {
        onImageChange(event.target.value); // Pass the URL string up
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleRemoveClick = (e) => {
        e.stopPropagation(); // Prevent any parent clicks
        if (onImageRemove) {
            onImageRemove();
        }
    };

    const handleSelectFromMediaLibrary = (url) => {
        onImageChange(url);
        setIsMediaModalOpen(false);
    };

    return (
        <>
            <div className="space-y-3">
                {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
                
                <div className="flex items-center gap-4 p-3 border-2 border-dashed border-gray-300 rounded-md">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*"
                    />
                    
                    {imageUrl ? (
                        <div className="relative group w-24 h-24 shrink-0">
                            <img 
                                src={imageUrl} 
                                alt="Preview" 
                                className="w-full h-full rounded-md object-cover" 
                                onError={(e) => { e.currentTarget.src = '/images/placeholder-brand.png'; }}
                            />
                            <div 
                                onClick={handleRemoveClick}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <FiTrash2 className="text-white h-6 w-6" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                            <FiImage className="h-10 w-10 text-gray-400" />
                        </div>
                    )}

                    <div className="flex-grow space-y-2">
                        <button
                            type="button"
                            onClick={triggerFileSelect}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-sm font-semibold text-gray-700 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50"
                        >
                            <FiUploadCloud /> {imageUrl ? 'Change File' : 'Upload File'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsMediaModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-sm font-semibold text-indigo-700 rounded-md border border-indigo-200 shadow-sm hover:bg-indigo-100"
                        >
                            <FiImage /> Select from Library
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Or paste an image URL"
                        value={(imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('blob:')) ? imageUrl : ''}
                        onChange={handleUrlChange}
                        className="w-full p-2 pl-10 border rounded-md text-sm"
                    />
                </div>
            </div>
            {isMediaModalOpen && <MediaSelectionModal onSelect={handleSelectFromMediaLibrary} onClose={() => setIsMediaModalOpen(false)} />}
        </>
    );
};

export default ImageUploader;