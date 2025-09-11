// src/auth/context/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {jwtDecode} from 'jwt-decode';

// Create the Auth context
const AuthContext = createContext();

// Helper to safely parse JWT
function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // { id, email, role, employeeId, ... }
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Called on initial load / refresh to bootstrap state from localStorage (if persisted)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRefreshToken = localStorage.getItem('refreshToken');

    if (savedToken) {
      const decoded = decodeToken(savedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          employeeId: decoded.employee,
        });
        setToken(savedToken);
        setRefreshToken(savedRefreshToken);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  // Set tokens and user info; save in localStorage if needed
  const login = useCallback(({ token, refreshToken }) => {
    console.log("AuthProvider login called with tokens:", token, refreshToken);
    const decoded = decodeToken(token);
    if (!decoded) throw new Error('Invalid token');

    setToken(token);
    setRefreshToken(refreshToken);
    setUser({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      employeeId: decoded.employee,
    });

    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }, []);

  // Clear tokens and user info on logout
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      refreshToken,
      loading,
      isAuthenticated,
      login,
      logout,
      setUser,
      setToken,
      setRefreshToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access Auth context easily
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
