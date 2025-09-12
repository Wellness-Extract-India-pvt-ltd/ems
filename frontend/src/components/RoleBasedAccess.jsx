import React from 'react';
import { useAuth } from '../auth/context/AuthProvider.jsx';

/**
 * Role-based access control component
 * Conditionally renders children based on user role
 */
const RoleBasedAccess = ({ 
  children, 
  allowedRoles = [], 
  requireAll = false,
  fallback = null 
}) => {
  const { user } = useAuth();
  
  if (!user) {
    return fallback;
  }

  const userRole = user.role;
  
  // If no roles specified, allow access
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role(s)
  const hasAccess = requireAll 
    ? allowedRoles.every(role => userRole === role)
    : allowedRoles.includes(userRole);

  return hasAccess ? children : fallback;
};

export default RoleBasedAccess;
