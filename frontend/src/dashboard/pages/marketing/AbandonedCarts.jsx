// frontend/src/dashboard/pages/marketing/AbandonedCarts.jsx

import React, { useState, useEffect, useCallback } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { useAuth } from '../../../context/AuthContext';
import { FaCartArrowDown, FaEnvelope, FaSpinner, FaTrash } from 'react-icons/fa';
import ReminderComposerModal from '../../components/ReminderComposerModal';
import apiClient from '../../../api';
import { toast } from 'react-toastify';
import AccessDenied from '../../../components/shared/AccessDenied';

const AbandonedCarts = () => {
    const { can, loading: authLoading } = useAuth();
    const [selectedCart, setSelectedCart] = useState(null);
    const [abandonedCarts, setAbandonedCarts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAbandonedCarts = useCallback(async () => {
        // ✅ CORRECTED: This check now uses the right permission.
        if (!can('cart_abandoned_view')) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data } = await apiClient.get('/cart/abandoned');
            if (data.success) {
                setAbandonedCarts(data.data || []);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Could not fetch abandoned carts.");
            }
        } finally {
            setLoading(false);
        }
    }, [can]);

    useEffect(() => {
        if (!authLoading) {
            fetchAbandonedCarts();
        }
    }, [fetchAbandonedCarts, authLoading]);

    const handleComposeReminder = (cart) => {
        setSelectedCart(cart);
    };

    const handleDeleteCart = async (cartId, customerName) => {
        if (!can('cart_delete')) {
            return toast.error("Permission Denied: You cannot delete carts.");
        }
        if (window.confirm(`Are you sure you want to delete the abandoned cart for "${customerName}"? This cannot be undone.`)) {
            try {
                await apiClient.delete(`/cart/${cartId}`);
                toast.warn(`Abandoned cart for "${customerName}" deleted.`);
                setAbandonedCarts(currentCarts => currentCarts.filter(c => c._id !== cartId));
            } catch (error) {
                if (error.response?.status !== 401) {
                    toast.error(error.response?.data?.error || "Failed to delete cart.");
                }
            }
        }
    };
    
    if (authLoading || loading) {
        return (
            <PageTransition>
                 <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <FaSpinner className="animate-spin text-blue-500 mx-auto text-3xl" />
                    <p className="mt-2">Loading Abandoned Carts...</p>
                 </div>
            </PageTransition>
        );
    }
    
    // ✅ CORRECTED: This final check also uses the right permission.
    if (!can('cart_abandoned_view')) {
        return <AccessDenied permission="cart_abandoned_view" />;
    }

    return (
        <>
            <ReminderComposerModal cart={selectedCart} onClose={() => setSelectedCart(null)} />
            <PageTransition>
                 <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCartArrowDown /> Abandoned Carts
                    </h1>
                    <p className="text-gray-600 mb-6 text-sm">
                       This report shows users with items in their cart who have not been active for over 30 minutes.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Customer</th>
                                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Cart Items</th>
                                    <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Total Qty</th>
                                    <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Cart Value</th>
                                    <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Last Updated</th>
                                    <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                               {abandonedCarts.length > 0 ? abandonedCarts.map(cart => (
                                    <tr key={cart._id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4"><p className="font-medium">{cart.user.name}</p><p className="text-xs text-gray-500">{cart.user.email}</p></td>
                                        <td className="py-3 px-4"><ul className="list-disc list-inside text-sm">{cart.items.map(item => (<li key={item.cartItemId}>{item.name} (x{item.quantity})</li>))}</ul></td>
                                        <td className="py-3 px-4 text-center font-semibold">{cart.totalQuantity}</td>
                                        <td className="py-3 px-4 text-center font-semibold">Rs {cart.totalValue.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-center text-sm">{new Date(cart.updatedAt).toLocaleString()}</td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleComposeReminder(cart)} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" title="Send Reminder"><FaEnvelope/></button>
                                                {can('cart_delete') && (
                                                    <button onClick={() => handleDeleteCart(cart._id, cart.user.name)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600" title="Delete Cart"><FaTrash /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                               )) : (<tr><td colSpan="6" className="text-center py-10 text-gray-500">No abandoned carts found.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </PageTransition>
        </>
    );
};

export default AbandonedCarts;