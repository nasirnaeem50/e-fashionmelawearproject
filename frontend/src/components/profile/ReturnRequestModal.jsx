import React, { useState } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
// ✅ THIS IS THE CORRECT IMPORT. It uses the hook, not the context directly.
import { useOrders } from '../../context/OrderContext';
import { toast } from 'react-toastify';

const ReturnRequestModal = ({ order, onClose }) => {
    // ✅ THIS IS THE CORRECT USAGE.
    const { requestReturn } = useOrders();
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error("Please provide a reason for the return.");
            return;
        }
        setIsSubmitting(true);
        const success = await requestReturn(order.id, reason);
        setIsSubmitting(false);
        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">×</button>
                <h2 className="text-xl font-bold mb-4">Request a Return for Order #{order.id.slice(-6).toUpperCase()}</h2>
                <p className="text-sm text-gray-600 mb-6">Please provide a reason for your return request. Our team will review it and get back to you shortly.</p>
                
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., 'The size was incorrect', 'Item was damaged upon arrival', etc."
                        rows="4"
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-red-300 focus:border-red-400"
                        required
                    />
                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting || !reason.trim()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <FaSpinner className="animate-spin"/> : <FaPaperPlane />}
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnRequestModal;