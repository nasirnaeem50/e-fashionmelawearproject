import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../api'; // <-- ADDED
import PageTransition from '../components/shared/PageTransition';
import ProductCard from '../components/shared/ProductCard';
import { FaTag } from 'react-icons/fa';
import { useCMS } from '../context/CMSContext';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // <-- REMOVED

const ProductGridSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full animate-pulse">
                <div className="aspect-[4/5] bg-gray-200 rounded-lg"></div>
                <div className="mt-2 h-4 w-3/4 bg-gray-200 rounded-md"></div>
                <div className="mt-1 h-4 w-1/2 bg-gray-200 rounded-md"></div>
            </div>
        ))}
    </div>
);

const OffersPage = () => {
    const { content, loading: cmsLoading } = useCMS();
    const [saleProducts, setSaleProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOnSaleProducts = async () => {
            setLoading(true);
            try {
                // Use apiClient for a consistent, centralized API call.
                const res = await apiClient.get('/products/on-sale'); // <-- CHANGED
                setSaleProducts(res.data.data || []);
            } catch (error) {
                console.error("Failed to fetch on-sale products:", error);
                setSaleProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOnSaleProducts();
    }, []);

    const pageTitle = content?.offersPage?.title || "Special Offers";
    const pageSubtitle = content?.offersPage?.subtitle || "All products with active discounts, just for you!";

    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-10">
                    <FaTag className="mx-auto text-5xl text-red-500 mb-4" />
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">{pageTitle}</h1>
                    <p className="mt-2 text-lg text-gray-600">{pageSubtitle}</p>
                </div>

                {loading || cmsLoading ? (
                    <ProductGridSkeleton />
                ) : saleProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {saleProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-700">No Special Offers Right Now</h3>
                        <p className="mt-2 text-gray-500">Please check back later for new deals and discounts.</p>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default OffersPage;