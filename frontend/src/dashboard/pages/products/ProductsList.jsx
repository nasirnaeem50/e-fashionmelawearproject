import React, { useState, useEffect, useCallback } from "react"; // ✅ ADDED useState, useEffect, useCallback
import { useNavigate } from "react-router-dom";
import PageTransition from "../../../components/shared/PageTransition";
import { useShop } from "../../../context/ShopContext";
import { useAuth } from "../../../context/AuthContext";
import { FiBox, FiEye, FiTrash2, FiEdit, FiLoader, FiChevronLeft, FiChevronRight } from "react-icons/fi"; // ✅ ADDED Icons
import AccessDenied from "../../../components/shared/AccessDenied";
import apiClient from "../../../api"; // ✅ ADDED apiClient
import { toast } from "react-toastify"; // ✅ ADDED toast for error handling

const ProductsList = () => {
  const { deleteProduct } = useShop(); // We only need the delete action from the context now
  const { can, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // --- ✅ ADDED: State management for this component's data ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(10); // Or any default page size you want

  // --- ✅ ADDED: useCallback for fetching data ---
  const fetchProducts = useCallback(async (currentPage) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/products?page=${currentPage}&limit=${limit}&sort=-createdAt`);
      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination || {});
        setTotalProducts(data.total || 0);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error("Failed to fetch products.");
      }
      console.error("Failed to fetch products list:", error);
    } finally {
      setLoading(false);
    }
  }, [limit]); // Dependency array

  // --- ✅ ADDED: useEffect to fetch data when the page changes ---
  useEffect(() => {
    if (can('product_view')) {
      fetchProducts(page);
    }
  }, [page, can, fetchProducts]);
  
  // The deleteProduct function in the context is already permission-aware
  const handleDelete = async (productId, productName) => {
    // After deletion, we should refetch the data for the current page
    await deleteProduct(productId, productName);
    fetchProducts(page);
  };
  
  // --- ✅ ADDED: Pagination navigation functions ---
  const handleNextPage = () => {
    if (pagination.next) {
      setPage(pagination.next.page);
    }
  };

  const handlePrevPage = () => {
    if (pagination.prev) {
      setPage(pagination.prev.page);
    }
  };

  // --- Page Guards ---
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-4xl text-red-500" />
      </div>
    );
  }

  if (!can('product_view')) {
    return <AccessDenied permission="product_view" />;
  }

  return (
    <PageTransition>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FiBox className="mr-2" /> All Products
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                        <FiLoader className="animate-spin" size={20} />
                        <span>Loading Products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <img src={product.image} alt={product.name} className="h-12 w-12 object-cover rounded-md"/>
                    </td>
                    <td className="py-2 px-4 font-medium">{product.name}</td>
                    <td className="py-2 px-4">{product.brand}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${ product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </span>
                    </td>
                    <td className="py-2 px-4">Rs {product.price.toLocaleString()}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => navigate(`/product/${product.id}`)} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" title="View Product on Site"><FiEye size={16} /></button>
                        {can('product_edit') && (
                          <button onClick={() => navigate(`/admin/products/edit/${product.id}`)} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600" title="Edit Product"><FiEdit size={16} /></button>
                        )}
                        {can('product_delete') && (
                          <button onClick={() => handleDelete(product.id, product.name)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600" title="Delete Product"><FiTrash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* --- ✅ ADDED: Pagination Controls --- */}
        {totalProducts > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Showing {products.length} of {totalProducts} products
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrevPage} 
                disabled={!pagination.prev}
                className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium">
                Page {page}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={!pagination.next}
                className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
};

export default ProductsList;