import React from 'react';
import { Link } from 'react-router-dom'; // ✅ ADDED: Import Link for better navigation
import PageTransition from '../components/shared/PageTransition';

const ProductReturns = () => {
    return (
        <PageTransition>
            <div className="bg-gray-50">
                <div className="container mx-auto px-4 py-12 md:py-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Product Returns Policy</h1>
                    <p className="text-lg text-gray-600 mt-4">A simple and hassle-free return process.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Easy Returns</h2>
                        <p>
                            We understand that sometimes an item just isn't right for you. That's why we've made our return process as easy as possible. You can return most new, unopened items within 30 days of delivery for a full refund or exchange.
                        </p>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Conditions for Return</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>The product must be returned within 30 days of the delivery date.</li>
                            <li>The product must be in its original condition: unworn, unwashed, and with all original tags and packaging intact.</li>
                            <li>Items marked as "Final Sale" cannot be returned or exchanged.</li>
                        </ul>
                    </section>
                    
                    {/* ✅ MODIFIED: This entire section has been updated with the new, correct instructions */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">How to Start a Return</h2>
                        <p className="mb-4">
                            Initiating a return is simple and can be done directly from your account:
                        </p>
                         <ol className="list-decimal list-inside space-y-3">
                            <li>
                                First, log in and go to your <Link to="/profile/orders" className="text-red-600 font-semibold hover:underline">Order History</Link> page.
                            </li>
                            <li>
                                Locate the order you wish to return. Only orders with a "Delivered" status are eligible for returns.
                            </li>
                             <li>
                                Click the "Request Return" button. You can find this on the main order list or on the specific order's detail page.
                            </li>
                            <li>
                                A form will pop up. Please provide a clear reason for the return and submit the request.
                            </li>
                             <li>
                                Our team will review your request. You can track the status ("Pending", "Approved", or "Rejected") from your order history.
                            </li>
                        </ol>
                    </section>
                </div>
            </div>
        </PageTransition>
    );
};

export default ProductReturns;