import React, { useMemo } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import StatCard from '../../../dashboard/components/StatCard';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { FiGift, FiPlusCircle, FiEdit, FiTrash2, FiZap, FiZapOff, FiClock, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

const getCampaignStatus = (campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    if (now > endDate) return { text: 'Expired', className: 'bg-red-100 text-red-800' };
    if (!campaign.isActive) return { text: 'Inactive', className: 'bg-gray-100 text-gray-800' };
    if (now < startDate) return { text: 'Scheduled', className: 'bg-blue-100 text-blue-800' };
    return { text: 'Active', className: 'bg-green-100 text-green-800' };
};

const CampaignList = () => {
    // Get contexts for data, actions, and permissions
    const { campaigns, deleteCampaign, loading: shopLoading } = useShop();
    const { can, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const { campaignStats, sortedCampaigns } = useMemo(() => {
        if (!campaigns) return { campaignStats: {}, sortedCampaigns: [] };
        let activeCount = 0, scheduledCount = 0;
        campaigns.forEach(c => {
            const status = getCampaignStatus(c).text;
            if (status === 'Active') activeCount++;
            if (status === 'Scheduled') scheduledCount++;
        });
        const stats = {
            total: campaigns.length, active: activeCount, scheduled: scheduledCount,
            inactive: campaigns.length - activeCount - scheduledCount,
        };
        const statusOrder = { 'Active': 1, 'Scheduled': 2, 'Inactive': 3, 'Expired': 4 };
        const sorted = [...campaigns].sort((a, b) => {
            const statusA = getCampaignStatus(a).text;
            const statusB = getCampaignStatus(b).text;
            if (statusOrder[statusA] !== statusOrder[statusB]) { return statusOrder[statusA] - statusOrder[statusB]; }
            return new Date(a.endDate) - new Date(b.endDate);
        });
        return { campaignStats: stats, sortedCampaigns: sorted };
    }, [campaigns]);
    
    // --- Page Guards ---
    if (authLoading || shopLoading) {
        return <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500" /></div>;
    }

    // A user needs `campaign_manage` permission to view this management page.
    if (!can('campaign_manage')) {
        return <AccessDenied permission="campaign_manage" />;
    }

    return (
        <PageTransition>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard icon={<FiGift size={20} />} title="Total Campaigns" value={campaignStats.total || 0} color="blue" />
                <StatCard icon={<FiZap size={20} />} title="Currently Active" value={campaignStats.active || 0} color="green" />
                <StatCard icon={<FiClock size={20} />} title="Scheduled" value={campaignStats.scheduled || 0} color="sky" />
                <StatCard icon={<FiZapOff size={20} />} title="Inactive/Expired" value={campaignStats.inactive || 0} color="red" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center">
                        <FiGift className="mr-2 text-blue-500" /> All Discount Campaigns
                    </h1>
                    {/* --- NEW: Conditionally render 'Create' button --- */}
                    {can('campaign_create') && (
                        <button onClick={() => navigate('/admin/campaigns/add')} className="flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 shadow-sm transition-colors">
                            <FiPlusCircle className="mr-2"/> Create New Campaign
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                     <table className="min-w-full bg-white"><thead className="bg-gray-100"><tr><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Campaign Name</th><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Status</th><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Type</th><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Duration</th><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th></tr></thead><tbody className="text-gray-700">
                        {sortedCampaigns.length > 0 ? (sortedCampaigns.map((campaign) => {
                            const statusInfo = getCampaignStatus(campaign);
                            return (
                                <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{campaign.name}</td>
                                    <td className="py-3 px-4"><span className={`px-2 py-1 text-xs rounded-full font-semibold ${statusInfo.className}`}>{statusInfo.text}</span></td>
                                    <td className="py-3 px-4 capitalize">{campaign.discount.type} ({campaign.discount.value}{campaign.discount.type === 'percentage' ? '%' : ' Rs'})</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center space-x-2">
                                            {/* --- NEW: Conditionally render 'Edit' button --- */}
                                            {can('campaign_edit') && (
                                                <button onClick={() => navigate(`/admin/campaigns/edit/${campaign.id}`)} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600" title="Edit Campaign"><FiEdit size={16} /></button>
                                            )}
                                            {/* --- NEW: Conditionally render 'Delete' button --- */}
                                            {can('campaign_delete') && (
                                                <button onClick={() => deleteCampaign(campaign.id)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600" title="Delete Campaign"><FiTrash2 size={16} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })) : (<tr><td colSpan="5" className="text-center py-10 text-gray-500">No campaigns created yet. Click "Create New Campaign" to start.</td></tr>)}
                    </tbody></table>
                </div>
            </div>
        </PageTransition>
    );
};

export default CampaignList;