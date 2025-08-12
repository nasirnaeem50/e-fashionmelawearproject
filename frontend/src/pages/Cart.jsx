import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { useSettings } from '../context/SettingsContext';
import PageTransition from '../components/shared/PageTransition';
import { FaPlus, FaMinus, FaTrash, FaArrowLeft, FaTag, FaTimes, FaSpinner } from 'react-icons/fa';

const Cart = () => {
    const { 
        cartItems, decreaseQuantity, increaseQuantity, removeFromCart, getCartTotal, clearCart,
        appliedCoupon, discountAmount, taxAmount, applyCoupon, removeCoupon, loading: cartLoading 
    } = useContext(CartContext);
    
    const { products, coupons } = useShop();
    const { activeShippingCost } = useSettings();
    const [isRemoving, setIsRemoving] = useState(null);
    const [couponInput, setCouponInput] = useState('');

    const getDiscountInfo = (item) => {
        const product = products.find(p => p.id === item.product);
        if (product && product.originalPrice && product.originalPrice > product.price) {
            return {
                percentage: Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100),
                originalPrice: product.originalPrice
            };
        }
        return null;
    };

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        if (couponInput.trim()) {
            applyCoupon(couponInput);
            setCouponInput('');
        }
    };
    
    const handleApplyHint = (code) => {
        applyCoupon(code);
    };

    const handleRemoveItem = (item) => {
        setIsRemoving(item.cartItemId);
        removeFromCart(item);
        // The timeout is for the exit animation
        setTimeout(() => setIsRemoving(null), 300); 
    };

    const subtotal = getCartTotal();
    const campaignDiscount = cartItems.reduce((acc, item) => {
        const product = products.find(p => p.id === item.product);
        if (product && product.originalPrice && product.originalPrice > product.price) {
            return acc + ((product.originalPrice - item.price) * item.quantity);
        }
        return acc;
    }, 0);
    
    const grandTotal = subtotal - discountAmount + taxAmount + activeShippingCost;
    const activeCoupons = coupons.filter(c => c.status === 'Active');

    if (cartLoading) {
        return (
            <PageTransition>
                <div className="container mx-auto px-4 py-32 text-center">
                    <FaSpinner className="animate-spin text-red-500 mx-auto text-4xl" />
                    <p className="mt-4 text-gray-600">Loading your cart...</p>
                </div>
            </PageTransition>
        );
    }

    if (cartItems.length === 0) {
        return (
            <PageTransition>
                <div className="container mx-auto px-4 py-32 text-center">
                    <div className="max-w-md mx-auto">
                        <svg className="w-20 h-20 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">Your Cart is Empty</h2>
                        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet</p>
                        <Link to="/shop" className="inline-flex items-center justify-center bg-red-500 text-white font-bold py-3 px-8 rounded-md hover:bg-red-600 transition duration-300 shadow-md hover:shadow-lg"><FaArrowLeft className="mr-2" />Continue Shopping</Link>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center mb-8">
                    <Link to="/shop" className="flex items-center text-gray-600 hover:text-red-500 transition-colors mr-6"><FaArrowLeft className="mr-2" />Continue Shopping</Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Your Shopping Cart</h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map(item => {
                            const discountInfo = getDiscountInfo(item);
                            return (
                                <div key={item.cartItemId} className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 ${isRemoving === item.cartItemId ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} hover:shadow-md`}>
                                   <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="relative w-full sm:w-40 h-40 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                                            {discountInfo && (<div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">{discountInfo.percentage}% OFF</div>)}
                                        </div>
                                        
                                        {/* ✅ FIX: Wrapped details, quantity, price, and delete button in a single flex container for proper alignment */}
                                        <div className="flex-1 flex flex-col sm:flex-row gap-4">
                                            {/* Item Info */}
                                            <div className="flex-1">
                                                <h3 className="text-sm font-bold text-gray-900 uppercase">{item.name}</h3>
                                                {item.selectedSize && <p className="text-xs text-gray-600 mt-1 font-semibold">Size: {item.selectedSize}</p>}
                                                <p className="text-xs text-gray-500 mt-1">{products.find(p => p.id === item.product)?.category || ''}</p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center border border-gray-200 rounded-md h-fit">
                                                <button onClick={() => decreaseQuantity(item)} className="p-2 text-gray-600 hover:bg-gray-50 transition-colors"><FaMinus size={14}/></button>
                                                <span className="px-4 py-1 font-semibold text-gray-800 w-12 text-center">{item.quantity}</span>
                                                <button onClick={() => increaseQuantity(item)} className="p-2 text-gray-600 hover:bg-gray-50 transition-colors"><FaPlus size={14}/></button>
                                            </div>

                                            {/* Price and Delete Button */}
                                            <div className="flex items-center sm:flex-col sm:items-end sm:justify-between gap-2">
                                                <div className="text-lg font-bold text-gray-800 text-right">
                                                    Rs {(item.price * item.quantity).toLocaleString('en-IN')}
                                                </div>
                                                <button onClick={() => handleRemoveItem(item)} className="text-gray-400 hover:text-red-500 transition-colors p-2" title="Remove item">
                                                    <FaTrash size={16}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="flex justify-between mt-6">
                            <button onClick={clearCart} className="text-gray-500 hover:text-red-500 font-medium flex items-center gap-2 transition-colors">
                                <FaTrash size={14}/> Clear Entire Cart
                            </button>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>
                            {activeCoupons.length > 0 && !appliedCoupon && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <h4 className="font-semibold text-sm text-red-800 flex items-center gap-2 mb-2"><FaTag /> Available Coupons</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {activeCoupons.map(c => (
                                            <button key={c.id} onClick={() => handleApplyHint(c.code)} className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-md hover:bg-red-200 transition-colors">{c.code}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {appliedCoupon && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-semibold text-green-800">Coupon Applied!</p>
                                        <p className="text-lg font-bold text-green-800">{appliedCoupon}</p>
                                    </div>
                                    <button onClick={removeCoupon} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full">
                                        <FaTimes />
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleApplyCoupon} className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Have a Coupon?</label>
                                <div className="flex gap-2">
                                    <input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Enter coupon code" className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                                    <button type="submit" className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-md hover:bg-black">Apply</button>
                                </div>
                            </form>

                            <div className="space-y-3 border-t pt-4">
                                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>Rs {subtotal.toLocaleString('en-IN')}</span></div>
                                {campaignDiscount > 0 && (<div className="flex justify-between text-green-600"><span>Campaign Discounts</span><span>- Rs {campaignDiscount.toLocaleString('en-IN')}</span></div>)}
                                {appliedCoupon && (<div className="flex justify-between items-center text-green-600"><span>Coupon Discount</span><span>- Rs {discountAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span></div>)}
                                <div className="flex justify-between text-gray-600"><span>GST (Est.)</span><span>Rs {taxAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Shipping</span>{activeShippingCost > 0 ? (<span className="font-semibold">Rs {activeShippingCost.toLocaleString('en-IN')}</span>) : (<span className="font-semibold text-green-600">Free</span>)}</div>
                                <div className="flex justify-between pt-3 border-t font-bold text-lg mt-2"><span className="text-gray-800">Grand Total</span><span className="text-gray-800">Rs {grandTotal.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span></div>
                                {(campaignDiscount + discountAmount) > 0 && (<div className="flex justify-between text-green-600 font-medium pt-2"><span>Total Savings</span><span>Rs {(campaignDiscount + discountAmount).toLocaleString('en-IN', {maximumFractionDigits: 0})}</span></div>)}
                            </div>
                            <Link to="/checkout"><button className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center">PROCEED TO CHECKOUT</button></Link>
                            <p className="text-center text-xs text-gray-500 mt-3">Secure SSL encrypted checkout</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};
export default Cart;