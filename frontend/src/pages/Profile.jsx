import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../api'; // <-- ADDED
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/shared/PageTransition';
import { 
    FaArrowLeft, 
    FaBox, 
    FaCheckCircle, 
    FaSpinner, 
    FaTimesCircle, 
    FaTags,
    FaArrowRight
} from 'react-icons/fa';
import { FiSettings } from 'react-icons/fi';

const Profile = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                // Use apiClient for a secure, token-aware API call.
                const { data } = await apiClient.get('/orders/myorders'); // <-- CHANGED
                setMyOrders(data.data || []);
            } catch (error) {
                if (error.response?.status !== 404 && error.response?.status !== 401) {
                    toast.error("Could not fetch your personal order history.");
                }
                setMyOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, [user]);

    const userOrders = useMemo(() => {
        if (!user || !myOrders) return [];
        return [...myOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [user, myOrders]);

    const isSpecialPage = ['/profile/wishlist', '/profile/compare', '/profile/settings'].includes(location.pathname);

    if (!user) {
        return (
            <PageTransition>
                <div className="container mx-auto px-4 py-12 text-center">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center text-gray-600 hover:text-red-500 mb-4 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Home
                    </button>
                    <h2 className="text-2xl font-bold mb-4">Please login to view your profile</h2>
                </div>
            </PageTransition>
        );
    }
    
    const recentOrders = userOrders.slice(0, 3);
    const stats = {
        total: userOrders.length,
        processing: userOrders.filter(o => o.status === 'Processing').length,
        completed: userOrders.filter(o => o.status === 'Delivered').length,
        cancelled: userOrders.filter(o => o.status === 'Cancelled').length,
    };

    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-8">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-600 hover:text-red-500 mb-6 transition-colors"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Home
                </button>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {!isSpecialPage && (
                        <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4 h-fit sticky top-24">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold">{user.name}</h3>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                            </div>
                            <ProfileNav />
                        </div>
                    )}

                    <div className={isSpecialPage ? "w-full" : "flex-1"}>
                        {location.pathname === '/profile' && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.name.split(' ')[0]}!</h2>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4"><FaBox className="text-blue-500 text-2xl"/><div><p className="text-gray-500 text-sm">Total Orders</p><p className="font-bold text-xl">{stats.total}</p></div></div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4"><FaSpinner className="text-yellow-500 text-2xl"/><div><p className="text-gray-500 text-sm">Processing</p><p className="font-bold text-xl">{stats.processing}</p></div></div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4"><FaCheckCircle className="text-green-500 text-2xl"/><div><p className="text-gray-500 text-sm">Completed</p><p className="font-bold text-xl">{stats.completed}</p></div></div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4"><FaTimesCircle className="text-red-500 text-2xl"/><div><p className="text-gray-500 text-sm">Cancelled</p><p className="font-bold text-xl">{stats.cancelled}</p></div></div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
                                    {loading ? (
                                        <p>Loading recent orders...</p>
                                    ) : recentOrders.length > 0 ? (
                                        <div className="space-y-6">
                                            {recentOrders.map(order => {
                                                const totalSavings = (order.campaignDiscount || 0) + (order.couponDiscount || 0);
                                                const visibleItems = order.orderItems.slice(0, 3);
                                                const remainingItems = order.orderItems.length - visibleItems.length;

                                                return (
                                                    <div key={order.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                                                        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                                                            <div><p className="font-bold text-gray-800">Order #{order.id.slice(-6).toUpperCase()}</p><p className="text-sm text-gray-500">Placed on: {new Date(order.date).toLocaleDateString()}</p></div>
                                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                                                        </div>
                                                        <div className="border-t border-b py-4 my-4"><div className="flex items-center space-x-4">{visibleItems.map(item => ( <img key={item.product} src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-md border" />))}{remainingItems > 0 && (<div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">+{remainingItems}</div>)}</div></div>
                                                        <div className="flex flex-wrap justify-between items-end gap-4">
                                                            <div className="text-sm space-y-1">
                                                                {order.couponCode && (<div className="flex items-center gap-2 text-green-600 font-semibold"><FaTags size={14} /><span>Coupon Applied: <strong>{order.couponCode}</strong></span></div>)}
                                                                {totalSavings > 0 && (<p className="font-medium text-gray-600">Total Savings: <span className="text-green-600">Rs {totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>)}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-gray-500">Order Total</p>
                                                                <p className="font-bold text-lg text-gray-800">Rs {order.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t text-right"><Link to={`/profile/orders/${order.id}`} className="text-red-500 font-semibold text-sm hover:underline flex items-center justify-end gap-1">View Details <FaArrowRight size={12} /></Link></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="bg-white p-8 rounded-lg shadow-sm text-center"><p className="text-gray-600">You have no recent orders.</p><p className="text-sm text-gray-500 mt-1">When you place an order, it will appear here.</p><Link to="/shop" className="inline-block mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-semibold">Start Shopping</Link></div>
                                    )}
                                </div>
                            </div>
                        )}
                        <Outlet />
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

// A simple component for the navigation links
const ProfileNav = () => {
    const getNavLinkClass = ({ isActive }) => 
        `flex items-center gap-3 py-2 px-3 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors ${
        isActive ? "bg-red-50 text-red-600 font-semibold" : "text-gray-600"
    }`;

    return (
        <nav className="space-y-1">
            <NavLink to="/profile/orders" className={getNavLinkClass}>
                <FaBox />
                <span>My Orders</span>
            </NavLink>
            <NavLink to="/profile/settings" className={getNavLinkClass}>
                <FiSettings />
                <span>Account Settings</span>
            </NavLink>
        </nav>
    );
};

export default Profile;