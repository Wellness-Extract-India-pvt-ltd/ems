// src/auth/routes/RequireRole.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider.jsx';

/**
 * Roles is an array of allowed roles to access this component/route
 */
const RequireRole = ({ roles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !roles.includes(user.role)) {
    // Optionally redirect unauthorized users or show a message
    return <div className="p-6 text-red-600 font-semibold">Access Denied: You do not have permission to view this page.</div>;
  }

  return children;
};

export default RequireRole;
