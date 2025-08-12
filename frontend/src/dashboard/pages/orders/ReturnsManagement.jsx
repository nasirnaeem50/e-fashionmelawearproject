import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../../context/OrderContext';
import { useAuth } from '../../../context/AuthContext';
import PageTransition from '../../../components/shared/PageTransition';
import AccessDenied from '../../../components/shared/AccessDenied';
import { FiRefreshCw, FiLoader, FiEye, FiCheck, FiX } from 'react-icons/fi';

const getStatusChip = (status) => {
    switch (status) {
        case 'Approved': return 'bg-green-100 text-green-800';
        case 'Rejected': return 'bg-red-100 text-red-800';
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const ReturnsManagement = () => {
    const { orders, loading, updateReturnStatus } = useOrders();
    const { can, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const returnRequests = useMemo(() => {
        if (!orders) return [];
        return orders
            .filter(order => order.returnStatus)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [orders]);
    
    if (authLoading || loading) {
        return <div className="flex justify-center items-center p-10"><FiLoader className="animate-spin text-blue-500" size={40} /></div>;
    }
    
    if (!can('order_view')) {
        return <AccessDenied permission="order_view" />;
    }

    return (
        <PageTransition>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FiRefreshCw className="mr-2" /> Returns Management
                </h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Order ID</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Customer</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Return Reason</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Return Status</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {returnRequests.length > 0 ? returnRequests.map((order) => (
                                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-xs">{order.id}</td>
                                    <td className="py-3 px-4">{order.shippingInfo.name}</td>
                                    
                                    {/* ✅ THIS IS THE CORRECTED LINE ✅ */}
                                    <td 
                                        className="py-3 px-4 text-sm max-w-xs truncate" 
                                        title={order.returnReason}
                                    >
                                        {order.returnReason}
                                    </td>
                                    
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusChip(order.returnStatus)}`}>
                                            {order.returnStatus}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => navigate(`/admin/orders/details/${order.id}`)} 
                                                className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300" 
                                                title="View Full Order"
                                            >
                                                <FiEye size={16} />
                                            </button>
                                            {order.returnStatus === 'Pending' && can('order_edit_status') && (
                                                <>
                                                    <button 
                                                        onClick={() => updateReturnStatus(order.id, 'Approved')} 
                                                        className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600" 
                                                        title="Approve Return"
                                                    >
                                                        <FiCheck size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => updateReturnStatus(order.id, 'Rejected')} 
                                                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600" 
                                                        title="Reject Return"
                                                    >
                                                        <FiX size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500">
                                        <FiRefreshCw className="mx-auto text-4xl text-gray-300 mb-2" />
                                        No return requests found.
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

export default ReturnsManagement;