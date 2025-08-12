import React from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';

const TermsAndConditions = () => {
    return (
        <PageTransition>
            <div className="bg-gray-50">
                <div className="container mx-auto px-4 py-12 md:py-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Terms and Conditions</h1>
                    <p className="text-lg text-gray-600 mt-4">Please read these terms carefully before using our service.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto space-y-8 text-gray-700 leading-relaxed">
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                        <p><strong>Disclaimer:</strong> This is a template for Terms and Conditions and is not legal advice. You should consult with a legal professional to ensure this policy is complete and compliant for your business.</p>
                    </div>

                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
                        <p>
                            Welcome to Fashion Mela Wear. These Terms and Conditions govern your use of our website located at [Your Website URL] and form a binding contractual agreement between you, the user of the Site, and us. By using the Site, you agree to be bound by these Terms and Conditions.
                        </p>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Intellectual Property</h2>
                        <p>
                            The content on this Site, including text, graphics, logos, images, and software, is the property of Fashion Mela Wear and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from any content on this Site without our express written permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Accounts</h2>
                        <p>
                            When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                        </p>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Purchases and Payment</h2>
                        <p>
                            If you wish to purchase any product or service made available through the Site, you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information. You agree to pay all charges incurred by you or on your behalf through the Site, at the prices in effect when such charges are incurred.
                        </p>
                    </section>

                     <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Limitation of Liability</h2>
                        <p>
                           In no event shall Fashion Mela Wear, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Changes to Terms</h2>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms and Conditions on this page.
                        </p>
                    </section>

                     <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please <Link to="/contact" className="text-red-600 font-semibold hover:underline">contact us</Link>.
                        </p>
                    </section>
                </div>
            </div>
        </PageTransition>
    );
};

export default TermsAndConditions;