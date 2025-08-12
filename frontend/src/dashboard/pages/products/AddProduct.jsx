import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlusCircle, FiImage, FiX, FiUploadCloud, FiLink, FiLoader, FiStar } from 'react-icons/fi';
import PageTransition from '../../../components/shared/PageTransition';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext';
import CreatableSelect from 'react-select/creatable';
import MediaSelectionModal from '../../components/MediaSelectionModal';
import AccessDenied from '../../../components/shared/AccessDenied';

// ✅ CORRECTED: Simplified predefined tags. Bestseller & Top Rated are now automated.
const predefinedTags = [
    { value: 'new-collection', label: 'New Collection' },
    { value: 'featured', label: 'Featured Product' }
];
const predefinedSizes = [
    { value: 'S', label: 'S (Small)' },
    { value: 'M', label: 'M (Medium)' },
    { value: 'L', label: 'L (Large)' },
    { value: 'XL', label: 'XL (Extra Large)' },
];

const AddProduct = () => {
    const { addProduct, categories, brands, loading: shopLoading } = useShop();
    const { can, loading: authLoading } = useAuth();
    
    const navigate = useNavigate();
    const [productData, setProductData] = useState({ name: '', gender: '', category: '', childCategory: '', brand: '', price: '', stock: '', description: '', image: '', images: [], tags: [], sizes: [] });
    const [isFeatured, setIsFeatured] = useState(false);
    
    const [subCategories, setSubCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [imageSourceTab, setImageSourceTab] = useState('upload');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (productData.gender && categories[productData.gender]) { setSubCategories(categories[productData.gender]); } else { setSubCategories([]); }
        setChildCategories([]);
    }, [productData.gender, categories]);

    useEffect(() => {
        if (productData.category && subCategories.length > 0) { const selectedSub = subCategories.find(sub => sub.name === productData.category); setChildCategories(selectedSub?.children || []); } else { setChildCategories([]); }
    }, [productData.category, subCategories]);

    useEffect(() => { setImagePreview(productData.image); }, [productData.image]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'gender') { setProductData(prev => ({ ...prev, gender: value, category: '', childCategory: '' })); } else if (name === 'category') { setProductData(prev => ({ ...prev, category: value, childCategory: '' })); } else { setProductData(prev => ({ ...prev, [name]: value })); }
    };
    const handleTagChange = (selectedOptions) => { setProductData(prev => ({...prev, tags: selectedOptions ? selectedOptions.map(opt => opt.value) : [] })); };
    const handleSizeChange = (selectedOptions) => { setProductData(prev => ({...prev, sizes: selectedOptions ? selectedOptions.map(opt => opt.value) : [] })); };
    const handleImageSelectFromLibrary = (imageUrl) => { setProductData(prev => ({ ...prev, image: imageUrl })); setImageUrlInput(imageUrl); setImageSourceTab('url'); };
    const handleImageUrlChange = (e) => { const url = e.target.value; setImageUrlInput(url); setProductData(prev => ({...prev, image: url})); };
    const handleRemoveImage = () => { setProductData(prev => ({ ...prev, image: '' })); setImagePreview(null); setImageUrlInput(''); if (fileInputRef.current) { fileInputRef.current.value = null; } };
    
    const handleImageFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("File is too large! Please select an image under 5MB."); return; }
        setIsUploading(true);
        const toastId = toast.loading("Uploading image to Cloudinary...");
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
            if (!response.ok) { throw new Error(`Upload failed with status: ${response.status}`); }
            const data = await response.json();
            setProductData(prev => ({ ...prev, image: data.secure_url }));
            setImageUrlInput(data.secure_url);
            toast.update(toastId, { render: "Image uploaded successfully!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            toast.update(toastId, { render: "Image upload failed. Please try again.", type: "error", isLoading: false, autoClose: 4000 });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isUploading) { toast.warn("Please wait for the image to finish uploading."); return; }
        if (!productData.image) { toast.error("Please provide a product image."); return; }
        if (!productData.price || !productData.stock) { toast.error("Price and Stock are required."); return; }
        if (!productData.gender || !productData.category) { toast.error("Parent and Sub-Category are required."); return; }
        
        setIsSubmitting(true);

        const finalTags = new Set(productData.tags);
        if (isFeatured) {
            finalTags.add('featured');
        } else {
            finalTags.delete('featured');
        }

        const newProduct = { 
            ...productData, 
            price: parseFloat(productData.price), 
            stock: parseInt(productData.stock, 10), 
            rating: 0, 
            reviewCount: 0,
            images: productData.image ? [productData.image] : [],
            tags: Array.from(finalTags),
        };
        
        const success = await addProduct(newProduct);

        setIsSubmitting(false);

        if (success) {
            navigate('/admin/products/all');
        }
    };
    
    const tabClass = (tabName) => `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${ imageSourceTab === tabName ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300' }`;

    if (authLoading || shopLoading) {
        return (
            <PageTransition>
                <div className="flex justify-center items-center h-64">
                    <FiLoader className="animate-spin text-red-500" size={48} />
                </div>
            </PageTransition>
        );
    }

    if (!can('product_create')) {
        return <AccessDenied permission="product_create" />;
    }

    return (
        <>
            {isMediaModalOpen && (<MediaSelectionModal onSelect={handleImageSelectFromLibrary} onClose={() => setIsMediaModalOpen(false)}/>)}
            <PageTransition>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center"><FiPlusCircle className="mr-2" /> Add New Product</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                             <input type="text" name="name" value={productData.name} onChange={handleChange} placeholder="Product Name" className="w-full p-2 border rounded-md" required />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Parent Category (Gender)</label><select name="gender" value={productData.gender} onChange={handleChange} className="w-full p-2 border rounded-md" required><option value="">Select Parent</option>{Object.keys(categories).map(parent => <option key={parent} value={parent}>{parent}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label><select name="category" value={productData.category} onChange={handleChange} className="w-full p-2 border rounded-md" required disabled={!productData.gender}><option value="">Select Sub-Category</option>{subCategories.map(sub => <option key={sub.name} value={sub.name}>{sub.name}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Child Category</label><select name="childCategory" value={productData.childCategory} onChange={handleChange} className="w-full p-2 border rounded-md" disabled={!productData.category || childCategories.length === 0}><option value="">Select Child Category (Optional)</option>{childCategories.map(child => <option key={child.name} value={child.name}>{child.name}</option>)}</select></div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                    <select name="brand" value={productData.brand} onChange={handleChange} className="w-full p-2 border rounded-md" required>
                                        <option value="">Select Brand</option>
                                        {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2 p-4 border border-gray-200 bg-gray-50 rounded-lg">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <FiStar className="text-yellow-500" />
                                            <div>
                                                <span className="font-bold text-gray-800">Feature this Product</span>
                                                <p className="text-xs text-gray-500">Display this item prominently on the homepage.</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only"
                                                checked={isFeatured}
                                                onChange={(e) => setIsFeatured(e.target.checked)}
                                            />
                                            <div className={`block w-14 h-8 rounded-full transition-colors ${isFeatured ? 'bg-red-600' : 'bg-gray-200'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isFeatured ? 'transform translate-x-full' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descriptive Tags (Optional)</label>
                                    <CreatableSelect isMulti onChange={handleTagChange} options={predefinedTags} placeholder="e.g., New Collection..." classNamePrefix="react-select" />
                                    <p className="text-xs text-gray-500 mt-1">'Bestseller' and 'Top Rated' are added automatically based on performance.</p>
                                </div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Available Sizes (for Stitched items)</label><CreatableSelect isMulti onChange={handleSizeChange} options={predefinedSizes} placeholder="e.g., S, M, L, XL..." classNamePrefix="react-select" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Base Price (Rs)</label><input type="number" name="price" value={productData.price} onChange={handleChange} placeholder="Regular, non-sale price" className="w-full p-2 border rounded-md" required /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label><input type="number" name="stock" value={productData.stock} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                            </div>
                            <textarea name="description" value={productData.description} onChange={handleChange} rows="4" placeholder="Product Description" className="w-full p-2 border rounded-md"></textarea>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                            <div className="flex items-center gap-2 mb-3">
                                <button type="button" onClick={() => setImageSourceTab('upload')} className={tabClass('upload')}>Upload</button>
                                <button type="button" onClick={() => setImageSourceTab('library')} className={tabClass('library')}>Library</button>
                                <button type="button" onClick={() => setImageSourceTab('url')} className={tabClass('url')}>URL</button>
                            </div>
                            {imageSourceTab === 'library' && ( <div className="p-4 border-2 border-dashed rounded-md text-center"><FiImage className="mx-auto h-12 w-12 text-gray-400" /><button type="button" onClick={() => setIsMediaModalOpen(true)} className="mt-2 text-sm font-semibold text-red-600 hover:text-red-500">Choose from Library</button></div>)}
                            {imageSourceTab === 'upload' && (<div className="p-4 border-2 border-dashed rounded-md text-center">{isUploading ? ( <div className="text-gray-500 font-medium">Uploading, please wait...</div> ) : ( <><FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" /><label htmlFor="file-upload" className="mt-2 text-sm font-semibold text-red-600 hover:text-red-500 cursor-pointer"><span>Select a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageFileUpload} accept="image/*" ref={fileInputRef} disabled={isUploading}/></label></> )}</div>)}
                            {imageSourceTab === 'url' && ( <div className="flex rounded-md shadow-sm"><span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"><FiLink /></span><input type="url" value={imageUrlInput} onChange={handleImageUrlChange} placeholder="https://..." className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 sm:text-sm" /></div>)}
                            {imagePreview && (<div className="mt-4 text-center"><p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p><div className="relative group inline-block p-2 border rounded-md"><img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto object-contain" />{!isUploading && <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><FiX size={16} /></button>}</div></div>)}
                        </div>
                    </div>
                    <div className="mt-8 border-t pt-6 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isUploading || isSubmitting} 
                            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                        >
                           {isSubmitting ? <><FiLoader className="animate-spin mr-2"/> Saving...</> : (isUploading ? 'Uploading...' : 'Add Product')}
                        </button>
                    </div>
                </form>
            </PageTransition>
        </>
    );
};
export default AddProduct;