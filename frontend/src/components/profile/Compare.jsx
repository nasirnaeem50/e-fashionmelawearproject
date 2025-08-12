// frontend/src/components/profile/Compare.jsx

import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductLists } from '../../context/ProductListsContext';
import { CartContext } from '../../context/CartContext';
import { FiArrowLeft, FiTrash2, FiShoppingCart, FiEye } from 'react-icons/fi';
import { FaBalanceScale, FaStar, FaRegStar } from 'react-icons/fa';
import { GiPriceTag } from 'react-icons/gi';
import { MdOutlineDiscount } from 'react-icons/md';
import { BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';
import QuickViewModal from '../shared/QuickViewModal';

const Compare = () => {
    const { compareItems, toggleCompareItem, clearCompareList } = useProductLists();
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const calculateDiscount = (product) => {
        const isSpecialOffer = product.originalPrice && product.originalPrice > product.price;
        if (!isSpecialOffer) return null;
        return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    };

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

    const comparisonAttributes = [
        {
            name: 'Price',
            icon: <GiPriceTag className="inline mr-2" />,
            key: 'price',
            format: (value) => `Rs ${value.toLocaleString()}`
        },
        {
            name: 'Original Price',
            icon: <GiPriceTag className="inline mr-2" />,
            key: 'originalPrice',
            format: (value) => value ? `Rs ${value.toLocaleString()}` : '-',
            show: (product) => product.originalPrice && product.originalPrice > product.price
        },
        {
            name: 'Discount',
            icon: <MdOutlineDiscount className="inline mr-2" />,
            key: null,
            calculate: (product) => {
                const discount = calculateDiscount(product);
                return discount !== null ? `${discount}%` : '-';
            },
            show: (product) => product.originalPrice && product.originalPrice > product.price
        },
        {
            name: 'Rating',
            icon: <FaStar className="inline mr-2 text-yellow-400" />,
            key: 'rating',
            format: (value) => (
                <div className="flex items-center">
                    {[...Array(5)].map((_, i) => 
                        i < Math.round(value) ? 
                        <FaStar key={i} className="text-yellow-400" /> : 
                        <FaRegStar key={i} className="text-gray-300" />
                    )}
                    <span className="ml-1 text-sm">({value ? value.toFixed(1) : '0.0'})</span>
                </div>
            )
        },
        {
            name: 'Reviews',
            key: 'reviewCount',
            format: (value) => `${value || 0} reviews`
        },
        {
            name: 'In Stock',
            key: 'stock',
            format: (stock) => stock > 0 ? 
                <span className="text-green-500 flex items-center"><BsCheckCircleFill className="mr-1" /> Available</span> : 
                <span className="text-red-500 flex items-center"><BsXCircleFill className="mr-1" /> Out of Stock</span>
        }
    ];

    const getProductValue = (product, attribute) => {
        if (attribute.calculate) return attribute.calculate(product);
        
        const keys = attribute.key?.split('.') || [];
        let value = product;
        for (const key of keys) {
            value = value?.[key];
            if (value === undefined) break;
        }
        
        return attribute.format ? attribute.format(value) : value || '-';
    };

    const getVisibleAttributes = () => {
        return comparisonAttributes.filter(attr => {
            if (!attr.show) return true;
            return compareItems.some(product => attr.show(product));
        });
    };

    const handleClearAll = () => {
        clearCompareList();
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
                            <FaBalanceScale className="mr-1 sm:mr-2 text-red-500" size={18} /> 
                            <span className="hidden sm:inline">Product</span> Comparison
                            {compareItems.length > 0 && (
                                <span className="ml-2 text-xs sm:text-sm font-normal bg-gray-100 px-2 py-1 rounded-full">
                                    {compareItems.length} items
                                </span>
                            )}
                        </h1>
                    </div>
                    
                    {compareItems.length > 0 && (
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <button
                                onClick={handleClearAll}
                                className="flex items-center text-red-500 hover:text-red-700 transition-colors text-xs sm:text-sm"
                            >
                                <FiTrash2 className="mr-0 sm:mr-1" size={14} /> 
                                <span className="hidden sm:inline">Clear All</span>
                            </button>
                            <button
                                onClick={() => navigate('/shop')}
                                className="hidden sm:flex items-center bg-red-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded hover:bg-red-600 transition-colors text-xs sm:text-sm"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    )}
                </div>
                
                {compareItems.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
                        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <FaBalanceScale size={24} className="text-gray-400" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-medium mb-1 sm:mb-2">Your comparison list is empty</h2>
                        <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto px-2">
                            Add products to compare their features, prices, and specifications side by side.
                        </p>
                        <button
                            onClick={() => navigate('/shop')}
                            className="inline-flex items-center bg-red-500 text-white text-sm sm:text-base px-4 sm:px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <div className="min-w-full" style={{ minWidth: `${compareItems.length * 220}px` }}>
                                <div className="grid border-b" style={{ 
                                    gridTemplateColumns: `120px repeat(${compareItems.length}, minmax(180px, 1fr))` 
                                }}>
                                    <div className="p-2 sm:p-3 font-medium text-xs sm:text-sm text-gray-500">Products</div>
                                    {compareItems.map(product => {
                                        const discount = calculateDiscount(product);
                                        return (
                                            <div key={product.id} className="border-l p-2 sm:p-3 relative group">
                                                <div className="h-32 sm:h-40 flex items-center justify-center mb-2 sm:mb-3">
                                                    <img 
                                                        src={product.image} 
                                                        alt={product.name} 
                                                        className="max-h-full max-w-full object-contain cursor-pointer"
                                                        onClick={() => navigate(`/product/${product.id}`)}
                                                    />
                                                    {discount !== null && (
                                                        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-500 text-white text-xxs sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded-md z-10">
                                                            {discount}% OFF
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 
                                                    className="font-semibold text-xs sm:text-sm text-gray-800 mb-1 truncate cursor-pointer hover:text-red-500"
                                                    onClick={() => navigate(`/product/${product.id}`)}
                                                >
                                                    {product.name}
                                                </h3>
                                                <div className="text-red-500 font-bold text-sm sm:text-base mb-1 sm:mb-2">
                                                    Rs {product.price.toLocaleString()}
                                                    {discount !== null && product.originalPrice && (
                                                        <span className="text-gray-400 text-xxs sm:text-xs line-through ml-1 sm:ml-2">
                                                            Rs {product.originalPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => toggleCompareItem(product)}
                                                    className="absolute top-1 right-1 sm:top-2 sm:right-2 text-gray-400 hover:text-red-500 bg-white p-0.5 sm:p-1 rounded-full"
                                                    title="Remove from comparison"
                                                >
                                                    <FiTrash2 size={12} className="sm:w-4 sm:h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                {getVisibleAttributes().map((attribute, index) => (
                                    <div 
                                        key={index} 
                                        className="grid border-b hover:bg-gray-50" 
                                        style={{ 
                                            gridTemplateColumns: `120px repeat(${compareItems.length}, minmax(180px, 1fr))` 
                                        }}
                                    >
                                        <div className="p-2 sm:p-3 font-medium text-xs sm:text-sm text-gray-700 flex items-center">
                                            <span className="hidden sm:inline">{attribute.icon || null}</span>
                                            {attribute.name}
                                        </div>
                                        {compareItems.map(product => (
                                            <div key={`${product.id}-${attribute.name}`} className="p-2 sm:p-3 border-l text-xs sm:text-sm">
                                                {getProductValue(product, attribute)}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                <div className="grid" style={{ 
                                    gridTemplateColumns: `120px repeat(${compareItems.length}, minmax(180px, 1fr))` 
                                }}>
                                    <div className="p-2 sm:p-3"></div>
                                    {compareItems.map(product => (
                                        <div key={`actions-${product.id}`} className="p-2 sm:p-3 border-l space-y-1 sm:space-y-2">
                                            <button
                                                onClick={() => navigate(`/product/${product.id}`)}
                                                className="w-full flex items-center justify-center bg-red-500 text-white py-1 sm:py-2 px-2 sm:px-4 rounded hover:bg-red-600 transition-colors text-xs sm:text-sm"
                                            >
                                                <FiEye className="mr-1 sm:mr-2 sm:w-4 sm:h-4" size={12} />
                                                <span className="truncate">View Details</span>
                                            </button>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="w-full flex items-center justify-center border border-red-500 text-red-500 py-1 sm:py-2 px-2 sm:px-4 rounded hover:bg-red-50 transition-colors text-xs sm:text-sm"
                                            >
                                                <FiShoppingCart className="mr-1 sm:mr-2 sm:w-4 sm:h-4" size={12} />
                                                <span className="truncate">Add to Cart</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {compareItems.length > 0 && (
                            <div className="p-2 sm:p-4 border-t sm:hidden">
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors text-sm"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {isModalOpen && selectedProduct && <QuickViewModal product={selectedProduct} onClose={closeModal} />}
        </>
    );
};

export default Compare;