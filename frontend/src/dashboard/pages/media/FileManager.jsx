import React, { useRef, useState } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { useMedia } from '../../../context/MediaContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { FiImage, FiUpload, FiTrash2, FiCopy, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied component

const FileManager = () => {
    // Get media context functions and auth context for permission checks
    const { mediaItems, loading, addMedia, deleteMedia, fetchMedia } = useMedia();
    const { can, loading: authLoading } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setIsUploading(true);
            await addMedia(files); // The addMedia function in the context already has a permission check
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleCopyUrl = (url) => {
        navigator.clipboard.writeText(url);
        toast.success("URL copied!");
    };
    
    // --- Page Guards ---
    // Show loader while auth status is being determined
    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FiLoader className="animate-spin text-4xl text-red-500" />
            </div>
        );
    }
    
    // Once auth is checked, if user can't view media, show access denied
    if (!can('media_view')) {
        return <AccessDenied permission="media_view" />;
    }

    return (
        <PageTransition>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FiImage /> File Manager
                        </h1>
                        <button 
                            onClick={fetchMedia}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            title="Refresh media"
                        >
                            <FiRefreshCw className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                    {/* --- Conditionally render the Upload button --- */}
                    {can('media_upload') && (
                        <>
                            <button
                                onClick={handleUploadClick}
                                disabled={isUploading || loading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {isUploading ? <FiLoader className="animate-spin" /> : <FiUpload />}
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx"
                            />
                        </>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <FiLoader className="mx-auto text-4xl text-gray-400 animate-spin" />
                        <p className="mt-4">Loading media from e_fashion_mela...</p>
                    </div>
                ) : (
                    <>
                        {mediaItems.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {mediaItems.map(item => (
                                    <div key={item.id} className="group relative border rounded-lg overflow-hidden shadow-sm aspect-square">
                                        <img 
                                            src={item.url} 
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/assets/placeholder-image.png';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                                            <p className="text-xs font-bold truncate">{item.name}</p>
                                            <div className="text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleCopyUrl(item.url)} 
                                                        className="p-2 bg-white/20 rounded-full hover:bg-white/40"
                                                        title="Copy URL"
                                                    >
                                                        <FiCopy size={14} />
                                                    </button>
                                                    {/* --- Conditionally render the Delete button --- */}
                                                    {can('media_delete') && (
                                                        <button 
                                                            onClick={() => deleteMedia(item.id)} // deleteMedia in context already has a permission check
                                                            className="p-2 bg-red-500/50 rounded-full hover:bg-red-500/80"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] mt-2">
                                                    {format(new Date(item.uploadedAt), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                <FiImage className="mx-auto text-5xl text-gray-300 mb-4" />
                                <h3 className="font-semibold">No files found in e_fashion_mela</h3>
                                <p className="text-sm text-gray-500">Upload files to get started</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PageTransition>
    );
};

export default FileManager;