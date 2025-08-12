// frontend/src/dashboard/pages/AuditLog.jsx (Complete with Single Delete)

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { FiPlusCircle, FiEdit, FiTrash2, FiLogIn, FiAlertCircle, FiShield, FiFileText, FiClock, FiAlertTriangle } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

const SmallSpinner = () => <FiClock className="animate-spin text-gray-400" />;

const FullPageSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
  </div>
);

const entityIcons = {
    Product: <FiFileText className="text-blue-500" />,
    Order: <FiFileText className="text-green-500" />,
    User: <FiFileText className="text-purple-500" />,
    Role: <FiFileText className="text-indigo-500" />,
    Coupon: <FiFileText className="text-pink-500" />,
    Campaign: <FiFileText className="text-orange-500" />,
    Auth: <FiLogIn className="text-gray-500" />,
    AuditLog: <FiShield className="text-gray-600" />,
    default: <FiFileText className="text-gray-400" />,
};

const AuditLog = () => {
  const { can } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchLogs = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      const { data } = await apiClient.get('/auditlog', {
        params: { page: currentPage, limit, sort: '-timestamp' }
      });
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch audit logs.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchLogs(true);
  }, [currentPage, limit]);

  useEffect(() => {
    const handleFocus = () => fetchLogs(false);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchLogs]);

  const handleClearAll = async () => {
    const result = await Swal.fire({
      title: 'Are you absolutely sure?',
      text: "This action cannot be undone. All log entries (except for this action itself) will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear all logs!'
    });

    if (result.isConfirmed) {
      try {
        const promise = apiClient.delete('/auditlog/clear');
        await toast.promise(promise, {
          loading: 'Clearing logs...',
          success: 'Audit log cleared successfully!',
          error: 'Failed to clear logs.'
        });
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchLogs(true);
        }
      } catch (err) {
        // toast.promise handles error
      }
    }
  };

  const handleDeleteSingle = async (logId, logDetails) => {
    const result = await Swal.fire({
      title: 'Delete this entry?',
      html: `You are about to permanently delete the log:<br/><i>"${logDetails}"</i>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const promise = apiClient.delete(`/auditlog/${logId}`);
        await toast.promise(promise, {
            loading: 'Deleting entry...',
            success: 'Log entry deleted.',
            error: 'Failed to delete entry.'
        });
        setLogs(prevLogs => prevLogs.filter(log => log._id !== logId));
      } catch (err) {
        // toast.promise handles error
      }
    }
  };

  const handleNextPage = () => {
    if (pagination.next) setCurrentPage(pagination.next.page);
  };

  const handlePrevPage = () => {
    if (pagination.prev) setCurrentPage(pagination.prev.page);
  };

  const renderActionIcon = (action) => {
    if (action.includes('CREATE')) return <FiPlusCircle className="text-green-500" />;
    if (action.includes('UPDATE')) return <FiEdit className="text-yellow-500" />;
    if (action.includes('DELETE') || action.includes('CLEAR')) return <FiTrash2 className="text-red-500" />;
    if (action.includes('LOGIN_SUCCESS')) return <FiLogIn className="text-green-500" />;
    if (action.includes('LOGIN_FAIL')) return <FiAlertCircle className="text-red-500" />;
    return <FiShield className="text-gray-400" />;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">System Activity Log</h1>
        <div className="flex items-center gap-4">
          {isRefreshing && <SmallSpinner />}
          {can('auditlog_manage') && (
            <button
              onClick={handleClearAll}
              disabled={logs.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FiAlertTriangle />
              Clear All Logs
            </button>
          )}
        </div>
      </div>
      
      {loading && <FullPageSpinner />}

      {error && !loading && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white shadow-lg rounded-lg">
          <div className="space-y-2 p-4">
            {logs.length > 0 ? logs.map((log) => (
              <div key={log._id} className="flex items-center gap-4 p-4 border rounded-md hover:bg-gray-50/50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {renderActionIcon(log.action)}
                </div>
                <div className="flex-1 flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-bold">{log.userName}</span>
                      <span className="text-gray-500">
                        {' '}
                        {log.action.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    </p>
                    
                    {log.link ? (
                      <Link to={log.link} className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition-colors">
                        {log.details}
                      </Link>
                    ) : (
                      <p className="text-sm text-gray-600">{log.details}</p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0" title={log.entity}>
                      {entityIcons[log.entity] || entityIcons.default}
                    </div>
                    {can('auditlog_delete_entry') && (
                      <button 
                        onClick={() => handleDeleteSingle(log._id, log.details)}
                        className="p-2 text-gray-400 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors"
                        title="Delete this log entry"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-16 px-6">
                <FiShield size={48} className="mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-800">No Activity Yet</h3>
                <p className="mt-1 text-sm text-gray-500">When an administrator makes a change, it will appear here.</p>
              </div>
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{pagination.totalPages || 1}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevPage} disabled={!pagination.prev || isRefreshing} className="px-4 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                <button onClick={handleNextPage} disabled={!pagination.next || isRefreshing} className="px-4 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLog;