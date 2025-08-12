import React from 'react';
import { FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TopProducts = ({ products }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No sales data available to rank products.
            </div>
        );
    }

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div 
            className="space-y-3"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="visible"
        >
            {products.map((product, index) => (
                <motion.div key={product.id} variants={itemVariants}>
                    <Link to={`/admin/products/edit/${product.id}`} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg overflow-hidden mr-4">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm truncate">{product.name}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                <span className="flex items-center mr-4">
                                    <FiTrendingUp className="mr-1 text-green-500" />
                                    {product.sales} sold
                                </span>
                                <span className="flex items-center">
                                    <FiDollarSign className="mr-1 text-blue-500" />
                                    Rs {product.revenue.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="text-right ml-4">
                            <p className="font-bold text-gray-800 text-sm">Rs {(product.revenue / product.sales).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            <p className="text-xs text-gray-400">Avg. Price</p>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default TopProducts;