import React from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';

const ShippingPolicy = () => {
    return (
        <PageTransition>
            <div className="bg-gray-50">
                <div className="container mx-auto px-4 py-12 md:py-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Shipping Policy</h1>
                    <p className="text-lg text-gray-600 mt-4">Everything you need to know about your delivery.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto space-y-8 text-gray-700 leading-relaxed">
                    
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Processing Time</h2>
                        <p>
                            All orders are processed within 1-2 business days (excluding weekends and holidays) after you receive your order confirmation email. You will receive another notification when your order has shipped.
                        </p>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shipping Rates & Delivery Estimates</h2>
                        <p className="mb-4">
                            Shipping charges for your order will be calculated and displayed at checkout. We offer the following shipping options:
                        </p>
                        <div className="border rounded-lg p-4">
                            <h3 className="font-bold">Standard Shipping (Nationwide)</h3>
                            <p className="text-sm text-gray-600">3-5 Business Days</p>
                            <p className="font-semibold mt-1">Rs 250</p>
                        </div>
                        <div className="border rounded-lg p-4 mt-4 bg-red-50 border-red-200">
                            <h3 className="font-bold text-red-800">Free Shipping Offer</h3>
                            <p>We offer free standard shipping on all orders over Rs 5,000.</p>
                        </div>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">How Do I Check My Order Status?</h2>
                        <p>
                            When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.
                        </p>
                        <p className="mt-2">
                            You can also track your order status by visiting your{' '}
                            <Link to="/profile/orders" className="text-red-600 font-semibold hover:underline">
                                Order History
                            </Link> in your profile.
                        </p>
                    </section>

                     <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Questions?</h2>
                        <p>
                            If you have any further questions or concerns about your order's shipping, please don't hesitate to{' '}
                            <Link to="/contact" className="text-red-600 font-semibold hover:underline">
                                contact us
                            </Link>.
                        </p>
                    </section>
                </div>
            </div>
        </PageTransition>
    );
};

export default ShippingPolicy;