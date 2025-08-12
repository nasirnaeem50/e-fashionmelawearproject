import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import ProductCard from '../shared/ProductCard';
import { SpecialOffersScroller } from './SpecialOffersScroller';

// A simple skeleton component for this section
const NewCollectionsSkeleton = () => (
    // MODIFIED: Updated grid for a more responsive 4-column layout on medium screens and up.
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full aspect-[4/5] bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
    </div>
);

const NewCollections = () => {
  const { newCollectionProducts, products, loading } = useShop();

  // MODIFIED: Removed .slice(0, 12) to allow all new products to be displayed, enabling auto-increasing rows.
  const newProducts = newCollectionProducts;
  
  const specialOffers = products.filter(p => p.originalPrice && p.originalPrice > p.price);

  return (
    <div className="bg-white py-8 sm:py-12 md:py-16 border-t border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">New Collections</h2>
              <Link to="/shop" className="text-red-500 font-semibold text-sm sm:text-base hover:underline">
                More Products →
              </Link>
            </div>
            {loading ? (
                <NewCollectionsSkeleton />
            ) : newProducts.length > 0 ? (
                // MODIFIED: Updated grid for a more responsive 4-column layout on medium screens and up.
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {newProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                    <p>New arrivals coming soon! Check back later.</p>
                </div>
            )}
          </div>
          
          {!loading && specialOffers.length > 0 && (
             // ✅✅✅ THE FIX IS HERE ✅✅✅
             // We add `lg:self-start` to this column.
             // This tells it to align to the top of the grid row on large screens
             // instead of stretching to match the height of the New Collections grid.
             <div className="lg:col-span-1 lg:self-start">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full">
                  <div className="flex justify-between items-center mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Specials</h2>
                  </div>
                  <SpecialOffersScroller specialOffers={specialOffers} />
                </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewCollections;