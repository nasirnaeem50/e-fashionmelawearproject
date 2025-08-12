import React, { useState, useEffect, useMemo, useCallback } from "react";
import PageTransition from "../../../components/shared/PageTransition";
import StatCard from "../../../dashboard/components/StatCard";
import { useShop } from "../../../context/ShopContext";
import { useAuth } from "../../../context/AuthContext";
// import axios from 'axios'; // <-- REMOVED
import apiClient from '../../../api'; // <-- ADDED
import { toast } from 'react-toastify';
import Swal from 'sweetalert2'; // <-- ADDED for delete confirmation
import { FiStar, FiThumbsUp, FiThumbsDown, FiClock, FiCheckCircle, FiLoader, FiTrash2 } from "react-icons/fi";
import AccessDenied from "../../../components/shared/AccessDenied";

const ProductReviews = () => {
  const { can, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refetchProducts } = useShop();

  const fetchReviews = useCallback(async () => {
    if (!can('review_view')) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Use apiClient for secure, token-aware calls
      const res = await apiClient.get('/reviews'); // <-- CHANGED
      setReviews(res.data.data);
    } catch (error) {
      if(error.response?.status !== 401) toast.error("Could not fetch reviews.");
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [can]);

  useEffect(() => {
    if (!authLoading) {
      fetchReviews();
    }
  }, [fetchReviews, authLoading]);

  const handleUpdateStatus = async (reviewId, newStatus) => {
    if (!can('review_edit')) {
      toast.error("Permission Denied: You cannot update review status.");
      return;
    }
    try {
      // Use apiClient for the update
      await apiClient.put(`/reviews/${reviewId}`, { status: newStatus }); // <-- CHANGED
      toast.success(`Review status updated!`);
      await fetchReviews();
      await refetchProducts();
    } catch (error) {
      if(error.response?.status !== 401) toast.error(error.response?.data?.error || "Failed to update review status.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!can('review_delete')) {
      toast.error("Permission Denied: You cannot delete reviews.");
      return;
    }
    const { isConfirmed } = await Swal.fire({
        title: 'Delete this review?',
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Yes, delete it!'
    });
    
    if (isConfirmed) {
      try {
        // Use apiClient for the delete
        await apiClient.delete(`/reviews/${reviewId}`); // <-- CHANGED
        toast.warn("Review has been deleted.");
        await fetchReviews();
        await refetchProducts();
      } catch (error) {
        if(error.response?.status !== 401) toast.error(error.response?.data?.error || "Failed to delete review.");
        console.error("Error deleting review:", error);
      }
    }
  };

  const reviewStats = useMemo(() => ({
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  }), [reviews]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-4xl text-red-500" />
      </div>
    );
  }

  if (!can('review_view')) {
    return <AccessDenied permission="review_view" />;
  }
  
  // The rest of your JSX is perfect and remains unchanged.
  return (
    <PageTransition>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard icon={<FiStar size={20} />} title="Total Reviews" value={reviewStats.total} color="blue" />
        <StatCard icon={<FiClock size={20} />} title="Pending Approval" value={reviewStats.pending} color="yellow" />
        <StatCard icon={<FiCheckCircle size={20} />} title="Approved Reviews" value={reviewStats.approved} color="green" />
        <StatCard icon={<FiThumbsDown size={20} />} title="Rejected Reviews" value={reviewStats.rejected} color="red" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FiStar className="mr-2" /> All Product Reviews</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Date</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Product</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Customer</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Rating</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Comment</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Status</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {reviews.length > 0 ? (
                reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((review) => (
                    <tr key={review.id} className="border-b">
                        <td className="py-3 px-4 text-sm">{new Date(review.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-medium">{review.product?.name || 'Deleted Product'}</td>
                        <td className="py-3 px-4">{review.user?.name || 'Deleted User'}</td>
                        <td className="py-3 px-4"><div className="flex items-center">{review.rating} <FiStar className="ml-1 text-yellow-400" /></div></td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{review.comment || "-"}</td>
                        <td className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${review.status === "approved" ? "bg-green-100 text-green-800" : review.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{review.status}</span></td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {can('review_edit') && (
                              <>
                                <button onClick={() => handleUpdateStatus(review.id, "approved")} disabled={review.status === "approved"} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed" title="Approve"><FiThumbsUp size={16} /></button>
                                <button onClick={() => handleUpdateStatus(review.id, "rejected")} disabled={review.status === "rejected"} className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:bg-yellow-300 disabled:cursor-not-allowed" title="Reject"><FiThumbsDown size={16} /></button>
                              </>
                            )}
                            {can('review_delete') && (
                              <button onClick={() => handleDeleteReview(review.id)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors" title="Delete Permanently"><FiTrash2 size={16} /></button>
                            )}
                          </div>
                        </td>
                    </tr>
                ))
              ) : (<tr><td colSpan="7" className="text-center py-10 text-gray-500">No customer reviews have been submitted yet.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
};
export default ProductReviews;