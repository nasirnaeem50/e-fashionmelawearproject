import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../api'; // <-- ADDED: Import the new API client
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// The API_URL constant is no longer needed here.
// const API_URL = `${import.meta.env.VITE_API_BASE_URL}/orders`;

const OrderContext = createContext();
export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const { user, loading: authLoading, can } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        if (authLoading) return;
        if (!user) {
            setOrders([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Use apiClient with relative paths. The correct token will be sent automatically.
            const url = can('order_view') ? '/orders' : '/orders/myorders'; // <-- CHANGED
            const { data } = await apiClient.get(url); // <-- CHANGED
            setOrders(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            if (error.response?.status !== 404 && error.response?.status !== 401) {
                console.error("Failed to fetch orders:", error);
                toast.error("Could not fetch order history.");
            } else {
                setOrders([]);
            }
        } finally {
            setLoading(false);
        }
    }, [user, authLoading, can]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const addOrder = async (orderData) => {
        try {
            const { data } = await apiClient.post('/orders', orderData); // <-- CHANGED
            if (data.success) {
                toast.success("Order placed successfully!");
                await fetchOrders(); 
                return data.data; 
            }
        } catch (error) {
            console.error("Order placement error in OrderContext:", error.response || error);
            if (error.response?.status !== 401) {
                const serverError = error.response?.data?.error || 'Order placement failed due to a server issue.';
                toast.error(serverError);
                throw new Error(serverError); 
            }
        }
    };

    const deleteOrder = async (orderId) => {
        if (!can('order_delete')) {
            toast.error("You do not have permission to delete orders.");
            return false;
        }
        const { isConfirmed } = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to delete this order? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        if (isConfirmed) {
            try {
                await apiClient.delete(`/orders/${orderId}`); // <-- CHANGED
                setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
                toast.warn("Order has been deleted.");
                return true; 
            } catch (error) {
                console.error("Failed to delete order:", error);
                if (error.response?.status !== 401) {
                    toast.error(error.response?.data?.error || "Could not delete the order.");
                }
                return false; 
            }
        }
        return false; 
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        if (!can('order_edit_status')) {
            toast.error("You do not have permission to update order status.");
            return;
        }
        try {
            const { data } = await apiClient.put(`/orders/${orderId}/status`, { status: newStatus }); // <-- CHANGED
            if (data.success) {
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId ? data.data : order
                    )
                );
                toast.success(`Order status updated to "${newStatus}"`);
            }
        } catch (error) {
            console.error("Failed to update order status:", error);
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Could not update order status.");
            }
        }
    };
    
    const requestReturn = async (orderId, reason) => {
        const toastId = toast.loading("Submitting your return request...");
        try {
            const { data } = await apiClient.put(`/orders/${orderId}/request-return`, { reason }); // <-- CHANGED
            if (data.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? data.data : o));
                toast.update(toastId, { render: "Return request submitted!", type: "success", isLoading: false, autoClose: 3000 });
                return true;
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                const errorMsg = error.response?.data?.error || "Failed to submit request.";
                toast.update(toastId, { render: errorMsg, type: "error", isLoading: false, autoClose: 4000 });
            }
            return false;
        }
    };

    const updateReturnStatus = async (orderId, newReturnStatus) => {
        if (!can('order_edit_status')) {
            toast.error("You do not have permission to update return status.");
            return;
        }
        try {
            const { data } = await apiClient.put(`/orders/${orderId}/return-status`, { returnStatus: newReturnStatus }); // <-- CHANGED
            if (data.success) {
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId ? data.data : order
                    )
                );
                toast.success(`Return request status updated to "${newReturnStatus}"`);
            }
        } catch (error) {
            console.error("Failed to update return status:", error);
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Could not update return status.");
            }
        }
    };
    
    const clearAllTransactions = async () => {
        if (!can('order_delete_all')) {
            toast.error("You do not have permission to perform this action.");
            return;
        }
        const { isConfirmed } = await Swal.fire({
            title: 'Clear All Transactions?',
            text: "This will permanently delete all non-cancelled orders. This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, clear them all!'
        });
        if (isConfirmed) {
            try {
                await apiClient.delete('/orders/clear'); // <-- CHANGED
                await fetchOrders();
                toast.success("All transactions have been successfully cleared.");
            } catch (error) {
                console.error("Failed to clear transactions:", error);
                if (error.response?.status !== 401) {
                    toast.error(error.response?.data?.error || "Could not clear transactions.");
                }
            }
        }
    };

    const value = {
        orders,
        loading,
        addOrder,
        deleteOrder, 
        updateOrderStatus,
        clearAllTransactions,
        refetchOrders: fetchOrders,
        requestReturn,
        updateReturnStatus
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};