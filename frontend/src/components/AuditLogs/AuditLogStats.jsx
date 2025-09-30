import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Users, Shield, Clock } from 'lucide-react';

const AuditLogStats = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error loading statistics</div>
          <div className="text-gray-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { summary, breakdown } = stats;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <BarChart3 size={24} className="text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Audit Log Statistics (Last 30 Days)</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <BarChart3 size={20} className="text-blue-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{summary.total_logs}</div>
              <div className="text-sm text-blue-700">Total Logs</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp size={20} className="text-green-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-green-900">{summary.recent_activity}</div>
              <div className="text-sm text-green-700">Last 24 Hours</div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-red-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-red-900">{summary.security_events}</div>
              <div className="text-sm text-red-700">Security Events</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock size={20} className="text-gray-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-gray-900">30</div>
              <div className="text-sm text-gray-700">Days Tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions Breakdown */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <Shield size={16} className="mr-2" />
            Top Actions
          </h4>
          <div className="space-y-2">
            {breakdown.by_action?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.action}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(item.count / breakdown.by_action[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Breakdown */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <AlertTriangle size={16} className="mr-2" />
            Severity Distribution
          </h4>
          <div className="space-y-2">
            {breakdown.by_severity?.map((item, index) => {
              const colors = {
                'LOW': 'bg-green-500',
                'MEDIUM': 'bg-yellow-500',
                'HIGH': 'bg-orange-500',
                'CRITICAL': 'bg-red-500'
              };
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.severity}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${colors[item.severity] || 'bg-gray-500'}`}
                        style={{ width: `${(item.count / summary.total_logs) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp size={16} className="mr-2" />
            Status Distribution
          </h4>
          <div className="space-y-2">
            {breakdown.by_status?.map((item, index) => {
              const colors = {
                'SUCCESS': 'bg-green-500',
                'WARNING': 'bg-yellow-500',
                'FAILURE': 'bg-red-500'
              };
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.status}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${colors[item.status] || 'bg-gray-500'}`}
                        style={{ width: `${(item.count / summary.total_logs) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Users */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <Users size={16} className="mr-2" />
            Most Active Users
          </h4>
          <div className="space-y-2">
            {breakdown.by_user?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.user_name}</div>
                  <div className="text-xs text-gray-500">{item.user_email}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(item.count / breakdown.by_user[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogStats;
