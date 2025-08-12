import React, { useState } from "react";
import { useShop } from '../../context/ShopContext';
import ProductCard from "../shared/ProductCard";
import { FiLoader } from "react-icons/fi";

const FeaturedProductsSkeleton = () => (
    // MODIFIED: Changed lg:grid-cols-4 to md:grid-cols-4 for a more responsive 4-column layout.
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full aspect-[4/5] bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
    </div>
);

const FeaturedProducts = () => {
  const { products, featuredProductsList, loading } = useShop();

  // "Bestsellers" remains the default active tab.
  const [activeTab, setActiveTab] = useState("bestsellers");

  const getProducts = () => {
    switch (activeTab) {
      case "featured":
        // Shows manually curated products, sorted by sales.
        return featuredProductsList;
      
      case "sale": 
        // Shows all products with a discount.
        return products.filter((p) => p.originalPrice && p.originalPrice > p.price);
      
      case "bestsellers":
        // Shows the most sold products.
        return [...products]
            .filter(p => p.sold > 0)
            .sort((a, b) => (b.sold || 0) - (a.sold || 0));
            // MODIFIED: Removed .slice(0, 8) to allow rows to increase automatically.
      
      // ✅✅✅ NEW LOGIC IS HERE ✅✅✅
      case "toprated":
        // Shows products with the highest customer star ratings.
        return [...products]
            .filter(p => p.rating > 0) // Only include products that have been rated.
            .sort((a, b) => (b.rating || 0) - (a.rating || 0)); // Sort by highest rating to lowest.
            // MODIFIED: Removed .slice(0, 8) to allow rows to increase automatically.

      default:
        return featuredProductsList;
    }
  };

  const tabClass = (tabName) =>
    `px-4 py-2 font-semibold border rounded-full cursor-pointer transition-colors duration-300 ${
      activeTab === tabName
        ? "bg-red-500 text-white border-red-500"
        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
    }`;

  const currentProducts = getProducts();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Our Top Picks
        </h2>
        
        {/* ✅ NEW "Top Rated" BUTTON ADDED TO THE UI */}
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => setActiveTab("bestsellers")} className={tabClass("bestsellers")}>Bestsellers</button>
          <button onClick={() => setActiveTab("toprated")} className={tabClass("toprated")}>Top Rated</button>
          <button onClick={() => setActiveTab("featured")} className={tabClass("featured")}>Featured</button>
          <button onClick={() => setActiveTab("sale")} className={tabClass("sale")}>On Sale</button>
        </div>
      </div>
      
      {loading ? (
        <FeaturedProductsSkeleton />
      ) : currentProducts.length > 0 ? (
          // MODIFIED: Changed lg:grid-cols-4 to md:grid-cols-4 for a more responsive 4-column layout.
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={`${activeTab}-${product.id}`} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
              <p>No products to display for this selection.</p>
              {activeTab === 'bestsellers' && <p className="text-sm mt-1">Once products are sold, they will appear here.</p>}
              {activeTab === 'toprated' && <p className="text-sm mt-1">Once customers rate products, they will appear here.</p>}
          </div>
        )}
    </div>
  );
};

export default FeaturedProducts;