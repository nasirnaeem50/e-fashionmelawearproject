// frontend/src/components/home/ShopByCategories.jsx

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useShop } from '../../context/ShopContext';

import 'swiper/css';
import 'swiper/css/navigation';

// --- MODIFIED: CategoryCard now has a dynamic link builder ---
const CategoryCard = ({ category }) => {
  const generateLink = () => {
    // If it's a child category, include all three params in the URL
    if (category.isChild) {
      return `/shop?parent=${encodeURIComponent(category.parent)}&category=${encodeURIComponent(category.subCategoryName)}&child=${encodeURIComponent(category.name)}`;
    }
    // Otherwise, it's a sub-category, so use the original two-param link format
    return `/shop?parent=${encodeURIComponent(category.parent)}&category=${encodeURIComponent(category.name)}`;
  };

  return (
    <Link
      to={generateLink()}
      className="block text-center group/slide"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover object-top transition-transform duration-300 ease-in-out group-hover/slide:scale-105"
          onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent
                     transform -translate-x-full transition-transform duration-700 ease-in-out
                     group-hover/slide:translate-x-full"
        ></div>
      </div>
      
      <h3 className="font-semibold text-gray-800 text-base sm:text-lg mt-4 uppercase tracking-wider">
        {category.name}
      </h3>
    </Link>
  );
};

// --- This skeleton component is UNCHANGED ---
const CategoriesSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full">
                <div className="aspect-[4/5] bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
            </div>
        ))}
    </div>
);


const ShopByCategories = () => {
  const { categories, loading } = useShop();

  // --- MODIFIED: This hook now flattens Sub-Categories AND Child-Categories into one list ---
  const allDisplayCategories = useMemo(() => {
    // Start by getting all parent categories (e.g., 'men', 'women')
    return Object.entries(categories).flatMap(([parentName, subCategories]) => {
      
      // For each parent, go through its sub-categories (e.g., 'summer collection')
      return subCategories.flatMap(sub => {
        
        // First, create the object for the sub-category itself
        const subCategoryObject = { 
          ...sub, 
          parent: parentName, 
          isChild: false, 
          uniqueKey: `${parentName}-${sub.name}` 
        };

        // Then, create objects for all of its children (if any)
        const childCategoryObjects = (sub.children || []).map(child => ({
          ...child,
          parent: parentName,
          subCategoryName: sub.name, // We need the sub-category name for the URL
          isChild: true,
          uniqueKey: `${parentName}-${sub.name}-${child.name}`
        }));

        // Return a new array containing the sub-category first, followed by all its children
        // The flatMap will combine all these little arrays into one big one.
        return [subCategoryObject, ...childCategoryObjects];
      });
    });
  }, [categories]);

  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Shop by Categories
      </h2>
      
      {loading ? (
        <CategoriesSkeleton />
      ) : (
        <div className="relative group">
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              breakpoints={{
                320: { slidesPerView: 2, spaceBetween: 15 },
                640: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 30 },
                1280: { slidesPerView: 5, spaceBetween: 30 },
              }}
              className="mySwiper"
            >
              {/* --- MODIFIED: We now map over the new combined list --- */}
              {allDisplayCategories.map((category) => (
                <SwiperSlide key={category.uniqueKey}>
                  <CategoryCard category={category} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            <div className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-2 lg:-left-4 z-10 cursor-pointer bg-white/80 rounded-full shadow-lg w-10 h-10 flex items-center justify-center backdrop-blur-sm opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white">
              <FiChevronLeft className="h-6 w-6 text-gray-800" />
            </div>
            <div className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-2 lg:-right-4 z-10 cursor-pointer bg-white/80 rounded-full shadow-lg w-10 h-10 flex items-center justify-center backdrop-blur-sm opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white">
              <FiChevronRight className="h-6 w-6 text-gray-800" />
            </div>
        </div>
      )}
    </div>
  );
};

export default ShopByCategories;