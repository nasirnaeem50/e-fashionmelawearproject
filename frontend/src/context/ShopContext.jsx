// frontend/src/context/ShopContext.jsx

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';

const defaultShopContext = {
    products: [], categories: {}, newCollectionProducts: [], featuredProductsList: [],
    campaigns: [], coupons: [], brands: [], loading: true, error: null,
    refetchProducts: () => {}, addParentCategory: () => {}, addSubCategory: () => {},
    addChildCategory: () => {}, deleteChildCategory: () => {}, deleteParentCategory: () => {},
    deleteSubCategory: () => {}, addProduct: () => {}, updateProduct: () => {},
    deleteProduct: () => {}, addCampaign: () => {}, updateCampaign: () => {},
    deleteCampaign: () => {}, addCoupon: () => {},
    deleteCoupon: () => {}, addBrand: () => {}, deleteBrand: () => {},
};

const ShopContext = createContext(defaultShopContext);
export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    const { can, loading: authLoading } = useAuth();
    const { settings, loading: settingsLoading } = useSettings();

    const [rawProducts, setRawProducts] = useState([]);
    const [categories, setCategories] = useState({});
    const [campaigns, setCampaigns] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [brands, setBrands] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (authLoading) return;
        setDataLoading(true);
        setError(null);
        try {
            const couponEndpoint = can('coupon_view') ? '/coupons' : '/coupons/active';
            const dataPromises = [
                apiClient.get('/products'),
                apiClient.get('/categories'),
                apiClient.get('/campaigns'),
                apiClient.get('/brands'),
                apiClient.get(couponEndpoint)
            ];
            const [ productsRes, categoriesRes, campaignsRes, brandsRes, couponsRes ] = await Promise.all(dataPromises);
            setRawProducts(productsRes.data.data || []);
            setCategories(categoriesRes.data.data || {});
            setCampaigns(campaignsRes.data.data || []);
            setBrands(brandsRes.data.data || []);
            setCoupons(couponsRes.data.data || []);
        } catch (err) {
            if (err.response?.status !== 401) {
                console.error("Failed to fetch data from backend:", err);
                setError("Could not connect to the server. Please try again later.");
                toast.error("Failed to fetch live data from the server.");
            }
        } finally {
            setDataLoading(false);
        }
    }, [can, authLoading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const products = useMemo(() => {
        const now = new Date();
        const validCampaigns = campaigns.filter(c => c.isActive && new Date(c.startDate) <= now && new Date(c.endDate) >= now);
        if (validCampaigns.length === 0) return rawProducts.map(p => ({ ...p, price: p.price, originalPrice: null }));
        return rawProducts.map(product => {
            const originalPrice = product.price;
            let finalPrice = originalPrice, bestDiscount = 0, appliedCampaign = false;
            validCampaigns.forEach(campaign => {
                const { type: scopeType, target: scopeTarget = [] } = campaign.scope;
                let isApplicable = false;
                const scopeTargetStr = scopeType === 'product' ? scopeTarget.map(String) : scopeTarget;
                if (scopeType === 'all') isApplicable = true;
                else if (scopeType === 'product') isApplicable = scopeTargetStr.includes(product.id);
                else if (scopeType === 'parent-category') isApplicable = scopeTarget.includes(product.gender);
                else if (scopeType === 'category') isApplicable = scopeTarget.includes(product.category);
                else if (scopeType === 'child-category') isApplicable = scopeTarget.includes(product.childCategory);
                if (isApplicable) {
                    appliedCampaign = true;
                    const discountValue = campaign.discount.type === 'percentage' ? originalPrice * (campaign.discount.value / 100) : campaign.discount.value;
                    if (discountValue > bestDiscount) bestDiscount = discountValue;
                }
            });
            if (appliedCampaign && bestDiscount > 0) {
                finalPrice = Math.round(originalPrice - bestDiscount);
                return { ...product, price: finalPrice, originalPrice: originalPrice };
            }
            return { ...product, price: originalPrice, originalPrice: null };
        });
    }, [rawProducts, campaigns]);
    
    // ✅ THIS IS THE CORE LOGIC FOR THE FEATURE ✅
    const derivedProductLists = useMemo(() => {
        // 1. Get the "newness" duration from settings, with a fallback of 30 days.
        const newnessDurationDays = settings?.newnessDurationDays || 30;
        const now = Date.now();
        const durationInMs = newnessDurationDays * 24 * 60 * 60 * 1000;
        const newnessThreshold = now - durationInMs;
        
        // 2. Create the "Featured" list: Find all products manually tagged with 'featured'.
        const manuallyFeatured = products
            .filter(p => p.tags?.includes('featured'))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // 3. Create the "New" list: 
        //    - Find all products created after the newness threshold.
        //    - This list is fully automated and time-based.
        const newProducts = products
            .filter(p => new Date(p.createdAt).getTime() > newnessThreshold)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // 4. Return both lists. They are now ready to be used by the homepage components.
        return { 
            newCollectionProducts: newProducts, 
            featuredProductsList: manuallyFeatured 
        };
    }, [products, settings]); // This recalculates whenever products or settings change.
    
    // All other functions (addProduct, updateProduct, etc.) remain the same.
    const addProduct = useCallback(async (data) => { if (!can('product_create')) { toast.error("Permission denied: Cannot add products."); return false; } try { await apiClient.post(`/products`, data); await fetchData(); toast.success(`Product added!`); return true; } catch (err) { if (err.response?.status !== 401) { toast.error(err.response?.data?.error); } return false; } }, [fetchData, can]);
    const updateProduct = useCallback(async (id, data) => { if(!can('product_edit')){toast.error("Permission denied: Cannot update products.");return;} try { await apiClient.put(`/products/${id}`, data); await fetchData(); toast.info("Product updated."); } catch(err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error); }}, [fetchData, can]);
    const deleteProduct = useCallback(async (id, name) => { if(!can('product_delete')){toast.error("Permission denied: Cannot delete products.");return;} const {isConfirmed} = await Swal.fire({title: `Delete "${name}"?`, text: "This action cannot be undone.", icon:'warning', showCancelButton: true, confirmButtonColor: '#d33'}); if (isConfirmed) { try { await apiClient.delete(`/products/${id}`); await fetchData(); toast.warn(`"${name}" deleted.`); } catch (err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error); }}}, [fetchData, can]);
    const addParentCategory = useCallback((name) => { if (categories[name]) { toast.error(`Parent category "${name}" already exists.`); return; } setCategories(prev => ({ ...prev, [name]: [] })); toast.success(`"${name}" added. You can now manage its sub-categories.`); }, [categories]);
    const deleteParentCategory = useCallback(async (name) => { const isTemporary = categories[name]?.length === 0; if(!isTemporary && !can('category_delete')){toast.error("Permission denied: Cannot delete database categories.");return;} const { isConfirmed } = await Swal.fire({ title: `Delete parent category "${name}"?`, text: isTemporary ? "This is a temporary category. It will be removed from the list." : "This will permanently delete all its sub-categories. This action cannot be undone.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' }); if (isConfirmed) { if (isTemporary) { setCategories(prev => { const n = { ...prev }; delete n[name]; return n; }); toast.warn(`Temporary category "${name}" removed.`); } else { try { await apiClient.delete(`/categories/parent/${name}`); await fetchData(); toast.warn(`Parent category "${name}" and all its sub-categories deleted.`); } catch (err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error || "Failed to delete parent category."); }}} }, [categories, fetchData, can]);
    const addSubCategory = useCallback(async (parentName, subCategoryData) => { if(!can('category_create')){toast.error("Permission denied: Cannot add categories.");return false;} try { await apiClient.post(`/categories`, { ...subCategoryData, parentCategory: parentName }); await fetchData(); toast.success("Sub-category saved!"); return true; } catch (err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error); return false; }}, [fetchData, can]);
    const deleteSubCategory = useCallback(async (subCategoryId) => { if(!can('category_delete')){toast.error("Permission denied: Cannot delete categories.");return;} const {isConfirmed} = await Swal.fire({title: `Delete this sub-category?`, text: "This will also remove its child categories.", icon:'warning', showCancelButton: true}); if (isConfirmed) { try { await apiClient.delete(`/categories/${subCategoryId}`); await fetchData(); toast.warn(`Sub-category deleted.`); } catch (err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error); }}}, [fetchData, can]);
    const addChildCategory = useCallback(async (subId, parent, childData) => { if(!can('category_edit')){toast.error("Permission denied: Cannot edit categories.");return;} const sub = categories[parent]?.find(s => s.id === subId); const children = [...(sub?.children || []), childData]; try { await apiClient.put(`/categories/${subId}`, { children }); await fetchData(); toast.success("Child category added."); } catch (err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error); }}, [fetchData, categories, can]);
    const deleteChildCategory = useCallback(async (subId, parent, childName) => { if(!can('category_edit')){toast.error("Permission denied: Cannot edit categories.");return;} const {isConfirmed} = await Swal.fire({title: `Delete child "${childName}"?`, icon:'warning', showCancelButton: true}); if (isConfirmed) { const sub = categories[parent]?.find(s => s.id === subId); const children = sub?.children.filter(c => c.name !== childName); try { await apiClient.put(`/categories/${subId}`, { children }); await fetchData(); toast.warn(`Child category deleted.`); } catch (err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error); }}}, [fetchData, categories, can]);
    const addBrand = useCallback(async (brandData) => { if(!can('brand_create')){toast.error("Permission denied: Cannot add brands.");return false;} try { await apiClient.post(`/brands`, brandData); await fetchData(); toast.success("Brand added successfully!"); return true; } catch (err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error || "Failed to add brand."); return false; }}, [fetchData, can]);
    const deleteBrand = useCallback(async (brandId, brandName) => { if(!can('brand_delete')){toast.error("Permission denied: Cannot delete brands.");return;} const { isConfirmed } = await Swal.fire({ title: `Delete brand "${brandName}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' }); if (isConfirmed) { try { await apiClient.delete(`/brands/${brandId}`); await fetchData(); toast.warn(`Brand "${brandName}" deleted.`); } catch (err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error || "Failed to delete brand."); }}}, [fetchData, can]);
    const addCampaign = useCallback(async (data) => { if(!can('campaign_create')){ toast.error("Permission denied: Cannot create campaigns."); return false; } try { await apiClient.post(`/campaigns`, data); await fetchData(); toast.success(`Campaign created!`); return true; } catch (err) { if(err.response?.status !== 401) { toast.error(err.response?.data?.error || 'Failed to create campaign.'); } return false; } }, [fetchData, can]);
    const updateCampaign = useCallback(async (id, data) => { if(!can('campaign_edit')){toast.error("Permission denied: Cannot update campaigns.");return;} try { await apiClient.put(`/campaigns/${id}`, data); await fetchData(); toast.info("Campaign updated."); } catch (err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error); }}, [fetchData, can]);
    const deleteCampaign = useCallback(async (id) => { if(!can('campaign_delete')){toast.error("Permission denied: Cannot delete campaigns.");return;} const {isConfirmed} = await Swal.fire({title: `Delete campaign?`, icon:'warning', showCancelButton: true}); if (isConfirmed) { try { await apiClient.delete(`/campaigns/${id}`); await fetchData(); toast.warn("Campaign deleted."); } catch (err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error); }}}, [fetchData, can]);
    const addCoupon = useCallback(async (newCouponData) => { if(!can('coupon_create')){toast.error("Permission denied: Cannot add coupons.");return;} try { await apiClient.post(`/coupons`, newCouponData); await fetchData(); toast.success(`Coupon added!`); } catch (err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error); }}, [fetchData, can]);
    const deleteCoupon = useCallback(async (couponId, couponCode) => { if(!can('coupon_delete')){toast.error("Permission denied: Cannot delete coupons.");return;} const {isConfirmed} = await Swal.fire({title: `Delete coupon "${couponCode}"?`, icon:'warning', showCancelButton: true}); if (isConfirmed) { try { await apiClient.delete(`/coupons/${couponId}`); await fetchData(); toast.warn(`Coupon deleted.`); } catch (err) { if(err.response?.status !== 401) toast.error(err.response?.data?.error); }}}, [fetchData, can]);

    const value = {
        products, campaigns, coupons, categories, brands, 
        // ✅ Provide the dynamically created lists to the rest of the app.
        newCollectionProducts: derivedProductLists.newCollectionProducts,
        featuredProductsList: derivedProductLists.featuredProductsList,
        loading: dataLoading || settingsLoading, 
        error, 
        refetchProducts: fetchData, 
        addProduct, updateProduct, deleteProduct, addParentCategory, addSubCategory, addChildCategory,
        deleteChildCategory, deleteParentCategory, deleteSubCategory, addCampaign, updateCampaign,
        deleteCampaign, addCoupon, deleteCoupon, addBrand, deleteBrand,
    };

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};