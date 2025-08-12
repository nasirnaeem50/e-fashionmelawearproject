import React from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, size = 16 }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <FaStar
                    key={i}
                    size={size}
                    className={i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"}
                />
            ))}
        </div>
    );
};

export default StarRating;