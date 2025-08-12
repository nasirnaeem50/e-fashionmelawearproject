import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { FiClock, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const SalesActivity = ({ orders }) => {
    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No recent orders to display.
            </div>
        );
    }

    const getStatusInfo = (status) => {
        switch (status) {
            case 'Processing':
                return { icon: <FiClock size={12} />, color: 'bg-yellow-100 text-yellow-800' };
            case 'Shipped':
                return { icon: <FiTruck size={12} />, color: 'bg-purple-100 text-purple-800' };
            case 'Delivered':
                return { icon: <FiCheckCircle size={12} />, color: 'bg-green-100 text-green-800' };
            case 'Cancelled':
                return { icon: <FiXCircle size={12} />, color: 'bg-red-100 text-red-800' };
            default:
                return { icon: <FiClock size={12} />, color: 'bg-gray-100 text-gray-800' };
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div 
            className="space-y-3"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="visible"
        >
            {orders.map(order => {
                const statusInfo = getStatusInfo(order.status);
                return (
                    <motion.div key={order.id} variants={itemVariants}>
                        <Link to={`/admin/orders/details/${order.id}`} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                                <span className="font-bold text-red-600 text-lg">
                                    {order.customerName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-sm">
                                    {order.customerName} - #{order.orderNumber}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDistanceToNow(new Date(order.date), { addSuffix: true })}
                                </p>
                            </div>
                            <div className="text-right ml-4">
                                {/* --- THIS IS THE FIX: The total is now rounded before being displayed --- */}
                                <p className="font-bold text-gray-800 text-sm">Rs {Math.round(order.total).toLocaleString()}</p>
                                <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                    {statusInfo.icon}
                                    {order.status}
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )
            })}
        </motion.div>
    );
};

export default SalesActivity;