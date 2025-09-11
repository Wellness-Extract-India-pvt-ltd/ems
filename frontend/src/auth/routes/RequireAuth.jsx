// src/auth/routes/RequireAuth.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider.jsx';

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show loading indicator while auth state is resolving
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to login with original location saved
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
