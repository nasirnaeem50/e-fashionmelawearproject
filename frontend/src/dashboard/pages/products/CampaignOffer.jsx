import React from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { FiGift, FiEye, FiSettings, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

const CampaignOffer = () => {
    // Get contexts for data and permissions
    const { products, loading: shopLoading } = useShop();
    const { can, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const campaignProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price);
    
    // --- Page Guards ---
    if (authLoading || shopLoading) {
        return <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500" /></div>;
    }

    // A user needs `campaign_manage` to view this overview page.
    if (!can('campaign_manage')) {
        return <AccessDenied permission="campaign_manage" />;
    }

    return (
        <PageTransition>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center">
                        <FiGift className="mr-2 text-blue-500" /> 
                        Active Campaign Products
                    </h1>
                    <button 
                        onClick={() => navigate('/admin/offers/campaigns')}
                        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 shadow-sm transition-colors"
                    >
                        <FiSettings className="mr-2"/>
                        Manage Campaigns
                    </button>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                    This table shows a real-time view of all products currently on sale. To add, edit, or disable a discount, click "Manage Campaigns".
                </p>
                
                <div className="overflow-x-auto">
                     <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Original Price</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Offer Price</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Discount</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {campaignProducts.length > 0 ? (
                                campaignProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-2 px-4 font-medium">{product.name}</td>
                                        <td className="py-2 px-4 text-gray-500 line-through">Rs {product.originalPrice ? product.originalPrice.toLocaleString() : 'N/A'}</td>
                                        <td className="py-2 px-4 font-semibold text-green-600">Rs {product.price.toLocaleString()}</td>
                                        <td className="py-2 px-4">
                                            {product.originalPrice && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-semibold">
                                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2 px-4">
                                            <button onClick={() => navigate(`/product/${product.id}`)} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" title="View Product on Site"><FiEye size={16} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500">
                                        <p className="font-semibold">No active campaigns found.</p>
                                        <p className="text-sm mt-1">Click "Manage Campaigns" to create your first discount.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
};

export default CampaignOffer;