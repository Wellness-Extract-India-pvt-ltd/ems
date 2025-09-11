// src/auth/components/AuthRedirectHandler.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { useAuth } from '../context/AuthProvider.jsx';

const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    console.log("Auth redirect params:", { token: !!token, refreshToken: !!refreshToken, error });

    // Handle error cases first
    if (error) {
      console.error("Authentication error:", error);
      navigate(`/login?error=${error}`, { replace: true });
      return;
    }

    if (!token) {
      console.error("No token provided in redirect");
      navigate('/login?error=missing_token', { replace: true });
      return;
    }

    try {
      // Validate token structure
      const decoded = jwtDecode(token);
      console.log("Token decoded successfully:", { email: decoded.email, role: decoded.role });

      // Call login method from AuthProvider to set auth state and tokens
      login({ token, refreshToken });

      // Clean up URL by removing tokens from query string for security
      window.history.replaceState({}, document.title, '/dashboard');

      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Token validation failed:", error);
      navigate('/login?error=invalid_token', { replace: true });
    }
  }, [location, navigate, login]);

  // Show loading spinner or message while processing tokens
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">Logging you in...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we set up your session</p>
      </div>
    </div>
  );
};

export default AuthRedirectHandler;
