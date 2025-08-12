import React from 'react';
import { Link } from 'react-router-dom'; // ✅ ADDED: Import Link for a better user experience
import PageTransition from '../components/shared/PageTransition';

const MoneyBackGuarantee = () => {
    return (
        <PageTransition>
            <div className="bg-gray-50">
                <div className="container mx-auto px-4 py-12 md:py-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Money-Back Guarantee</h1>
                    <p className="text-lg text-gray-600 mt-4">Your satisfaction is our priority.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Commitment to You</h2>
                        <p>
                            At Fashion Mela Wear, we stand behind the quality of our products. If you are not completely satisfied with your purchase, we offer a straightforward money-back guarantee to ensure a risk-free shopping experience. Our goal is to make sure you love what you buy.
                        </p>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Eligibility for a Refund</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Requests must be made within 30 days of the delivery date.</li>
                            <li>The item must be in its original, unused, and unworn condition with all tags attached.</li>
                            <li>Proof of purchase, such as your order number or receipt, is required.</li>
                            <li>Customized or final sale items are not eligible for a refund.</li>
                        </ul>
                    </section>
                    
                    {/* ✅ MODIFIED: This entire section has been updated with the new instructions */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">How to Request a Refund</h2>
                        <p className="mb-4">
                            We've made requesting a return simple and easy directly from your account:
                        </p>
                        <ol className="list-decimal list-inside space-y-3">
                            <li>
                                Navigate to your <Link to="/profile/orders" className="text-red-600 font-semibold hover:underline">Order History</Link> in your profile.
                            </li>
                            <li>
                                Find the order you wish to return. The order status must be "Delivered" to be eligible.
                            </li>
                            <li>
                                Click the "Request Return" button associated with that order.
                            </li>
                            <li>
                                Fill out the short form explaining the reason for your return and submit it. Our support team will review your request and be in touch promptly.
                            </li>
                        </ol>
                    </section>
                </div>
            </div>
        </PageTransition>
    );
};

export default MoneyBackGuarantee;