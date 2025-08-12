import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit, FiImage, FiX, FiUploadCloud, FiLink, FiLoader, FiStar } from 'react-icons/fi';
import PageTransition from '../../../components/shared/PageTransition';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext';
import CreatableSelect from 'react-select/creatable';
import MediaSelectionModal from '../../components/MediaSelectionModal';
import AccessDenied from '../../../components/shared/AccessDenied';

// ✅ CORRECTED: Simplified tags. Bestseller & Top Rated are automated.
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

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, updateProduct, categories, brands, loading: shopLoading } = useShop();
    const { can, loading: authLoading } = useAuth();
    
    const [productData, setProductData] = useState(null);
    const [isFeatured, setIsFeatured] = useState(false);
    const [subCategories, setSubCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [imageSourceTab, setImageSourceTab] = useState('upload');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!shopLoading && products.length > 0) {
            const productToEdit = products.find(p => p.id === id);
            if (productToEdit) {
                const tagsForSelect = productToEdit.tags
                    ? productToEdit.tags.map(tag => ({ value: tag, label: predefinedTags.find(t => t.value === tag)?.label || tag }))
                    : [];
                
                const data = {
                    ...productToEdit,
                    price: productToEdit.originalPrice || productToEdit.price,
                    tags: tagsForSelect,
                    sizes: productToEdit.sizes ? productToEdit.sizes.map(size => ({ value: size, label: predefinedSizes.find(s => s.value === size)?.label || size })) : []
                };
                setProductData(data);
                setIsFeatured(productToEdit.tags?.includes('featured') || false);
                setImageUrlInput(data.image);
                setImagePreview(data.image);
                if (data.gender && categories[data.gender]) {
                    const subs = categories[data.gender];
                    setSubCategories(subs);
                    if(data.category) {
                        const selectedSub = subs.find(s => s.name === data.category);
                        setChildCategories(selectedSub?.children || []);
                    }
                }
            } else {
                toast.error("Product not found!");
                navigate('/admin/products/all');
            }
        }
    }, [id, products, navigate, categories, shopLoading]);

    useEffect(() => {
        if (productData?.gender && categories[productData.gender]) { setSubCategories(categories[productData.gender]); } else { setSubCategories([]); }
    }, [productData?.gender, categories]);

    useEffect(() => {
        if (productData?.category && subCategories.length > 0) { const selectedSub = subCategories.find(sub => sub.name === productData.category); setChildCategories(selectedSub?.children || []); } else { setChildCategories([]); }
    }, [productData?.category, subCategories]);

    useEffect(() => { setImagePreview(productData?.image || null); }, [productData?.image]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'gender') { setProductData(prev => ({ ...prev, gender: value, category: '', childCategory: '' })); } 
        else if (name === 'category') { setProductData(prev => ({ ...prev, category: value, childCategory: '' })); } 
        else { setProductData(prev => ({ ...prev, [name]: value })); }
    };
    
    const handleTagChange = (selectedOptions) => { setProductData(prev => ({ ...prev, tags: selectedOptions || [] })); };
    const handleSizeChange = (selectedOptions) => { setProductData(prev => ({ ...prev, sizes: selectedOptions || [] })); };
    const handleImageSelectFromLibrary = (imageUrl) => { setProductData(prev => ({ ...prev, image: imageUrl })); setImageUrlInput(imageUrl); setImageSourceTab('url'); };
    const handleImageUrlChange = (e) => { const url = e.target.value; setImageUrlInput(url); setProductData(prev => ({...prev, image: url})); };
    
    const handleImageFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("File is too large! Please select an image under 5MB."); return; }
        setIsUploading(true);
        const toastId = toast.loading("Uploading new image...");
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
            if (!response.ok) { throw new Error(`Upload failed with status: ${response.status}`); }
            const data = await response.json();
            const imageUrl = data.secure_url;
            setProductData(prev => ({ ...prev, image: imageUrl }));
            setImageUrlInput(imageUrl);
            toast.update(toastId, { render: "Image uploaded successfully!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            toast.update(toastId, { render: "Image upload failed.", type: "error", isLoading: false, autoClose: 4000 });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isUploading) { toast.warn("Please wait for the image to finish uploading."); return; }
        if (!productData.image) { toast.error("Please provide a product image."); return; }

        const submittedTags = new Set(productData.tags.map(tag => tag.value));
        if (isFeatured) {
            submittedTags.add('featured');
        } else {
            submittedTags.delete('featured');
        }
        
        // Ensure automated tags are not manually saved
        submittedTags.delete('bestseller');
        submittedTags.delete('top-rated');

        const dataToUpdate = {
            ...productData,
            price: parseFloat(productData.price),
            stock: parseInt(productData.stock, 10),
            tags: Array.from(submittedTags),
            sizes: productData.sizes ? productData.sizes.map(size => size.value) : []
        };
        updateProduct(id, dataToUpdate);
        navigate('/admin/products/all');
    };

    if (authLoading || shopLoading || !productData) { 
        return (
            <PageTransition>
                <div className="flex justify-center items-center h-64">
                    <FiLoader className="animate-spin text-red-500" size={48} />
                </div>
            </PageTransition>
        );
    }

    if (!can('product_edit')) {
        return <AccessDenied permission="product_edit" />;
    }
    
    const tabClass = (tabName) => `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${ imageSourceTab === tabName ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300' }`;

    return (
        <>
            {isMediaModalOpen && (<MediaSelectionModal onSelect={handleImageSelectFromLibrary} onClose={() => setIsMediaModalOpen(false)}/>)}
            <PageTransition>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center"><FiEdit className="mr-2" /> Edit Product</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label><input type="text" name="name" value={productData.name} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label><select name="gender" value={productData.gender} onChange={handleChange} className="w-full p-2 border rounded-md" required>{Object.keys(categories).map(parent => <option key={parent} value={parent}>{parent}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label><select name="category" value={productData.category} onChange={handleChange} className="w-full p-2 border rounded-md" required disabled={!productData.gender}>{subCategories.map(sub => <option key={sub.name} value={sub.name}>{sub.name}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Child Category</label><select name="childCategory" value={productData.childCategory || ''} onChange={handleChange} className="w-full p-2 border rounded-md" disabled={!productData.category || childCategories.length === 0}><option value="">Select Child (Optional)</option>{childCategories.map(child => <option key={child.name} value={child.name}>{child.name}</option>)}</select></div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                    <select name="brand" value={productData.brand} onChange={handleChange} className="w-full p-2 border rounded-md" required>
                                        {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-2 p-4 border border-gray-200 bg-gray-50 rounded-lg">
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
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descriptive Tags</label>
                                    <CreatableSelect isMulti value={productData.tags} onChange={handleTagChange} options={predefinedTags} classNamePrefix="react-select" />
                                    <p className="text-xs text-gray-500 mt-1">'Bestseller' and 'Top Rated' are managed automatically.</p>
                                </div>
                                <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label><CreatableSelect isMulti value={productData.sizes} onChange={handleSizeChange} options={predefinedSizes} classNamePrefix="react-select" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Base Price (Rs)</label><input type="number" name="price" value={productData.price} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label><input type="number" name="stock" value={productData.stock} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" value={productData.description} onChange={handleChange} rows="4" className="w-full p-2 border rounded-md"></textarea></div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                            <div className="flex items-center gap-2 mb-3"><button type="button" onClick={() => setImageSourceTab('upload')} className={tabClass('upload')}>Upload</button><button type="button" onClick={() => setImageSourceTab('library')} className={tabClass('library')}>Library</button><button type="button" onClick={() => setImageSourceTab('url')} className={tabClass('url')}>URL</button></div>
                            {imageSourceTab === 'library' && (<div className="p-4 border-2 border-dashed rounded-md text-center"><FiImage className="mx-auto h-12 w-12 text-gray-400" /><button type="button" onClick={() => setIsMediaModalOpen(true)} className="mt-2 text-sm font-semibold text-red-600 hover:text-red-500">Choose from Library</button></div>)}
                            {imageSourceTab === 'upload' && (<div className="p-4 border-2 border-dashed rounded-md text-center">{isUploading ? ( <div className="text-gray-500 font-medium">Uploading...</div> ) : ( <><FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" /><label htmlFor="file-upload" className="mt-2 text-sm font-semibold text-red-600 hover:text-red-500 cursor-pointer"><span>Select a new file</span><input id="file-upload" type="file" className="sr-only" onChange={handleImageFileUpload} accept="image/*" ref={fileInputRef} disabled={isUploading}/></label></> )}</div>)}
                            {imageSourceTab === 'url' && (<div className="flex rounded-md shadow-sm"><span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"><FiLink /></span><input type="url" value={imageUrlInput} onChange={handleImageUrlChange} placeholder="https://..." className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 sm:text-sm" /></div>)}
                            {imagePreview && (<div className="mt-4 text-center"><p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p><div className="relative group inline-block p-2 border rounded-md"><img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto object-contain" /></div></div>)}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4 border-t pt-6">
                        <Link to="/admin/products/all" className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Cancel</Link>
                        <button type="submit" disabled={isUploading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isUploading ? 'Uploading...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </PageTransition>
        </>
    );
};

export default EditProduct;