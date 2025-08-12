import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/shared/PageTransition";
import ProductReviewModal from "../components/profile/ProductReviewModal";
import ReturnRequestModal from "../components/profile/ReturnRequestModal"; // ✅ ADDED
import {
  FaBox, FaCheckCircle, FaArrowLeft, FaTrash, FaTimesCircle, FaShippingFast, FaSpinner,
} from "react-icons/fa";
import { FiStar, FiMapPin, FiCreditCard, FiFileText } from "react-icons/fi";

// This helper component creates the visual progress tracker
const OrderProgressTracker = ({ steps }) => {
    return (
        <div className="flex items-center w-full">
            {steps.map((step, index) => (
                <React.Fragment key={step.status}>
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            step.active ? 'bg-red-500 border-red-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}>
                            {step.icon}
                        </div>
                        <p className={`mt-2 text-xs font-semibold ${step.active ? 'text-gray-800' : 'text-gray-500'}`}>{step.status}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-grow h-1 mx-2 transition-colors duration-300 ${steps[index+1].active ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, loading, deleteOrder } = useOrders();
  const { user } = useAuth(); 

  const order = !loading ? orders.find((o) => o.id === orderId) : null;

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [isReturnModalOpen, setReturnModalOpen] = useState(false); // ✅ ADDED STATE

  const getStatusDetails = (status) => {
    const allSteps = [
      { status: "Processing", icon: <FaBox size={18} /> },
      { status: "Shipped", icon: <FaShippingFast size={18} /> },
      { status: "Delivered", icon: <FaCheckCircle size={18} /> },
    ];
    let activeSteps = [];
    switch (status) {
      case "Processing":
        activeSteps = [true, false, false];
        return { text: "Processing", color: "bg-yellow-100 text-yellow-800", steps: allSteps.map((s, i) => ({...s, active: activeSteps[i]})) };
      case "Shipped":
        activeSteps = [true, true, false];
        return { text: "Shipped", color: "bg-purple-100 text-purple-800", steps: allSteps.map((s, i) => ({...s, active: activeSteps[i]})) };
      case "Delivered":
        activeSteps = [true, true, true];
        return { text: "Delivered", color: "bg-green-100 text-green-800", steps: allSteps.map((s, i) => ({...s, active: activeSteps[i]})) };
      case "Cancelled":
        return { text: "Cancelled", color: "bg-red-100 text-red-800", steps: [] };
      default:
        return { text: "Order Received", color: "bg-gray-100 text-gray-800", steps: allSteps.map(s => ({...s, active: false})) };
    }
  };
  
  const handleOpenReviewModal = (product) => {
    setSelectedProductForReview(product);
    setIsReviewModalOpen(true);
  };

  const handleDeleteOrder = async () => {
    const wasDeleted = await deleteOrder(orderId);
    if (wasDeleted) {
      navigate("/profile/orders");
    }
  };
  
  if (loading) {
    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-32 text-center">
                <FaSpinner className="animate-spin text-red-500 text-4xl mx-auto" />
                <p className="mt-4 text-gray-600">Loading Order Details...</p>
            </div>
        </PageTransition>
    );
  }

  if (!order) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12 text-center">
          <button onClick={() => navigate("/profile/orders")} className="flex items-center text-gray-600 hover:text-red-500 mb-4 transition-colors"><FaArrowLeft className="mr-2" />Back to Orders</button>
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p>The order you're looking for doesn't exist or you may not have permission to view it.</p>
        </div>
      </PageTransition>
    );
  }

  const status = getStatusDetails(order.status);
  const totalSavings = (order.campaignDiscount || 0) + (order.couponDiscount || 0);
  const formatCurrency = (amount) => `Rs ${Math.round(amount || 0).toLocaleString('en-IN')}`;

  return (
    <>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigate("/profile/orders")} className="flex items-center text-gray-600 hover:text-red-500 transition-colors">
              <FaArrowLeft className="mr-2" />
              Back to Orders
            </button>
            {user && user.role === 'admin' && (
              <button onClick={handleDeleteOrder} title="Delete Order" className="flex items-center text-red-500 hover:text-red-700 transition-colors text-sm">
                <FaTrash className="mr-2" />
                Delete Order
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b">
              <div>
                <h1 className="text-2xl font-bold">Order #{order.id.slice(-6).toUpperCase()}</h1>
                <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div className={`px-4 py-2 mt-3 sm:mt-0 rounded-full text-sm font-semibold ${status.color}`}>{status.text}</div>
            </div>
            {status.steps.length > 0 && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <OrderProgressTracker steps={status.steps} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Order Items ({order.orderItems.length})</h2>
                <div className="space-y-4">
                  {order.orderItems.map((item) => {
                    const isDiscounted = item.originalPrice && item.originalPrice > item.price;
                    const savedAmount = isDiscounted ? (item.originalPrice - item.price) * item.quantity : 0;
                    return (
                      <div key={item.cartItemId} className="flex flex-col sm:flex-row border-t first:border-t-0 pt-4 first:pt-0 gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.selectedSize && <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>}
                          <p className="text-gray-600 text-sm">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                          {isDiscounted && item.originalPrice && (<p className="text-xs text-gray-400 line-through">was {formatCurrency(item.originalPrice)} each</p>)}
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col items-end justify-between">
                          <div>
                            <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                            {isDiscounted && (<p className="text-xs text-green-600">You saved {formatCurrency(savedAmount)}</p>)}
                          </div>
                          {order.status === "Delivered" && (
                            <button onClick={() => handleOpenReviewModal(item)} className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-md shadow-sm hover:bg-green-700 transition-colors">
                              <FiStar size={14}/>
                              Leave a review
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiFileText /> Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b"><span>Subtotal</span><strong>{formatCurrency(order.subtotal)}</strong></div>
                  {order.campaignDiscount > 0 && (<div className="flex justify-between py-1 border-b text-green-600"><span>Sale Discounts</span><strong>- {formatCurrency(order.campaignDiscount)}</strong></div>)}
                  {order.couponCode && order.couponDiscount > 0 && (<div className="flex justify-between py-1 border-b text-green-600"><span>Coupon ({order.couponCode})</span><strong>- {formatCurrency(order.couponDiscount)}</strong></div>)}
                  {order.taxAmount > 0 && (<div className="flex justify-between py-1 border-b"><span>GST</span><strong>+ {formatCurrency(order.taxAmount)}</strong></div>)}
                  {order.shippingCost > 0 && (<div className="flex justify-between py-1 border-b"><span>Shipping</span><strong>{formatCurrency(order.shippingCost)}</strong></div>)}
                  <div className="flex justify-between py-2 text-lg font-bold"><span>Grand Total</span><span>{formatCurrency(order.total)}</span></div>
                  {totalSavings > 0 && (<div className="flex justify-end text-green-600 font-medium text-sm mt-1"><span>Total Savings: {formatCurrency(totalSavings)}</span></div>)}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiMapPin /> Shipping Address</h2>
                <div className="space-y-1 text-sm"><p className="font-semibold">{order.shippingInfo.name}</p><p>{order.shippingInfo.address}</p><p>{order.shippingInfo.phone}</p><p>{order.shippingInfo.email || ""}</p></div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                 <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiCreditCard /> Payment Details</h2>
                 <div className="space-y-1 text-sm"><p><strong>Method:</strong> {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod === "bank" ? "Bank Transfer" : "Easypaisa"}</p><p><strong>Status:</strong> {order.paymentStatus}</p></div>
              </div>

              {/* ✅ ADDED: This entire section is new */}
              {order.status === 'Delivered' && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-lg font-semibold mb-4">Need to return something?</h2>
                      {order.returnStatus ? (
                          <div className="bg-gray-100 p-4 rounded-md">
                              <p className="font-semibold">Return Status: <span className="text-blue-600">{order.returnStatus}</span></p>
                              {order.returnReason && <p className="text-sm text-gray-600 mt-2"><strong>Reason given:</strong> {order.returnReason}</p>}
                          </div>
                      ) : (
                          <>
                              <p className="text-sm text-gray-600 mb-4">If you're not satisfied with your order, you can request a return. Our team will review your request.</p>
                              <button 
                                  onClick={() => setReturnModalOpen(true)}
                                  className="w-full bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-md hover:bg-gray-300 transition-colors"
                              >
                                  Request a Return
                              </button>
                          </>
                      )}
                  </div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
      
      {isReviewModalOpen && selectedProductForReview && (
        <ProductReviewModal
          product={selectedProductForReview}
          orderId={order.id}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
      
      {/* ✅ ADDED: This renders the return modal */}
      {isReturnModalOpen && (
        <ReturnRequestModal
            order={order}
            onClose={() => setReturnModalOpen(false)}
        />
      )}
    </>
  );
};

export default OrderDetail;