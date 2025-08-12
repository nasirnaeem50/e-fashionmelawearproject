// src/components/home/SpecialOffersColumn.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SpecialOfferItem = ({ offer, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="bg-white p-2 sm:p-3 shadow-sm rounded-lg hover:shadow-md transition-all duration-300"
  >
    <Link to={`/product/${offer.id}`} className="flex items-center space-x-2 sm:space-x-3 h-full">
      <motion.img 
        src={offer.image} 
        alt={offer.name}
        // ✅✅✅ THE FIX IS HERE: Changed to `object-contain` ✅✅✅
        // `object-contain` scales the image to fit entirely within the box,
        // ensuring both the top and bottom are always visible.
        className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded flex-shrink-0"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 text-xs leading-tight sm:text-sm">
          {offer.name}
        </h4>
        <div className="flex items-center my-1">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`text-xs ${i < Math.round(offer.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
        <div className="flex flex-col items-start sm:flex-row sm:items-baseline">
          <span className="text-red-500 font-bold text-sm sm:text-base">Rs {offer.price.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through sm:ml-2">Rs {offer.originalPrice.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  </motion.div>
);

// --- Your existing SpecialOffersColumn component (UNCHANGED) ---
export const SpecialOffersColumn = ({ offers, columnIndex }) => (
  <div 
    className="grid grid-cols-2 gap-3 lg:grid-cols-1 w-full px-2"
  >
    {offers.slice(0, 8).map((offer, index) => (
      <SpecialOfferItem 
        key={`${offer.id}-${columnIndex}-${index}`} 
        offer={offer} 
        index={index}
      />
    ))}
  </div>
);