// frontend/src/components/profile/Orders.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { 
  FaBox, FaCheckCircle, FaTrash, FaTimesCircle,
  FaShippingFast, FaSpinner, FaTags 
} from 'react-icons/fa';

const Orders = () => {
    // UPDATE: Now we get the user-specific orders directly from the context
    const { orders: userOrders, loading, deleteOrder } = useOrders();

    const getStatusDetails = (status) => {
        switch (status) {
            case 'Processing': return { icon: <FaBox className="text-yellow-500" />, text: 'Processing', color: 'bg-yellow-100 text-yellow-800', progress: 25 };
            case 'Shipped': return { icon: <FaShippingFast className="text-purple-500" />, text: 'Shipped', color: 'bg-purple-100 text-purple-800', progress: 75 };
            case 'Delivered': return { icon: <FaCheckCircle className="text-green-500" />, text: 'Delivered', color: 'bg-green-100 text-green-800', progress: 100 };
            case 'Cancelled': return { icon: <FaTimesCircle className="text-red-500" />, text: 'Cancelled', color: 'bg-red-100 text-red-800', progress: 0 };
            default: return { icon: <FaBox className="text-gray-500" />, text: 'Received', color: 'bg-gray-100 text-gray-800', progress: 10 };
        }
    };

    const handleDeleteOrder = (orderId, e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteOrder(orderId);
    };

    if (loading) {
        return <div className="text-center py-8 flex justify-center items-center"><FaSpinner className="animate-spin mr-3"/> Loading your orders...</div>;
    }

    if (userOrders.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <h3 className="text-lg font-medium mb-2">You haven't placed any orders yet</h3>
                <p className="text-gray-600 mb-4">When you place an order, it will appear here.</p>
                <Link to="/shop" className="inline-block bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">My Orders</h2>
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">{userOrders.length} Total</span>
            </div>
            <div className="divide-y">
                {userOrders.map(order => {
                    const status = getStatusDetails(order.status);
                    const totalSavings = (order.campaignDiscount || 0) + (order.couponDiscount || 0);
                    
                    const formatCurrency = (amount) => `Rs ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

                    return (
                        <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors relative group">
                             <Link to={`/profile/orders/${order.id}`} className="absolute inset-0 z-0"></Link>
                            <button
                                onClick={(e) => handleDeleteOrder(order.id, e)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
                                title="Delete order"
                            >
                                <FaTrash />
                            </button>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 relative z-10">
                                <div className="flex items-center gap-3 mb-2 md:mb-0">
                                    {status.icon}
                                    <div>
                                        <h3 className="font-medium">Order #{order.id.slice(-6)}</h3>
                                        <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     {order.couponCode && (
                                        <span title={`Coupon Applied: ${order.couponCode}`} className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 flex items-center gap-1">
                                            <FaTags size={12}/> Coupon
                                        </span>
                                     )}
                                    <div className={`px-3 py-1 rounded-full text-sm ${status.color}`}>{status.text}</div>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4"><div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${status.progress}%` }}></div></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 relative z-10">
                                <div><p className="text-sm text-gray-500">Total Paid</p><p className="font-medium">{formatCurrency(order.total)}</p></div>
                                <div><p className="text-sm text-gray-500">Items</p><p className="font-medium">{order.orderItems.reduce((acc, item) => acc + item.quantity, 0)}</p></div>
                                <div><p className="text-sm text-gray-500">Savings</p><p className="font-medium text-green-600">{formatCurrency(totalSavings)}</p></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Orders;