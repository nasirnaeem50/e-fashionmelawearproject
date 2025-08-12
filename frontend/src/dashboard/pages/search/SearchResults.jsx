import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import PageTransition from '../../../components/shared/PageTransition';
import { useShop } from '../../../context/ShopContext';
import { useOrders } from '../../../context/OrderContext';
import { useAuth } from '../../../context/AuthContext';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../../../api'; // <-- ADDED
import { FiSearch, FiBox, FiShoppingBag, FiUser, FiTag, FiChevronsRight, FiGrid, FiLoader } from 'react-icons/fi';
import { dashboardNavigation } from '../../dashboardNavigation.jsx'; 

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
    const query = useQuery();
    const searchTerm = query.get('q') || '';

    const { products, categories, loading: shopLoading } = useShop();
    const { orders, loading: ordersLoading } = useOrders();
    const { can } = useAuth();

    const [allUsers, setAllUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);

    useEffect(() => {
        const fetchAllUsers = async () => {
            setUsersLoading(true);
            try {
                // Use apiClient to ensure the request is authenticated
                const res = await apiClient.get('/users'); // <-- CHANGED
                setAllUsers(res.data.data || []);
            } catch (err) {
                // The global 401 handler will catch session errors, but we can log others.
                if (err.response?.status !== 401) {
                    console.error("Search results could not fetch user data:", err);
                }
            } finally {
                setUsersLoading(false);
            }
        };
        fetchAllUsers();
    }, []);

    const customers = useMemo(() => allUsers.filter(u => u.role?.name === 'user'), [allUsers]);

    const searchResults = useMemo(() => {
        if (!searchTerm) {
            return { products: [], orders: [], customers: [], categories: [], pages: [] };
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        
        const accessiblePages = dashboardNavigation.filter(page => page.permission === 'any' || can(page.permission));
        const foundPages = accessiblePages.filter(page => 
            page.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseSearchTerm))
        );

        const foundProducts = products.filter(p =>
            p.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            (p.brand && p.brand.toLowerCase().includes(lowerCaseSearchTerm))
        );
        const foundOrders = orders.filter(o =>
            o.id.toLowerCase().includes(lowerCaseSearchTerm) ||
            o.shippingInfo.name.toLowerCase().includes(lowerCaseSearchTerm)
        );
        const foundCustomers = customers.filter(c =>
            c.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            c.email.toLowerCase().includes(lowerCaseSearchTerm)
        );
        const allCategories = Object.entries(categories).flatMap(([parent, subs]) => subs.map(sub => ({ ...sub, parent })));
        const foundCategories = allCategories.filter(cat => 
            cat.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            cat.parent.toLowerCase().includes(lowerCaseSearchTerm)
        );

        return {
            products: foundProducts,
            orders: foundOrders,
            customers: foundCustomers,
            categories: foundCategories,
            pages: foundPages,
        };

    }, [searchTerm, products, orders, customers, categories, can]);

    const totalResults = useMemo(() => Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0), [searchResults]);

    const renderResult = (item, type) => {
        switch (type) {
            case 'page':
                return (
                     <Link key={item.path} to={item.path} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-md text-gray-500">{item.icon}</div>
                        <div className="flex-grow">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.parent ? `${item.parent} > ${item.name}` : 'Dashboard Page'}</p>
                        </div>
                        <FiChevronsRight className="text-gray-400"/>
                    </Link>
                );
            case 'product':
                return ( 
                    <Link key={`prod-${item.id}`} to={`/admin/products/edit/${item.id}`} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-500">Brand: {item.brand} | Price: Rs {item.price.toLocaleString()}</p>
                        </div>
                    </Link> 
                );
            case 'order':
                return ( 
                    <Link key={`order-${item.id}`} to={`/admin/orders/details/${item.id}`} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <FiShoppingBag className="w-12 text-blue-500 flex-shrink-0" size={24} />
                        <div className="flex-grow">
                            <p className="font-semibold">Order #{item.id}</p>
                            <p className="text-sm text-gray-500">Customer: {item.shippingInfo.name} | Total: Rs {item.total.toLocaleString()}</p>
                        </div>
                    </Link> 
                );
            case 'customer':
                return ( 
                    <Link key={`cust-${item.email}`} to="/admin/customers" className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                         <FiUser className="w-12 text-green-500 flex-shrink-0" size={24} />
                        <div className="flex-grow">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.email}</p>
                        </div>
                    </Link> 
                );
            case 'category':
                 return ( 
                    <Link key={`cat-${item.name}`} to={`/admin/categories/sub?parent=${item.parent}`} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <FiTag className="w-12 text-purple-500 flex-shrink-0" size={24} />
                        <div className="flex-grow">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-500">Parent: {item.parent}</p>
                        </div>
                    </Link> 
                );
            default:
                return null;
        }
    };

    const isLoading = shopLoading || ordersLoading || usersLoading;

    if (isLoading) {
        return (
            <PageTransition>
                <div className="flex justify-center items-center h-64">
                    <FiLoader className="animate-spin text-red-500" size={48} />
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FiSearch className="mr-3" />
                    Search Results for "{searchTerm}"
                </h1>
                
                {searchTerm && <p className="text-gray-600">{totalResults} result(s) found.</p>}

                {searchResults.pages.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiGrid /> Pages & Navigation ({searchResults.pages.length})</h2>
                        <div className="space-y-2">{searchResults.pages.map(item => renderResult(item, 'page'))}</div>
                    </div>
                )}

                {searchResults.products.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiBox /> Products ({searchResults.products.length})</h2>
                        <div className="space-y-2">{searchResults.products.map(item => renderResult(item, 'product'))}</div>
                    </div>
                )}
                
                {searchResults.orders.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiShoppingBag /> Orders ({searchResults.orders.length})</h2>
                        <div className="space-y-2">{searchResults.orders.map(item => renderResult(item, 'order'))}</div>
                    </div>
                )}

                {searchResults.customers.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiUser /> Customers ({searchResults.customers.length})</h2>
                        <div className="space-y-2">{searchResults.customers.map(item => renderResult(item, 'customer'))}</div>
                    </div>
                )}

                {searchResults.categories.length > 0 && (
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiTag /> Categories ({searchResults.categories.length})</h2>
                        <div className="space-y-2">{searchResults.categories.map(item => renderResult(item, 'category'))}</div>
                    </div>
                )}

                {totalResults === 0 && searchTerm && (
                    <div className="text-center py-10">
                        <p className="text-gray-500 font-semibold">No results found for your search term.</p>
                        <p className="text-sm text-gray-500 mt-1">Try a different keyword for products, orders, or pages.</p>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default SearchResults;