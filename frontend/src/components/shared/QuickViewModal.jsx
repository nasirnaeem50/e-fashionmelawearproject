import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiX, FiHeart, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { FaStar, FaHeart, FaBalanceScale } from 'react-icons/fa';
import { CartContext } from '../../context/CartContext';
import { useProductLists } from '../../context/ProductListsContext';
import { toast } from 'react-toastify';

const QuickViewModal = ({ product, onClose }) => {
    const { addToCart } = useContext(CartContext);
    const { toggleWishlistItem, toggleCompareItem, wishlistItems, compareItems } = useProductLists();

    // --- NEW STATE FOR SIZE SELECTION ---
    const [selectedSize, setSelectedSize] = useState(null);

    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    const isInCompare = compareItems.some(item => item.id === product.id);
    const isSpecialOffer = product.originalPrice && product.originalPrice > product.price;
    const discountPercentage = isSpecialOffer ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    
    // --- NEW: Reset selected size when product changes ---
    useEffect(() => {
        setSelectedSize(null);
    }, [product]);

    if (!product) return null;

    // --- NEW: Handler for adding to cart from modal ---
    const handleAddToCartFromModal = () => {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            toast.warn("Please select a size.");
            return;
        }
        addToCart(product, selectedSize); // Pass selected size to context
        onClose();
    };

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
                    className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10"
                    >
                        <FiX size={24} />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 flex-grow">
                        <div className="p-4 bg-gray-100 flex items-center justify-center relative">
                            {isSpecialOffer && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                                    {discountPercentage}% OFF
                                </div>
                            )}
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full max-h-[70vh] object-contain"
                            />
                        </div>
                        <div className="p-6 flex flex-col">
                            <div className="flex-grow">
                                <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                                <div className="flex items-center my-2">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'} />
                                    ))}
                                    <span className="text-gray-400 ml-2">({product.reviewCount || 0} Reviews)</span>
                                </div>
                                <div className="flex items-baseline gap-3 my-2">
                                    <p className="text-xl font-bold text-red-500">
                                        Rs {product.price.toLocaleString()}
                                    </p>
                                    {isSpecialOffer && product.originalPrice && (
                                        <>
                                            <p className="text-gray-400 line-through text-lg">
                                                Rs {product.originalPrice.toLocaleString()}
                                            </p>
                                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">
                                                Save Rs {(product.originalPrice - product.price).toLocaleString()}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                                
                                <div className="mt-4 flex items-center">
                                    <p className="font-medium text-gray-800 mr-2">Availability:</p>
                                    {product.stock > 0 ? (
                                        <span className="flex items-center text-green-600 font-semibold">
                                            <FiCheckCircle className="mr-1.5" /> In Stock ({product.stock})
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-red-600 font-semibold">
                                            <FiXCircle className="mr-1.5" /> Out of Stock
                                        </span>
                                    )}
                                </div>
                                {product.stock > 0 && product.stock <= 5 && (
                                     <p className="text-red-600 text-sm mt-1 font-semibold">Only {product.stock} left!</p>
                                )}

                                {/* --- NEW: SIZE SELECTOR --- */}
                                {product.sizes && product.sizes.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-medium text-gray-800 mb-2">Size:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {product.sizes.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`px-4 py-1.5 border rounded-md text-sm font-semibold transition-colors duration-200 ${
                                                        selectedSize === size
                                                            ? 'bg-gray-800 text-white border-gray-800'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-800'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-auto pt-6">
                                <button 
                                    onClick={handleAddToCartFromModal} // --- MODIFIED ---
                                    disabled={product.stock === 0 || (product.sizes && product.sizes.length > 0 && !selectedSize)} // --- MODIFIED ---
                                    className="w-full bg-red-600 text-white font-bold py-3 rounded-md hover:bg-red-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {product.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
                                </button>
                                
                                <div className="flex items-center justify-center space-x-6 mt-4">
                                    <button
                                        onClick={() => toggleWishlistItem(product)}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${isInWishlist ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                                    >
                                        {isInWishlist ? <FaHeart /> : <FiHeart />}
                                        {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                                    </button>
                                    <button
                                        onClick={() => toggleCompareItem(product)}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${isInCompare ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                                    >
                                        <FaBalanceScale />
                                        {isInCompare ? 'In Compare' : 'Add to Compare'}
                                    </button>
                                </div>
                                
                                <Link 
                                    to={`/product/${product.id}`} 
                                    className="block text-center mt-4 text-red-500 hover:underline text-sm font-semibold"
                                    onClick={onClose}
                                >
                                    View Full Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default QuickViewModal;