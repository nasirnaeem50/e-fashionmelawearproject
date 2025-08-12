// frontend/src/dashboard/components/ReminderComposerModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCopy, FiSend } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ReminderComposerModal = ({ cart, onClose }) => {
    if (!cart) return null;

    // ✅ DEFINITIVE FIX: Access the nested user object provided by the backend.
    const userName = cart.user?.name || cart.user?.email?.split('@')[0] || 'Valued Customer';
    const userEmail = cart.user?.email;

    const subject = "You left something in your cart! 🛒";
    
    // Generate the plain text body
    const bodyText = `
Hi ${userName},

We noticed you left some wonderful items in your shopping cart at Fashion Mela!

Here's what you left behind:
${cart.items.map(item => `- ${item.name} (x${item.quantity}) - Rs ${item.price.toLocaleString()}`).join('\n')}

Total Cart Value: Rs ${cart.totalValue.toLocaleString()}

Ready to complete your order?
Click here: ${window.location.origin}/cart

We're holding these for you for a little while longer. Don't miss out!

Best,
The Fashion Mela Team
    `.trim();

    // Generate the mailto link which opens the user's default email client
    const mailtoLink = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(bodyText);
        toast.success("Reminder text copied to clipboard!");
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 50 }}
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Compose Reminder for {userEmail}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full"><FiX size={20} /></button>
                    </div>

                    <div className="p-6">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input type="text" readOnly value={subject} className="w-full p-2 border rounded-md bg-gray-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                            <textarea
                                readOnly
                                value={bodyText}
                                rows="12"
                                className="w-full p-2 border rounded-md bg-gray-100 font-mono text-sm"
                            ></textarea>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                            Click 'Open in Email' or copy the text.
                        </p>
                        <div className="flex gap-3">
                             <button 
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 shadow-sm"
                            >
                                <FiCopy /> Copy Text
                            </button>
                            <a 
                                href={mailtoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 shadow-sm"
                            >
                                <FiSend /> Open in Email
                            </a>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReminderComposerModal;