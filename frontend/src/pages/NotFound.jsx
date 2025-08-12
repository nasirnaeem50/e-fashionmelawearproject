// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';

const NotFound = () => {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-6xl font-bold text-red-500">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 mb-8">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="bg-red-500 text-white font-bold py-3 px-8 rounded-md hover:bg-red-600 transition duration-300"
        >
          GO TO HOMEPAGE
        </Link>
      </div>
    </PageTransition>
  );
};

export default NotFound;