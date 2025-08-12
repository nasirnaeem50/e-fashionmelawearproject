import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Link } from 'react-router-dom';

const Brands = () => {
    const { brands, loading } = useShop();

    // The loading skeleton and empty state guard are preserved and correct.
    if (loading) {
        return (
            <div className="bg-white py-16 border-t border-gray-100">
                <div className="container mx-auto px-4 animate-pulse">
                    <div className="h-8 w-1/3 bg-gray-200 rounded-md mx-auto mb-12"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-gray-200 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    
    if (!brands || brands.length === 0) {
        return null;
    }

    return (
        <div id="brands-section" className="bg-white py-16 border-t border-gray-100">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
                    Top Brands
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
                    {brands.map(brand => (
                        <Link
                            key={brand._id}
                            // ✅ FIX: Changed the query parameter from `brand` to `brands` to match the new filtering API.
                            to={`/shop?brands=${encodeURIComponent(brand.name)}`}
                            className="flex flex-col items-center group"
                            title={`Shop ${brand.name}`}
                        >
                            <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 ease-in-out transform group-hover:scale-105 border border-gray-200 group-hover:border-gray-300 overflow-hidden p-5 hover:shadow-lg">
                                <img 
                                    src={brand.logo} 
                                    alt={brand.name} 
                                    className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 object-contain transition-transform duration-300 group-hover:scale-110"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/images/placeholder-brand.png';
                                    }}
                                />
                            </div>
                            <span className="mt-4 text-center text-sm font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                {brand.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Brands;