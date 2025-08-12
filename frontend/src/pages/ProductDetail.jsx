// pages/ProductDetail.jsx (Complete and Corrected File)

import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api'; // <<<--- ADDED: apiClient for direct fetching
import PageTransition from '../components/shared/PageTransition';
import StarRating from '../components/shared/StarRating';
import { FiLoader, FiHeart, FiPlus, FiMinus, FiTag, FiArchive } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import ProductReviews from '../components/product/ProductReviews';
import ProductCard from '../components/shared/ProductCard';
import { toast } from 'react-toastify';

const ProductDetail = () => {
    const { id } = useParams();
    const { products: productsFromContext } = useShop();
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useAuth();
    
    // <<<--- ✅ FIX: Use local state to manage the product and loading status ---<<<
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                // Fetch the specific product directly. The backend now correctly applies discounts.
                const res = await apiClient.get(`/products/${id}`);
                setProduct(res.data.data);
            } catch (error) {
                console.error("Failed to fetch product:", error);
                setProduct(null); // Set to null if fetch fails
            } finally {
                setLoading(false);
            }
        };

        // First, try a quick lookup in the context for speed.
        const productFromContext = productsFromContext.find(p => p.id === id);
        
        if (productFromContext) {
            setProduct(productFromContext);
            setLoading(false);
        } else {
            // If not in context (e.g., direct navigation), fetch from API.
            fetchProduct();
        }

        // Reset component state when the ID changes
        window.scrollTo(0, 0);
        setSelectedSize(null);
        setQuantity(1);
        setActiveTab('description');

    }, [id, productsFromContext]);

    // This effect updates the image when the local product state is populated
    useEffect(() => {
        if (product) {
            setMainImage(product.image);
        }
    }, [product]);

    // handleAddToCart now uses the reliable local 'product' state.
    const handleAddToCart = () => {
        if (!product) {
            toast.error("Product data is not available. Please try again.");
            return;
        }
        if (product.sizes?.length > 0 && !selectedSize) {
            toast.error(`Please select a size for ${product.name}.`);
            return;
        }
        addToCart(product, selectedSize, quantity);
        toast.success(`${quantity} x "${product.name}" added to cart!`);
    };

    const relatedProducts = useMemo(() => {
        if (!product || !productsFromContext) return [];
        return productsFromContext
            .filter(p => p.id !== product.id && p.category === product.category && p.gender === product.gender)
            .slice(0, 4);
    }, [product, productsFromContext]);

    // Updated loading and "not found" checks
    if (loading) {
        return (<div className="flex justify-center items-center min-h-screen bg-gray-50"><FiLoader className="animate-spin text-red-600" size={48} /></div>);
    }
    
    if (!product) {
        return (
            <PageTransition>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Product Not Found</h2>
                    <p className="text-lg text-gray-600 mb-6">The product you are looking for does not exist or may have been removed.</p>
                    <Link to="/shop" className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg">Go to Shop</Link>
                </div>
            </PageTransition>
        );
    }
    
    // The rest of the JSX remains the same, but now it's guaranteed to have a valid 'product' object.
    const isWishlisted = isInWishlist(product.id);
    const getTabClass = (tabName) => activeTab === tabName ? 'border-red-500 text-red-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
    const salePercentage = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const galleryImages = [product.image, ...(product.galleryImages || [])];

    return (
        <PageTransition>
            <div className="bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <nav className="text-sm text-gray-500 mb-8">
                        <Link to="/" className="hover:text-gray-700">Home</Link>
                        <span className="mx-2">/</span>
                        <Link to={`/shop?parent=${product.gender}`} className="hover:text-gray-700">{product.gender}</Link>
                        <span className="mx-2">/</span>
                        <Link to={`/shop?parent=${product.gender}&category=${product.category}`} className="hover:text-gray-700">{product.category}</Link>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        <div className="w-full max-w-md mx-auto lg:sticky lg:top-28 h-fit">
                            <div className="aspect-[4/5] w-full bg-gray-100 overflow-hidden shadow-sm mb-4">
                                <img src={mainImage} alt={product.name} className="w-full h-full object-cover object-top transition-all duration-300 ease-in-out group-hover:scale-105" />
                            </div>
                            {galleryImages.length > 1 && (
                                <div className="grid grid-cols-5 gap-3">
                                    {galleryImages.map((img, index) => (
                                        <button key={index} onClick={() => setMainImage(img)} className={`aspect-[4/5] bg-gray-100 overflow-hidden transition-all duration-200 ${mainImage === img ? 'ring-2 ring-red-500' : 'hover:opacity-75'}`}>
                                            <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover object-top" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">{product.name}</h1>
                                <Link to={`/shop?brands=${encodeURIComponent(product.brand)}`} className="text-base font-medium text-gray-500 hover:text-gray-800 transition-colors tracking-wide">{product.brand}</Link>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <StarRating rating={product.rating} />
                                <span className="text-gray-600 text-sm font-medium">({product.reviewCount || 0} Reviews)</span>
                            </div>

                            <div className="flex items-baseline gap-4">
                                <span className="text-4xl font-bold text-red-600">Rs {product.price.toLocaleString()}</span>
                                {product.originalPrice && (<span className="text-xl text-gray-400 line-through font-medium">Rs {product.originalPrice.toLocaleString()}</span>)}
                                {salePercentage > 0 && (<span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">{salePercentage}% OFF</span>)}
                            </div>

                            {product.sizes && product.sizes.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold uppercase text-gray-800 tracking-wide">Select Size</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product.sizes.map(size => (<button key={size} onClick={() => setSelectedSize(size)} className={`px-5 py-2.5 border rounded-lg text-sm font-semibold transition-all duration-200 ${selectedSize === size ? 'bg-gray-900 text-white border-gray-900 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-900'}`}>{size}</button>))}
                                    </div>
                                    {selectedSize && (
                                        <p className="text-sm text-gray-600">
                                            Selected: <span className="font-bold text-gray-900">{selectedSize}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t">
                                <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-l-lg"><FiMinus size={18} /></button>
                                    <span className="px-6 py-3 text-lg font-semibold w-16 text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-r-lg"><FiPlus size={18} /></button>
                                </div>
                                <button onClick={handleAddToCart} className="w-full sm:w-auto bg-red-600 text-white font-semibold py-4 px-16 rounded-lg hover:bg-red-700 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg">Add to Cart</button>
                            </div>

                            <div className="flex gap-6 pt-4 border-t">
                                <button onClick={() => toggleWishlist(product.id)} className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-200 ${isWishlisted ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`}>
                                    {isWishlisted ? <FaHeart size={18} /> : <FiHeart size={18} />} 
                                    {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
                                </button>
                            </div>

                            <ul className="text-sm text-gray-600 space-y-2 pt-4 border-t">
                                <li className="flex items-center gap-2"><FiArchive className="text-gray-400" /> <strong>SKU:</strong> {product.id.slice(-8).toUpperCase()}</li>
                                <li className="flex items-center gap-2"><FiTag className="text-gray-400" /> <strong>Category:</strong> {product.category}{product.childCategory && `, ${product.childCategory}`}</li>
                                <li>
                                    <strong className="font-semibold text-gray-700">Availability:</strong> 
                                    <span className={product.stock > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                        {product.stock > 0 ? ` In Stock (${product.stock} items)` : ' Out of Stock'}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 border-t">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px space-x-8" aria-label="Tabs">
                            <button onClick={() => setActiveTab('description')} className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-semibold transition-colors duration-200 ${getTabClass('description')}`}>Description</button>
                            <button onClick={() => setActiveTab('reviews')} className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-semibold transition-colors duration-200 ${getTabClass('reviews')}`}>Reviews ({product.reviewCount || 0})</button>
                            <button onClick={() => setActiveTab('shipping')} className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-semibold transition-colors duration-200 ${getTabClass('shipping')}`}>Shipping & Returns</button>
                        </nav>
                    </div>
                    <div className="py-10">
                        {activeTab === 'description' && (<div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }}></div>)}
                        {activeTab === 'reviews' && (<ProductReviews productId={product.id} />)}
                        {activeTab === 'shipping' && (
                            <div className="prose max-w-none text-gray-700 leading-relaxed">
                                <h4>Shipping Policy</h4>
                                <p>We offer standard shipping across the country. Orders are typically processed within 1-2 business days and delivered within 5-7 business days. Shipping costs are calculated at checkout based on your location.</p>
                                <h4>Return Policy</h4>
                                <p>We want you to be completely satisfied with your purchase. If you're not, you can return most items within 14 days of delivery for a full refund or exchange. Items must be in their original, unworn condition with all tags attached. Please visit our <Link to="/product-returns">Returns Page</Link> for more details and to initiate a return.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="bg-white border-t">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-12">You May Also Like</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {relatedProducts.map(relatedProduct => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </PageTransition>
    );
};

export default ProductDetail;