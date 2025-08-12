import React, { useState } from 'react';
import PageTransition from '../../components/shared/PageTransition';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { FiDollarSign, FiLoader, FiChevronDown, FiChevronUp, FiTruck, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import AccessDenied from '../../components/shared/AccessDenied'; // Import AccessDenied

const Transactions = () => {
    // Get contexts for data, actions, and permissions
    const { orders, loading, deleteOrder, clearAllTransactions } = useOrders();
    const { can, loading: authLoading } = useAuth();
    
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    
    // --- Page Guards ---
    if (authLoading || loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm flex justify-center items-center h-64">
                <FiLoader className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    // A user must be able to view orders to see the transactions page.
    if (!can('order_view')) {
        return <AccessDenied permission="order_view" />;
    }

    const transactions = orders ? orders.filter(order => order.status !== 'Cancelled').sort((a,b) => new Date(b.date) - new Date(a.date)) : [];

    const handleToggleDetails = (orderId) => {
        setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
    };

    const formatCurrency = (amount) => {
        const num = amount || 0;
        return `Rs ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    return (
        <PageTransition>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center">
                        <FiDollarSign className="mr-2" /> All Transactions
                    </h1>
                    {/* --- NEW: Conditionally render 'Clear All' button --- */}
                    {transactions.length > 0 && can('order_delete_all') && (
                        <button
                            onClick={clearAllTransactions} // This function is already permission-aware in the context
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold text-sm rounded-md hover:bg-red-700 shadow-sm transition-colors"
                            title="Delete all non-cancelled orders"
                        >
                            <FiTrash2 size={16} />
                            Clear All
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Order ID</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Date</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Customer</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Amount</th>
                                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {transactions.length > 0 ? (
                                transactions.map(order => (
                                    <React.Fragment key={order.id}>
                                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-mono text-xs">{order.id}</td>
                                            <td className="py-3 px-4">{new Date(order.date).toLocaleDateString()}</td>
                                            <td className="py-3 px-4">{order.shippingInfo.name}</td>
                                            <td className="py-3 px-4 font-semibold">{formatCurrency(order.total)}</td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => handleToggleDetails(order.id)} className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50" title="View Details">
                                                        {expandedOrderId === order.id ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                                                    </button>
                                                    {/* --- NEW: Conditionally render 'Delete' button --- */}
                                                    {can('order_delete') && (
                                                        <button onClick={() => deleteOrder(order.id)} className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50" title="Delete Transaction">
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedOrderId === order.id && (
                                            <tr className="bg-red-50/50">
                                                <td colSpan="5" className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 className="font-bold text-md mb-2 flex items-center gap-2"><FiTruck/>Shipping Details</h4>
                                                            <div className="text-sm space-y-1 bg-white p-4 rounded-lg border">
                                                                <p><strong className="font-semibold">Name:</strong> {order.shippingInfo.name}</p>
                                                                <p><strong className="font-semibold">Phone:</strong> {order.shippingInfo.phone}</p>
                                                                <p><strong className="font-semibold">Address:</strong> {order.shippingInfo.address}</p>
                                                                {order.shippingInfo.email && <p><strong className="font-semibold">Email:</strong> {order.shippingInfo.email}</p>}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-md mb-2 flex items-center gap-2"><FiShoppingBag/>Items Ordered</h4>
                                                            <div className="space-y-3 bg-white p-4 rounded-lg border">
                                                                {Array.isArray(order.orderItems) && order.orderItems.map(item => (
                                                                    <div key={item.cartItemId || item.product} className="flex items-center gap-3 border-b pb-2 last:border-b-0 last:pb-0">
                                                                        <img src={item.image} alt={item.name} className="w-14 h-14 object-contain rounded-md bg-gray-100 p-1" />
                                                                        <div className="flex-grow text-sm">
                                                                            <p className="font-semibold">{item.name}</p>
                                                                            {item.selectedSize && <p className="text-gray-500 font-semibold">Size: {item.selectedSize}</p>}
                                                                            <p className="text-gray-600">Qty: {item.quantity} x {formatCurrency(item.price)}</p>
                                                                        </div>
                                                                        <p className="font-semibold text-sm">{formatCurrency(item.quantity * item.price)}</p>
                                                                    </div>
                                                                ))}
                                                                <div className="text-sm mt-3 pt-3 border-t">
                                                                    <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(order.subtotal)}</span></div>
                                                                    {order.campaignDiscount > 0 && (<div className="flex justify-between text-green-600"><span>Sale Discount:</span><span>- {formatCurrency(order.campaignDiscount)}</span></div>)}
                                                                    {order.couponCode && order.couponDiscount > 0 && (<div className="flex justify-between text-green-600"><span>Coupon ({order.couponCode}):</span><span>- {formatCurrency(order.couponDiscount)}</span></div>)}
                                                                    {order.taxAmount > 0 && (<div className="flex justify-between"><span>GST:</span><span>+ {formatCurrency(order.taxAmount)}</span></div>)}
                                                                    <div className="flex justify-between"><span>Shipping:</span><span>{formatCurrency(order.shippingCost)}</span></div>
                                                                    <div className="flex justify-between font-bold mt-1"><span>Total:</span><span>{formatCurrency(order.total)}</span></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-500">No transactions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
};

export default Transactions;