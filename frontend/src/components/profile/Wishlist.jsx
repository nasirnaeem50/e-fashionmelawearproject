// frontend/src/components/profile/Wishlist.jsx

import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductLists } from '../../context/ProductListsContext';
import { CartContext } from '../../context/CartContext';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { FaHeart, FaStar } from 'react-icons/fa';
import QuickViewModal from '../shared/QuickViewModal';

const Wishlist = () => {
    const { wishlistItems, toggleWishlistItem } = useProductLists();
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleAddToCart = (product) => {
        if (product.sizes && product.sizes.length > 0) {
            setSelectedProduct(product);
            setIsModalOpen(true);
        } else {
            addToCart(product);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    return (
        <>
            <div className="container mx-auto px-2 sm:px-4 py-4">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center">
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center text-gray-600 hover:text-red-500 mr-2 sm:mr-4 transition-colors"
                        >
                            <FiArrowLeft className="mr-1" size={18} />
                            <span className="hidden xs:inline text-sm sm:text-base">Back</span>
                        </button>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center">
                            <FaHeart className="mr-1 sm:mr-2 text-red-500" size={18} /> 
                            Your Wishlist
                            {wishlistItems.length > 0 && (
                                <span className="ml-2 text-xs sm:text-sm font-normal bg-gray-100 px-2 py-1 rounded-full">
                                    {wishlistItems.length} items
                                </span>
                            )}
                        </h1>
                    </div>
                    
                    {wishlistItems.length > 0 && (
                        <button
                            onClick={() => navigate('/shop')}
                            className="hidden sm:flex items-center bg-red-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded hover:bg-red-600 transition-colors text-xs sm:text-sm"
                        >
                            Continue Shopping
                        </button>
                    )}
                </div>
                
                {wishlistItems.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
                        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <FaHeart size={24} className="text-gray-400" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-medium mb-1 sm:mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto px-2">
                            Save your favorite items here to easily find them later.
                        </p>
                        <button
                            onClick={() => navigate('/shop')}
                            className="inline-flex items-center bg-red-500 text-white text-sm sm:text-base px-4 sm:px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                        {wishlistItems.map(product => {
                            const isSpecialOffer = product.originalPrice && product.originalPrice > product.price;
                            const discount = isSpecialOffer 
                                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                                : null;

                            return (
                                <div key={product.id} className="group bg-white rounded-lg shadow-sm overflow-hidden relative hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                                    {isSpecialOffer && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                                            {discount}% OFF
                                        </div>
                                    )}
                                    <div className="relative overflow-hidden bg-gray-50 flex-grow">
                                        <div 
                                            className="relative h-0 pt-[100%] cursor-pointer"
                                            onClick={() => navigate(`/product/${product.id}`)}
                                        >
                                            <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className="absolute top-0 left-0 w-full h-full object-contain p-4 transition-transform duration-300 ease-in-out group-hover:scale-105" 
                                            />
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleWishlistItem(product);
                                            }}
                                            className="absolute top-2 right-2 text-red-500 bg-white p-1 rounded-full shadow-md"
                                            aria-label="Remove from wishlist"
                                        >
                                            <FaHeart size={16} />
                                        </button>
                                    </div>
                                    <div className="p-3 sm:p-4 text-left">
                                        <h3 
                                            className="text-sm sm:text-base font-semibold text-gray-800 truncate mb-1 cursor-pointer hover:text-red-500"
                                            onClick={() => navigate(`/product/${product.id}`)}
                                        >
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center text-xs sm:text-sm mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar 
                                                    key={i} 
                                                    size={12}
                                                    className={i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'} 
                                                />
                                            ))}
                                            <span className="text-gray-400 ml-1 text-xs">({product.reviewCount})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-base sm:text-lg font-bold text-gray-900">
                                                Rs {product.price.toLocaleString()}
                                            </p>
                                            {isSpecialOffer && (
                                                <p className="text-xs sm:text-sm text-gray-500 line-through">
                                                    Rs {product.originalPrice.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-2 sm:p-3 border-t border-gray-100">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(product);
                                            }}
                                            className="w-full flex items-center justify-center bg-gray-800 text-white font-medium py-2 px-3 rounded-md hover:bg-red-500 transition-colors text-xs sm:text-sm"
                                        >
                                            <FiShoppingCart className="mr-2" size={14} />
                                            ADD TO CART
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {wishlistItems.length > 0 && (
                    <div className="p-2 sm:p-4 mt-4 sm:hidden text-center">
                        <button
                            onClick={() => navigate('/shop')}
                            className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 transition-colors text-sm"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
            {isModalOpen && selectedProduct && <QuickViewModal product={selectedProduct} onClose={closeModal} />}
        </>
    );
};

export default Wishlist;