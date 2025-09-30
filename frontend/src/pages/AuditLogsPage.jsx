import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAuditLogs, fetchAuditLogStats, exportAuditLogs, cleanupAuditLogs, setFilters, setSort, setPagination, clearFilters } from '../store/slices/auditLogSlice';
import AuditLogTable from '../components/AuditLogs/AuditLogTable';
import AuditLogFilters from '../components/AuditLogs/AuditLogFilters';
import AuditLogStats from '../components/AuditLogs/AuditLogStats';
import Pagination from '../components/Common/Pagination';
import RoleBasedAccess from '../components/RoleBasedAccess';
import { useAuth } from '../auth/context/AuthProvider';
import { Download, Trash2, RefreshCw, Filter, BarChart3 } from 'lucide-react';

const AuditLogsPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { 
    logs, 
    stats, 
    pagination, 
    filters, 
    sort, 
    status, 
    error 
  } = useSelector(state => state.auditLogs);

  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [retentionDays, setRetentionDays] = useState(365);

  // Fetch audit logs and stats on component mount
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          await dispatch(fetchAuditLogStats());
        } catch (error) {
          console.error('Failed to load audit log stats:', error);
        }
      };
      
      loadData();
    }
  }, [dispatch, user]);

  // Fetch audit logs when filters, sort, or pagination change
  useEffect(() => {
    if (user) {
      const params = {
        page: pagination.current_page,
        limit: pagination.limit,
        ...filters,
        sort_by: sort.field,
        sort_order: sort.order
      };
      dispatch(fetchAuditLogs(params));
    }
  }, [dispatch, user, pagination.current_page, pagination.limit, filters, sort]);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(setPagination({ current_page: 1 })); // Reset to first page
  };

  const handleSortChange = (field) => {
    const newOrder = sort.field === field && sort.order === 'DESC' ? 'ASC' : 'DESC';
    dispatch(setSort({ field, order: newOrder }));
  };

  const handlePageChange = (page) => {
    dispatch(setPagination({ current_page: page }));
  };

  const handleExport = () => {
    dispatch(exportAuditLogs());
  };

  const handleCleanup = () => {
    if (window.confirm(`Are you sure you want to delete audit logs older than ${retentionDays} days? This action cannot be undone.`)) {
      dispatch(cleanupAuditLogs(retentionDays));
    }
  };

  const handleRefresh = () => {
    dispatch(fetchAuditLogs());
    dispatch(fetchAuditLogStats());
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  if (status.fetch === 'loading' && logs.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading audit logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">
            Comprehensive audit trail for compliance and security monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <BarChart3 size={16} />
            <span>Statistics</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={status.fetch === 'loading'}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={status.fetch === 'loading' ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExport}
            disabled={status.export === 'loading'}
            className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div className="mb-6">
          <AuditLogStats 
            stats={stats} 
            loading={status.stats === 'loading'} 
            error={error.stats}
          />
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <AuditLogFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}

      {/* Error Display */}
      {error.fetch && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 font-medium">
            {error.fetch.includes('Rate limit exceeded') ? 'Rate Limit Exceeded' : 'Error loading audit logs'}
          </div>
          <div className="text-red-600 text-sm">{error.fetch}</div>
          {error.fetch.includes('Rate limit exceeded') && (
            <div className="mt-2">
              <button
                onClick={handleRefresh}
                className="text-sm text-red-700 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        <AuditLogTable 
          logs={logs}
          loading={status.fetch === 'loading'}
          onSortChange={handleSortChange}
          sort={sort}
        />
        
        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              onPageChange={handlePageChange}
              hasNextPage={pagination.has_next_page}
              hasPrevPage={pagination.has_prev_page}
            />
          </div>
        )}
      </div>

      {/* Admin Actions */}
      <RoleBasedAccess allowedRoles={['admin']}>
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Administrative Actions</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="retention-days" className="text-sm text-yellow-700">
                Retention Days:
              </label>
              <input
                id="retention-days"
                type="number"
                min="30"
                max="3650"
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                className="w-20 px-2 py-1 border border-yellow-300 rounded text-sm"
              />
            </div>
            <button
              onClick={handleCleanup}
              disabled={status.cleanup === 'loading'}
              className="flex items-center space-x-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span>Cleanup Old Logs</span>
            </button>
          </div>
        </div>
      </RoleBasedAccess>
    </div>
  );
};

export default AuditLogsPage;
