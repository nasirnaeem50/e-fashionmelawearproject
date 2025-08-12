import React, { createContext, useContext, useMemo } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api';
import { useAuth } from './AuthContext';
import { useShop } from './ShopContext';

export const ProductListsContext = createContext();
export const useProductLists = () => useContext(ProductListsContext);

export const ProductListsProvider = ({ children }) => {
    const { user, fetchUser, loading: authLoading } = useAuth();
    const { products, loading: productsLoading } = useShop();

    const { wishlistItems, compareItems } = useMemo(() => {
        if (authLoading || productsLoading || !user) {
            return { wishlistItems: [], compareItems: [] };
        }
        
        const populatedWishlist = user.wishlist
            .map(productId => products.find(p => p.id === productId))
            .filter(Boolean);

        const populatedCompare = user.compare
            .map(productId => products.find(p => p.id === productId))
            .filter(Boolean);
            
        return { wishlistItems: populatedWishlist, compareItems: populatedCompare };

    }, [user, products, authLoading, productsLoading]);


    const toggleWishlistItem = async (product) => {
        if (!user) {
            toast.error("Please log in to manage your wishlist.");
            return;
        }
        try {
            const isItemInWishlist = user.wishlist.includes(product.id);
            if (isItemInWishlist) {
                toast.info(`${product.name} removed from wishlist.`);
            } else {
                toast.success(`${product.name} added to wishlist!`);
            }
            await apiClient.post('/users/wishlist', { productId: product.id });
            await fetchUser();
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error("Could not update wishlist. Please try again.");
            }
            console.error("Wishlist toggle error:", error);
        }
    };

    const toggleCompareItem = async (product) => {
        if (!user) {
            toast.error("Please log in to manage your compare list.");
            return;
        }
        try {
            const isItemInCompare = user.compare.includes(product.id);

            // This client-side check provides immediate feedback but isn't the final authority.
            if (!isItemInCompare && compareItems.length >= 4) {
                toast.warn("You can only compare up to 4 items.");
                return;
            }
            
            // Optimistic UI toast message
            if (isItemInCompare) {
                toast.info(`${product.name} removed from compare list.`);
            } else {
                toast.success(`${product.name} added to compare list!`);
            }
            
            // Let the backend be the single source of truth for the operation.
            await apiClient.post('/users/compare', { productId: product.id });
            await fetchUser();

        } catch (error) {
            // ✅ THIS IS THE FIX.
            // It correctly reads the error message sent from the backend.
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Could not update compare list.");
            }
            console.error("Compare toggle error:", error);
        }
    };
    
    const clearCompareList = async () => {
        if (!user || compareItems.length === 0) return;
        try {
            await apiClient.delete('/users/compare/clear');
            await fetchUser();
            toast.warn("Compare list has been cleared.");
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error("Could not clear compare list.");
            }
        }
    };

    const value = {
        wishlistItems,
        compareItems,
        toggleWishlistItem,
        toggleCompareItem,
        clearCompareList, 
        getWishlistCount: () => wishlistItems.length,
        getCompareCount: () => compareItems.length,
    };

    return (
        <ProductListsContext.Provider value={value}>
            {children}
        </ProductListsContext.Provider>
    );
};