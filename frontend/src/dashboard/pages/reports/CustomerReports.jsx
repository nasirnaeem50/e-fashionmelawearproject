import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { FiUsers, FiDollarSign, FiShoppingBag, FiDownload, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageTransition from '../../../components/shared/PageTransition';
import StatCard from '../../../dashboard/components/StatCard';
import { useAuth } from '../../../context/AuthContext';
import AccessDenied from '../../../components/shared/AccessDenied';
import apiClient from '../../../api';

const CustomerReports = () => {
    const { can, loading: authLoading } = useAuth();
    
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);
    const [limit, setLimit] = useState(25);

    const fetchReportData = useCallback(async () => {
        if (!can('report_view')) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data } = await apiClient.get(`/reports?type=top_customers&days=${timeRange}&limit=${limit}`);
            if (data.success) {
                setReportData(data.data);
            } else {
                toast.error("Failed to load customer report data.");
            }
        } catch (error) {
            toast.error("An error occurred while fetching the customer report.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [timeRange, limit, can]);

    useEffect(() => {
        if (!authLoading) {
            fetchReportData();
        }
    }, [authLoading, fetchReportData]);

    const formatCurrency = (value) => `Rs ${Math.round(value || 0).toLocaleString('en-IN')}`;

    const handleExport = () => {
        if (!reportData || reportData.length === 0) {
            toast.warn("No data available to export.");
            return;
        }
        const headers = ["Customer Name", "Email", "Total Orders", "Total Spent (Rs)"];
        const rows = reportData.map(row => [
            row.name,
            row.email,
            row.totalOrders,
            Math.round(row.totalSpent)
        ]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `top_customers_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (authLoading || loading) {
        return <PageTransition><div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-red-500" size={40} /></div></PageTransition>;
    }

    if (!can('report_view')) {
        return <AccessDenied permission="report_view" />;
    }

    const totalSpentByTopCustomers = reportData.reduce((sum, customer) => sum + customer.totalSpent, 0);

    return (
        <PageTransition>
            <div className="space-y-8">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Top Customer Report</h1>
                        <p className="text-gray-500">Identify your most valuable customers.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select onChange={(e) => setTimeRange(Number(e.target.value))} value={timeRange} className="p-2 border rounded-md bg-white shadow-sm">
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="365">Last 365 Days</option>
                        </select>
                        <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 shadow-sm">
                            <FiDownload size={16}/> Export CSV
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard icon={<FiUsers size={20}/>} title={`Top ${reportData.length} Customers`} value={reportData.length.toLocaleString()} color="blue" to={null} />
                    <StatCard icon={<FiDollarSign size={20}/>} title="Total Spent by Top Customers" value={formatCurrency(totalSpentByTopCustomers)} color="green" to={null} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Top Spenders</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Rank</th>
                                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Customer Name</th>
                                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
                                    <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Total Orders</th>
                                    <th className="text-right py-3 px-4 uppercase font-semibold text-sm">Total Spent</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {reportData.length > 0 ? reportData.map((customer, index) => (
                                    <tr key={customer.userId} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-bold text-center">{index + 1}</td>
                                        <td className="py-3 px-4">{customer.name}</td>
                                        <td className="py-3 px-4 text-gray-500">{customer.email}</td>
                                        <td className="py-3 px-4 text-center">{customer.totalOrders}</td>
                                        <td className="py-3 px-4 text-right font-semibold">{formatCurrency(customer.totalSpent)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-gray-500">
                                            No customer data for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default CustomerReports;