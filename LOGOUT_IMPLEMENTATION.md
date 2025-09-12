# Logout Functionality Implementation

This document describes the complete logout functionality implementation for the EMS (Employee Management System).

## Overview

The logout functionality has been implemented across both frontend and backend to provide secure user session termination.

## Backend Implementation

### 1. Enhanced Logout Controller (`backend/controllers/authController.js`)

```javascript
export const logout = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      // Clear refresh token from database
      await UserRoleMap.update(
        { refresh_token: null },
        { where: { id: userId } }
      );
      
      logger.info('User logged out successfully', { userId });
    }
    
    res.status(200).json({ 
      message: 'Logged out successfully',
      success: true 
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message, userId: req.user?.id });
    res.status(500).json({ 
      message: 'Logout failed', 
      success: false 
    });
  }
};
```

**Features:**
- Clears refresh token from database
- Logs logout events for audit purposes
- Handles errors gracefully
- Returns consistent response format

### 2. Logout Route (`backend/routes/authRoutes.js`)

```javascript
// Logout route - requires authentication
router.post('/logout', authMiddleware, logout);
```

**Features:**
- Protected with authentication middleware
- POST endpoint for security
- Integrated with existing auth routes

## Frontend Implementation

### 1. Enhanced AuthProvider (`frontend/src/auth/context/AuthProvider.jsx`)

```javascript
const logout = useCallback(async () => {
  try {
    // Call backend logout endpoint if we have a token
    if (token) {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn('Backend logout failed, but continuing with local logout');
      }
    }
  } catch (error) {
    console.warn('Error calling logout endpoint:', error);
  } finally {
    // Always clear local state regardless of backend response
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}, [token]);
```

**Features:**
- Calls backend logout endpoint
- Clears local storage and state
- Handles network errors gracefully
- Always performs local logout even if backend fails

### 2. LogoutButton Component (`frontend/src/components/LogoutButton.jsx`)

A comprehensive logout button component with:
- User avatar and information display
- Dropdown menu with profile and logout options
- Loading states during logout
- Proper error handling
- Responsive design

**Features:**
- User avatar with initials
- Dropdown menu with profile and logout options
- Loading state during logout process
- Automatic navigation to login page
- Responsive design

### 3. Updated Header Component (`frontend/src/components/Header/Header.jsx`)

- Integrated LogoutButton component
- Replaced static user display with interactive logout functionality

### 4. Updated Sidebar Component (`frontend/src/components/Sidebar/Sidebar.jsx`)

- Added logout button in sidebar navigation
- Consistent styling with other menu items
- Direct logout functionality

## API Endpoints

### POST `/api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response (Success):**
```json
{
  "message": "Logged out successfully",
  "success": true
}
```

**Response (Error):**
```json
{
  "message": "Logout failed",
  "success": false
}
```

**Status Codes:**
- `200` - Logout successful
- `401` - Unauthorized (invalid/missing token)
- `500` - Server error

## Security Features

1. **Token Invalidation**: Refresh tokens are cleared from the database
2. **Audit Logging**: All logout events are logged for security monitoring
3. **Graceful Degradation**: Frontend logout works even if backend is unavailable
4. **Authentication Required**: Logout endpoint requires valid JWT token
5. **Local State Cleanup**: All local storage and state is cleared

## User Experience

1. **Multiple Access Points**: Logout available from header dropdown and sidebar
2. **Visual Feedback**: Loading states and user feedback during logout
3. **Automatic Navigation**: Redirects to login page after logout
4. **Error Handling**: Graceful handling of network or server errors
5. **Responsive Design**: Works on desktop and mobile devices

## Testing

### Manual Testing

1. **Login to the application**
2. **Click logout button** in header dropdown or sidebar
3. **Verify** you are redirected to login page
4. **Verify** you cannot access protected routes
5. **Verify** tokens are cleared from localStorage

### Automated Testing

Run the test script:
```bash
cd backend
node test-logout.js
```

## Usage Examples

### Using LogoutButton Component

```jsx
import LogoutButton from '../components/LogoutButton';

function Header() {
  return (
    <header>
      <LogoutButton />
    </header>
  );
}
```

### Using Logout in Custom Components

```jsx
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

function CustomComponent() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
```

## Troubleshooting

### Common Issues

1. **Backend not responding**: Frontend will still perform local logout
2. **Token expired**: User will be redirected to login automatically
3. **Network errors**: Logout will complete locally with warning message

### Debug Information

- Check browser console for logout-related messages
- Check backend logs for logout events
- Verify API endpoint is accessible
- Check authentication middleware configuration

## Future Enhancements

1. **Session Management**: Track active sessions across devices
2. **Force Logout**: Admin ability to force logout users
3. **Logout Confirmation**: Optional confirmation dialog
4. **Session Timeout**: Automatic logout after inactivity
5. **Multi-device Logout**: Logout from all devices option
