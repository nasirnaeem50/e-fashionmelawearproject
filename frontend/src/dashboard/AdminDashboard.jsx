import React, { useMemo, useState, useEffect, useCallback } from 'react'; // ✅ useCallback added
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { format, subDays, isToday, isThisMonth, isThisYear } from 'date-fns'; // isWithinInterval is no longer needed
import PageTransition from '../components/shared/PageTransition';
import StatCard from './components/StatCard';
import TopProducts from './components/TopProducts';
import SalesActivity from './components/SalesActivity';
import DashboardSkeleton from './components/DashboardSkeleton';
import { useOrders } from '../context/OrderContext';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api';
import { toast } from 'react-toastify';
import { 
    FiShoppingBag, FiDollarSign, FiBox, FiUsers, FiShield,
    FiTruck, FiXCircle, FiCheckCircle, FiTrendingUp, FiAlertTriangle,
    FiCalendar, FiGift, FiArchive, FiClock,
    FiBarChart2, FiFolder, FiFolderPlus, FiLayers, FiMessageSquare,
    FiZap,
} from 'react-icons/fi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard = () => {
    const { orders, loading: ordersLoading } = useOrders();
    const { products, categories, campaigns, coupons, loading: shopLoading } = useShop();
    const { user, can, loading: authLoading } = useAuth();
    
    const [allUsers, setAllUsers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [localLoading, setLocalLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);

    // ✅ NEW: State to hold the fetched report data for the analytics section
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLocalLoading(true);
            const dataPromises = [];
            if (can('user_view')) { dataPromises.push(apiClient.get('/users')); }
            if (can('review_view')) { dataPromises.push(apiClient.get('/reviews')); }
            if (dataPromises.length === 0) { setLocalLoading(false); return; }
            try {
                const results = await Promise.allSettled(dataPromises);
                let userIndex = can('user_view') ? 0 : -1;
                let reviewIndex = can('review_view') ? (can('user_view') ? 1 : 0) : -1;
                if (userIndex !== -1 && results[userIndex].status === 'fulfilled') { setAllUsers(results[userIndex].value.data.data || []); }
                if (reviewIndex !== -1 && results[reviewIndex].status === 'fulfilled') { setReviews(results[reviewIndex].value.data.data || []); }
            } catch (err) { 
                if (err.response?.status !== 401) { toast.error("Could not fetch some dashboard data."); }
                console.error("Dashboard fetch error:", err);
            } finally { 
                setLocalLoading(false); 
            }
        };
        if (!authLoading) { fetchDashboardData(); }
    }, [authLoading, can]);

    // ✅ NEW: useEffect to fetch the sales analytics data from our new efficient endpoint
    const fetchAnalyticsData = useCallback(async () => {
        setAnalyticsLoading(true);
        try {
            const { data } = await apiClient.get(`/reports?type=sales_dashboard&days=${timeRange}`);
            if (data.success) {
                setAnalyticsData(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard analytics:", error);
        } finally {
            setAnalyticsLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);


    const dashboardStats = useMemo(() => {
        // This section is preserved and calculates the top-level stats
        if (shopLoading || ordersLoading || localLoading) return {}; 
        const validOrders = orders.filter(order => order.status !== 'Cancelled');
        const now = new Date();
        const parseDate = (d) => d ? new Date(d) : null;
        const activeCoupons = coupons.filter(c => c.status?.toLowerCase() === 'active' && parseDate(c.endDate) > now).length;
        const activeCampaigns = campaigns.filter(c => (c.status?.toLowerCase() === 'active' || c.isActive) && parseDate(c.endDate || c.duration?.split(' - ')[1]) > now).length;
        return {
            todaySales: validOrders.filter(o => isToday(parseDate(o.date))).reduce((sum, o) => sum + o.total, 0),
            monthSales: validOrders.filter(o => isThisMonth(parseDate(o.date))).reduce((sum, o) => sum + o.total, 0),
            yearSales: validOrders.filter(o => isThisYear(parseDate(o.date))).reduce((sum, o) => sum + o.total, 0),
            allTimeSales: validOrders.reduce((sum, o) => sum + o.total, 0),
            todayOrders: orders.filter(o => isToday(parseDate(o.date))).length,
            monthOrders: orders.filter(o => isThisMonth(parseDate(o.date))).length,
            yearOrders: orders.filter(o => isThisYear(parseDate(o.date))).length,
            allTimeOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'Processing').length,
            inProgressOrders: orders.filter(o => o.status === 'Shipped').length,
            deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
            cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
            totalProducts: products.length,
            inventoryValue: products.reduce((acc, p) => acc + (p.price * p.stock), 0),
            outOfStock: products.filter(p => p.stock === 0).length,
            onSale: products.filter(p => p.originalPrice && p.originalPrice > p.price).length,
            totalCustomers: allUsers.filter(u => u.role?.name === 'user').length,
            totalStaff: allUsers.filter(u => u.role?.name !== 'user').length,
            pendingReviews: reviews.filter(r => r.status === 'pending').length,
            totalParentCategories: Object.keys(categories).length,
            totalSubCategories: Object.values(categories).reduce((sum, subs) => sum + subs.length, 0),
            totalChildCategories: Object.values(categories).flat().reduce((total, sub) => total + (sub.children?.length || 0), 0),
            activeCoupons, activeCampaigns,
        };
    }, [orders, products, reviews, allUsers, categories, coupons, campaigns, ordersLoading, shopLoading, localLoading]);

    const { topProducts: allTimeTopProducts, recentOrders } = useMemo(() => {
        // This section for "All-Time Activity" is also preserved
        if (shopLoading || ordersLoading || !Array.isArray(orders)) return { topProducts: [], recentOrders: [] };
        const validOrders = orders.filter(order => order.status !== 'Cancelled');
        const productSalesMap = validOrders.reduce((acc, order) => {
            order.orderItems?.forEach(item => {
                if (!acc[item.product]) acc[item.product] = { id: item.product, name: item.name, image: item.image, sales: 0, revenue: 0 };
                acc[item.product].sales += item.quantity;
                acc[item.product].revenue += item.price * item.quantity;
            });
            return acc;
        }, {});
        const calculatedTopProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        const calculatedRecentOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(o => ({ 
            id: o.id, orderNumber: o.id.slice(-6), customerName: o.shippingInfo.name, date: o.date, total: o.total, status: o.status, items: o.orderItems
        }));
        return { topProducts: calculatedTopProducts, recentOrders: calculatedRecentOrders };
    }, [orders, products, ordersLoading, shopLoading]);
    
    // ✅ REMOVED: The old, inefficient `timeRangeReportData` useMemo hook is no longer needed.
    // We now use the `analyticsData` state which is fetched from the API.

    const formatValue = (value, prefix = 'Rs ') => `${prefix}${Math.round(value || 0).toLocaleString('en-IN')}`;
    const formatCurrency = (value) => `Rs ${Math.round(value || 0).toLocaleString('en-IN')}`;

    if (authLoading || ordersLoading || shopLoading || localLoading) {
        return <PageTransition><DashboardSkeleton /></PageTransition>;
    }
    
    const sectionVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

    return (
        <PageTransition>
            <motion.div className="space-y-10" variants={sectionVariants} initial="hidden" animate="visible">
                {/* All top-level sections are preserved */ }
                <motion.div variants={itemVariants}><h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name.split(' ')[0]}! 👋</h1><p className="text-gray-500 mt-1">Here's a complete summary of your store's performance.</p></motion.div>
                <motion.div variants={itemVariants}><h2 className="text-xl font-semibold text-gray-700 mb-4">Performance Metrics</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><StatCard to="/admin/reports" icon={<FiDollarSign size={28}/>} title="Today's Revenue" value={formatValue(dashboardStats.todaySales)} color="green" /><StatCard to="/admin/reports" icon={<FiCalendar size={28}/>} title="This Month's Revenue" value={formatValue(dashboardStats.monthSales)} color="green" /><StatCard to="/admin/reports" icon={<FiTrendingUp size={28}/>} title="This Year's Revenue" value={formatValue(dashboardStats.yearSales)} color="green" /><StatCard to="/admin/reports" icon={<FiBarChart2 size={28}/>} title="All-Time Revenue" value={formatValue(dashboardStats.allTimeSales)} color="green" /><StatCard to="/admin/orders/all" icon={<FiShoppingBag size={28}/>} title="Today's Orders" value={dashboardStats.todayOrders || 0} color="blue" /><StatCard to="/admin/orders/all" icon={<FiCalendar size={28}/>} title="This Month's Orders" value={dashboardStats.monthOrders || 0} color="blue" /><StatCard to="/admin/orders/all" icon={<FiTrendingUp size={28}/>} title="This Year's Orders" value={dashboardStats.yearOrders || 0} color="blue" /><StatCard to="/admin/orders/all" icon={<FiBarChart2 size={28}/>} title="All-Time Orders" value={dashboardStats.allTimeOrders || 0} color="blue" /></div></motion.div>
                <motion.div variants={itemVariants}><h2 className="text-xl font-semibold text-gray-700 mb-4">Live Order Status</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><StatCard to="/admin/orders/pending" icon={<FiClock size={24} />} title="Pending Processing" value={dashboardStats.pendingOrders || 0} color="yellow" /><StatCard to="/admin/orders/progress" icon={<FiTruck size={24} />} title="Shipped / In Progress" value={dashboardStats.inProgressOrders || 0} color="purple" /><StatCard to="/admin/orders/delivered" icon={<FiCheckCircle size={24} />} title="Completed" value={dashboardStats.deliveredOrders || 0} color="sky" /><StatCard to="/admin/orders/canceled" icon={<FiXCircle size={24} />} title="Cancelled" value={dashboardStats.cancelledOrders || 0} color="red" /></div></motion.div>
                
                {/* ✅ UPDATED: This entire "Sales Analytics" section now uses the new, efficient `analyticsData` state */}
                <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                        <h2 className="text-xl font-semibold text-gray-700">Sales Analytics</h2>
                        <select onChange={(e) => setTimeRange(Number(e.target.value))} value={timeRange} className="p-2 border rounded-md bg-white shadow-sm focus:ring-red-500 focus:border-red-500">
                            <option value="7">Last 7 Days</option><option value="30">Last 30 Days</option><option value="90">Last 90 Days</option>
                        </select>
                    </div>
                    {analyticsLoading ? (
                        <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg"><DashboardSkeleton /></div>
                    ) : analyticsData && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard icon={<FiDollarSign size={20}/>} title="Total Revenue" value={formatCurrency(analyticsData.stats.totalRevenue)} color="green" />
                                <StatCard icon={<FiShoppingBag size={20}/>} title="Total Orders" value={analyticsData.stats.totalOrders.toLocaleString()} color="blue" />
                                <StatCard icon={<FiTrendingUp size={20}/>} title="Avg. Order Value" value={formatCurrency(analyticsData.stats.avgOrderValue)} color="purple" />
                            </div>
                             <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Sales & Orders Over Time</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analyticsData.salesData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={timeRange > 31 ? Math.floor(timeRange / 7) : 'auto'} />
                                        <YAxis yAxisId="left" tickFormatter={(value) => `Rs ${value / 1000}k`} tick={{ fontSize: 12, fill: '#ef4444' }}/>
                                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#3b82f6' }}/>
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ddd', borderRadius: '0.5rem' }} formatter={(value, name) => name === 'Sales' ? formatCurrency(value) : value} />
                                        <Legend />
                                        <Line yAxisId="left" type="monotone" dataKey="sales" name="Sales" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 8 }} />
                                        <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Sales by Category</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analyticsData.categorySales} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" tickFormatter={(value) => `Rs ${value / 1000}k`} tick={{ fontSize: 12 }} />
                                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                                            <Tooltip formatter={(value) => formatCurrency(value)} cursor={{fill: '#f3f4f6'}} />
                                            <Bar dataKey="value" name="Revenue" fill="#00C49F" barSize={20}>
                                                {analyticsData.categorySales.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Top Selling Products</h3>
                                    <div className="space-y-4">
                                        {analyticsData.topProducts.length > 0 ? analyticsData.topProducts.map(product => (
                                            <div key={product.id} className="flex justify-between items-center text-sm">
                                                <span className="font-medium truncate pr-4 text-gray-700">{product.name}</span>
                                                <div className="flex-shrink-0 text-right">
                                                    <p className="font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                                                    <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                                                </div>
                                            </div>
                                        )) : ( <p className="text-center text-gray-500 py-10">No products sold in this period.</p> )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* All lower sections are preserved */ }
                <motion.div variants={itemVariants}><h2 className="text-xl font-semibold text-gray-700 mb-4">All-Time Activity</h2><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="font-bold text-gray-800 mb-4">Top Selling Products (All Time)</h3><TopProducts products={allTimeTopProducts} /></div><div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="font-bold text-gray-800 mb-4">Latest Orders</h3><SalesActivity orders={recentOrders} /></div></div></motion.div>
                <motion.div variants={itemVariants}><h2 className="text-xl font-semibold text-gray-700 mb-4">Inventory & Catalog</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><StatCard to="/admin/products/all" icon={<FiBox size={24} />} title="Total Products" value={dashboardStats.totalProducts || 0} color="purple" /><StatCard to="/admin/offers/campaigns" icon={<FiGift size={24} />} title="Products on Sale" value={dashboardStats.onSale || 0} color="purple" /><StatCard to="/admin/products/stock-out" icon={<FiArchive size={24} />} title="Out of Stock" value={dashboardStats.outOfStock || 0} color="red" /><StatCard to="/admin/products/all" icon={<FiDollarSign size={24} />} title="Inventory Value" value={formatValue(dashboardStats.inventoryValue)} color="purple" /></div></motion.div>
                <motion.div variants={itemVariants}><h2 className="text-xl font-semibold text-gray-700 mb-4">Site & Community</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"><StatCard to="/admin/customers" icon={<FiUsers size={24} />} title="Total Customers" value={dashboardStats.totalCustomers || 0} color="sky" /><StatCard to="/admin/users" icon={<FiShield size={24} />} title="Total Staff" value={dashboardStats.totalStaff || 0} color="sky" /><StatCard to="/admin/categories" icon={<FiFolder size={24} />} title="Parent Cats" value={dashboardStats.totalParentCategories || 0} color="indigo" /><StatCard to="/admin/categories" icon={<FiFolderPlus size={24} />} title="Sub-Cats" value={dashboardStats.totalSubCategories || 0} color="indigo" /><StatCard to="/admin/categories" icon={<FiLayers size={24} />} title="Child Cats" value={dashboardStats.totalChildCategories || 0} color="indigo" /></div></motion.div>
                <motion.div variants={itemVariants}><h2 className="text-xl font-semibold text-gray-700 mb-4">Marketing & Content</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"><StatCard to="/admin/ecommerce/coupons" icon={<FiGift size={24} />} title="Active Coupons" value={dashboardStats.activeCoupons || 0} color="yellow" /><StatCard to="/admin/offers/campaigns" icon={<FiZap size={24} />} title="Active Campaigns" value={dashboardStats.activeCampaigns || 0} color="yellow" /><StatCard to="/admin/reviews" icon={<FiMessageSquare size={24} />} title="Pending Reviews" value={dashboardStats.pendingReviews || 0} color="red" /></div></motion.div>
            </motion.div>
        </PageTransition>
    );
};

export default AdminDashboard;