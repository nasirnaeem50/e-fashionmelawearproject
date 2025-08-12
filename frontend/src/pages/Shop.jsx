import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/shared/ProductCard';
import PageTransition from '../components/shared/PageTransition';
import axios from 'axios';
import { FiFilter, FiChevronDown, FiChevronUp, FiX, FiSearch } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ FIX 1: The helper function is updated to be more robust.
// It will now correctly handle keywords like "women" and match it to the "Women" category.
const getInitialCategoryToggles = (query, categories) => {
    const parent = query.get('parent');
    const category = query.get('category');
    const keyword = (query.get('keyword') || '').toLowerCase(); // Standardize to lowercase
    const toggles = {};

    // Auto-expand based on direct URL parameters (e.g., ?parent=Women)
    if (parent) {
        toggles[parent] = true;
    }
    if (parent && category) {
        toggles[`${parent}-${category}`] = true;
    }

    // Auto-expand if the search keyword is a direct match for a parent category name.
    // This is the key logic that was missing.
    if (keyword) {
        const matchedParent = Object.keys(categories).find(
            p => p.toLowerCase() === keyword
        );
        if (matchedParent) {
            toggles[matchedParent] = true;
        }
    }

    return toggles;
};


const ProductGridSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="w-full animate-pulse">
                <div className="aspect-[4/5] bg-gray-200 rounded-lg"></div>
                <div className="mt-2 h-4 w-3/4 bg-gray-200 rounded-md"></div>
                <div className="mt-1 h-4 w-1/2 bg-gray-200 rounded-md"></div>
            </div>
        ))}
    </div>
);

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const Shop = () => {
    const { categories, brands, loading: contextLoading } = useShop();
    const location = useLocation();
    const navigate = useNavigate();
    const query = useQuery();
    
    const cache = useRef({});

    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const [openSections, setOpenSections] = useState({
        categories: true,
        brands: !!query.get('brands'),
        price: !!query.get('minPrice') || !!query.get('maxPrice'),
    });

    const [openCategoryToggles, setOpenCategoryToggles] = useState(() => getInitialCategoryToggles(query, categories));
    
    useEffect(() => {
        const fetchFilteredProducts = async () => {
            const searchString = location.search;
            if (cache.current[searchString]) {
                const data = cache.current[searchString];
                setProducts(data.data || []);
                setPagination({ ...(data.pagination || {}), totalProducts: data.totalProducts || 0 });
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/products/search${searchString}`);
                const data = res.data;
                cache.current[searchString] = data;
                setProducts(data.data || []);
                setPagination({ ...(data.pagination || {}), totalProducts: data.totalProducts || 0 });
            } catch (error) {
                console.error("Failed to fetch filtered products:", error);
                setProducts([]);
                setPagination({});
            } finally {
                setLoading(false);
            }
        };
        fetchFilteredProducts();
    }, [location.search]);
    
    useEffect(() => {
        // This effect runs whenever the URL or categories data changes.
        // It keeps the sidebar state (which sections are open) in sync.
        const currentQuery = new URLSearchParams(location.search);
        setOpenSections(prev => ({
            ...prev,
            categories: true, 
            brands: !!currentQuery.get('brands'),
            price: !!currentQuery.get('minPrice') || !!currentQuery.get('maxPrice'),
        }));
        // Update individual category toggles based on the URL.
        setOpenCategoryToggles(getInitialCategoryToggles(currentQuery, categories));
    }, [location.search, categories]);


    const updateURLParams = (newParams) => {
        const params = new URLSearchParams(location.search);
        Object.entries(newParams).forEach(([key, value]) => {
            if (value) { params.set(key, value); } else { params.delete(key); }
        });
        if(!newParams.page) params.set('page', '1');
        navigate({ pathname: '/shop', search: params.toString() });
    };

    const handleCategoryChange = (parent, sub = '', child = '') => {
        const params = { parent, category: sub, child };
        const currentParams = new URLSearchParams(); // Start with a fresh URL
        
        // Only add parameters if they have a value
        Object.entries(params).forEach(([key, value]) => {
            if(value) currentParams.set(key, value);
        });
        
        currentParams.set('page', '1');
        navigate({ pathname: '/shop', search: currentParams.toString() });
        
        if (window.innerWidth < 1024) setIsFilterOpen(false);
    };

    const handleToggleCategory = (key) => {
        setOpenCategoryToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleBrandChange = (e) => {
        const { value, checked } = e.target;
        const currentBrands = query.get('brands')?.split(',') || [];
        const newBrands = checked ? [...currentBrands, value] : currentBrands.filter(b => b !== value);
        updateURLParams({ brands: newBrands.length ? newBrands.join(',') : null });
    };
    const handlePriceSubmit = (e) => {
        e.preventDefault();
        const minPrice = e.target.elements.minPrice.value;
        const maxPrice = e.target.elements.maxPrice.value;
        updateURLParams({ minPrice, maxPrice });
    };
    const handleSortChange = (e) => {
        updateURLParams({ sortBy: e.target.value });
    };
    const handlePagination = (page) => {
        updateURLParams({ page });
    };
    const clearFilter = (filterName) => {
        const params = new URLSearchParams(location.search);
        if (Array.isArray(filterName)) {
            filterName.forEach(name => params.delete(name));
        } else {
            params.delete(filterName);
        }
        params.set('page', '1');
        navigate({ pathname: '/shop', search: params.toString() });
    };
    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };
    const isBrandChecked = (brandName) => (query.get('brands') || '').split(',').includes(brandName);

    const sidebar = (
        <div className="p-4 bg-white rounded-lg shadow-sm lg:sticky lg:top-24 space-y-6">
            <div>
                <h3 className="font-bold text-lg mb-2">Categories</h3>
                <div className="space-y-1">
                    <button onClick={() => handleCategoryChange('')} className={`w-full text-left p-2 rounded-md transition-colors ${!query.get('parent') && !query.get('category') && !query.get('keyword') ? 'bg-red-100 font-semibold text-red-700' : 'hover:bg-gray-100'}`}>All Products</button>
                    {Object.keys(categories).map(parent => {
                        // ✅ FIX 2: The highlighting logic is now more robust.
                        // It highlights if the `parent` param matches OR if the `keyword` param matches.
                        const isParentHighlighted = (
                            (query.get('parent') === parent && !query.get('category')) ||
                            (query.get('keyword')?.toLowerCase() === parent.toLowerCase() && !query.get('parent'))
                        );
                        
                        return (
                            <div key={parent}>
                                <div className={`flex justify-between items-center rounded-md transition-colors ${isParentHighlighted ? 'bg-red-100' : ''}`}>
                                    <button onClick={() => handleCategoryChange(parent)} className={`flex-grow text-left p-2 font-semibold ${isParentHighlighted ? 'text-red-700' : 'hover:bg-gray-100'}`}>{parent}</button>
                                    <button onClick={() => handleToggleCategory(parent)} className={`p-2 ${isParentHighlighted ? 'text-red-700' : 'text-gray-500 hover:bg-gray-200'} rounded-md`}>
                                        {openCategoryToggles[parent] ? <FiChevronUp size={16}/> : <FiChevronDown size={16}/>}
                                    </button>
                                </div>
                                {openCategoryToggles[parent] && (
                                    <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-200">
                                        {categories[parent].map(sub => {
                                            const subKey = `${parent}-${sub.name}`;
                                            const isSubHighlighted = query.get('category') === sub.name;
                                            const hasChildren = sub.children && sub.children.length > 0;
                                            return (
                                                <div key={sub.name}>
                                                    <div className={`flex justify-between items-center rounded-md transition-colors ${isSubHighlighted ? 'bg-red-100' : ''}`}>
                                                        <button onClick={() => handleCategoryChange(parent, sub.name)} className={`flex-grow text-left p-2 text-sm ${isSubHighlighted ? 'font-semibold text-red-700' : 'hover:bg-gray-100'}`}>{sub.name}</button>
                                                        {hasChildren && (
                                                            <button onClick={() => handleToggleCategory(subKey)} className={`p-2 ${isSubHighlighted ? 'text-red-700' : 'text-gray-500 hover:bg-gray-200'} rounded-md`}>
                                                                {openCategoryToggles[subKey] ? <FiChevronUp size={16}/> : <FiChevronDown size={16}/>}
                                                            </button>
                                                        )}
                                                    </div>
                                                    {hasChildren && openCategoryToggles[subKey] && (
                                                      <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-200">
                                                          {sub.children.map(child => (
                                                              <button key={child.name} onClick={() => handleCategoryChange(parent, sub.name, child.name)} className={`w-full text-left p-2 text-xs rounded-md transition-colors ${query.get('child') === child.name ? 'bg-red-100 font-semibold text-red-700' : 'hover:bg-gray-100'}`}>{child.name}</button>
                                                          ))}
                                                      </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            <div>
                 <button onClick={() => toggleSection('brands')} className="w-full flex justify-between items-center font-bold text-lg">Brands {openSections.brands ? <FiChevronUp/> : <FiChevronDown/>}</button>
                {openSections.brands && (
                    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                        {brands.map(brand => (
                            <label key={brand._id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                <input type="checkbox" value={brand.name} checked={isBrandChecked(brand.name)} onChange={handleBrandChange} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                                <span className="text-sm">{brand.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
            <div>
                 <button onClick={() => toggleSection('price')} className="w-full flex justify-between items-center font-bold text-lg">Price Range {openSections.price ? <FiChevronUp/> : <FiChevronDown/>}</button>
                {openSections.price && (<form onSubmit={handlePriceSubmit} className="mt-4 space-y-3"><div className="flex items-center gap-2"><input type="number" name="minPrice" defaultValue={query.get('minPrice') || ''} placeholder="Min" className="w-full p-2 border rounded-md text-sm" /><span className="text-gray-500">-</span><input type="number" name="maxPrice" defaultValue={query.get('maxPrice') || ''} placeholder="Max" className="w-full p-2 border rounded-md text-sm" /></div><button type="submit" className="w-full bg-red-600 text-white p-2 rounded-md text-sm font-semibold hover:bg-red-700">Apply Price</button></form>)}
            </div>
        </div>
    );
    
    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="hidden lg:block lg:col-span-1">{sidebar}</aside>
                    <div className={`fixed inset-0 z-40 lg:hidden transition-opacity ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsFilterOpen(false)}><div className="absolute inset-0 bg-black/50"></div></div>
                    <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-50 z-50 transform transition-transform duration-300 lg:hidden ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>{sidebar}</aside>
                     <main className="lg:col-span-3">
                         <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                             <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="lg:hidden flex items-center gap-2 p-2 border rounded-md"><FiFilter/> Filters</button>
                             <p className="text-gray-600 hidden sm:block">{!loading ? `${pagination.totalProducts || 0} products found` : 'Searching...'}</p>
                             <div><select value={query.get('sortBy') || 'default'} onChange={handleSortChange} className="border-gray-300 rounded-md shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"><option value="default">Sort by Relevance</option><option value="latest">Sort by Latest</option><option value="price-asc">Sort by Price: Low to High</option><option value="price-desc">Sort by Price: High to Low</option></select></div>
                         </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {query.get('keyword') && (<div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-2">Showing results for: "{query.get('keyword')}"<button onClick={() => clearFilter('keyword')}><FiX/></button></div>)}
                            {query.get('brands') && (<div className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-2">Brands applied<button onClick={() => clearFilter('brands')}><FiX/></button></div>)}
                            {(query.get('minPrice') || query.get('maxPrice')) && (<div className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-2">Price applied<button onClick={() => clearFilter(['minPrice', 'maxPrice'])}><FiX/></button></div>)}
                        </div>

                         {loading || contextLoading ? (
                            <ProductGridSkeleton />
                         ) : products.length === 0 ? (
                             <div className="bg-white p-8 rounded-lg shadow-sm text-center"><FiSearch size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3><p className="text-gray-600">We couldn't find anything matching your filters. Try a different selection or clear the filters.</p></div>
                         ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">{products.map(product => (<ProductCard key={product.id} product={product} />))}</div>
                                {pagination.totalPages > 1 && (<div className="flex justify-center items-center mt-10 gap-2"><button onClick={() => handlePagination(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="px-4 py-2 border rounded-md disabled:opacity-50">Previous</button><span className="text-gray-700">Page {pagination.currentPage} of {pagination.totalPages}</span><button onClick={() => handlePagination(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="px-4 py-2 border rounded-md disabled:opacity-50">Next</button></div>)}
                            </>
                         )}
                     </main>
                 </div>
             </div>
         </PageTransition>
     );
 };

 export default Shop;