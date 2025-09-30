import React, { useState } from 'react';
import { useAuth } from '../auth/context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const LogoutButton = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = () => {
    // This would typically come from user profile data
    // For now, using a default based on the test user
    return user?.email === 'sawan@wellnessextract.com' ? 'Sawan Khanna' : 'User';
  };

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white">
          {getUserInitials(getUserDisplayName())}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-800">
            {getUserDisplayName()}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {user?.role || 'User'}
          </div>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-800">
              {getUserDisplayName()}
            </div>
            <div className="text-xs text-gray-500">
              {user?.email}
            </div>
          </div>
          
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              navigate('/profile');
            }}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default LogoutButton;
