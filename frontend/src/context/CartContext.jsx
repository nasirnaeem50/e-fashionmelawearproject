import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const TAX_RATE_KEY = 'eFashionGeneralTaxRate';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();

    const [cartItems, setCartItems] = useState([]);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [taxAmount, setTaxAmount] = useState(0);
    const [loading, setLoading] = useState(true);

    const syncCartState = (cartData) => {
        setCartItems(cartData.items || []);
        setAppliedCoupon(cartData.appliedCoupon || null);
        setSubtotal(cartData.subtotal || 0);
        setDiscountAmount(cartData.discountAmount || 0);
    };

    const fetchCart = useCallback(async () => {
        if (!user) {
            syncCartState({});
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data } = await apiClient.get('/cart');
            syncCartState(data.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error("Failed to sync cart with server.");
            }
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    useEffect(() => {
        const taxableTotal = subtotal - discountAmount;
        const taxRate = parseFloat(localStorage.getItem(TAX_RATE_KEY) || '17');
        setTaxAmount(taxableTotal > 0 && taxRate > 0 ? taxableTotal * (taxRate / 100) : 0);
    }, [subtotal, discountAmount]);

    // ✅ FIX 3: Updated function signature to accept quantity
    const addToCart = async (product, selectedSize, quantity = 1) => {
        if (!user) { 
            toast.error("Please log in to add items to your cart."); 
            return; 
        }
        
        if (!product || !product.id) {
            toast.error("Cannot add item to cart: Invalid product data.");
            console.error("addToCart called with invalid product:", product);
            return;
        }

        if (product.sizes?.length > 0 && !selectedSize) { 
            toast.error(`Please select a size for ${product.name}.`); 
            return; 
        }
        
        const cartItemId = selectedSize ? `${product.id}-${selectedSize}` : product.id;
        
        // ✅ FIX 4: Improved logic - if item exists, update its quantity instead of returning
        const existingItem = cartItems.find(item => item.cartItemId === cartItemId);
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            await updateQuantity(cartItemId, newQuantity);
            // We no longer show a toast here, as the ProductDetail page now shows its own toast
            return;
        }
        
        try {
            const newItemPayload = {
                product: product.id,
                name: product.name,
                image: product.image,
                price: product.price,
                originalPrice: product.originalPrice || product.price,
                selectedSize: selectedSize || null,
                cartItemId: cartItemId,
                quantity: quantity // ✅ FIX 5: Use the passed quantity
            };

            const { data } = await apiClient.post('/cart', newItemPayload);
            syncCartState(data.data);
            // The toast is now handled on the page that calls this function for more specific feedback

        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Could not add item to cart.");
                fetchCart();
            }
        }
    };

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (!user) return;
        try {
            const { data } = await apiClient.put(`/cart/item/${cartItemId}`, { quantity: newQuantity });
            syncCartState(data.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Could not update item quantity.");
                fetchCart();
            }
        }
    };
    
    const increaseQuantity = (cartItem) => {
        updateQuantity(cartItem.cartItemId, cartItem.quantity + 1);
    };

    const decreaseQuantity = (cartItem) => {
        if (cartItem.quantity > 1) {
            updateQuantity(cartItem.cartItemId, cartItem.quantity - 1);
        } else {
            removeFromCart(cartItem);
        }
    };

    const removeFromCart = async (cartItem) => {
        if (!user) return;
        try {
            const { data } = await apiClient.delete(`/cart/item/${cartItem.cartItemId}`);
            syncCartState(data.data);
            toast.warn(`${cartItem.name} removed from cart.`);
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Could not remove item.");
                fetchCart();
            }
        }
    };

    const clearCart = async () => {
        if (!user) return;
        try {
            const { data } = await apiClient.delete('/cart');
            syncCartState(data.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Could not clear the cart.");
            }
        }
    };
    
    const applyCoupon = async (couponCode) => {
        if (!couponCode.trim()) return;
        setLoading(true);
        try {
            const { data } = await apiClient.post('/cart/coupon', { couponCode });
            syncCartState(data.data);
            toast.success("Coupon applied successfully!");
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Failed to apply coupon.");
            }
        } finally {
            setLoading(false);
        }
    };

    const removeCoupon = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.delete('/cart/coupon');
            syncCartState(data.data);
            toast.info("Coupon has been removed.");
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Could not remove coupon.");
            }
        } finally {
            setLoading(false);
        }
    };

    const value = {
        cartItems, 
        loading, 
        addToCart, 
        increaseQuantity,
        decreaseQuantity,
        removeFromCart, 
        clearCart,
        getCartTotal: () => subtotal,
        getCartItemCount: () => cartItems.reduce((c, i) => c + i.quantity, 0),
        appliedCoupon, 
        discountAmount, 
        taxAmount, 
        applyCoupon, 
        removeCoupon,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};