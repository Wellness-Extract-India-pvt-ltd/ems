import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, Clock, User, Shield, AlertTriangle } from 'lucide-react';

const AuditLogTable = ({ logs, loading, onSortChange, sort }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (logId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILURE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getSortIcon = (field) => {
    if (sort.field !== field) return null;
    return sort.order === 'ASC' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading audit logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
              onClick={() => onSortChange('created_at')}
            >
              <div className="flex items-center space-x-1">
                <Clock size={16} />
                <span>Timestamp</span>
                {getSortIcon('created_at')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
              onClick={() => onSortChange('user_name')}
            >
              <div className="flex items-center space-x-1">
                <User size={16} />
                <span>User</span>
                {getSortIcon('user_name')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
              onClick={() => onSortChange('action')}
            >
              <div className="flex items-center space-x-1">
                <Shield size={16} />
                <span>Action</span>
                {getSortIcon('action')}
              </div>
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-600">Resource</th>
            <th 
              className="px-6 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
              onClick={() => onSortChange('severity')}
            >
              <div className="flex items-center space-x-1">
                <AlertTriangle size={16} />
                <span>Severity</span>
                {getSortIcon('severity')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
              onClick={() => onSortChange('status')}
            >
              <span>Status</span>
              {getSortIcon('status')}
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-600">IP Address</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                No audit logs found. Try adjusting your filters or check back later.
              </td>
            </tr>
          ) : (
            logs.map(log => (
              <React.Fragment key={log.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                    {formatTimestamp(log.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{log.user_name}</div>
                      <div className="text-sm text-gray-500">{log.user_email}</div>
                      <div className="text-xs text-gray-400">{log.user_role}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{log.action}</div>
                    {log.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs" title={log.description}>
                        {log.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{log.resource_type}</div>
                    {log.resource_name && (
                      <div className="text-xs text-gray-500">{log.resource_name}</div>
                    )}
                    {log.resource_id && (
                      <div className="text-xs text-gray-400">ID: {log.resource_id}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip_address || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleRowExpansion(log.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
                {expandedRows.has(log.id) && (
                  <tr className="bg-gray-50">
                    <td colSpan="8" className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
                          <div className="space-y-1 text-sm">
                            <div><span className="font-medium">Category:</span> {log.category}</div>
                            {log.tags && log.tags.length > 0 && (
                              <div><span className="font-medium">Tags:</span> {log.tags.join(', ')}</div>
                            )}
                            {log.session_id && (
                              <div><span className="font-medium">Session ID:</span> {log.session_id}</div>
                            )}
                            {log.user_agent && (
                              <div><span className="font-medium">User Agent:</span> {log.user_agent}</div>
                            )}
                          </div>
                        </div>
                        {(log.old_values || log.new_values) && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Data Changes</h4>
                            {log.old_values && (
                              <div className="mb-2">
                                <div className="text-xs font-medium text-red-600 mb-1">Old Values:</div>
                                <pre className="text-xs bg-red-50 p-2 rounded text-red-800 overflow-auto max-h-32">
                                  {JSON.stringify(log.old_values, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.new_values && (
                              <div>
                                <div className="text-xs font-medium text-green-600 mb-1">New Values:</div>
                                <pre className="text-xs bg-green-50 p-2 rounded text-green-800 overflow-auto max-h-32">
                                  {JSON.stringify(log.new_values, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogTable;
