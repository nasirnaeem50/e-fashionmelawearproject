const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose'); // ✅ ADDED: Required for advanced database queries
const { parseISO, startOfDay, endOfDay, subDays, format } = require('date-fns');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// --- Reporting Helper Functions ---

// Helper to generate the main sales dashboard data (Existing code - unchanged)
const generateSalesDashboardReport = async (startDate, endDate) => {
    const orders = await Order.find({
        date: { $gte: startDate, $lte: endDate },
        status: { $ne: 'Cancelled' }
    }).populate('orderItems.product', 'category');
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const stats = { totalRevenue, totalOrders, avgOrderValue };
    const salesByDate = {};
    orders.forEach(order => {
        const dateKey = format(new Date(order.date), 'yyyy-MM-dd');
        if (!salesByDate[dateKey]) salesByDate[dateKey] = { sales: 0, orders: 0 };
        salesByDate[dateKey].sales += order.total;
        salesByDate[dateKey].orders += 1;
    });
    const timeDifference = (endDate - startDate) / (1000 * 3600 * 24);
    const daysInRange = Math.round(timeDifference);
    const salesData = [];
    for (let i = 0; i <= daysInRange; i++) {
        const currentDay = subDays(endDate, daysInRange - i);
        const dateKey = format(currentDay, 'yyyy-MM-dd');
        salesData.push({ 
            date: format(currentDay, 'MMM dd'), 
            sales: salesByDate[dateKey]?.sales || 0, 
            orders: salesByDate[dateKey]?.orders || 0 
        });
    }
    const categoryMap = {};
    orders.forEach(order => {
        order.orderItems.forEach(item => {
            const category = item.product?.category || 'Uncategorized';
            categoryMap[category] = (categoryMap[category] || 0) + (item.price * item.quantity);
        });
    });
    const categorySales = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    const productSalesMap = {};
    orders.forEach(order => {
        order.orderItems.forEach(item => {
            const productId = item.product._id.toString();
            if (!productSalesMap[productId]) {
                productSalesMap[productId] = { id: productId, name: item.name, quantity: 0, revenue: 0 };
            }
            productSalesMap[productId].quantity += item.quantity;
            productSalesMap[productId].revenue += item.price * item.quantity;
        });
    });
    const topProducts = Object.values(productSalesMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    return { stats, salesData, categorySales, topProducts };
};

// Helper for wishlist report (Existing code - unchanged)
const generateWishlistReport = async () => {
    const allUsers = await User.find({}).select('wishlist');
    const allWishlistedIds = allUsers.flatMap(user => user.wishlist);
    const productCounts = allWishlistedIds.reduce((acc, productId) => {
        const idStr = productId.toString();
        acc[idStr] = (acc[idStr] || 0) + 1;
        return acc;
    }, {});
    const sortedProductIds = Object.keys(productCounts).sort((a, b) => productCounts[b] - productCounts[a]);
    const products = await Product.find({ '_id': { $in: sortedProductIds } });
    return sortedProductIds.map(productId => {
        const product = products.find(p => p._id.toString() === productId);
        return { product, count: productCounts[productId] };
    }).filter(item => item.product);
};

// ✅ NEW: Helper function to generate the Top Customers (VIPs) report
const generateTopCustomersReport = async (startDate, endDate, limit = 25) => {
    // This is a MongoDB Aggregation Pipeline. It's the most efficient way to do this.
    const topCustomers = await Order.aggregate([
        // Step 1: Filter orders to be within the date range and not cancelled
        {
            $match: {
                date: { $gte: startDate, $lte: endDate },
                status: { $ne: 'Cancelled' }
            }
        },
        // Step 2: Group the orders by the user ID
        {
            $group: {
                _id: '$user', // Group by the 'user' field
                totalSpent: { $sum: '$total' }, // Sum the 'total' of all their orders
                totalOrders: { $sum: 1 } // Count the number of orders
            }
        },
        // Step 3: Sort the results by the total amount spent, descending
        {
            $sort: { totalSpent: -1 }
        },
        // Step 4: Limit the results to the top customers (e.g., top 25)
        {
            $limit: limit
        },
        // Step 5: Fetch the user's details (name, email) for each result
        {
            $lookup: {
                from: 'users', // The name of the users collection
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        // Step 6: Reshape the final output
        {
            $project: {
                _id: 0, // Exclude the default _id field
                userId: '$_id',
                totalSpent: '$totalSpent',
                totalOrders: '$totalOrders',
                name: { $arrayElemAt: ['$userDetails.name', 0] }, // Get the name from the userDetails array
                email: { $arrayElemAt: ['$userDetails.email', 0] } // Get the email
            }
        }
    ]);

    return topCustomers;
};


// --- Main Controller ---

// @desc    Get a specific report based on type
// @route   GET /api/reports?type=sales_dashboard&days=30
// @access  Private/Admin
exports.getReport = asyncHandler(async (req, res, next) => {
    const { type, days = 30, limit = 25 } = req.query; // Default to 30 days if not specified

    let reportData;
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, parseInt(days) - 1));

    switch (type) {
        case 'sales_dashboard':
            reportData = await generateSalesDashboardReport(startDate, endDate);
            break;
        
        case 'wishlist_insights':
            reportData = await generateWishlistReport();
            break;
        
        // ✅ NEW: Added the case for our new customer report
        case 'top_customers':
            reportData = await generateTopCustomersReport(startDate, endDate, parseInt(limit));
            break;

        default:
            return next(new ErrorResponse(`Report type '${type}' is not valid.`, 400));
    }

    res.status(200).json({
        success: true,
        reportType: type,
        data: reportData
    });
});


// @desc    Get insights on most wishlisted products (Existing code - unchanged)
// @route   GET /api/reports/wishlist-insights
// @access  Private/Admin
exports.getWishlistInsights = asyncHandler(async (req, res, next) => {
    const reportData = await generateWishlistReport();
    res.status(200).json({ success: true, data: reportData });
});