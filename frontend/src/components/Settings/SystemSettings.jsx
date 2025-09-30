import React, { useState } from 'react';
import { Server, Database, Globe, Clock, Shield, AlertTriangle, CheckCircle, RefreshCw, Save } from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    appName: 'MyWellness',
    appVersion: '1.0.0',
    environment: 'production',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    
    // System Configuration
    maxFileSize: 10,
    allowedFileTypes: 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif',
    sessionTimeout: 30,
    maxUsers: 1000,
    maintenanceMode: false,
    
    // Performance Settings
    cacheEnabled: true,
    cacheTTL: 300,
    maxConnections: 100,
    requestTimeout: 30,
    
    // Logging Settings
    logLevel: 'info',
    logRetention: 30,
    auditLogging: true,
    errorReporting: true,
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    backupLocation: '/backups',
    
    // Security Settings
    encryptionEnabled: true,
    sslRequired: true,
    corsEnabled: true,
    rateLimiting: true,
    maxRequestsPerMinute: 100
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const getSaveButtonContent = () => {
    if (saveStatus === 'saving') {
      return (
        <>
          <RefreshCw size={16} className="animate-spin" />
          <span>Saving...</span>
        </>
      );
    } else if (saveStatus === 'success') {
      return (
        <>
          <CheckCircle size={16} />
          <span>Saved!</span>
        </>
      );
    } else if (saveStatus === 'error') {
      return (
        <>
          <AlertTriangle size={16} />
          <span>Error</span>
        </>
      );
    }
    return (
      <>
        <Save size={16} />
        <span>Save Settings</span>
      </>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Server size={24} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
            <p className="text-gray-600">Configure system-wide application settings</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            saveStatus === 'success' 
              ? 'bg-green-600 text-white' 
              : saveStatus === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {getSaveButtonContent()}
        </button>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            General Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Name
              </label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => handleInputChange('appName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Version
              </label>
              <input
                type="text"
                value={settings.appVersion}
                onChange={(e) => handleInputChange('appVersion', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environment
              </label>
              <select
                value={settings.environment}
                onChange={(e) => handleInputChange('environment', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* File Upload Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            File Upload Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max File Size (MB)
              </label>
              <input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed File Types
              </label>
              <input
                type="text"
                value={settings.allowedFileTypes}
                onChange={(e) => handleInputChange('allowedFileTypes', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="pdf,doc,docx,jpg,png"
              />
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Performance Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="cacheEnabled"
                checked={settings.cacheEnabled}
                onChange={(e) => handleInputChange('cacheEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="cacheEnabled" className="text-sm font-medium text-gray-700">
                Enable Caching
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cache TTL (Seconds)
              </label>
              <input
                type="number"
                value={settings.cacheTTL}
                onChange={(e) => handleInputChange('cacheTTL', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="60"
                max="3600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Database Connections
              </label>
              <input
                type="number"
                value={settings.maxConnections}
                onChange={(e) => handleInputChange('maxConnections', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="10"
                max="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Timeout (Seconds)
              </label>
              <input
                type="number"
                value={settings.requestTimeout}
                onChange={(e) => handleInputChange('requestTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="5"
                max="300"
              />
            </div>
          </div>
        </div>

        {/* Logging Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Logging Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Level
              </label>
              <select
                value={settings.logLevel}
                onChange={(e) => handleInputChange('logLevel', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
                <option value="trace">Trace</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Retention (Days)
              </label>
              <input
                type="number"
                value={settings.logRetention}
                onChange={(e) => handleInputChange('logRetention', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="7"
                max="365"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="auditLogging"
                checked={settings.auditLogging}
                onChange={(e) => handleInputChange('auditLogging', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="auditLogging" className="text-sm font-medium text-gray-700">
                Enable Audit Logging
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="errorReporting"
                checked={settings.errorReporting}
                onChange={(e) => handleInputChange('errorReporting', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="errorReporting" className="text-sm font-medium text-gray-700">
                Enable Error Reporting
              </label>
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Backup Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoBackup"
                checked={settings.autoBackup}
                onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="autoBackup" className="text-sm font-medium text-gray-700">
                Enable Automatic Backups
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Retention (Days)
              </label>
              <input
                type="number"
                value={settings.backupRetention}
                onChange={(e) => handleInputChange('backupRetention', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="7"
                max="365"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Location
              </label>
              <input
                type="text"
                value={settings.backupLocation}
                onChange={(e) => handleInputChange('backupLocation', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="/backups"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Security Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="encryptionEnabled"
                checked={settings.encryptionEnabled}
                onChange={(e) => handleInputChange('encryptionEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="encryptionEnabled" className="text-sm font-medium text-gray-700">
                Enable Data Encryption
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="sslRequired"
                checked={settings.sslRequired}
                onChange={(e) => handleInputChange('sslRequired', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="sslRequired" className="text-sm font-medium text-gray-700">
                Require SSL/HTTPS
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="corsEnabled"
                checked={settings.corsEnabled}
                onChange={(e) => handleInputChange('corsEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="corsEnabled" className="text-sm font-medium text-gray-700">
                Enable CORS
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="rateLimiting"
                checked={settings.rateLimiting}
                onChange={(e) => handleInputChange('rateLimiting', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="rateLimiting" className="text-sm font-medium text-gray-700">
                Enable Rate Limiting
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Requests Per Minute
              </label>
              <input
                type="number"
                value={settings.maxRequestsPerMinute}
                onChange={(e) => handleInputChange('maxRequestsPerMinute', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="10"
                max="1000"
              />
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            System Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Database</h4>
                <p className="text-sm text-gray-600">Connected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Cache</h4>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">API</h4>
                <p className="text-sm text-gray-600">Running</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
