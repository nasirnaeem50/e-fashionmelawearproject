import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useCMS } from "../../context/CMSContext";
import { useShop } from "../../context/ShopContext";

const Hero = () => {
  const { content, loading: cmsLoading } = useCMS();
  const { categories, loading: shopLoading } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  const mainBanners = content?.hero?.mainBanners ?? [];
  const sideBanners = content?.hero?.sideBanners ?? [];
  
  useEffect(() => {
    if (sideBanners.length > 1) {
      const slideInterval = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % sideBanners.length);
      }, 5000);
      return () => clearInterval(slideInterval);
    }
  }, [sideBanners.length]);

  if (cmsLoading || shopLoading || !content) {
    return (
        <div className="bg-gray-100">
            <div className="container mx-auto px-4 pt-2 pb-5">
                 <div className="flex flex-col lg:flex-row gap-5" style={{ minHeight: "458px" }}>
                    <div className="w-full lg:w-[250px] bg-white shrink-0 border border-gray-200 hidden lg:block animate-pulse">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 border-b border-gray-300"></div>
                        ))}
                    </div>
                    <div className="flex-1 h-full bg-gray-200 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
  }

  const mainBanner = mainBanners[0] || {};
  const heroCategories = Object.keys(categories).flatMap(parent => 
      categories[parent].map(sub => ({
          name: sub.name,
          link: `/shop?parent=${encodeURIComponent(parent)}&category=${encodeURIComponent(sub.name)}`
      }))
  ).slice(0, 10);

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 pt-2 pb-5">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left Sidebar - DYNAMIC Categories */}
          <div className="w-full lg:w-[250px] bg-white shrink-0 border border-gray-200 hidden lg:block">
            <ul className="divide-y divide-gray-200">
              {heroCategories.map((category, index) => (
                <li key={index}>
                  <Link
                    to={category.link}
                    className="group flex items-center justify-between px-4 py-3 text-gray-800 transition-all duration-300 ease-in-out hover:bg-red-600 hover:text-white hover:pl-6"
                  >
                    <span className="text-sm font-bold">{category.name}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FiChevronRight size={16} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t border-gray-200 text-center">
              <Link
                to="/shop"
                className="font-semibold text-gray-800 text-sm hover:text-red-600 uppercase"
              >
                View All Categories
              </Link>
            </div>
          </div>

          {/* Main Content - Banners */}
          <div className="flex-1" style={{ minHeight: "458px" }}>
            <div className="h-full flex flex-col md:flex-row gap-5">
              {/* Main Banner (Left) - DYNAMIC */}
              <div className="flex-grow h-80 md:h-full relative overflow-hidden group">
                <img
                  src={mainBanner.imageUrl}
                  alt={mainBanner.headline}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = '/images/hero-bg.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-start justify-end p-6 md:p-8">
                  <div className="text-white">
                    <h2 className="text-xl md:text-2xl font-light uppercase tracking-wider">
                      {mainBanner.subheadline}
                    </h2>
                    <p className="text-3xl md:text-4xl font-bold mt-1">
                      {mainBanner.headline}
                    </p>
                    <Link
                      to={mainBanner.link || '#'}
                      className="mt-4 inline-block bg-red-600 text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 transition-colors text-sm uppercase"
                    >
                      {mainBanner.buttonText}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sliding Banner (Right) - DYNAMIC */}
              <div className="w-full md:w-[320px] shrink-0 h-80 md:h-full relative overflow-hidden rounded-md">
                <div
                  className="flex h-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {sideBanners.map((banner, index) => {
                    let finalLink = '#';
                    if (banner.link) {
                      if (banner.link.startsWith('/')) {
                        finalLink = banner.link;
                      } else {
                        finalLink = `/shop?parent=${encodeURIComponent(banner.link)}`;
                      }
                    }

                    return (
                      <div
                        key={index}
                        className="w-full h-full shrink-0 relative group"
                      >
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { e.currentTarget.src = '/images/placeholder-brand.png'; }}
                        />
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="relative z-10 h-full flex flex-col justify-center items-start p-6 text-white">
                          <h3 className="text-xl font-light uppercase">
                            {banner.title}
                          </h3>
                          <p className="mt-1 font-semibold">{banner.subtitle}</p>
                          <Link
                            to={finalLink}
                            className="mt-3 inline-block font-bold py-1 text-xs uppercase tracking-wider border-b-2 border-white/70 hover:border-white transition-all"
                          >
                            {banner.linkLabel}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;