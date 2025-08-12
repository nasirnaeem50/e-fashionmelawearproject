// dashboard/pages/orders/AdminOrderDetail.jsx (Complete and Corrected File)

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../../context/OrderContext';
import { useAuth } from '../../../context/AuthContext';
import PageTransition from '../../../components/shared/PageTransition';
import { FiArrowLeft, FiBox, FiDollarSign, FiTruck, FiShoppingBag, FiFileText, FiRefreshCw, FiCheck, FiX, FiDownload } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import AccessDenied from '../../../components/shared/AccessDenied';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const AdminOrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    
    const { orders, loading, updateOrderStatus, updateReturnStatus } = useOrders();
    const { can, loading: authLoading } = useAuth();

    const order = !loading ? orders.find(o => o.id === orderId) : null;
    
    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        if (order && newStatus && newStatus !== order.status) {
            updateOrderStatus(orderId, newStatus);
        }
    };

    const formatCurrency = (amount) => {
        const num = amount || 0;
        return `Rs ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };
    
    const handleDownloadInvoice = () => {
        if (!order) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        doc.text('Fashion Mela Wear', 20, 30);
        doc.text('123 Commerce St, Online City', 20, 35);
        doc.text('contact@fashionmelawear.com', 20, 40);

        // Order Information
        doc.setFontSize(12);
        doc.text(`Order ID: ${order.id}`, pageWidth - 20, 30, { align: 'right' });
        doc.text(`Order Date: ${new Date(order.date).toLocaleDateString()}`, pageWidth - 20, 35, { align: 'right' });
        doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, pageWidth - 20, 40, { align: 'right' });

        doc.setLineWidth(0.5);
        doc.line(20, 48, pageWidth - 20, 48);

        // Billing Info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 20, 58);
        doc.setFont('helvetica', 'normal');
        doc.text(order.shippingInfo.name, 20, 63);
        doc.text(order.shippingInfo.address, 20, 68);
        doc.text(order.shippingInfo.phone, 20, 73);

        // Items Table
        const tableColumn = ["#", "Item Description", "Size", "Qty", "Unit Price", "Total"];
        const tableRows = [];
        order.orderItems.forEach((item, index) => {
            const itemData = [
                index + 1,
                item.name,
                item.selectedSize || 'N/A',
                item.quantity,
                formatCurrency(item.price),
                formatCurrency(item.quantity * item.price)
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 80,
            headStyles: { fillColor: [22, 160, 133] },
            theme: 'grid',
        });
        
        const finalY = doc.lastAutoTable.finalY;

        // Financial Summary
        const summaryX = pageWidth - 80;
        const summaryY = finalY + 10;
        const rightAlignX = pageWidth - 20;
        
        const addSummaryRow = (label, value, yOffset, isBold = false) => {
            if (isBold) doc.setFont('helvetica', 'bold');
            doc.text(label, summaryX, summaryY + yOffset);
            doc.text(value, rightAlignX, summaryY + yOffset, { align: 'right' });
            if (isBold) doc.setFont('helvetica', 'normal');
            return yOffset + 7;
        };

        let yOffset = 0;
        doc.setFontSize(10);
        yOffset = addSummaryRow('Subtotal:', formatCurrency(order.subtotal), yOffset);
        if (order.campaignDiscount > 0) yOffset = addSummaryRow('Sale Discount:', `- ${formatCurrency(order.campaignDiscount)}`, yOffset);
        if (order.couponCode) yOffset = addSummaryRow(`Coupon (${order.couponCode}):`, `- ${formatCurrency(order.couponDiscount)}`, yOffset);
        if (order.taxAmount > 0) yOffset = addSummaryRow('GST:', `+ ${formatCurrency(order.taxAmount)}`, yOffset);
        yOffset = addSummaryRow('Shipping:', formatCurrency(order.shippingCost), yOffset);
        
        doc.setLineWidth(0.2);
        doc.line(summaryX - 5, summaryY + yOffset - 2, rightAlignX, summaryY + yOffset - 2);
        
        doc.setFontSize(12);
        addSummaryRow('Grand Total:', formatCurrency(order.total), yOffset + 2, true);

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text('Thank you for your business!', pageWidth / 2, doc.internal.pageSize.height - 15, { align: 'center' });
        }

        doc.save(`invoice-${order.id}.pdf`);
    };
    
    if (authLoading || loading) {
        return (
            <PageTransition>
                <div className="text-center py-10">
                    <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto" />
                    <p className="mt-2">Loading order...</p>
                </div>
            </PageTransition>
        );
    }

    if (!can('order_view')) {
        return <AccessDenied permission="order_view" />;
    }

    if (!order) {
        return (
            <PageTransition>
                <div className="container mx-auto px-4 py-12 text-center">
                    <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
                    <p>The order you're looking for doesn't exist.</p>
                    <button onClick={() => navigate(-1)} className="mt-4 flex items-center mx-auto text-blue-600 hover:underline">
                        <FiArrowLeft className="mr-2" /> Go Back
                    </button>
                </div>
            </PageTransition>
        );
    }

    const orderStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

    return (
        <PageTransition>
            <div className="bg-white rounded-lg shadow-sm p-6">
                {/* ✅ FIX: Made the header responsive. It stacks on mobile and is a row on larger screens. */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-4 border-b gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 flex items-center"><FiBox className="mr-3" /> Order Details</h1>
                        <p className="text-sm text-gray-500 font-mono mt-1">{order.id}</p>
                    </div>
                    {/* ✅ FIX: Button container aligns right on mobile and stays in the flex row on larger screens. */}
                    <div className="flex items-center space-x-3 sm:space-x-4 self-end sm:self-center">
                        {order.status === 'Delivered' && can('order_view') && (
                             <button 
                                onClick={handleDownloadInvoice} 
                                // ✅ FIX: Reduced vertical padding on mobile (py-1.5) and adjusted horizontal padding.
                                className="flex items-center text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                            >
                                <FiDownload className="mr-2" /> Download Invoice
                            </button>
                        )}
                        <button onClick={() => navigate(-1)} className="flex items-center text-sm text-blue-600 hover:underline whitespace-nowrap">
                            <FiArrowLeft className="mr-1" /> Back to List
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiTruck/>Customer & Shipping</h2>
                        <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                            <p><strong>Customer:</strong> {order.shippingInfo.name}</p>
                            <p><strong>Phone:</strong> {order.shippingInfo.phone}</p>
                            <p><strong>Address:</strong> {order.shippingInfo.address}</p>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiDollarSign/>Order & Payment</h2>
                        <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                            <p><strong>Order Date:</strong> {new Date(order.date).toLocaleString()}</p>
                            <p><strong>Payment:</strong> {order.paymentMethod.toUpperCase()} ({order.paymentStatus})</p>
                            <p><strong>Order Total:</strong> <span className="font-bold text-lg">{formatCurrency(order.total)}</span></p>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Update Status</h2>
                        <div className="flex items-center">
                            <select 
                                value={order.status} 
                                onChange={handleStatusChange} 
                                disabled={!can('order_edit_status')}
                                className="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                            >
                                {orderStatuses.map(status => (<option key={status} value={status}>{status}</option>))}
                            </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Select a new status to update the order.</p>
                    </div>

                    {order.returnStatus && (
                        <div className="lg:col-span-3">
                            <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2 text-blue-600"><FiRefreshCw /> Return Request Information</h2>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Status:</strong> <span className="font-bold">{order.returnStatus}</span></p>
                                        <p><strong>Reason Provided by Customer:</strong> {order.returnReason}</p>
                                    </div>
                                    {order.returnStatus === 'Pending' && can('order_edit_status') && (
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => updateReturnStatus(order.id, 'Approved')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-md hover:bg-green-600"
                                            >
                                                <FiCheck /> Approve
                                            </button>
                                            <button 
                                                onClick={() => updateReturnStatus(order.id, 'Rejected')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-md hover:bg-red-600"
                                            >
                                                <FiX /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiShoppingBag/>Items in this Order</h2>
                        <div className="space-y-3">
                            {order.orderItems.map(item => (
                                <div key={item.cartItemId || item.product} className="flex items-center bg-gray-50 p-3 rounded-lg">
                                    <img src={item.image} alt={item.name} className="h-16 w-16 object-contain rounded-md mr-4 bg-white border" />
                                    <div className="flex-grow">
                                        <p className="font-semibold">{item.name}</p>
                                        {item.selectedSize && <p className="text-sm text-gray-500 font-semibold">Size: {item.selectedSize}</p>}
                                        <p className="text-sm text-gray-500">Qty: {item.quantity} x {formatCurrency(item.price)}</p>
                                    </div>
                                    <div className="font-semibold text-right">{formatCurrency(item.quantity * item.price)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiFileText/>Financial Summary</h2>
                        <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between py-1 border-b"><span>Subtotal</span><strong>{formatCurrency(order.subtotal)}</strong></div>
                            {order.campaignDiscount > 0 && (<div className="flex justify-between py-1 border-b text-green-600"><span>Sale Discount</span><strong>- {formatCurrency(order.campaignDiscount)}</strong></div>)}
                            {order.couponCode && (<div className="flex justify-between py-1 border-b text-green-600"><span>Coupon ({order.couponCode})</span><strong>- {formatCurrency(order.couponDiscount)}</strong></div>)}
                            <div className="flex justify-between py-1 border-b"><span>Price After Discounts</span><strong>{formatCurrency((order.subtotal - (order.campaignDiscount || 0) - (order.couponDiscount || 0)))}</strong></div>
                            {order.taxAmount > 0 && (<div className="flex justify-between py-1 border-b"><span>GST</span><strong>+ {formatCurrency(order.taxAmount)}</strong></div>)}
                            <div className="flex justify-between py-1 border-b"><span>Shipping</span><strong>{formatCurrency(order.shippingCost)}</strong></div>
                            <div className="flex justify-between py-2 text-lg font-bold"><span>Grand Total</span><span>{formatCurrency(order.total)}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default AdminOrderDetail;