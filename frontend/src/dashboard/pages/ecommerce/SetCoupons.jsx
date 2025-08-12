import React, { useState, useMemo } from 'react';
import PageTransition from '../../../components/shared/PageTransition';
import StatCard from '../../../dashboard/components/StatCard';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { FiGift, FiPlusCircle, FiTrash2, FiTag, FiCalendar, FiCheckCircle, FiXCircle, FiEye, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import AccessDenied from '../../../components/shared/AccessDenied'; // Import AccessDenied

const getCouponStatus = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    if (now > endDate) return { text: 'Expired', className: 'bg-red-100 text-red-800' };
    if (coupon.status !== 'Active') return { text: 'Inactive', className: 'bg-gray-100 text-gray-800' };
    if (now < startDate) return { text: 'Scheduled', className: 'bg-blue-100 text-blue-800' };
    return { text: 'Active', className: 'bg-green-100 text-green-800' };
};

const SetCoupons = () => {
    // Get contexts for data, actions, and permissions
    const { coupons, addCoupon, deleteCoupon, products, categories, loading: shopLoading } = useShop();
    const { can, loading: authLoading } = useAuth();
    
    const [code, setCode] = useState('');
    const [type, setType] = useState('Percentage');
    const [value, setValue] = useState('');
    const [scopeType, setScopeType] = useState('all');
    const [target, setTarget] = useState([]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    });
    const [displayType, setDisplayType] = useState('standard'); 
    
    const couponStats = useMemo(() => {
        if (!coupons) return { total: 0, active: 0, inactiveOrExpired: 0 };
        let activeCount = 0, inactiveOrExpiredCount = 0;
        coupons.forEach(coupon => {
            if (getCouponStatus(coupon).text === 'Active') activeCount++; else inactiveOrExpiredCount++;
        });
        return { total: coupons.length, active: activeCount, inactiveOrExpired: inactiveOrExpiredCount };
    }, [coupons]);

    const allSubCategories = useMemo(() => Object.values(categories).flat(), [categories]);

    const getScopeDisplay = (coupon) => {
        if (!coupon.scope || !coupon.scope.type) return <span className="text-gray-400">N/A</span>;
        const { type, target } = coupon.scope;
        const typeDisplay = type.replace('-', ' ');
        if (type === 'all' || !target || target.length === 0) return 'All Products';
        const targetValue = target[0];
        let targetName = '';
        if (type === 'product') {
            const product = products.find(p => String(p.id) === String(targetValue));
            targetName = product ? product.name : `(ID: ${targetValue})`;
        } else {
            targetName = targetValue;
        }
        return (<div className="flex flex-col"><span className="font-semibold capitalize">{typeDisplay}</span><span className="text-xs text-gray-500 truncate" title={targetName}>{targetName}</span></div>);
    };

    // The addCoupon function in the context is already permission-aware
    const handleAddCoupon = (e) => {
        e.preventDefault();
        if ((scopeType !== 'all') && target.length === 0) { toast.error('Please select a target for the chosen scope.'); return; }
        const newCouponData = {
            code: code.toUpperCase().trim(), type, value: parseFloat(value), status: 'Active',
            scope: { type: scopeType, target: [target].flat() },
            display: displayType, startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString(),
        };
        addCoupon(newCouponData);
        setCode(''); setType('Percentage'); setValue(''); setScopeType('all'); setTarget([]); setDisplayType('standard');
    };

    // The deleteCoupon function in the context is already permission-aware
    const handleDelete = (id, code) => deleteCoupon(id, code);
    
    // --- Page Guards ---
    if (authLoading || shopLoading) {
        return <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500" /></div>;
    }

    if (!can('coupon_manage')) {
        return <AccessDenied permission="coupon_manage" />;
    }

    return (
        <PageTransition>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <StatCard icon={<FiGift size={20} />} title="Total Coupons" value={couponStats.total} color="blue" />
                <StatCard icon={<FiCheckCircle size={20} />} title="Active Coupons" value={couponStats.active} color="green" />
                <StatCard icon={<FiXCircle size={20} />} title="Expired/Inactive" value={couponStats.inactiveOrExpired} color="red" />
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FiGift className="mr-2" /> Coupon List</h1>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white"><thead className="bg-gray-100"><tr><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Code</th><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Status</th><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Discount</th><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Applies To</th><th className="text-left py-3 px-4 uppercase font-semibold text-sm">Duration</th><th className="text-center py-3 px-4 uppercase font-semibold text-sm">Actions</th></tr></thead>
                            <tbody className="text-gray-700">
                                {coupons.length > 0 ? coupons.map(c => {
                                    const statusInfo = getCouponStatus(c);
                                    return (
                                        <tr key={c.id} className="border-b"><td className="py-3 px-4 font-mono">{c.code}</td><td className="py-3 px-4"><span className={`px-2 py-1 text-xs rounded-full font-semibold ${statusInfo.className}`}>{statusInfo.text}</span></td><td className="py-3 px-4">{c.type === 'Percentage' ? `${c.value}%` : `Rs ${c.value.toLocaleString()}`}</td><td className="py-3 px-4">{getScopeDisplay(c)}</td><td className="py-3 px-4 text-sm">{new Date(c.startDate).toLocaleDateString()} - {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'N/A'}</td><td className="py-3 px-4"><div className="flex items-center justify-center">
                                            {/* --- NEW: Conditionally render 'Delete' button --- */}
                                            {can('coupon_delete') && <button onClick={() => handleDelete(c.id, c.code)} className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200" title="Delete Coupon"><FiTrash2 size={16} /></button>}
                                        </div></td></tr>
                                    )
                                }) : (<tr><td colSpan="6" className="text-center py-10 text-gray-500">No coupons created yet.</td></tr>)}
                            </tbody></table>
                    </div>
                </div>
                
                 {/* --- NEW: Conditionally render the 'Add Coupon' form --- */}
                 {can('coupon_create') && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><FiPlusCircle className="mr-2" /> Add New Coupon</h2>
                        <form onSubmit={handleAddCoupon} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div><label className="block text-sm font-medium mb-1">Coupon Code</label><input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g., WINTERSALE" className="w-full p-2 border rounded-md" required /></div>
                                <div><label className="block text-sm font-medium mb-1">Discount Type</label><select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border rounded-md"><option value="Percentage">Percentage</option><option value="Fixed">Fixed</option></select></div>
                                <div><label className="block text-sm font-medium mb-1">Value</label><input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g., 25 or 1000" className="w-full p-2 border rounded-md" required step="0.01"/></div>
                                <div><label className="block text-sm font-medium mb-1 flex items-center"><FiEye className="mr-2"/> Display Type</label><select value={displayType} onChange={e => setDisplayType(e.target.value)} className="w-full p-2 border rounded-md"><option value="standard">Standard (Use in Cart)</option><option value="popup">Popup (Show on Site)</option></select></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1 flex items-center"><FiCalendar className="mr-2"/> Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full p-2 border rounded-md"/></div><div><label className="block text-sm font-medium mb-1 flex items-center"><FiCalendar className="mr-2"/> End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full p-2 border rounded-md"/></div></div>
                            <div><label className="block text-sm font-medium mb-1 flex items-center"><FiTag className="mr-2"/> Coupon Scope</label><select value={scopeType} onChange={e => {setScopeType(e.target.value); setTarget([]);}} className="w-full p-2 border rounded-md"><option value="all">All Products (Site-wide)</option><option value="parent-category">A Specific Parent Category</option><option value="category">Specific Sub-Category</option><option value="product">Specific Product</option></select></div>
                            {scopeType === 'parent-category' && (<div><label className="block text-sm font-medium mb-1">Select Parent Category</label><select onChange={e => setTarget([e.target.value])} required className="w-full p-2 border rounded-md"><option value="">-- Choose --</option>{Object.keys(categories).map(parent => <option key={parent} value={parent}>{parent}</option>)}</select></div>)}
                            {scopeType === 'category' && (<div><label className="block text-sm font-medium mb-1">Select Sub-Category</label><select onChange={e => setTarget([e.target.value])} required className="w-full p-2 border rounded-md"><option value="">-- Choose --</option>{allSubCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div>)}
                            {scopeType === 'product' && (<div><label className="block text-sm font-medium mb-1">Select Product</label><select onChange={e => setTarget([e.target.value])} required className="w-full p-2 border rounded-md"><option value="">-- Choose --</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>)}
                            <div className="flex justify-end pt-2"><button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Add Coupon</button></div>
                        </form>
                    </div>
                 )}
            </div>
        </PageTransition>
    );
};
export default SetCoupons;