import React, { useState, useMemo } from 'react';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../../components/shared/PageTransition';
import { FiTag, FiPlusCircle, FiCalendar, FiLoader } from 'react-icons/fi';
import AccessDenied from '../../../components/shared/AccessDenied';
import { toast } from 'react-toastify'; // Import toast for potential alerts

const AddCampaign = () => {
    const { addCampaign, products, categories, loading: shopLoading } = useShop();
    const { can, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    // ✅ MODIFIED: Set default discount type to lowercase 'percentage'
    const [discountType, setDiscountType] = useState('percentage'); 
    const [scopeType, setScopeType] = useState('category');
    const [discountValue, setDiscountValue] = useState('');
    const [target, setTarget] = useState([]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(() => {
        const defaultEndDate = new Date();
        defaultEndDate.setDate(defaultEndDate.getDate() + 7);
        return defaultEndDate.toISOString().split('T')[0];
    });

    const allSubCategories = useMemo(() => Object.values(categories).flat(), [categories]);

    const allChildCategories = useMemo(() => {
        const childSet = new Set();
        Object.values(categories).forEach(subArray => {
            subArray.forEach(sub => {
                if (sub.children) { sub.children.forEach(child => childSet.add(child.name)); }
            });
        });
        return Array.from(childSet).sort();
    }, [categories]);

    // ✅ MODIFIED: handleSubmit is now async and handles success/failure
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (target.length === 0 && scopeType !== 'all') {
            // Using toast for a better user experience than alert()
            toast.warn('Please select a target for the campaign scope.');
            return;
        }

        const newCampaign = {
            // ✅ REMOVED: Unnecessary frontend ID generation
            name, 
            isActive: true,
            discount: { type: discountType, value: parseFloat(discountValue) },
            scope: { type: scopeType, target: target },
            startDate: new Date(startDate).toISOString(), 
            endDate: new Date(endDate).toISOString(),
        };

        // This is line 52 where the call was being made
        const success = await addCampaign(newCampaign);

        if (success) {
            navigate('/admin/offers/campaigns');
        }
        // If not successful, the user stays on the page, and the error toast
        // from the context will show them what went wrong.
    };
    
    if (authLoading || shopLoading) {
        return <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500" /></div>;
    }

    if (!can('campaign_create')) {
        return <AccessDenied permission="campaign_create" />;
    }

    return (
        <PageTransition>
            {/* This is line 67 */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
                <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FiPlusCircle className="mr-2" /> Create New Discount Campaign
                </h1>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Eid Sale 2024" required className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                        {/* ✅ MODIFIED: Values are lowercase to match backend schema */}
                        <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (Rs)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                        <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} required step="0.01" min="0.01" className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FiCalendar className="mr-2"/> Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FiCalendar className="mr-2"/> End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md" /></div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apply Discount To</label>
                    <select value={scopeType} onChange={e => { setScopeType(e.target.value); setTarget([]); }} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                        <option value="all">All Products</option>
                        <option value="parent-category">A Specific Parent Category (e.g., Men)</option>
                        <option value="category">A Specific Sub-Category (e.g., Lawn)</option>
                        <option value="child-category">A Specific Child Category (e.g., Shorts)</option>
                        <option value="product">A Specific Product</option>
                    </select>
                </div>

                {scopeType === 'parent-category' && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Parent Category</label>
                        <select onChange={e => setTarget([e.target.value])} required className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">-- Choose a parent category --</option>
                            {Object.keys(categories).map(parent => <option key={parent} value={parent}>{parent}</option>)}
                        </select>
                    </div>
                )}
                
                {scopeType === 'category' && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Sub-Category</label>
                        <select onChange={e => setTarget([e.target.value])} required className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">-- Choose a sub-category --</option>
                            {allSubCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                )}

                {scopeType === 'child-category' && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Child Category</label>
                        <select onChange={e => setTarget([e.target.value])} required className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">-- Choose a child category --</option>
                            {allChildCategories.map(childName => <option key={childName} value={childName}>{childName}</option>)}
                        </select>
                    </div>
                )}
                
                {scopeType === 'product' && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                        <select onChange={e => setTarget([e.target.value])} required className="w-full p-2 border border-gray-300 rounded-md">
                           <option value="">-- Choose a product --</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Rs {p.price})</option>)}
                        </select>
                    </div>
                )}

                <div className="flex justify-end mt-8 pt-4 border-t">
                    <button type="submit" className="flex items-center justify-center px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 shadow-sm">
                        <FiTag className="mr-2"/>
                        Create Campaign
                    </button>
                </div>
            </form>
        </PageTransition>
    );
};

export default AddCampaign;