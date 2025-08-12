// Checkout.jsx (Complete and Corrected File)
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { useShop } from '../context/ShopContext';
import { useSettings } from '../context/SettingsContext';
import PageTransition from "../components/shared/PageTransition";
import { toast } from "react-toastify";
import { FaSpinner, FaLock, FaMoneyBillWave, FaUniversity } from "react-icons/fa";
import { FiCheckCircle, FiTruck, FiCreditCard } from "react-icons/fi";

const gatewayIcons = {
    cod: <FaMoneyBillWave className="w-6 h-6 text-green-600 inline-block" />,
    bank: <FaUniversity className="w-6 h-6 text-blue-700 inline-block" />,
    easypaisa: <img src="/images/easy.webp" alt="Easypaisa" className="h-6 inline-block" />,
    stripe: <FiCreditCard className="w-6 h-6 text-gray-600 inline-block" />,
};
const gatewayNames = { cod: 'Cash on Delivery', bank: 'Bank Transfer', easypaisa: 'Easypaisa', stripe: 'Credit Card (Stripe)' };
const gatewayDescriptions = {
    cod: 'Pay with cash upon receiving your order.',
    bank: 'Transfer the amount to our bank account.',
    easypaisa: 'Pay securely with your mobile account.',
    stripe: 'Pay with your credit or debit card.',
};

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart, appliedCoupon, discountAmount, taxAmount } = useContext(CartContext);
  // ✅ REMOVED: decreaseStock is no longer needed here.
  const { products } = useShop();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const { settings, activeShippingCost } = useSettings();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [easypaisaNumber, setEasypaisaNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
  const availableGateways = settings?.paymentGateways ? Object.entries(settings.paymentGateways)
    .filter(([key, value]) => value.enabled)
    .map(([key]) => key) : ['cod'];

  useEffect(() => {
    if (availableGateways.length > 0) {
      setPaymentMethod(availableGateways[0]);
    }
  }, [settings, availableGateways]);

  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      toast.info("Your cart is empty. Redirecting...");
      navigate("/cart");
    }
  }, [cartItems, orderPlaced, navigate]);

  const getDiscountInfo = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product && product.originalPrice && product.originalPrice > product.price) {
      return { originalPrice: product.originalPrice };
    }
    return null;
  };
  
  const subtotal = getCartTotal();
  const campaignDiscount = cartItems.reduce((acc, item) => {
      const product = products.find(p => p.id === item.product);
      if (product && product.originalPrice && product.originalPrice > item.price) {
          return acc + ((product.originalPrice - item.price) * item.quantity);
      }
      return acc;
  }, 0);
  const grandTotal = subtotal - discountAmount + taxAmount + activeShippingCost;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.name.value || !form.address.value || !form.phone.value) {
      toast.error("Please fill in all required shipping details.");
      return;
    }
    setIsProcessing(true);

    const sanitizedOrderItems = cartItems.map(item => ({
        name: item.name, quantity: item.quantity, image: item.image, price: item.price,
        originalPrice: item.originalPrice, selectedSize: item.selectedSize,
        product: item.product, cartItemId: item.cartItemId
    }));

    const orderData = {
      orderItems: sanitizedOrderItems,
      shippingInfo: { 
          name: form.name.value, phone: form.phone.value, 
          email: form.email.value || "", address: form.address.value 
      },
      paymentMethod, subtotal, campaignDiscount,
      couponCode: appliedCoupon, couponDiscount: discountAmount,
      taxAmount, shippingCost: activeShippingCost, total: grandTotal,
    };

    try {
      const newOrder = await addOrder(orderData);
      if (newOrder && newOrder.id) {
        await clearCart(); 
        setOrderDetails(newOrder);
        setOrderPlaced(true);

        // ✅ REMOVED: The insecure call to decreaseStock has been deleted.
        // The backend now handles this securely and automatically.
        
        setTimeout(() => {
            navigate("/profile/orders");
        }, 3000);
      } else { 
        // This 'else' block might be triggered if the backend returns a non-201 status but doesn't throw an error,
        // for example, the 409 Conflict for out-of-stock items.
        // The error toast for this is now handled globally by the OrderContext's addOrder function.
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error in handlePlaceOrder:", error);
      // The error toast is handled by the OrderContext
      setIsProcessing(false);
    }
    // No finally block needed here, as state is managed within try/catch
  };

  if (cartItems.length === 0 && !orderPlaced) {
    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-32 text-center">
                <FaSpinner className="animate-spin text-red-500 text-4xl mx-auto" />
                <p className="mt-4 text-gray-600">Redirecting to your cart...</p>
            </div>
        </PageTransition>
    );
  }
  
  const getLabelClass = (method) => `flex items-center p-4 border rounded-md cursor-pointer transition-all duration-200 ${
    paymentMethod === method ? "bg-red-50 border-red-500 ring-2 ring-red-200" : "bg-white border-gray-200 hover:border-red-300"
  }`;

  if (orderPlaced) {
    if (!orderDetails) return null;
    const totalSavings = (orderDetails.campaignDiscount || 0) + (orderDetails.couponDiscount || 0);
    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-12 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl">
                    <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
                    <p className="text-gray-600 mb-6">Thank you! Your order #{orderDetails.id.slice(-6).toUpperCase()} has been confirmed. You will be redirected shortly.</p>
                    <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
                        <p className="font-medium flex justify-between"><span>Order Total:</span> <span>Rs {orderDetails.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>
                        {totalSavings > 0 && (<p className="text-green-600 flex justify-between"><span>You saved:</span> <span>Rs {totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>)}
                    </div>
                    <Link to="/profile/orders" className="inline-block bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors">View My Orders</Link>
                </motion.div>
            </div>
        </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/cart" className="flex items-center text-gray-600 hover:text-red-500 transition-colors mr-6"><FiTruck className="mr-2" /> Back to Cart</Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Checkout</h1>
        </div>
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-gray-700 mb-1">Full Name *</label><input name="name" type="text" defaultValue={user?.name || ""} required className="w-full p-2 border rounded-md focus:ring-red-300 focus:border-red-300" /></div>
                <div><label className="block text-gray-700 mb-1">Phone Number *</label><input name="phone" type="tel" required className="w-full p-2 border rounded-md focus:ring-red-300 focus:border-red-300" /></div>
                <div className="md:col-span-2"><label className="block text-gray-700 mb-1">Email Address</label><input name="email" type="email" defaultValue={user?.email || ""} className="w-full p-2 border rounded-md focus:ring-red-300 focus:border-red-300" /></div>
                <div className="md:col-span-2"><label className="block text-gray-700 mb-1">Full Address *</label><textarea name="address" required rows="3" className="w-full p-2 border rounded-md focus:ring-red-300 focus:border-red-300"></textarea></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                {availableGateways.map((key) => (
                  <label key={key} className={getLabelClass(key)}>
                    <input type="radio" name="payment" value={key} checked={paymentMethod === key} onChange={() => setPaymentMethod(key)} className="form-radio text-red-500 focus:ring-red-500" />
                    <div className="flex items-center w-full ml-4">
                      <div className="flex-shrink-0 w-8 text-center">{gatewayIcons[key]}</div>
                      <div className="ml-3">
                        <span className="font-semibold">{gatewayNames[key]}</span>
                        <p className="text-sm text-gray-500 mt-1">{gatewayDescriptions[key]}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {paymentMethod === "bank" && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }} className="mt-4 p-4 bg-gray-100 rounded-md text-sm"><p className="font-bold mb-2">Our Bank Details:</p><p>Bank: HBL</p><p>Account Name: Fashion Mela Wear</p><p>Account Number: 1234-5678-9012-3456</p><p className="mt-2 text-xs">Please send a screenshot of the transaction to our WhatsApp number after placing the order.</p></motion.div>)}
              {paymentMethod === "easypaisa" && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }} className="mt-4 p-4 bg-gray-100 rounded-md text-sm"><p className="font-bold mb-2">Enter your Easypaisa account details:</p><input type="tel" value={easypaisaNumber} onChange={(e) => setEasypaisaNumber(e.target.value)} placeholder="Easypaisa Account Number (03xxxxxxxxx)" className="w-full p-2 border rounded-md focus:ring-red-300 focus:border-red-300" required /></motion.div>)}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cartItems.map((item) => { 
                    const discountInfo = getDiscountInfo(item.product); 
                    return (
                        <div key={item.cartItemId} className="flex justify-between items-center text-sm border-b pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    {item.selectedSize && <p className="text-gray-500 text-xs font-semibold">Size: {item.selectedSize}</p>}
                                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                    {discountInfo && (<span className="text-xs bg-red-100 text-red-700 px-1 rounded">ON SALE</span>)}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">Rs {(item.price * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                {discountInfo && (<p className="text-xs text-gray-400 line-through">Rs {(discountInfo.originalPrice * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>)}
                            </div>
                        </div>
                    );
                })}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2"><span>Subtotal</span><span>Rs {subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
                {campaignDiscount > 0 && (<div className="flex justify-between text-green-500 mb-2"><span>Sale Discounts</span><span>- Rs {campaignDiscount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>)}
                {appliedCoupon && discountAmount > 0 && (<div className="flex justify-between text-green-500 mb-2"><span>Coupon ({appliedCoupon})</span><span>- Rs {discountAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span></div>)}
                <div className="flex justify-between mb-2"><span className="text-gray-600">GST</span><span>Rs {taxAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Shipping</span>{activeShippingCost > 0 ? (<span className="font-semibold">Rs {activeShippingCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>) : (<span className="font-semibold text-green-600">Free</span>)}</div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t"><span>Total</span><span>Rs {grandTotal.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span></div>
                {(campaignDiscount + discountAmount) > 0 && (<div className="flex justify-between text-green-600 font-medium pt-2"><span>Total Savings</span><span>Rs {(campaignDiscount + discountAmount).toLocaleString('en-IN', {maximumFractionDigits: 0})}</span></div>)}
              </div>
              <button type="submit" disabled={isProcessing} className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-md transition duration-300 flex items-center justify-center disabled:bg-red-300 disabled:cursor-not-allowed">
                {isProcessing ? (<><FaSpinner className="animate-spin mr-2" />Processing...</>) : (<><FaLock className="mr-2" />{paymentMethod === "easypaisa" ? "PAY NOW" : "PLACE ORDER"}</>)}
              </button>
              <div className="flex items-center justify-center mt-4 text-xs text-gray-500"><FiCheckCircle className="text-green-500 mr-1" /><span>Secure SSL encrypted checkout</span></div>
            </div>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};
export default Checkout;