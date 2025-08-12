import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '../../components/shared/PageTransition';
import StatCard from '../components/StatCard';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { FiShoppingBag, FiEye, FiTrash2, FiLoader, FiDollarSign, FiBarChart2, FiRefreshCw } from 'react-icons/fi';
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

const getReturnStatusChip = (status) => {
    switch (status) {
        case 'Approved': return 'bg-green-100 text-green-800';
        case 'Rejected': return 'bg-red-100 text-red-800';
        case 'Pending': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// ✅ ADDED: New helper function to get the full descriptive text for the badge
const getReturnStatusText = (status) => {
    switch (status) {
        case 'Pending': return 'Return Pending';
        case 'Approved': return 'Return Approved';
        case 'Rejected': return 'Return Rejected';
        default: return 'Return'; // Fallback
    }
};

const OrdersList = () => {
    const { status: statusSlug } = useParams();
    const { orders, loading, deleteOrder } = useOrders();
    const { can, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const formatCurrency = (amount) => {
        return `Rs ${Math.round(amount || 0).toLocaleString('en-IN')}`;
    };

    const { filteredOrders, title, stats } = useMemo(() => {
        if (!orders) return { filteredOrders: [], title: 'Loading...', stats: {} };
        const statusMap = { 'pending': 'Processing', 'progress': 'Shipped', 'delivered': 'Delivered', 'canceled': 'Cancelled' };
        const currentDataStatus = statusMap[statusSlug];
        const data = currentDataStatus ? orders.filter(order => order.status === currentDataStatus) : orders;
        const calculatedStats = {
            orderCount: data.length,
            totalValue: data.reduce((sum, order) => sum + order.total, 0),
            avgOrderValue: data.length > 0 ? data.reduce((sum, order) => sum + order.total, 0) / data.length : 0,
        };
        const pageTitle = currentDataStatus ? `${currentDataStatus} Orders` : 'All Orders';
        return { filteredOrders: data, title: pageTitle, stats: calculatedStats };
    }, [orders, statusSlug]);
    
    if (authLoading || loading) {
        return <div className="flex justify-center items-center p-10"><FiLoader className="animate-spin text-blue-500" size={40} /></div>;
    }
    
    if (!can('order_view')) {
        return <AccessDenied permission="order_view" />;
    }

    return (
        <PageTransition>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <StatCard icon={<FiShoppingBag size={20} />} title={`Orders in View`} value={stats.orderCount} color="blue" />
                <StatCard icon={<FiDollarSign size={20} />} title={`Value of Orders`} value={formatCurrency(stats.totalValue)} color="green" />
                <StatCard icon={<FiBarChart2 size={20} />} title={`Avg. Order Value`} value={formatCurrency(stats.avgOrderValue)} color="purple" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FiShoppingBag className="mr-2" /> {title}
                </h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Order ID</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Customer</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Date</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Total</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Status</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-xs">{order.id}</td>
                                    <td className="py-3 px-4">{order.shippingInfo.name}</td>
                                    <td className="py-3 px-4">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">{formatCurrency(order.total)}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusClass(order.status)}`}>{order.status}</span>
                                            
                                            {order.returnStatus && (
                                                <span 
                                                    className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${getReturnStatusChip(order.returnStatus)}`}
                                                    title={getReturnStatusText(order.returnStatus)} // ✅ MODIFIED: Use new function for tooltip
                                                >
                                                    <FiRefreshCw size={12}/>
                                                    {getReturnStatusText(order.returnStatus)} {/* ✅ MODIFIED: Use new function for display text */}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => navigate(`/admin/orders/details/${order.id}`)} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" title="View Order"><FiEye size={16} /></button>
                                            {can('order_delete') && (
                                                <button onClick={() => deleteOrder(order.id)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600" title="Delete Order"><FiTrash2 size={16} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-gray-500">No orders found with this status.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
};

export default OrdersList;