import React, { useState, useEffect, useCallback } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { FiXCircle, FiEye, FiEdit, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../api';
import { toast } from 'react-toastify';
import AccessDenied from '../../../components/shared/AccessDenied';

const StockOutProducts = () => {
    const navigate = useNavigate();
    const { can, loading: authLoading } = useAuth();

    const [stockOutProducts, setStockOutProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStockOut = useCallback(async () => {
        if (!can('product_stock_view')) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.get('/products/stock-out');
            setStockOutProducts(res.data.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                const serverError = error.response?.data?.error || "Failed to load out-of-stock products.";
                toast.error(serverError);
            }
            console.error("Error fetching stock-out products:", error);
        } finally {
            setLoading(false);
        }
    }, [can]);

    useEffect(() => {
        if (!authLoading) {
            fetchStockOut();
        }
    }, [authLoading, fetchStockOut]);
    
    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FiLoader className="animate-spin text-4xl text-red-500" />
            </div>
        );
    }
    
    if (!can('product_stock_view')) {
        return <AccessDenied permission="product_stock_view" />;
    }

    return (
        <PageTransition>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FiXCircle className="mr-2 text-red-500" /> Stock Out Products
                </h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Image</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Category</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Stock</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10">
                                        <div className="flex justify-center items-center gap-2 text-gray-500">
                                            <FiLoader className="animate-spin" size={20} />
                                            <span>Loading Products...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : stockOutProducts.length > 0 ? stockOutProducts.map((product) => (
                                // ✅✅✅ THE FIX IS HERE ✅✅✅
                                // Changed key from product._id to product.id
                                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-2 px-4"><img src={product.image} alt={product.name} className="h-12 w-12 object-cover rounded-md" /></td>
                                    <td className="py-2 px-4 font-medium">{product.name}</td>
                                    <td className="py-2 px-4">{product.category}</td>
                                    <td className="py-2 px-4"><span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-semibold">{product.stock}</span></td>
                                    <td className="py-2 px-4">
                                        <div className="flex items-center space-x-2">
                                            {/* ✅ MODIFIED: Changed product._id to product.id for consistency */}
                                            <button onClick={() => navigate(`/product/${product.id}`)} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" title="View"><FiEye size={16} /></button>
                                            {can('product_edit') && (
                                                // ✅ MODIFIED: Changed product._id to product.id for consistency
                                                <button onClick={() => navigate(`/admin/products/edit/${product.id}`)} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600" title="Edit"><FiEdit size={16} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500">No products are currently out of stock.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
};

export default StockOutProducts;