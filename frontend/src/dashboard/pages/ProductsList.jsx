import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import PageTransition from "../../../components/shared/PageTransition";
import StatCard from "../../../dashboard/components/StatCard";
import { useShop } from "../../../context/ShopContext";
import { useAuth } from "../../../context/AuthContext";
import { FiBox, FiEye, FiTrash2, FiEdit, FiArchive, FiXCircle, FiGift, FiSearch, FiX } from "react-icons/fi";

// --- NEW: Custom hook to read URL query parameters ---
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ProductsList = () => {
  const { products, deleteProduct, categories } = useShop();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const query = useQuery(); // Use the hook

  // --- MODIFIED: Initialize searchTerm from the URL ---
  const [searchTerm, setSearchTerm] = useState(query.get('search') || '');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState('all');

  // --- NEW: useEffect to update search term if URL changes ---
  useEffect(() => {
      setSearchTerm(query.get('search') || '');
  }, [query]);

  const uniqueBrands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products]);
  const allSubCategories = useMemo(() => [...new Set(Object.values(categories).flat().map(sub => sub.name))].sort(), [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchMatch = searchTerm.toLowerCase() === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      
      const brandMatch = filterBrand === '' || product.brand === filterBrand;
      const categoryMatch = filterCategory === '' || product.category === filterCategory;
      const stockMatch = filterStockStatus === 'all' ||
        (filterStockStatus === 'inStock' && product.stock > 0) ||
        (filterStockStatus === 'outOfStock' && product.stock === 0);

      return searchMatch && brandMatch && categoryMatch && stockMatch;
    });
  }, [products, searchTerm, filterBrand, filterCategory, filterStockStatus]);

  const productStats = useMemo(() => {
    const totalProducts = filteredProducts.length;
    const outOfStock = filteredProducts.filter(p => p.stock === 0).length;
    const onSale = filteredProducts.filter(p => p.originalPrice && p.originalPrice > p.price).length;
    const totalStockValue = filteredProducts.reduce((acc, p) => acc + (p.price * p.stock), 0);
    return { totalProducts, outOfStock, onSale, totalStockValue };
  }, [filteredProducts]);

  const handleDelete = (productId, productName) => {
    deleteProduct(productId, productName);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterBrand('');
    setFilterCategory('');
    setFilterStockStatus('all');
    // Also clear the search param from the URL
    navigate('/admin/products/all');
  };

  return (
    <PageTransition>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard icon={<FiBox size={20} />} title="Products in View" value={productStats.totalProducts} color="blue" />
        <StatCard icon={<FiArchive size={20} />} title="Inventory Value" value={`Rs ${productStats.totalStockValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="purple" />
        <StatCard icon={<FiXCircle size={20} />} title="Out of Stock" value={productStats.outOfStock} color="red" />
        <StatCard icon={<FiGift size={20} />} title="On Sale" value={productStats.onSale} color="green" />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" id="search" placeholder="Search by name or brand..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="brand-filter" className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select id="brand-filter" value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
              <option value="">All Brands</option>
              {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select id="category-filter" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
              <option value="">All Categories</option>
              {allSubCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="flex items-end h-full">
            <button onClick={handleResetFilters} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors">
              <FiX /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FiBox className="mr-2" /> Product List
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Image</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Brand</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Stock</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Price</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-2 px-4"><img src={product.image} alt={product.name} className="h-12 w-12 object-cover rounded-md" /></td>
                  <td className="py-2 px-4 font-medium">{product.name}</td>
                  <td className="py-2 px-4">{product.brand}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                  </td>
                  <td className="py-2 px-4">Rs {product.price.toLocaleString()}</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => navigate(`/product/${product.id}`)} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" title="View Product on Site"><FiEye size={16} /></button>
                      <button onClick={() => navigate(`/admin/products/edit/${product.id}`)} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600" title="Edit Product"><FiEdit size={16} /></button>
                      {isAdmin && (<button onClick={() => handleDelete(product.id, product.name)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600" title="Delete Product"><FiTrash2 size={16} /></button>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p className="font-semibold">No products match your search or filters.</p>
              <p className="text-sm mt-1">Try adjusting your criteria or click "Reset".</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ProductsList;