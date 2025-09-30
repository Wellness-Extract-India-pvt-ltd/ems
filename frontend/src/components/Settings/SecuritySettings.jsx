import React, { useState } from 'react';
import { Shield, Lock, Key, Eye, EyeOff, AlertTriangle, CheckCircle, Clock, Smartphone } from 'lucide-react';

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
    loginAttempts: 5,
    lockoutDuration: 15,
    requireStrongPassword: true,
    passwordHistory: 5,
    ipWhitelist: '',
    allowedDomains: '',
    securityQuestions: {
      question1: '',
      answer1: '',
      question2: '',
      answer2: '',
      question3: '',
      answer3: ''
    }
  });

  const [showAnswers, setShowAnswers] = useState({
    answer1: false,
    answer2: false,
    answer3: false
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityQuestionChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      securityQuestions: { ...prev.securityQuestions, [field]: value }
    }));
  };

  const toggleAnswerVisibility = (field) => {
    setShowAnswers(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const securityQuestions = [
    "What was the name of your first pet?",
    "What city were you born in?",
    "What was your mother's maiden name?",
    "What was the name of your elementary school?",
    "What was your childhood nickname?",
    "What was the make of your first car?",
    "What was your favorite food as a child?",
    "What was the name of your first teacher?"
  ];

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Shield size={24} className="text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
          <p className="text-gray-600">Configure security policies and authentication settings</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Two-Factor Authentication */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Two-Factor Authentication
          </h3>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone size={24} className="text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Enable 2FA</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Password Policies */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Password Policies
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Expiry (Days)
              </label>
              <input
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => handleInputChange('passwordExpiry', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="30"
                max="365"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (Minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="5"
                max="480"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.loginAttempts}
                onChange={(e) => handleInputChange('loginAttempts', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="3"
                max="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lockout Duration (Minutes)
              </label>
              <input
                type="number"
                value={settings.lockoutDuration}
                onChange={(e) => handleInputChange('lockoutDuration', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="5"
                max="60"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="requireStrongPassword"
                checked={settings.requireStrongPassword}
                onChange={(e) => handleInputChange('requireStrongPassword', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="requireStrongPassword" className="text-sm font-medium text-gray-700">
                Require Strong Passwords (8+ chars, mixed case, numbers, symbols)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password History (Prevent reuse of last N passwords)
              </label>
              <input
                type="number"
                value={settings.passwordHistory}
                onChange={(e) => handleInputChange('passwordHistory', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="12"
              />
            </div>
          </div>
        </div>

        {/* Security Questions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Security Questions
          </h3>
          
          <div className="space-y-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Question {num}
                  </label>
                  <select
                    value={settings.securityQuestions[`question${num}`]}
                    onChange={(e) => handleSecurityQuestionChange(`question${num}`, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a security question</option>
                    {securityQuestions.map((question, index) => (
                      <option key={index} value={question}>{question}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer {num}
                  </label>
                  <div className="relative">
                    <input
                      type={showAnswers[`answer${num}`] ? "text" : "password"}
                      value={settings.securityQuestions[`answer${num}`]}
                      onChange={(e) => handleSecurityQuestionChange(`answer${num}`, e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your answer"
                    />
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => toggleAnswerVisibility(`answer${num}`)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showAnswers[`answer${num}`] ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IP Whitelist */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Access Control
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IP Whitelist (Comma-separated IP addresses)
            </label>
            <textarea
              value={settings.ipWhitelist}
              onChange={(e) => handleInputChange('ipWhitelist', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="192.168.1.1, 10.0.0.1, 172.16.0.1"
            />
            <p className="text-sm text-gray-500 mt-1">Leave empty to allow all IPs</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Email Domains (Comma-separated)
            </label>
            <textarea
              value={settings.allowedDomains}
              onChange={(e) => handleInputChange('allowedDomains', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="company.com, partner.org"
            />
            <p className="text-sm text-gray-500 mt-1">Restrict registration to specific domains</p>
          </div>
        </div>

        {/* Security Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Security Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Password Strength</h4>
                <p className="text-sm text-gray-600">Strong password policy enabled</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Clock size={24} className="text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Session Management</h4>
                <p className="text-sm text-gray-600">Auto-logout after {settings.sessionTimeout} minutes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle size={24} className="text-yellow-600" />
              <div>
                <h4 className="font-medium text-gray-900">Login Protection</h4>
                <p className="text-sm text-gray-600">Account locks after {settings.loginAttempts} failed attempts</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <Key size={24} className="text-purple-600" />
              <div>
                <h4 className="font-medium text-gray-900">Password History</h4>
                <p className="text-sm text-gray-600">Prevents reuse of last {settings.passwordHistory} passwords</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
