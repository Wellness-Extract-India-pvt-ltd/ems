import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivities } from '../../store/slices/activitySlice';
import RecentActivityItem from './RecentActivityItem';
import { 
  Plus, 
  Monitor, 
  AlertTriangle, 
  User, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Clock, 
  Shield, 
  Database,
  FileText,
  Settings,
  LogIn,
  LogOut,
  Key,
  Award,
  XCircle
} from 'lucide-react';

// Activity type to icon mapping
const getActivityIcon = (type) => {
  const iconMap = {
    // Employee activities
    employee_created: <Plus size={16} />,
    employee_updated: <Edit size={16} />,
    employee_deleted: <Trash2 size={16} />,
    
    // Asset activities
    asset_assigned: <Monitor size={16} />,
    asset_unassigned: <XCircle size={16} />,
    asset_created: <Plus size={16} />,
    asset_updated: <Edit size={16} />,
    
    // License activities
    license_created: <FileText size={16} />,
    license_updated: <Edit size={16} />,
    license_expiring: <AlertTriangle size={16} />,
    
    // Ticket activities
    ticket_created: <Plus size={16} />,
    ticket_updated: <Edit size={16} />,
    ticket_resolved: <CheckCircle size={16} />,
    
    // Biometric activities
    biometric_checkin: <Clock size={16} />,
    biometric_checkout: <Clock size={16} />,
    
    // System activities
    system_login: <LogIn size={16} />,
    system_logout: <LogOut size={16} />,
    profile_updated: <User size={16} />,
    settings_changed: <Settings size={16} />,
    password_changed: <Key size={16} />,
    role_assigned: <Award size={16} />,
    permission_granted: <Shield size={16} />,
    permission_revoked: <XCircle size={16} />,
    
    // Report activities
    report_generated: <FileText size={16} />,
    data_exported: <Database size={16} />
  };
  
  return iconMap[type] || <Database size={16} />;
};

// Activity type to color mapping
const getActivityColor = (type, severity = 'low') => {
  const colorMap = {
    // Employee activities
    employee_created: 'bg-green-100 text-green-600',
    employee_updated: 'bg-blue-100 text-blue-600',
    employee_deleted: 'bg-red-100 text-red-600',
    
    // Asset activities
    asset_assigned: 'bg-blue-100 text-blue-600',
    asset_unassigned: 'bg-gray-100 text-gray-600',
    asset_created: 'bg-green-100 text-green-600',
    asset_updated: 'bg-blue-100 text-blue-600',
    
    // License activities
    license_created: 'bg-green-100 text-green-600',
    license_updated: 'bg-blue-100 text-blue-600',
    license_expiring: 'bg-yellow-100 text-yellow-600',
    
    // Ticket activities
    ticket_created: 'bg-green-100 text-green-600',
    ticket_updated: 'bg-blue-100 text-blue-600',
    ticket_resolved: 'bg-green-100 text-green-600',
    
    // Biometric activities
    biometric_checkin: 'bg-green-100 text-green-600',
    biometric_checkout: 'bg-blue-100 text-blue-600',
    
    // System activities
    system_login: 'bg-green-100 text-green-600',
    system_logout: 'bg-gray-100 text-gray-600',
    profile_updated: 'bg-blue-100 text-blue-600',
    settings_changed: 'bg-purple-100 text-purple-600',
    password_changed: 'bg-orange-100 text-orange-600',
    role_assigned: 'bg-green-100 text-green-600',
    permission_granted: 'bg-green-100 text-green-600',
    permission_revoked: 'bg-red-100 text-red-600',
    
    // Report activities
    report_generated: 'bg-blue-100 text-blue-600',
    data_exported: 'bg-purple-100 text-purple-600'
  };
  
  return colorMap[type] || 'bg-gray-100 text-gray-600';
};

// Format timestamp to relative time
const formatTimestamp = (timestamp) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - activityTime) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

const RecentActivity = () => {
  const dispatch = useDispatch();
  const { activities, loading, error } = useSelector(state => state.activities);

  useEffect(() => {
    // Fetch recent activities (last 7 days, limit 10)
    dispatch(fetchActivities({ 
      days: 7, 
      limit: 10, 
      page: 1 
    }));
  }, [dispatch]);

  if (loading) {
    return (
      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">Error loading activities: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow'>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Activity
      </h2>
      {activities.length === 0 ? (
        <p className='text-sm text-gray-500'>No recent activity.</p>
      ) : (
        <ul className='space-y-5'>
          {activities.map((activity) => (
            <RecentActivityItem
              key={activity.id}
              icon={getActivityIcon(activity.type)}
              iconBg={getActivityColor(activity.type, activity.severity)}
              title={activity.title}
              subtitle={activity.description || `By ${activity.user.email}`}
              timestamp={formatTimestamp(activity.timestamp)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;
