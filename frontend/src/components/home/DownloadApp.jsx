// src/components/home/DownloadApp.jsx
import React from 'react';

const DownloadApp = () => {
    return (
        <div className="bg-cover bg-center text-white" style={{backgroundImage: "url('/images/banners/app-bg.jpg')"}}>
            <div className="bg-black bg-opacity-60 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-3">Download App Now!</h2>
                    <p className="max-w-2xl mx-auto mb-8 text-gray-200">
                        Shopping fastly and more easily with our app. Get a link to download the app on your phone.
                    </p>
                    <form className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4 mb-8">
                        <input 
                            type="email" 
                            placeholder="Enter Your Email..." 
                            className="flex-grow px-5 py-3 rounded-md text-gray-800 bg-white border-2 border-gray-300 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 placeholder-gray-500" 
                            required
                        />
                        <button 
                            type="submit" 
                            className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-3 px-8 rounded-md transition duration-300 whitespace-nowrap"
                        >
                            SEND LINK
                        </button>
                    </form>
                    <div className="flex justify-center space-x-4">
                        <a href="#" className="hover:opacity-90 transition-opacity">
                            {/* Added rounded-lg class here */}
                            <img src="/images/app1.png" alt="Download on the App Store" className="h-12 rounded-lg"/>
                        </a>
                        <a href="#" className="hover:opacity-90 transition-opacity">
                            {/* Added rounded-lg class here */}
                            <img src="/images/google.webp" alt="Get it on Google Play" className="h-12 rounded-lg"/>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DownloadApp;