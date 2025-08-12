import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGift, FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useShop } from '../../context/ShopContext';

const CouponModal = ({ coupon, onClose }) => {
    const { products } = useShop();

    if (!coupon) return null;

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        toast.success(`Coupon "${code}" copied!`);
    };

    // ✅ --- THIS IS THE FIX ---
    // This helper function formats the date from the server (assumed UTC)
    // and displays it correctly, ignoring the user's local timezone.
    const formatUTCDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Use Intl.DateTimeFormat to force UTC interpretation for display.
        // 'en-GB' locale formats the date as DD/MM/YYYY.
        return new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'UTC' // This is the magic key to solve the problem.
        }).format(date);
    };

    const discountText = coupon.type === 'Percentage' 
        ? `${coupon.value}% OFF` 
        : `Rs ${coupon.value} OFF`;

    let scopeDescription = "On your entire order!";

    if (coupon.scope && coupon.scope.type && coupon.scope.target) {
        const targetText = Array.isArray(coupon.scope.target) ? coupon.scope.target.join(', ') : '';

        switch (coupon.scope.type) {
            case 'category':
                scopeDescription = `On all items in the "${targetText}" category.`;
                break;
            case 'parent-category':
                scopeDescription = `On all items in the "${targetText}" collection.`;
                break;
            case 'product':
                const targetProduct = products.find(p => coupon.scope.target.includes(p.id));
                if (targetProduct) {
                    scopeDescription = `Specifically for the "${targetProduct.name}"!`;
                } else {
                    scopeDescription = `On a specific selected product.`;
                }
                break;
            default:
                break;
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 50 }}
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 text-center bg-red-500 text-white">
                        <FiGift size={48} className="mx-auto mb-3" />
                        <h2 className="text-2xl font-bold">Special Offer!</h2>
                        <p>Just for you, a limited-time discount.</p>
                    </div>

                    <div className="p-6 text-center">
                        <p className="text-gray-600 mb-2">Use the code below for</p>
                        <p className="text-3xl font-extrabold text-gray-800 mb-1">{discountText}</p>
                        
                        <p className="text-sm text-gray-500 mb-4">{scopeDescription}</p>
                        
                        <div className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg">
                            <span className="text-2xl font-bold tracking-widest text-red-600 mr-4">
                                {coupon.code}
                            </span>
                            <button 
                                onClick={() => handleCopy(coupon.code)} 
                                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                title="Copy Code"
                            >
                                <FiCopy size={20} />
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 mt-4">
                            {/* ✅ Using the new, correct formatting function */}
                            Offer valid until {formatUTCDate(coupon.endDate)}.
                        </p>
                    </div>

                    <button 
                        onClick={onClose} 
                        className="absolute top-3 right-3 text-white/70 hover:text-white transition-opacity"
                    >
                        <FiX size={24} />
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CouponModal;