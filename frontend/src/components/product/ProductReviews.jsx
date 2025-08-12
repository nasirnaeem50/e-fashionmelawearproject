import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../../api'; // <-- ADDED
import { FiLoader, FiMessageSquare } from 'react-icons/fi';
import StarRating from '../shared/StarRating';

const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!productId) return;

        const fetchReviews = async () => {
            setLoading(true);
            setError(null);
            try {
                // Use apiClient for a consistent, centralized API call.
                const { data } = await apiClient.get(`/products/${productId}/reviews`); // <-- CHANGED
                setReviews(data.data || []);
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
                setError("Could not load reviews at this time.");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <FiLoader className="animate-spin text-red-500" size={30} />
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                <FiMessageSquare size={40} className="mx-auto mb-4" />
                <h3 className="font-semibold text-lg">No Reviews Yet</h3>
                <p>Be the first to share your thoughts on this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map(review => (
                <div key={review.id} className="flex gap-4 border-b pb-6 last:border-b-0">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-lg text-gray-600">
                        {review.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-800">{review.user.name}</h4>
                            <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="my-1">
                            <StarRating rating={review.rating} />
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductReviews;