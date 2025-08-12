import React, { useState, useMemo } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { FiUploadCloud, FiDownload, FiRefreshCw, FiPlusCircle, FiLoader } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import { usePapaParse } from 'react-papaparse';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../../../api'; // <-- ADDED
import AccessDenied from '../../../components/shared/AccessDenied';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // <-- REMOVED

const CSVManager = () => {
    const { products, refetchProducts, loading: shopLoading } = useShop();
    const { can, loading: authLoading } = useAuth();
    
    const { readString } = usePapaParse();
    const [importedData, setImportedData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                readString(event.target.result, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const validData = results.data.filter(row => row.name && row.price && row.stock);
                        if(validData.length !== results.data.length) {
                             toast.warn("Some rows were skipped due to missing required fields (name, price, stock).");
                        }
                        setImportedData(validData);
                        toast.success(`${validData.length} products parsed from ${file.name}.`);
                    },
                    error: (error) => { toast.error("Error parsing CSV file."); console.error("CSV Parse Error:", error); }
                });
            };
            reader.readAsText(file);
        }
    };
    
    const buildProductDataFromRow = (row) => ({
        name: row.name, gender: row.gender, category: row.category, childCategory: row.childCategory,
        brand: row.brand, price: parseFloat(row.price), stock: parseInt(row.stock, 10),
        description: row.description, image: row.image,
        tags: row.tags ? String(row.tags).split(',').map(t => t.trim()) : [],
        sizes: row.sizes ? String(row.sizes).split(',').map(s => s.trim()) : [],
    });

    const handleAddProducts = async () => {
        if (!can('product_create')) {
            return toast.error("Permission Denied: You cannot add new products.");
        }
        setIsProcessing(true);
        const productsToAdd = importedData.filter(row => !row.id || !products.some(p => p.id === row.id));
        if (productsToAdd.length === 0) { setIsProcessing(false); return toast.info("No new products found in the file to add."); }
        let successCount = 0;
        const toastId = toast.loading(`Adding ${productsToAdd.length} new products...`);
        await Promise.all(productsToAdd.map(async row => {
            const newProductData = buildProductDataFromRow(row);
            // Use apiClient for the post request
            try { await apiClient.post('/products', newProductData); successCount++; } // <-- CHANGED
            catch (err) { console.error("Failed to add product:", row.name, err.response?.data?.error || err.message); }
        }));
        if (successCount > 0) {
            await refetchProducts();
            toast.update(toastId, { render: `${successCount} new products added successfully!`, type: "success", isLoading: false, autoClose: 3000 });
        } else {
            toast.update(toastId, { render: "Failed to add any new products. Check console for errors.", type: "error", isLoading: false, autoClose: 4000 });
        }
        setImportedData([]); setFileName(''); setIsProcessing(false);
    };

    const handleUpdateProducts = async () => {
        if (!can('product_edit')) {
            return toast.error("Permission Denied: You cannot update existing products.");
        }
        setIsProcessing(true);
        const productsToUpdate = importedData.filter(row => row.id && products.some(p => p.id === row.id));
        if (productsToUpdate.length === 0) { setIsProcessing(false); return toast.info("No matching products found in the file to update."); }
        let successCount = 0;
        const toastId = toast.loading(`Updating ${productsToUpdate.length} products...`);
        await Promise.all(productsToUpdate.map(async row => {
            const updateData = buildProductDataFromRow(row);
            // Use apiClient for the put request
            try { await apiClient.put(`/products/${row.id}`, updateData); successCount++; } // <-- CHANGED
            catch (err) { console.error("Failed to update product:", row.name, err.response?.data?.error || err.message); }
        }));
        if (successCount > 0) {
            await refetchProducts();
            toast.update(toastId, { render: `${successCount} products updated successfully!`, type: "success", isLoading: false, autoClose: 3000 });
        } else {
            toast.update(toastId, { render: "Failed to update any products. Check console for errors.", type: "error", isLoading: false, autoClose: 4000 });
        }
        setImportedData([]); setFileName(''); setIsProcessing(false);
    };
    
    const exportableProducts = useMemo(() => {
        return products.map(p => ({ ...p, price: p.originalPrice || p.price, tags: p.tags ? p.tags.join(', ') : '', sizes: p.sizes ? p.sizes.join(', ') : '', }));
    }, [products]);
    
    const headers = [
        { label: "id", key: "id" }, { label: "name", key: "name" }, { label: "gender", key: "gender" },
        { label: "category", key: "category" }, { label: "childCategory", key: "childCategory" },
        { label: "brand", key: "brand" }, { label: "price", key: "price" }, { label: "stock", key: "stock" },
        { label: "description", key: "description" }, { label: "image", key: "image" },
        { label: "tags", key: "tags" }, { label: "sizes", key: "sizes" },
    ];

    if (authLoading || shopLoading) {
        return <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500" /></div>;
    }

    if (!can('product_manage')) {
        return <AccessDenied permission="product_manage" />;
    }

    // The rest of your JSX component is perfect and remains unchanged.
    return (
        <PageTransition>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FiDownload className="mr-2" /> Export Products</h1>
                    <p className="text-gray-600 mb-4 text-sm">Download a CSV file of all products. This format is compatible with the importer, allowing you to bulk edit and re-upload.</p>
                    <CSVLink data={exportableProducts} headers={headers} filename={"products_export.csv"} className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                        <FiDownload className="mr-2" /> Download Products CSV
                    </CSVLink>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FiUploadCloud className="mr-2" /> Import Products</h1>
                    <p className="text-gray-600 mb-4 text-sm">Upload a CSV to add or update products. Required columns: `name`, `price`, `stock`. The `id` column is used for matching existing products to update.</p>
                    <input type="file" accept=".csv" onChange={handleFileUpload} disabled={isProcessing} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"/>
                
                    {importedData.length > 0 && (
                        <div className="mt-6 border-t pt-6">
                            <h2 className="font-semibold mb-2">Import Preview: <span className="text-gray-500 font-normal">{fileName}</span></h2>
                            <div className="overflow-x-auto max-h-60 border rounded-md">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>{Object.keys(importedData[0]).map(key => <th key={key} className="text-left p-2 font-medium">{key}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {importedData.slice(0, 5).map((row, i) => (
                                            <tr key={i} className="border-t">{Object.values(row).map((val, j) => <td key={j} className="p-2 truncate max-w-xs">{String(val) || '-'}</td>)}</tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                                {can('product_create') && (
                                    <button onClick={handleAddProducts} disabled={isProcessing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                                        {isProcessing ? <FiLoader className="animate-spin"/> : <FiPlusCircle />} 
                                        Add New Products Only
                                    </button>
                                )}
                                {can('product_edit') && (
                                    <button onClick={handleUpdateProducts} disabled={isProcessing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-400">
                                        {isProcessing ? <FiLoader className="animate-spin"/> : <FiRefreshCw />} 
                                        Update Existing Products
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                'Add' will import products without an ID or with an ID not in the store. 'Update' will modify products with matching IDs.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default CSVManager;