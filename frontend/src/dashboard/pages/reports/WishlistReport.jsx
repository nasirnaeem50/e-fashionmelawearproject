import React, { useState, useEffect, useCallback } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { FaRegHeart } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import apiClient from '../../../api'; 
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

const WishlistReport = () => {
    // Get contexts for data and permissions
    const { can, loading: authLoading } = useAuth();
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlistReport = useCallback(async () => {
        // Guard the data fetch itself
        if (!can('report_view')) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data } = await apiClient.get('/reports/wishlist-insights');
            if (data.success) {
                setReportData(data.data);
            } else {
                toast.error(data.error || "Failed to load report data.");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Could not load report.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [can]);

    useEffect(() => {
        // Wait for auth check to complete before fetching
        if (!authLoading) {
            fetchWishlistReport();
        }
    }, [fetchWishlistReport, authLoading]);

    // --- Page Guards ---
    if (authLoading || loading) {
        return (
            <PageTransition>
                <div className="flex justify-center items-center h-64">
                    <FiLoader className="animate-spin text-red-500" size={40} />
                </div>
            </PageTransition>
        );
    }
    
    if (!can('report_view')) {
        return <AccessDenied permission="report_view" />;
    }
    
    return (
        <PageTransition>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaRegHeart /> Wishlist Insights
                </h1>
                <p className="text-gray-600 mb-6 text-sm">
                    This report shows which products are most frequently added to all customer wishlists.
                </p>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Rank</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Product</th>
                                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Times Wishlisted</th>
                                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Current Stock</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {reportData.length > 0 ? reportData.map((item, index) => {
                                if (!item || !item.product || !item.product.id) {
                                    return null; 
                                }
                                return (
                                    <tr key={item.product.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 font-bold">{index + 1}</td>
                                        <td className="py-3 px-4">
                                            <Link to={`/product/${item.product.id}`} target="_blank" className="flex items-center gap-3 hover:underline">
                                                <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-contain rounded-md bg-gray-50"/>
                                                <span className="font-medium">{item.product.name}</span>
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-center font-semibold text-lg">{item.count}</td>
                                        <td className="py-3 px-4 text-center">
                                             <span className={`px-2 py-1 text-xs rounded-full font-semibold ${item.product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {item.product.stock > 0 ? `${item.product.stock} in stock` : "Out of stock"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-500">No items have been wishlisted by any users yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
};

export default WishlistReport;