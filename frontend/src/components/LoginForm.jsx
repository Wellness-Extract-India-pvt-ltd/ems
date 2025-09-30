import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Logo from './Logo';
import InputField from './InputField';
import Button from './Button';
import toast from 'react-hot-toast';

import microsoftLogo from '../assets/Microsoft_logo.svg';

/**
 * LoginForm
 * ----------
 * ▸ Default mode = Employee Code.
 * ▸ Users can switch to Email mode via the toggle link.
 * ▸ Whatever the user types is sent to the backend as the single
 *   query‑param `identifier`. No client‑side branching on email vs code.
 */
const LoginForm = () => {
  const location = useLocation();
  
  // Holds either employee‑code *or* email depending on the active mode
  const [identifier, setIdentifier] = useState('');
  const [useEmail, setUseEmail] = useState(false); // false ⇒ employee‑code mode

  // Handle error messages from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    
    if (error) {
      const errorMessages = {
        'missing_token': 'Authentication failed. Please try logging in again.',
        'invalid_token': 'Your session has expired. Please log in again.',
        'auth_failed': 'Authentication failed. Please check your credentials.',
        'not_found': 'User not found. Please contact your administrator.',
        'invalid_request': 'Invalid request. Please try again.'
      };
      
      toast.error(errorMessages[error] || 'An error occurred during login.');
    }
  }, [location]);

  const toggleMode = () => {
    setUseEmail((prev) => !prev);
    setIdentifier(''); // clear the field when switching modes
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!identifier.trim()) {
      toast.error(`Please enter your ${useEmail ? 'email' : 'employee code'}.`);
      return;
    }

    // Send whichever identifier the user entered. The backend decides
    // whether it is email or code.
    window.location.href = `http://localhost:5000/api/v1/auth/login?identifier=${encodeURIComponent(
      identifier.trim()
    )}`;
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <div className="flex flex-col items-center mb-6">
        <Logo />
        <h2 className="text-2xl font-semibold mt-4">Welcome Back</h2>
        <p className="text-gray-500 text-sm">Sign in to your account</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField
          label={useEmail ? 'Email' : 'Employee Code'}
          type={useEmail ? 'email' : 'text'}
          name="identifier"
          placeholder={`Enter your ${useEmail ? 'email' : 'employee code'}`}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <div className="text-right">
          {/* Switch between email and employee-code modes */}
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-blue-600 hover:underline focus:outline-none"
          >
            {useEmail ? 'Use Employee Code Instead' : 'Use Email Instead'}
          </button>
        </div>

        <Button
          type="submit"
          text={
            <span className="flex items-center justify-center gap-2">
              <img src={microsoftLogo} alt="Microsoft" className="w-5 h-5" />
              Continue with Microsoft
            </span>
          }
        />
      </form>
    </div>
  );
};

export default LoginForm;
