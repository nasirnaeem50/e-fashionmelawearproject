import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../../components/shared/PageTransition';
import StatCard from '../../dashboard/components/StatCard';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../../api'; // <-- ADDED
import { toast } from 'react-toastify';
import { FiUsers, FiDollarSign, FiShoppingBag, FiChevronDown, FiChevronUp, FiArchive, FiExternalLink, FiLoader, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import AccessDenied from '../../components/shared/AccessDenied';

const getStatusClass = (status) => {
    switch (status) {
        case 'Processing': return 'bg-yellow-100 text-yellow-800';
        case 'Delivered': return 'bg-green-100 text-green-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        case 'Shipped': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { orders, deleteOrder, refetchOrders, loading: ordersLoading } = useOrders();
    const { user: currentUser, can, loading: authLoading } = useAuth();
    const [expandedCustomerId, setExpandedCustomerId] = useState(null);

    const fetchCustomers = useCallback(async () => {
        if (!can('user_view')) {
            setLoading(false);
            return;
        }
        try {
            // Use apiClient for secure, token-aware calls
            const res = await apiClient.get('/users'); // <-- CHANGED
            setCustomers(res.data.data.filter(u => u.role?.name === 'user'));
        } catch (err) {
            if (err.response?.status !== 401) {
                toast.error("Failed to fetch customer data.");
            }
        } finally {
            setLoading(false);
        }
    }, [can]);

    useEffect(() => {
        if (!authLoading) {
            fetchCustomers();
        }
    }, [authLoading, fetchCustomers]);

    const handleDeleteCustomer = async (customerId, customerName) => {
        if (!can('user_delete')) {
            toast.error("Permission Denied: You cannot delete users.");
            return;
        }
        const { isConfirmed } = await Swal.fire({
            title: `Delete ${customerName}?`,
            text: "This will permanently delete the customer's account. This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (isConfirmed) {
            try {
                // Use apiClient for the delete operation
                await apiClient.delete(`/users/${customerId}`); // <-- CHANGED
                toast.warn(`Customer "${customerName}" has been deleted.`);
                await fetchCustomers();
                await refetchOrders();
            } catch (err) {
                if (err.response?.status !== 401) {
                    toast.error(err.response?.data?.error || "Failed to delete customer.");
                }
            }
        }
    };

    const formatCurrency = (amount) => `Rs ${Math.round(amount || 0).toLocaleString('en-IN')}`;

    const { customerStats, summaryStats } = useMemo(() => {
        const stats = {};
        let totalLifetimeValue = 0, totalOrdersCount = 0;
        customers.forEach(customer => {
            const customerOrders = orders.filter(order => order.user && order.user._id === customer._id);
            const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
            stats[customer._id] = { orderCount: customerOrders.length, totalSpent };
            totalLifetimeValue += totalSpent;
            totalOrdersCount += customerOrders.length;
        });
        const summary = { totalCustomers: customers.length, totalLTV: totalLifetimeValue, avgOrdersPerCustomer: customers.length > 0 ? totalOrdersCount / customers.length : 0 };
        return { customerStats: stats, summaryStats: summary };
    }, [customers, orders]);

    const handleToggleOrders = (customerId) => setExpandedCustomerId(prevId => (prevId === customerId ? null : customerId));

    if (authLoading || loading || ordersLoading) {
        return <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500" /></div>;
    }
    
    if (!can('user_view')) {
        return <AccessDenied permission="user_view" />;
    }

    // The rest of your component's JSX is perfect and remains unchanged.
    return (
        <PageTransition>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <StatCard icon={<FiUsers size={20} />} title="Total Customers" value={summaryStats.totalCustomers} color="blue" />
                <StatCard icon={<FiDollarSign size={20} />} title="Total Lifetime Value" value={formatCurrency(summaryStats.totalLTV)} color="green" />
                <StatCard icon={<FiShoppingBag size={20} />} title="Avg. Orders/Customer" value={summaryStats.avgOrdersPerCustomer.toFixed(1)} color="purple" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FiUsers className="mr-2" /> Customer List</h1>
                <p className="text-sm text-gray-600 mb-6">A list of all registered customers. Click the arrow to view their order history.</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm w-1/4">Name</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm w-1/4">Email</th>
                                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Total Orders</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Total Spent</th>
                                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {customers.map((customer) => {
                                const isExpanded = expandedCustomerId === customer._id;
                                const customerOrders = isExpanded ? orders.filter(o => o.user && o.user._id === customer._id).sort((a,b) => new Date(b.date) - new Date(a.date)) : [];
                                return (
                                    <React.Fragment key={customer._id}>
                                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-4">{customer.name}</td>
                                            <td className="py-3 px-4">{customer.email}</td>
                                            <td className="py-3 px-4 text-center font-medium">{customerStats[customer._id]?.orderCount || 0}</td>
                                            <td className="py-3 px-4 font-semibold">{formatCurrency(customerStats[customer._id]?.totalSpent || 0)}</td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button onClick={() => handleToggleOrders(customer._id)} className="p-2 rounded-full hover:bg-gray-200" title="View Orders">
                                                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                    </button>
                                                    {can('user_delete') && (
                                                        <button 
                                                            onClick={() => handleDeleteCustomer(customer._id, customer.name)} 
                                                            disabled={currentUser._id === customer._id}
                                                            className="p-2 text-red-600 rounded-full hover:bg-red-100 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed" 
                                                            title="Delete Customer"
                                                        >
                                                            <FiTrash2 size={16}/>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded ? (
                                            <tr className="bg-red-50"><td colSpan="6" className="p-4"><div className="bg-white p-4 rounded-lg shadow-inner border">
                                                <h3 className="font-bold text-gray-800 mb-4">Order History for {customer.name}</h3>
                                                {customerOrders.length > 0 ? (<div className="space-y-4">{customerOrders.map(order => (
                                                    <div key={order.id} className="p-3 border rounded-md grid grid-cols-6 gap-4 items-center">
                                                        <div className="font-mono text-xs text-gray-600 col-span-2"><strong>ID:</strong> {order.id}</div>
                                                        <div><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</div>
                                                        <div><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>{order.status}</span></div>
                                                        <div className="font-bold text-gray-800 text-right">{formatCurrency(order.total)}</div>
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link to={`/admin/orders/details/${order.id}`} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300" title="View Full Order Details"><FiExternalLink size={16}/></Link>
                                                            {can('order_delete') && (
                                                                <button onClick={() => deleteOrder(order.id)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600" title="Delete Order"><FiTrash2 size={16}/></button>
                                                            )}
                                                        </div>
                                                    </div>))}</div>) : (<div className="text-center py-6"><FiArchive className="mx-auto text-gray-400 text-4xl mb-2" /><p className="text-gray-600">This customer has not placed any orders yet.</p></div>)}
                                            </div></td></tr>
                                        ) : null}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
};
export default Customers;