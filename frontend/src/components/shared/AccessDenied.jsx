import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiArrowLeft, FiGrid } from 'react-icons/fi';
import PageTransition from './PageTransition';

/**
 * A reusable component to display an "Access Denied" message.
 * It's shown when a user tries to access a page without the required permission.
 *
 * @param {object} props
 * @param {string} [props.permission] - The specific permission required (e.g., 'product_manage').
 */
const AccessDenied = ({ permission }) => {
    const navigate = useNavigate();

    // Helper function to format the permission string for display
    const formatPermission = (perm) => {
        if (!perm) return null;
        return perm
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word
    };

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto my-12 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-8 rounded-lg shadow-md" role="alert">
                <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                        <FiLock className="h-10 w-10 text-yellow-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-1">Access Denied</h2>
                        <p className="text-yellow-700">
                            You do not have the necessary permissions to view this page.
                        </p>
                        {permission && (
                            <p className="text-sm mt-3">
                                Required Permission: 
                                <code className="bg-yellow-200 text-yellow-900 font-semibold px-2 py-1 rounded text-xs font-mono ml-2">
                                    {formatPermission(permission)}
                                </code>
                            </p>
                        )}
                        <div className="mt-6 flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors shadow"
                            >
                                <FiArrowLeft /> Go Back
                            </button>
                            <Link
                                to="/admin"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors"
                            >
                                <FiGrid /> Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default AccessDenied;