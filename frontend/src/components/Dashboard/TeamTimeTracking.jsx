import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTeamTimeTracking } from '../../store/slices/timeTrackingSlice';
import { MapPin, Clock, User, Calendar, Filter, Download } from 'lucide-react';

const TeamTimeTracking = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { teamData, loading, error } = useSelector(state => state.timeTracking);
  
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    employeeId: '',
    departmentId: ''
  });
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    // Only load team data for admins and managers
    if (['admin', 'manager'].includes(user?.role)) {
      dispatch(getTeamTimeTracking(filters));
    }
  }, [dispatch, user?.role, filters]);

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const formatDuration = (hours) => {
    if (!hours) return '00:00';
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'checked_in': return 'bg-green-100 text-green-800';
      case 'checked_out': return 'bg-red-100 text-red-800';
      case 'on_break': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const openLocationModal = (session) => {
    setSelectedSession(session);
  };

  const closeLocationModal = () => {
    setSelectedSession(null);
  };

  if (!['admin', 'manager'].includes(user?.role)) {
    return null; // Don't show for regular employees
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Team Time Tracking</h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <input
            type="text"
            placeholder="Employee ID"
            value={filters.employeeId}
            onChange={(e) => handleFilterChange('employeeId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <input
            type="text"
            placeholder="Department ID"
            value={filters.departmentId}
            onChange={(e) => handleFilterChange('departmentId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Team Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamData.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No time tracking data found
                </td>
              </tr>
            ) : (
              teamData.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {session.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {session.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDate(session.workDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatTime(session.checkInTime)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatTime(session.checkOutTime)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDuration(session.totalHours)}
                    </div>
                    {session.overtimeHours > 0 && (
                      <div className="text-xs text-orange-600">
                        +{formatDuration(session.overtimeHours)} OT
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                      {session.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openLocationModal(session)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      View Location
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Location Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Location Details
              </h3>
              <button
                onClick={closeLocationModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Employee: {selectedSession.employeeName}</h4>
                <p className="text-sm text-gray-600">Date: {formatDate(selectedSession.workDate)}</p>
              </div>
              
              {selectedSession.checkInLocation && (
                <div className="border rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 mb-2">Check-In Location</h5>
                  <div className="text-sm text-gray-600">
                    <p>Latitude: {selectedSession.checkInLocation.latitude}</p>
                    <p>Longitude: {selectedSession.checkInLocation.longitude}</p>
                    {selectedSession.checkInLocation.address && (
                      <p>Address: {selectedSession.checkInLocation.address}</p>
                    )}
                    <p>Accuracy: {selectedSession.checkInLocation.accuracy}m</p>
                  </div>
                </div>
              )}
              
              {selectedSession.checkOutLocation && (
                <div className="border rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 mb-2">Check-Out Location</h5>
                  <div className="text-sm text-gray-600">
                    <p>Latitude: {selectedSession.checkOutLocation.latitude}</p>
                    <p>Longitude: {selectedSession.checkOutLocation.longitude}</p>
                    {selectedSession.checkOutLocation.address && (
                      <p>Address: {selectedSession.checkOutLocation.address}</p>
                    )}
                    <p>Accuracy: {selectedSession.checkOutLocation.accuracy}m</p>
                  </div>
                </div>
              )}
              
              {!selectedSession.checkInLocation && !selectedSession.checkOutLocation && (
                <div className="text-center py-4 text-gray-500">
                  No location data available
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeLocationModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTimeTracking;
