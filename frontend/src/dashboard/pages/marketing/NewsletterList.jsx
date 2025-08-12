// frontend/src/dashboard/pages/marketing/NewsletterList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import PageTransition from '../../../components/shared/PageTransition';
import AccessDenied from '../../../components/shared/AccessDenied';
import { useAuth } from '../../../context/AuthContext';
import { FiMail, FiLoader, FiDownload, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

const NewsletterList = () => {
    const { can, loading: authLoading } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscriptions = useCallback(async () => {
        // ✅ CORRECTED: Check for the new, specific permission.
        if (!can('newsletter_view')) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await apiClient.get('/newsletter');
            if (data.success) {
                setSubscriptions(data.data);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error("Could not fetch newsletter subscribers.");
            }
        } finally {
            setLoading(false);
        }
    }, [can]);

    useEffect(() => {
        if (!authLoading) {
            fetchSubscriptions();
        }
    }, [authLoading, fetchSubscriptions]);

    const handleDelete = useCallback(async (subId, subEmail) => {
        // ✅ CORRECTED: Check for the delete permission.
        if (!can('newsletter_delete')) {
            toast.error("Permission Denied.");
            return;
        }

        const { isConfirmed } = await Swal.fire({
            title: `Delete subscription for "${subEmail}"?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (isConfirmed) {
            try {
                await apiClient.delete(`/newsletter/${subId}`);
                toast.warn(`Subscription for "${subEmail}" has been deleted.`);
                setSubscriptions(prevSubs => prevSubs.filter(sub => sub._id !== subId));
            } catch (error) {
                if (error.response?.status !== 401) {
                    toast.error("Failed to delete subscription.");
                }
            }
        }
    }, [can]);

    const handleClearAll = useCallback(async () => {
        // ✅ CORRECTED: Check for the manage/delete permission.
        if (!can('newsletter_delete')) {
            toast.error("Permission Denied.");
            return;
        }

        const { isConfirmed } = await Swal.fire({
            title: 'Are you absolutely sure?',
            html: "This will permanently delete <strong>ALL</strong> newsletter subscribers. This action cannot be undone.",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, clear them all!'
        });

        if (isConfirmed) {
            try {
                await apiClient.delete('/newsletter/clear');
                toast.success('All newsletter subscriptions have been cleared.');
                setSubscriptions([]);
            } catch (error) {
                if (error.response?.status !== 401) {
                    toast.error("Failed to clear subscriptions.");
                }
            }
        }
    }, [can]);

    const handleExportCSV = () => {
        if (subscriptions.length === 0) {
            toast.info("There are no emails to export.");
            return;
        }
        const headers = "Email,Subscribed At\n";
        const rows = subscriptions.map(sub => 
            `${sub.email},${new Date(sub.subscribedAt).toISOString()}`
        ).join("\n");

        const csvContent = headers + rows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "newsletter_subscribers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Subscribers exported successfully!");
    };
    
    if (authLoading || loading) {
        return (
            <PageTransition>
                <div className="flex justify-center items-center p-10">
                    <FiLoader className="animate-spin text-red-500" size={40} />
                </div>
            </PageTransition>
        );
    }
    
    // ✅ CORRECTED: This final check ensures the whole page is protected by the correct permission.
    if (!can('newsletter_view')) {
        return <AccessDenied permission="newsletter_view" />;
    }

    return (
        <PageTransition>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FiMail /> Newsletter Subscribers ({subscriptions.length})
                    </h1>
                    <div className="flex items-center gap-2">
                        {/* ✅ CORRECTED: The permission check for the button is now correct. */}
                        {can('newsletter_delete') && (
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 disabled:bg-red-400"
                                disabled={subscriptions.length === 0}
                            >
                                <FiAlertTriangle /> Clear All
                            </button>
                        )}
                        <button 
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:bg-green-400"
                            disabled={subscriptions.length === 0}
                        >
                            <FiDownload /> Export as CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email Address</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Subscription Date</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {subscriptions.length > 0 ? subscriptions.map((sub) => (
                                <tr key={sub._id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{sub.email}</td>
                                    <td className="py-3 px-4">{new Date(sub.subscribedAt).toLocaleString()}</td>
                                    <td className="py-3 px-4">
                                        <button 
                                            onClick={() => handleDelete(sub._id, sub.email)}
                                            className="text-red-500 hover:text-red-700" 
                                            title="Delete Subscription"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-10 text-gray-500">
                                        No one has subscribed to the newsletter yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
};

export default NewsletterList;