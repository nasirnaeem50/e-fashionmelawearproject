import React from 'react';
import { motion } from 'framer-motion';

const SkeletonCard = () => (
    <div className="p-6 rounded-xl bg-gray-200 animate-pulse">
        <div className="h-5 w-3/4 bg-gray-300 rounded mb-4"></div>
        <div className="h-10 w-1/2 bg-gray-300 rounded"></div>
    </div>
);

const SkeletonListItem = () => (
    <div className="flex items-center p-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gray-300 rounded-lg mr-4"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
            <div className="h-3 w-1/2 bg-gray-300 rounded"></div>
        </div>
        <div className="h-6 w-16 bg-gray-300 rounded"></div>
    </div>
);

const DashboardSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
        >
            {/* Header Skeleton */}
            <div>
                <div className="h-9 w-1/2 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Performance Metrics Skeleton */}
            <div>
                <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
            
            {/* Live Order Status Skeleton */}
            <div>
                <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>

            {/* Recent Activity Skeleton */}
             <div>
                <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-3">
                        <div className="h-5 w-1/3 bg-gray-300 rounded animate-pulse mb-4"></div>
                        {[...Array(5)].map((_, i) => <SkeletonListItem key={i} />)}
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border space-y-3">
                        <div className="h-5 w-1/3 bg-gray-300 rounded animate-pulse mb-4"></div>
                        {[...Array(5)].map((_, i) => <SkeletonListItem key={i} />)}
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

export default DashboardSkeleton;