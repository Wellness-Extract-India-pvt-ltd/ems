// Temporary authentication utility for testing
// In a real application, this would be handled by proper authentication

export const getAuthToken = () => {
  // For testing purposes, return a dummy token
  // In production, this would come from your authentication system
  return 'test-token-123';
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};
