import React from 'react';
import PageTransition from '../components/shared/PageTransition';
import { FiTool, FiClock } from 'react-icons/fi';

const MaintenancePage = () => {
    return (
        <PageTransition>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
                <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl max-w-lg">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-100 rounded-full">
                            <FiTool className="text-red-500 w-12 h-12" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        We'll be back soon!
                    </h1>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        Sorry for the inconvenience. We're performing some scheduled maintenance to improve our service. 
                        We'll be back online shortly!
                    </p>
                    <div className="flex items-center justify-center text-gray-500">
                        <FiClock className="mr-2" />
                        <span>Thank you for your patience.</span>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default MaintenancePage;