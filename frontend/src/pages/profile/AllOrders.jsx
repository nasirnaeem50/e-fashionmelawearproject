import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Import useState and useEffect
import { Link } from 'react-router-dom';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../../api'; // <-- ADDED
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FaSpinner, FaBoxOpen, FaChevronRight } from 'react-icons/fa';

const AllOrders = () => {
    const { user } = useAuth();
    // --- THIS IS THE DEFINITIVE FIX ---
    // 1. This component will now manage its own state for orders.
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. This component now fetches its OWN data directly from the /myorders endpoint.
    // It no longer depends on the OrderContext for its list of orders.
    useEffect(() => {
        const fetchMyOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                // Use apiClient for secure, token-aware calls.
                const { data } = await apiClient.get('/orders/myorders'); // <-- CHANGED
                setMyOrders(data.data || []);
            } catch (error) {
                // Refined error handling to work with our global 401 handler.
                if (error.response?.status !== 404 && error.response?.status !== 401) {
                    toast.error("Could not fetch your personal order history.");
                }
                setMyOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, [user]); // Re-fetch only if the user changes.

    // 3. The useMemo hook now uses the local `myOrders` state.
    const filteredOrders = useMemo(() => {
        if (loading || !user) return [];
        return [...myOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [myOrders, user, loading]);

    if (loading) {
        return (
            <div className="text-center py-10">
                <FaSpinner className="animate-spin text-red-500 text-4xl mx-auto" />
                <p className="mt-2 text-gray-600">Loading your orders...</p>
            </div>
        );
    }

    if (filteredOrders.length === 0) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <FaBoxOpen className="text-gray-400 text-5xl mx-auto mb-4" />
                <h3 className="font-bold text-xl text-gray-800">No Orders Found</h3>
                <p className="text-gray-500 mt-1">When you place an order, it will appear here.</p>
                <Link to="/shop" className="inline-block mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-semibold">
                    Start Shopping
                </Link>
            </div>
        );
    }

    const getStatusChip = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Shipped': return 'bg-purple-100 text-purple-800';
            case 'Processing': return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">All My Orders ({filteredOrders.length} Total)</h2>
            {filteredOrders.map(order => {
                const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
                return (
                    <Link 
                        key={order.id} 
                        to={`/profile/orders/${order.id}`} 
                        className="block bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-xl hover:ring-2 hover:ring-red-400 transition-all duration-300"
                    >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                    <p className="font-bold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</p>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChip(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Placed on: {new Date(order.date).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex sm:flex-col text-left sm:text-right">
                                <p className="text-gray-500 text-sm">Total ({totalItems} items)</p>
                                <p className="font-bold text-lg text-gray-800">Rs {order.total.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-gray-400">
                                <FaChevronRight size={20} />
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default AllOrders;