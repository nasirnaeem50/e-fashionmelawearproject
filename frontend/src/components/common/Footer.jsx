import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../../api'; // <-- ADDED
import { toast } from 'react-toastify';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP } from 'react-icons/fa';
import { useCMS } from '../../context/CMSContext';

const socialIconMap = {
    facebook: <FaFacebookF />,
    twitter: <FaTwitter />,
    instagram: <FaInstagram />,
    pinterest: <FaPinterestP />,
};

const Footer = () => {
    const { content, loading } = useCMS();
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter an email address.");
            return;
        }
        setIsSubscribing(true);
        const toastId = toast.loading("Subscribing...");
        try {
            // Use apiClient for a consistent, centralized API call.
            const response = await apiClient.post(
                '/newsletter/subscribe', // <-- CHANGED
                { email }
            );
            toast.update(toastId, {
                render: response.data.message,
                type: 'success',
                isLoading: false,
                autoClose: 4000,
            });
            setEmail('');
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Subscription failed. Please try again.";
            toast.update(toastId, {
                render: errorMessage,
                type: 'error',
                isLoading: false,
                autoClose: 4000,
            });
        } finally {
            setIsSubscribing(false);
        }
    };

    if (loading || !content) {
        return (
            <footer className="bg-[#212121] text-gray-300 pt-16 pb-8 animate-pulse">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div><div className="h-20 w-40 bg-gray-700 rounded mb-4"></div><div className="h-4 w-3/4 bg-gray-700 rounded mb-2"></div><div className="h-8 w-1/2 bg-gray-700 rounded"></div></div>
                        <div><div className="h-6 w-1/2 bg-gray-700 rounded mb-4"></div><div className="h-4 w-3/4 bg-gray-700 rounded mb-2"></div><div className="h-4 w-2/3 bg-gray-700 rounded mb-2"></div></div>
                        <div><div className="h-6 w-1/2 bg-gray-700 rounded mb-4"></div><div className="h-4 w-3/4 bg-gray-700 rounded mb-2"></div><div className="h-4 w-2/3 bg-gray-700 rounded mb-2"></div></div>
                        <div><div className="h-6 w-1/2 bg-gray-700 rounded mb-4"></div><div className="h-4 w-full bg-gray-700 rounded mb-4"></div><div className="h-10 w-full bg-gray-700 rounded-md"></div></div>
                    </div>
                </div>
            </footer>
        )
    }

    return (
        <footer className="bg-[#212121] text-gray-300 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Column 1: About */}
                    <div className="space-y-4">
                        <Link to="/">
                            <img src={content.header?.logoUrl || "/images/logop.png"} alt="fashionmelawear" className="h-20 w-auto filter invert" />
                        </Link>
                        <p>Got Question? Call us 24/7</p>
                        <p className="text-2xl font-bold text-white">
                            <a href={`tel:${content.contact?.phone}`} className="hover:text-red-400">{content.contact?.phone}</a>
                        </p>
                        <p>{content.contact?.address}</p>
                        <p>
                            <a href={`mailto:${content.contact?.email}`} className="hover:text-red-400">{content.contact?.email}</a>
                        </p>
                    </div>

                    {/* Column 2: Company */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">COMPANY</h3>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="hover:text-red-400">About Us</Link></li>
                            <li><Link to="/about#team-section" className="hover:text-red-400">Team Member</Link></li>
                            <li><Link to="/careers" className="hover:text-red-400">Career</Link></li>
                            <li><Link to="/contact" className="hover:text-red-400">Contact Us</Link></li>
                            <li><Link to="#" className="hover:text-red-400 opacity-50 cursor-not-allowed">Affiliate</Link></li>
                            <li><Link to="/profile/orders" className="hover:text-red-400">Order History</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Customer Service */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">CUSTOMER SERVICE</h3>
                        <ul className="space-y-2">
                            <li><Link to="/money-back-guarantee" className="hover:text-red-400">Money-back Guarantee!</Link></li>
                            <li><Link to="/product-returns" className="hover:text-red-400">Products Returns</Link></li>
                            <li><Link to="/contact" className="hover:text-red-400">Support Center</Link></li>
                            <li><Link to="/shipping-policy" className="hover:text-red-400">Shipping</Link></li>
                            <li><Link to="/terms-and-conditions" className="hover:text-red-400">Term and Conditions</Link></li>
                        </ul>
                    </div>
                    
                    {/* Column 4: Newsletter & Meta */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">OUR NEWSLETTER</h3>
                        <p className="mb-4">To stay up-to-date on our promotions, discounts, sales, special offers and more.</p>
                        <form className="flex" onSubmit={handleNewsletterSubmit}>
                            <input 
                                type="email" 
                                placeholder="Your E-mail Address" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-l-md focus:outline-none border border-gray-600 focus:border-red-500 placeholder-gray-400" 
                            />
                            <button 
                                type="submit" 
                                disabled={isSubscribing}
                                className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-6 py-1.5 rounded-r-md font-semibold transition-colors duration-300 disabled:bg-red-400 disabled:cursor-not-allowed"
                            >
                                {isSubscribing ? '...' : 'SIGN UP'}
                            </button>
                        </form>
                        
                        <div className="flex space-x-4 mt-6">
                            {content.footer?.socialLinks?.map(social => (
                                <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" aria-label={social.platform}>
                                    {socialIconMap[social.platform.toLowerCase()] || null}
                                </a>
                            ))}
                        </div>
                        
                        {content.footer?.paymentMethodIcons && content.footer.paymentMethodIcons.length > 0 && (
                            <div className="mt-8">
                                <p className="mb-3 font-medium">We're using safe payment for:</p>
                                <div className="flex items-center space-x-4">
                                    {content.footer.paymentMethodIcons.map(icon => (
                                        <div key={icon.altText} className="relative group flex justify-center">
                                            <img 
                                                src={icon.iconUrl} 
                                                alt={icon.altText} 
                                                className="h-6" 
                                            />
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 z-10 mt-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap">
                                                {icon.altText}
                                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-gray-800"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p>{content.footer?.copyrightText || `Copyright © ${new Date().getFullYear()} Fashion Mela Wear. All Rights Reserved.`}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;