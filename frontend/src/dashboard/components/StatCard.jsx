import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const StatCard = ({ icon, title, value, color = 'sky', trend, className, to, ...rest }) => {
  
  const colorClasses = {
    green: { from: 'from-emerald-500', to: 'to-green-600' },
    blue: { from: 'from-blue-500', to: 'to-indigo-600' },
    red: { from: 'from-red-500', to: 'to-rose-600' },
    sky: { from: 'from-sky-500', to: 'to-cyan-600' },
    purple: { from: 'from-purple-500', to: 'to-violet-600' },
    yellow: { from: 'from-amber-500', to: 'to-orange-600' },
    indigo: { from: 'from-indigo-500', to: 'to-fuchsia-600' },
  };

  const selectedColor = colorClasses[color] || colorClasses.sky;

  const renderTrend = () => {
    if (!trend) return null;

    const isPositive = trend.startsWith('+');
    const TrendIcon = isPositive ? FiTrendingUp : FiTrendingDown;

    return (
      <div className="flex items-center text-sm font-medium text-white/80">
        <TrendIcon className="mr-1 h-4 w-4" />
        <span>{trend}</span>
      </div>
    );
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const CardInner = (
    <motion.div
      variants={cardVariants}
      className={`relative p-6 rounded-xl shadow-lg text-white overflow-hidden transition-all duration-300 ease-in-out bg-gradient-to-br ${selectedColor.from} ${selectedColor.to} ${className}`}
      whileHover={{ scale: 1.03, y: -5, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      {...rest}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start">
            <p className="text-base font-medium opacity-80">{title}</p>
            <div className="text-white/80">
                {icon}
            </div>
        </div>
        
        <div className="mt-2 flex items-baseline space-x-2">
            <p className="text-4xl font-bold">{value}</p>
            {renderTrend()}
        </div>
      </div>
       <div className={`absolute -bottom-10 -right-10 w-28 h-28 ${selectedColor.to} opacity-20 rounded-full`}></div>
    </motion.div>
  );

  if (to) {
    return (
        <Link to={to}>
            {CardInner}
        </Link>
    );
  }

  return CardInner;
};

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.oneOf(['green', 'blue', 'red', 'sky', 'purple', 'yellow', 'indigo']),
  trend: PropTypes.string,
  className: PropTypes.string,
  to: PropTypes.string,
};

export default StatCard;