import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiStar, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../../api'; // <-- ADDED
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';

// This modal is now designed to handle one product at a time.
const ProductReviewModal = ({ product, orderId, onClose }) => {
    const { user } = useAuth();
    const { refetchProducts } = useShop();
    
    // State is simplified for a single review
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a star rating.");
            return;
        }
        setIsSubmitting(true);
        
        const reviewData = {
            rating,
            comment,
            user: user.id,
            product: product.product,
        };

        try {
            // Use apiClient for a secure, token-aware post request.
            await apiClient.post('/reviews', reviewData); // <-- CHANGED
            
            toast.success("Thank you! Your review will be visible after approval.");
            
            if (refetchProducts) {
                await refetchProducts(); 
            }
            onClose();
        } catch (error) {
            // Refined error handling to work with the global 401 handler.
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Could not submit review. You may have already reviewed this product.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 50 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9, y: 50 }} 
                    className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden relative flex flex-col" 
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-lg font-bold">Leave a Review</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                        <div className="flex-grow overflow-y-auto p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <img src={product.image} alt={product.name} className="w-24 h-24 object-contain bg-gray-100 rounded-md flex-shrink-0" />
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                    <div className="flex items-center my-2">
                                        {[...Array(5)].map((_, index) => {
                                            const ratingValue = index + 1;
                                            return (
                                                <label key={ratingValue} onMouseEnter={() => setHoverRating(ratingValue)} onMouseLeave={() => setHoverRating(0)} >
                                                    <input type="radio" name={`rating-${product.product}`} value={ratingValue} onClick={() => setRating(ratingValue)} className="sr-only" />
                                                    <FiStar className="cursor-pointer transition-colors" color={ratingValue <= (hoverRating || rating) ? "#ffc107" : "#e4e5e9"} size={28} />
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <textarea 
                                        placeholder="Share your thoughts about this product..." 
                                        rows="4" 
                                        value={comment} 
                                        onChange={(e) => setComment(e.target.value)} 
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-end">
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center min-w-[140px]">
                                {isSubmitting ? <FiLoader className="animate-spin" /> : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProductReviewModal;