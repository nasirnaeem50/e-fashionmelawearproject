import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { useNavigate, useParams, Link } from 'react-router-dom';
import PageTransition from '../../../components/shared/PageTransition';
import { FiSave, FiCalendar, FiLoader, FiArrowLeft } from 'react-icons/fi';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

const EditCampaign = () => {
    // Get contexts for data, actions, and permissions
    const { campaigns, updateCampaign, products, categories, loading: shopLoading } = useShop();
    const { can, loading: authLoading } = useAuth();
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [campaignData, setCampaignData] = useState(null);

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

    useEffect(() => {
        if (campaigns.length > 0) {
            const campaignToEdit = campaigns.find(c => c.id === campaignId);
            if (campaignToEdit) {
                const formattedCampaign = {
                    ...campaignToEdit,
                    startDate: campaignToEdit.startDate ? new Date(campaignToEdit.startDate).toISOString().split('T')[0] : '',
                    endDate: campaignToEdit.endDate ? new Date(campaignToEdit.endDate).toISOString().split('T')[0] : '',
                };
                setCampaignData(formattedCampaign);
            } else {
                toast.error("Campaign not found.");
                navigate('/admin/offers/campaigns');
            }
        }
    }, [campaignId, campaigns, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'isActive') {
            setCampaignData(prev => ({...prev, [name]: value === 'true' }));
            return;
        }
        setCampaignData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleDiscountChange = (e) => {
        const { name, value } = e.target;
        setCampaignData(prev => ({ ...prev, discount: { ...prev.discount, [name]: value } }));
    };

    const handleScopeChange = (e) => {
        const { name, value } = e.target;
        if (name === 'type') {
            setCampaignData(prev => ({ ...prev, scope: { ...prev.scope, [name]: value, target: [] } }));
        } else {
             setCampaignData(prev => ({ ...prev, scope: { ...prev.scope, [name]: [value] } }));
        }
    };
    
    // The updateCampaign function in the context is already permission-aware
    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
            ...campaignData,
            discount: { ...campaignData.discount, value: parseFloat(campaignData.discount.value) },
            startDate: new Date(campaignData.startDate).toISOString(),
            endDate: new Date(campaignData.endDate).toISOString(),
            scope: { ...campaignData.scope, target: campaignData.scope.target } // No need to re-parse product IDs
        };
        updateCampaign(campaignId, finalData);
        navigate('/admin/offers/campaigns');
    };

    // --- Page Guards ---
    if (authLoading || shopLoading || !campaignData) {
        return <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500" /></div>;
    }

    if (!can('campaign_edit')) {
        return <AccessDenied permission="campaign_edit" />;
    }

    return (
        <PageTransition>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-gray-800">Edit Campaign</h1>
                    <Link to="/admin/offers/campaigns" className="text-sm text-blue-600 hover:underline flex items-center gap-1"><FiArrowLeft /> Back to List</Link>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                            <input type="text" name="name" value={campaignData.name} onChange={handleChange} required className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Status</label>
                            <select name="isActive" value={campaignData.isActive} onChange={handleChange} className="w-full p-2 border rounded-md">
                                <option value={true}>Active</option>
                                <option value={false}>Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                            <select name="type" value={campaignData.discount.type} onChange={handleDiscountChange} className="w-full p-2 border rounded-md">
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (Rs)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                            <input type="number" name="value" value={campaignData.discount.value} onChange={handleDiscountChange} required step="0.01" className="w-full p-2 border rounded-md" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FiCalendar className="mr-2"/> Start Date</label><input type="date" name="startDate" value={campaignData.startDate} onChange={handleChange} required className="w-full p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FiCalendar className="mr-2"/> End Date</label><input type="date" name="endDate" value={campaignData.endDate} onChange={handleChange} required className="w-full p-2 border rounded-md" /></div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apply Discount To</label>
                        <select name="type" value={campaignData.scope.type} onChange={handleScopeChange} className="w-full p-2 border rounded-md">
                            <option value="all">All Products</option>
                            <option value="parent-category">A Specific Parent Category</option>
                            <option value="category">A Specific Sub-Category</option>
                            <option value="child-category">A Specific Child Category</option>
                            <option value="product">A Specific Product</option>
                        </select>
                    </div>

                    {campaignData.scope.type === 'parent-category' && ( <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Select Parent Category</label><select name="target" value={campaignData.scope.target[0] || ''} onChange={handleScopeChange} className="w-full p-2 border rounded-md"><option value="">-- Choose --</option>{Object.keys(categories).map(parent => <option key={parent} value={parent}>{parent}</option>)}</select></div> )}
                    {campaignData.scope.type === 'category' && ( <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Select Sub-Category</label><select name="target" value={campaignData.scope.target[0] || ''} onChange={handleScopeChange} className="w-full p-2 border rounded-md"><option value="">-- Choose --</option>{allSubCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div> )}
                    {campaignData.scope.type === 'child-category' && ( <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Select Child Category</label><select name="target" value={campaignData.scope.target[0] || ''} onChange={handleScopeChange} className="w-full p-2 border rounded-md"><option value="">-- Choose --</option>{allChildCategories.map(childName => <option key={childName} value={childName}>{childName}</option>)}</select></div> )}
                    {campaignData.scope.type === 'product' && ( <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label><select name="target" value={campaignData.scope.target[0] || ''} onChange={handleScopeChange} className="w-full p-2 border rounded-md"><option value="">-- Choose --</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} (Rs {p.price})</option>)}</select></div> )}
                </div>
                
                <div className="flex justify-end mt-8 pt-4 border-t">
                    <button type="submit" className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                        <FiSave className="mr-2"/> Save Changes
                    </button>
                </div>
            </form>
        </PageTransition>
    );
};

export default EditCampaign;