// frontend/src/dashboard/AdminLayout.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid, FiShoppingBag, FiUsers, FiDollarSign, FiTag, FiFileText, FiMenu, FiX, FiPackage, 
  FiChevronRight, FiGift, FiTruck, FiSettings, FiPlusCircle, FiLogOut, 
  FiUser, FiBell, FiZap, FiSearch, FiHome, FiMail, FiCheckCircle
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { dashboardNavigation, groupNavItems } from './dashboardNavigation.jsx';
import apiClient from '../api';

// This helper hook is unchanged and was part of your original file's logic.
const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

// This helper hook is unchanged and was part of your original file's logic.
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isQuickAddOpen, setQuickAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user, can, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  // Location is no longer needed for the permission refresh logic but is kept for other potential uses
  const location = useLocation();

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const quickAddRef = useRef(null);
  // ✅ ADDED: This ref is required for the new "Smart Polling" logic.
  const permissionsIntervalRef = useRef(null);

  useClickOutside(profileRef, () => setProfileOpen(false));
  useClickOutside(notificationsRef, () => setNotificationsOpen(false));
  useClickOutside(quickAddRef, () => setQuickAddOpen(false));

  // ✅ UPDATED: The old useEffect that fired on every navigation has been replaced
  // with this new, more efficient "Smart Polling" useEffect.
  useEffect(() => {
    // Function to start the periodic refresh
    const startPermissionsCheck = () => {
      // Clear any existing interval before starting a new one
      if (permissionsIntervalRef.current) {
        clearInterval(permissionsIntervalRef.current);
      }
      // Set an interval to refresh user permissions every 3 minutes (180000 ms)
      permissionsIntervalRef.current = setInterval(() => {
        if (refreshUser) {
            console.log('Polling for updated permissions...'); // Optional for debugging
            refreshUser();
        }
      }, 180000); 
    };

    // Function to stop the periodic refresh
    const stopPermissionsCheck = () => {
      if (permissionsIntervalRef.current) {
        clearInterval(permissionsIntervalRef.current);
        permissionsIntervalRef.current = null;
      }
    };
    
    // Event handler for when the tab's visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, stop checking
        stopPermissionsCheck();
      } else {
        // Tab is visible, restart checking
        startPermissionsCheck();
      }
    };

    // Initial check when the component mounts
    if (refreshUser) {
        refreshUser();
    }
    startPermissionsCheck();

    // Add the event listener for tab visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function: runs when the component unmounts
    return () => {
      stopPermissionsCheck(); // Clear the interval
      document.removeEventListener('visibilitychange', handleVisibilityChange); // Remove the listener
    };
  }, [refreshUser]);


  // All the code below is exactly as you provided it, with no stylistic changes.

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const { data } = await apiClient.get('/notifications');
        if (data.success) {
          setNotifications(data.data);
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(intervalId);
  }, [user]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
        try {
            await apiClient.put(`/notifications/${notification._id}`);
            setNotifications(prev => 
                prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    }
    if (notification.link) {
        navigate(notification.link);
    }
    setNotificationsOpen(false);
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
        await apiClient.put('/notifications/mark-all-read');
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    } catch (error) {
        console.error("Failed to mark all as read", error);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const accessibleNavItems = useMemo(() => {
    return dashboardNavigation.filter(item => {
      if (!item.permission || item.permission === 'any') return true;
      return can(item.permission);
    });
  }, [can, user]);

  const groupedNavItems = useMemo(() => groupNavItems(accessibleNavItems), [accessibleNavItems]);

  const SidebarLink = ({ to, icon, text }) => {
    return (
      <NavLink 
        to={to} 
        className={({ isActive }) => 
          `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 group ${
            isActive 
              ? 'bg-red-600 text-white font-semibold shadow-lg' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`
        }
      >
        <span className="mr-3 text-lg">{icon}</span>
        <span className="text-sm">{text}</span>
      </NavLink>
    );
  };
  
  const CollapsibleLink = ({ title, icon, paths, children }) => {
    const location = useLocation();
    const isChildActive = paths.some(path => location.pathname.startsWith(path));
    const [isOpen, setIsOpen] = useState(isChildActive);
    const wasActive = usePrevious(isChildActive);

    useEffect(() => {
      if (!wasActive && isChildActive) {
        setIsOpen(true);
      }
    }, [isChildActive, wasActive]);

    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors duration-200 ${
            isChildActive 
              ? 'text-white' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <div className="flex items-center">
            <span className="mr-3 text-lg">{icon}</span>
            <span className="font-semibold text-sm">{title}</span>
          </div>
          <FiChevronRight 
            size={16} 
            className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} 
          />
        </button>
        {isOpen && (
          <div className="pl-8 pt-1 ml-4 mt-1 border-l-2 border-slate-700/50 space-y-0.5">
            {children}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <>
      <div className="p-4 flex items-center justify-between border-b border-slate-800 h-16">
        <Link to="/admin" className="flex items-center gap-2.5 shrink-0">
          <span className="bg-red-600/20 text-red-400 p-2 rounded-lg">
            <FiSettings size={20} />
          </span>
          <h1 className="text-lg font-semibold text-white tracking-wide">Administrator</h1>
        </Link>
        <button 
          className="lg:hidden text-slate-400 hover:text-white transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <FiX size={24} />
        </button>
      </div>

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {Object.entries(groupedNavItems).map(([parentName, group]) => {
          if (group.items.length === 0) return null;
          if (parentName === 'Home') {
            return group.items.map(item => (
              <SidebarLink key={item.path} to={item.path} icon={item.icon} text={item.name} />
            ));
          }
          return (
            <CollapsibleLink key={parentName} title={parentName} icon={group.icon} paths={group.items.map(i => i.path)}>
              {group.items.map(item => (
                <SidebarLink key={item.path} to={item.path} icon={item.icon} text={item.name} />
              ))}
            </CollapsibleLink>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="space-y-2">
           <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-200"
            >
              <FiHome className="mr-3 text-lg" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-200"
            >
              <FiLogOut className="mr-3 text-lg" />
              <span className="text-sm font-medium">Logout</span>
            </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white z-20 shadow-2xl">
        {sidebarContent}
      </aside>

      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 shadow-xl flex flex-col">
            {sidebarContent}
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200 z-10">
          <button className="lg:hidden text-gray-600 hover:text-gray-800" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={24} />
          </button>
          <div className="flex-1 flex justify-center px-4">
            <form onSubmit={handleSearch} className="w-full max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, orders, pages..."
                  className="w-full h-10 pl-10 pr-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 transition"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center space-x-4">
             <div ref={quickAddRef} className="relative">
              <button onClick={() => setQuickAddOpen(!isQuickAddOpen)} className="h-10 w-10 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-colors">
                <FiPlusCircle size={20} />
              </button>
              {isQuickAddOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border">
                  {can('product_create') && <Link to="/admin/products/add" onClick={() => setQuickAddOpen(false)} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"><FiPackage /> Add Product</Link>}
                  {can('coupon_create') && <Link to="/admin/ecommerce/coupons" onClick={() => setQuickAddOpen(false)} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"><FiGift /> Add Coupon</Link>}
                  {can('campaign_create') && <Link to="/admin/offers/campaigns" onClick={() => setQuickAddOpen(false)} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"><FiZap /> Add Campaign</Link>}
                </div>
              )}
            </div>
            
            <div ref={notificationsRef} className="relative">
              <button onClick={() => setNotificationsOpen(!isNotificationsOpen)} className="h-10 w-10 flex items-center justify-center bg-white text-gray-500 rounded-full hover:bg-gray-100 border relative transition-colors">
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border">
                  <div className="p-3 font-semibold text-sm border-b flex justify-between items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-red-600 font-semibold hover:underline">Mark All as Read</button>}
                  </div>
                  <div className="py-1 max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => handleNotificationClick(notif)}
                          className={`flex items-start gap-3 w-full px-4 py-3 text-sm hover:bg-red-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-red-50/50' : 'text-gray-700'}`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {notif.isRead ? <FiCheckCircle className="text-gray-400" /> : <FiMail className="text-blue-500" />}
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold leading-tight ${!notif.isRead ? 'text-gray-800' : 'text-gray-600'}`}>{notif.title}</p>
                            <p className="leading-tight mt-1">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm text-gray-500 py-6">No new notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div ref={profileRef} className="relative">
              <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center ring-2 ring-offset-2 ring-red-200">
                  <span className="text-lg font-bold text-red-600">{user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}</span>
                </div>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 border">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    <p className="text-xs text-red-600 font-bold capitalize mt-1">{user?.role?.name || user?.role}</p>
                  </div>
                  <div className="py-1"><Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"><FiUser /> My Profile</Link></div>
                  <div className="py-1 border-t"><button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"><FiLogOut /> Logout</button></div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;