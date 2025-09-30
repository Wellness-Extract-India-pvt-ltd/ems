import React, { useState } from 'react';
import { Mail, Send, TestTube, CheckCircle, XCircle, AlertTriangle, Server, Key, Globe } from 'lucide-react';

const EmailSettings = () => {
  const [settings, setSettings] = useState({
    // SMTP Configuration
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: false,
    smtpUsername: '',
    smtpPassword: '',
    
    // Email Settings
    fromEmail: 'noreply@mywellness.com',
    fromName: 'MyWellness System',
    replyToEmail: 'support@mywellness.com',
    
    // Email Templates
    welcomeEmail: true,
    passwordResetEmail: true,
    notificationEmail: true,
    systemAlertsEmail: true,
    
    // Email Limits
    dailyEmailLimit: 1000,
    hourlyEmailLimit: 100,
    maxRecipients: 50,
    
    // Email Content
    emailSignature: 'Best regards,\nMyWellness Team',
    companyLogo: '',
    footerText: 'This email was sent by MyWellness System',
    
    // Advanced Settings
    enableTracking: true,
    enableUnsubscribe: true,
    enableBounceHandling: true,
    retryFailedEmails: true,
    maxRetries: 3
  });

  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Simulate email test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResult('success');
    } catch (error) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Mail size={24} className="text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Settings</h2>
          <p className="text-gray-600">Configure email server and notification settings</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* SMTP Configuration */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center">
            <Server size={20} className="mr-2" />
            SMTP Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host *
              </label>
              <input
                type="text"
                value={settings.smtpHost}
                onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="smtp.gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port *
              </label>
              <input
                type="number"
                value={settings.smtpPort}
                onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="587"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Username *
              </label>
              <input
                type="email"
                value={settings.smtpUsername}
                onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your-email@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Password *
              </label>
              <input
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your email password or app password"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="smtpSecure"
              checked={settings.smtpSecure}
              onChange={(e) => handleInputChange('smtpSecure', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="smtpSecure" className="text-sm font-medium text-gray-700">
              Use SSL/TLS (Recommended for port 465)
            </label>
          </div>
        </div>

        {/* Email Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Email Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email Address *
              </label>
              <input
                type="email"
                value={settings.fromEmail}
                onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="noreply@mywellness.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name *
              </label>
              <input
                type="text"
                value={settings.fromName}
                onChange={(e) => handleInputChange('fromName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="MyWellness System"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reply-To Email
              </label>
              <input
                type="email"
                value={settings.replyToEmail}
                onChange={(e) => handleInputChange('replyToEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="support@mywellness.com"
              />
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Email Templates
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="welcomeEmail"
                checked={settings.welcomeEmail}
                onChange={(e) => handleInputChange('welcomeEmail', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="welcomeEmail" className="text-sm font-medium text-gray-700">
                Welcome Email (New Users)
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="passwordResetEmail"
                checked={settings.passwordResetEmail}
                onChange={(e) => handleInputChange('passwordResetEmail', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="passwordResetEmail" className="text-sm font-medium text-gray-700">
                Password Reset Email
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="notificationEmail"
                checked={settings.notificationEmail}
                onChange={(e) => handleInputChange('notificationEmail', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notificationEmail" className="text-sm font-medium text-gray-700">
                Notification Emails
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="systemAlertsEmail"
                checked={settings.systemAlertsEmail}
                onChange={(e) => handleInputChange('systemAlertsEmail', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="systemAlertsEmail" className="text-sm font-medium text-gray-700">
                System Alert Emails
              </label>
            </div>
          </div>
        </div>

        {/* Email Limits */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Email Limits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Email Limit
              </label>
              <input
                type="number"
                value={settings.dailyEmailLimit}
                onChange={(e) => handleInputChange('dailyEmailLimit', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="100"
                max="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Email Limit
              </label>
              <input
                type="number"
                value={settings.hourlyEmailLimit}
                onChange={(e) => handleInputChange('hourlyEmailLimit', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="10"
                max="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Recipients per Email
              </label>
              <input
                type="number"
                value={settings.maxRecipients}
                onChange={(e) => handleInputChange('maxRecipients', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Email Content
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Signature
              </label>
              <textarea
                value={settings.emailSignature}
                onChange={(e) => handleInputChange('emailSignature', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Best regards,\nMyWellness Team"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Text
              </label>
              <input
                type="text"
                value={settings.footerText}
                onChange={(e) => handleInputChange('footerText', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="This email was sent by MyWellness System"
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Advanced Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableTracking"
                checked={settings.enableTracking}
                onChange={(e) => handleInputChange('enableTracking', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableTracking" className="text-sm font-medium text-gray-700">
                Enable Email Tracking
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableUnsubscribe"
                checked={settings.enableUnsubscribe}
                onChange={(e) => handleInputChange('enableUnsubscribe', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableUnsubscribe" className="text-sm font-medium text-gray-700">
                Enable Unsubscribe Links
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableBounceHandling"
                checked={settings.enableBounceHandling}
                onChange={(e) => handleInputChange('enableBounceHandling', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableBounceHandling" className="text-sm font-medium text-gray-700">
                Enable Bounce Handling
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="retryFailedEmails"
                checked={settings.retryFailedEmails}
                onChange={(e) => handleInputChange('retryFailedEmails', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="retryFailedEmails" className="text-sm font-medium text-gray-700">
                Retry Failed Emails
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Retry Attempts
              </label>
              <input
                type="number"
                value={settings.maxRetries}
                onChange={(e) => handleInputChange('maxRetries', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>

        {/* Test Email */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center">
            <TestTube size={20} className="mr-2" />
            Test Email Configuration
          </h3>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="test@example.com"
              />
            </div>
            <div className="pt-6">
              <button
                onClick={handleTestEmail}
                disabled={!testEmail || isTesting}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {testResult === 'success' ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : (
                  <XCircle size={20} className="text-red-600" />
                )}
                <span className={`font-medium ${
                  testResult === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult === 'success' 
                    ? 'Test email sent successfully!' 
                    : 'Failed to send test email. Please check your configuration.'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-colors ${
              saveStatus === 'success' 
                ? 'bg-green-600 text-white' 
                : saveStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : saveStatus === 'success' ? (
              <>
                <CheckCircle size={16} />
                <span>Saved!</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <XCircle size={16} />
                <span>Error</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Save Email Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
