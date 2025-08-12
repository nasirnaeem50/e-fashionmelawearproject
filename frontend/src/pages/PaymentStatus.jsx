// src/pages/PaymentStatus.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';
import { FaCheckCircle, FaTimesCircle, FaPrint, FaEnvelope, FaHome, FaBoxOpen } from 'react-icons/fa';
import { useOrders } from '../context/OrderContext';

const PaymentStatus = () => {
    const { state } = useLocation();
    const { getOrderById } = useOrders();
    
    // Get order details either from location state or context
    const order = state?.orderId ? getOrderById(state.orderId) : state?.order;
    const isSuccess = state?.status === 'success';

    if (!order) {
        return (
            <PageTransition>
                <div className="container mx-auto px-4 py-12 text-center">
                    <h2 className="text-2xl font-bold mb-4">Order Information Not Found</h2>
                    <p className="mb-6">We couldn't retrieve your order details.</p>
                    <Link 
                        to="/profile/orders" 
                        className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 inline-block"
                    >
                        View Your Orders
                    </Link>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Status Header */}
                    <div className={`p-6 text-center ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isSuccess ? (
                            <>
                                <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h1>
                                <p className="text-green-600">Your order has been confirmed.</p>
                            </>
                        ) : (
                            <>
                                <FaTimesCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h1 className="text-2xl font-bold text-red-800 mb-2">Payment Failed</h1>
                                <p className="text-red-600">We couldn't process your payment.</p>
                            </>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-gray-500">Order Number</p>
                                <p className="font-medium">{order.id}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Date</p>
                                <p className="font-medium">
                                    {new Date(order.date).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Total Amount</p>
                                <p className="font-medium">Rs {order.total.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Payment Method</p>
                                <p className="font-medium">
                                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                                     order.paymentMethod === 'bank' ? 'Bank Transfer' : 'Easypaisa'}
                                </p>
                            </div>
                        </div>

                        {order.discount > 0 && (
                            <div className="bg-yellow-50 p-3 rounded-md">
                                <p className="text-green-600 font-medium text-center">
                                    You saved Rs {order.discount.toLocaleString()} on this order!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6">
                        <div className="flex flex-wrap justify-center gap-4 mb-6">
                            {isSuccess && (
                                <>
                                    <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md">
                                        <FaPrint /> Print Receipt
                                    </button>
                                    <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md">
                                        <FaEnvelope /> Email Receipt
                                    </button>
                                </>
                            )}
                            <Link 
                                to="/" 
                                className="flex items-center gap-2 bg-gray-800 text-white hover:bg-gray-900 px-4 py-2 rounded-md"
                            >
                                <FaHome /> Continue Shopping
                            </Link>
                            <Link 
                                to={`/profile/orders/${order.id}`} 
                                className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md"
                            >
                                <FaBoxOpen /> View Order Details
                            </Link>
                        </div>

                        {!isSuccess && (
                            <div className="bg-red-50 p-4 rounded-md text-center">
                                <h3 className="font-bold text-red-800 mb-2">Need Help?</h3>
                                <p className="mb-3">Your payment wasn't processed, but your items are still in your cart.</p>
                                <Link 
                                    to="/checkout" 
                                    className="inline-block bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
                                >
                                    Try Payment Again
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default PaymentStatus;