// frontend/src/dashboard/pages/Inbox.jsx

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiInbox, FiMail, FiUser, FiClock, FiLoader, FiAlertCircle } from 'react-icons/fi';
import PageTransition from '../../components/shared/PageTransition';
import { useAuth } from '../../context/AuthContext';
import AccessDenied from '../../components/shared/AccessDenied';
import apiClient from '../../api';

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const { can } = useAuth();

    useEffect(() => {
        const fetchMessages = async () => {
            // No permission check needed here, because the final check below will handle it.
            // If the user can't view, the component will show AccessDenied anyway.
            try {
                const { data } = await apiClient.get('/contact');
                if (data.success) {
                    setMessages(data.data);
                }
            } catch (err) {
                // Let the AccessDenied component handle permission errors.
                if (err.response?.status !== 403) {
                    setError('Failed to fetch messages. Please try again.');
                    toast.error('Failed to fetch messages.');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        // Only fetch if the user has permission to view.
        if (can('contact_view')) {
            fetchMessages();
        } else {
            setLoading(false);
        }
    }, [can]);
    
    const handleSelectMessage = async (message) => {
        setSelectedMessage(message);
        if (!message.isRead && can('contact_update')) { // Check for update permission
            try {
                await apiClient.put(`/contact/${message._id}/read`);
                setMessages(prev => 
                    prev.map(m => m._id === message._id ? { ...m, isRead: true } : m)
                );
            } catch (err) {
                console.error("Failed to mark message as read", err);
                toast.error("Could not update message status.");
            }
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-4xl text-red-500" /></div>;
    }

    // ✅ CORRECTED: This is the final check for the entire page.
    // It uses the new, specific permission string.
    if (!can('contact_view')) {
        return <AccessDenied permission="contact_view" />;
    }

    if (error) {
        return <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg flex items-center justify-center gap-2"><FiAlertCircle /> {error}</div>;
    }

    return (
        <PageTransition>
            <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiInbox /> Customer Inbox
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm h-[75vh] flex flex-col">
                    <h2 className="text-lg font-semibold border-b pb-2 mb-2">Messages</h2>
                    <div className="overflow-y-auto">
                        {messages.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No messages found.</p>
                        ) : (
                            <ul className="space-y-2">
                                {messages.map(msg => (
                                    <li key={msg._id} onClick={() => handleSelectMessage(msg)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedMessage?._id === msg._id ? 'bg-red-100' : 'hover:bg-gray-100'}`}>
                                        <div className="flex justify-between items-center">
                                            <p className={`font-semibold truncate ${!msg.isRead ? 'text-gray-800' : 'text-gray-500'}`}>{msg.name}</p>
                                            {!msg.isRead && <span className="h-2 w-2 bg-red-500 rounded-full flex-shrink-0 ml-2"></span>}
                                        </div>
                                        <p className={`text-sm truncate ${!msg.isRead ? 'text-gray-600' : 'text-gray-400'}`}>{msg.subject}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm h-[75vh] flex flex-col">
                    {selectedMessage ? (
                         <div className="flex flex-col h-full">
                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-2xl font-bold text-gray-800">{selectedMessage.subject}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                    <span className="flex items-center gap-1.5"><FiUser size={14} /> {selectedMessage.name}</span>
                                    <span className="flex items-center gap-1.5"><FiMail size={14} /> <a href={`mailto:${selectedMessage.email}`} className="text-red-600 hover:underline">{selectedMessage.email}</a></span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-2">
                                    <FiClock size={12} /> Received: {new Date(selectedMessage.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto pr-2">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <FiInbox size={48} className="mb-4" />
                            <p className="text-lg">Select a message to read</p>
                            <p className="text-sm">Unread messages are marked with a red dot.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default Inbox;