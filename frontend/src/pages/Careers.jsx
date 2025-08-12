import React from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';
import { FiBriefcase } from 'react-icons/fi';

const Careers = () => {
    return (
        <PageTransition>
            <div className="bg-gray-50">
                <div className="container mx-auto px-4 py-12 md:py-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Careers at Fashion Mela Wear</h1>
                    <p className="text-lg text-gray-600 mt-4">Join our passionate team and help shape the future of fashion.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Why Work With Us?</h2>
                        <p>
                            Fashion Mela Wear is more than just a brand; we're a family of creative, driven, and passionate individuals. We believe in fostering a collaborative environment where every voice is heard and every team member has the opportunity to grow.
                        </p>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Current Openings</h2>
                        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                             <FiBriefcase className="text-gray-400 text-5xl mx-auto mb-4" />
                            <h3 className="font-bold text-xl text-gray-800">No Open Positions Currently</h3>
                            <p className="text-gray-500 mt-2">
                                We are not actively hiring at the moment, but we are always looking for exceptional talent. If you are passionate about fashion and believe you would be a great fit for our team, we'd love to hear from you.
                            </p>
                        </div>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Get in Touch</h2>
                        <p>
                            Please feel free to send your resume and a cover letter to <a href="mailto:careers@fashionmelawear.com" className="text-red-600 font-semibold hover:underline">careers@fashionmelawear.com</a>. We will keep your information on file for future opportunities.
                        </p>
                    </section>
                </div>
            </div>
        </PageTransition>
    );
};

export default Careers;