import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import { useMedia } from '../../context/MediaContext';

const MediaSelectionModal = ({ onSelect, onClose }) => {
    const { mediaItems } = useMedia();

    const handleImageSelect = (image) => {
        onSelect(image.url); // Pass the selected image URL back to the parent
        onClose(); // Close the modal
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 50 }}
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                        <h2 className="text-lg font-bold text-gray-800">Select an Image from Media Library</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full">
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="p-4 flex-grow overflow-y-auto">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {mediaItems.length > 0 ? mediaItems.map(item => (
                                <div
                                    key={item.id}
                                    className="group relative border rounded-lg overflow-hidden shadow-sm aspect-square cursor-pointer"
                                    onClick={() => handleImageSelect(item)}
                                >
                                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <FiCheckCircle className="text-white w-10 h-10" />
                                    </div>
                                    <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center p-1 truncate">
                                        {item.name}
                                    </p>
                                </div>
                            )) : (
                                <div className="col-span-full text-center py-16">
                                    <p className="text-gray-500">Your media library is empty.</p>
                                    <p className="text-sm text-gray-400">Upload images in the File Manager.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MediaSelectionModal;