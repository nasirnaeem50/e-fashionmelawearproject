import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { format } from 'date-fns';
import { FiBarChart2, FiDollarSign, FiShoppingBag, FiTrendingUp, FiDownload, FiArrowLeft, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageTransition from '../../../components/shared/PageTransition';
import StatCard from '../../../dashboard/components/StatCard';
import { useAuth } from '../../../context/AuthContext';
import AccessDenied from '../../../components/shared/AccessDenied';
import apiClient from '../../../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports = () => {
    const { can, loading: authLoading } = useAuth();
    
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);

    const fetchReportData = useCallback(async () => {
        if (!can('report_view')) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // ✅ THE ONLY CHANGE IS ON THIS LINE: Removed the extra "/api"
            const { data } = await apiClient.get(`/reports?type=sales_dashboard&days=${timeRange}`);
            
            if (data.success) {
                setReportData(data.data);
            } else {
                toast.error("Failed to load report data.");
            }
        } catch (error) {
            toast.error("An error occurred while fetching report data.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [timeRange, can]);

    useEffect(() => {
        if (!authLoading) {
            fetchReportData();
        }
    }, [authLoading, fetchReportData]);

    const formatCurrency = (value) => `Rs ${Math.round(value || 0).toLocaleString('en-IN')}`;
    const handleTimeRangeChange = (e) => setTimeRange(Number(e.target.value));
    
    const handleExport = () => {
        if (!reportData || !reportData.salesData) { toast.warn("No data available to export."); return; }
        const headers = ["Date", "Sales (Rs)", "Orders"];
        const rows = reportData.salesData.map(row => [row.date, Math.round(row.sales), row.orders]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales_report_last_${timeRange}_days_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Page Guards ---
    if (authLoading || loading) {
        return <PageTransition><div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-red-500" size={40} /></div></PageTransition>;
    }

    if (!can('report_view')) {
        return <AccessDenied permission="report_view" />;
    }
    
    if (!reportData || reportData.stats.totalOrders === 0) {
        return (
             <PageTransition><div className="text-center py-10 bg-white rounded-lg shadow-sm"><FiBarChart2 size={48} className="mx-auto text-gray-400 mb-4" /><h2 className="text-xl font-semibold">No Sales Data for this Period</h2><p className="text-gray-500 mt-2">Change the time range or wait for new orders.</p><Link to="/admin" className="mt-4 inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"><FiArrowLeft /> Back to Dashboard</Link></div></PageTransition>
        );
    }

    const { salesData, categorySales, topProducts, stats } = reportData;

    return (
        <PageTransition>
            <div className="space-y-8">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div><h1 className="text-2xl font-bold text-gray-800">Sales & Revenue Report</h1><p className="text-gray-500">A detailed breakdown of your store's performance.</p></div>
                    <div className="flex items-center gap-4">
                        <select onChange={handleTimeRangeChange} value={timeRange} className="p-2 border rounded-md bg-white shadow-sm"><option value="7">Last 7 Days</option><option value="30">Last 30 Days</option><option value="90">Last 90 Days</option><option value="365">Last 365 Days</option></select>
                        <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 shadow-sm"><FiDownload size={16}/> Export CSV</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={<FiDollarSign size={20}/>} title="Total Revenue" value={formatCurrency(stats.totalRevenue)} color="green" to={null} />
                    <StatCard icon={<FiShoppingBag size={20}/>} title="Total Orders" value={stats.totalOrders.toLocaleString()} color="blue" to={null} />
                    <StatCard icon={<FiTrendingUp size={20}/>} title="Avg. Order Value" value={formatCurrency(stats.avgOrderValue)} color="purple" to={null} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Sales & Orders Over Time</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesData}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="date" tick={{ fontSize: 12 }} interval={timeRange > 31 ? Math.floor(timeRange / 7) : 'auto'} /><YAxis yAxisId="left" tickFormatter={(value) => `Rs ${value / 1000}k`} tick={{ fontSize: 12, fill: '#16a34a' }}/><YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#2563eb' }}/><Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)' }} formatter={(value, name) => name === 'Sales' ? formatCurrency(value) : value} /><Legend /><Line yAxisId="left" type="monotone" dataKey="sales" name="Sales" stroke="#16a34a" strokeWidth={2} activeDot={{ r: 8 }} /><Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 8 }} /></LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm"><h2 className="text-lg font-semibold mb-4">Sales by Category</h2><ResponsiveContainer width="100%" height={300}><BarChart data={categorySales} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tickFormatter={(value) => `Rs ${value / 1000}k`} tick={{ fontSize: 12 }} /><YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} /><Tooltip formatter={(value) => formatCurrency(value)} cursor={{fill: '#f3f4f6'}} /><Bar dataKey="value" name="Revenue" fill="#00C49F" barSize={20}>{categorySales.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Bar></BarChart></ResponsiveContainer></div>
                    <div className="bg-white p-6 rounded-lg shadow-sm"><h2 className="text-lg font-semibold mb-4">Top Selling Products</h2><div className="space-y-4">{topProducts.length > 0 ? topProducts.map(product => (<div key={product.id} className="flex justify-between items-center text-sm"><span className="font-medium truncate pr-4">{product.name}</span><div className="flex-shrink-0 text-right"><p className="font-bold">{formatCurrency(product.revenue)}</p><p className="text-xs text-gray-500">{product.quantity} units</p></div></div>)) : (<p className="text-center text-gray-500 py-10">No products sold in this period.</p>)}</div></div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Reports;