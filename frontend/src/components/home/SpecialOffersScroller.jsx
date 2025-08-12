import React, { useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SpecialOffersColumn } from './SpecialOffersColumn';

export const SpecialOffersScroller = ({ specialOffers }) => {
  const scrollContainerRef = useRef(null);
  const [currentColumn, setCurrentColumn] = useState(0);

  const columns = [];
  for (let i = 0; i < specialOffers.length; i += 8) {
    columns.push(specialOffers.slice(i, i + 8));
  }

  const scrollToColumn = (direction) => {
    const newColumn = direction === 'left' 
      ? Math.max(0, currentColumn - 1)
      : Math.min(columns.length - 1, currentColumn + 1);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: newColumn * scrollContainerRef.current.offsetWidth,
        behavior: 'smooth'
      });
      setCurrentColumn(newColumn);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Special Offers</h3>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => scrollToColumn('left')}
            disabled={currentColumn === 0}
            className={`p-2 rounded-full shadow-md transition-all ${
              currentColumn === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-red-500 hover:bg-red-50 hover:shadow-lg transform hover:scale-110'
            }`}
            aria-label="Previous offers"
          >
            <FaChevronLeft className="text-lg" />
          </button>

          <div className="flex space-x-2">
            {columns.map((_, index) => (
              <span
                key={`indicator-${index}`}
                className={`block h-2 w-2 rounded-full transition-all ${
                  index === currentColumn ? 'bg-red-500 w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={() => scrollToColumn('right')}
            disabled={currentColumn === columns.length - 1}
            className={`p-2 rounded-full shadow-md transition-all ${
              currentColumn === columns.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-red-500 hover:bg-red-50 hover:shadow-lg transform hover:scale-110'
            }`}
            aria-label="Next offers"
          >
            <FaChevronRight className="text-lg" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {columns.map((columnOffers, index) => (
          <div key={`column-${index}`} className="flex-shrink-0 w-full px-1">
            <SpecialOffersColumn 
              offers={columnOffers} 
              columnIndex={index} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};