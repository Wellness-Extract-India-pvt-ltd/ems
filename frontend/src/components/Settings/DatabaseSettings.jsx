import React, { useState } from 'react';
import { Database, Server, Key, Shield, RefreshCw, CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react';

const DatabaseSettings = () => {
  const [settings, setSettings] = useState({
    // Database Connection
    dbHost: 'localhost',
    dbPort: 3306,
    dbName: 'ems_db',
    dbUsername: '',
    dbPassword: '',
    dbCharset: 'utf8mb4',
    dbCollation: 'utf8mb4_unicode_ci',
    
    // Connection Pool
    maxConnections: 10,
    minConnections: 2,
    connectionTimeout: 30000,
    acquireTimeout: 60000,
    idleTimeout: 300000,
    
    // Database Options
    enableSSL: false,
    enableCompression: true,
    enableLogging: true,
    enableSlowQueryLog: true,
    slowQueryThreshold: 2000,
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 7,
    backupCompression: true,
    
    // Maintenance
    enableAutoVacuum: true,
    vacuumFrequency: 'weekly',
    enableIndexOptimization: true,
    enableQueryOptimization: true
  });

  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('testing');
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnectionStatus('success');
    } catch (error) {
      setConnectionStatus('error');
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

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <XCircle size={20} className="text-red-600" />;
      case 'testing':
        return <RefreshCw size={20} className="text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle size={20} className="text-yellow-600" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'success':
        return 'Connected';
      case 'error':
        return 'Connection Failed';
      case 'testing':
        return 'Testing...';
      default:
        return 'Not Tested';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'testing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Database size={24} className="text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Database Settings</h2>
          <p className="text-gray-600">Configure database connection and maintenance settings</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Database Connection */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center">
            <Server size={20} className="mr-2" />
            Database Connection
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database Host *
              </label>
              <input
                type="text"
                value={settings.dbHost}
                onChange={(e) => handleInputChange('dbHost', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="localhost"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database Port *
              </label>
              <input
                type="number"
                value={settings.dbPort}
                onChange={(e) => handleInputChange('dbPort', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3306"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database Name *
              </label>
              <input
                type="text"
                value={settings.dbName}
                onChange={(e) => handleInputChange('dbName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ems_db"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={settings.dbUsername}
                onChange={(e) => handleInputChange('dbUsername', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="root"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={settings.dbPassword}
                onChange={(e) => handleInputChange('dbPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter database password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Set
              </label>
              <select
                value={settings.dbCharset}
                onChange={(e) => handleInputChange('dbCharset', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="utf8">UTF-8</option>
                <option value="utf8mb4">UTF-8MB4</option>
                <option value="latin1">Latin1</option>
              </select>
            </div>
          </div>

          {/* Connection Test */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getConnectionStatusIcon()}
              <div>
                <h4 className="font-medium text-gray-900">Connection Status</h4>
                <p className={`text-sm ${getConnectionStatusColor().split(' ')[2]}`}>
                  {getConnectionStatusText()}
                </p>
              </div>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Activity size={16} />
                  <span>Test Connection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Connection Pool */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Connection Pool Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Connections
              </label>
              <input
                type="number"
                value={settings.maxConnections}
                onChange={(e) => handleInputChange('maxConnections', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Connections
              </label>
              <input
                type="number"
                value={settings.minConnections}
                onChange={(e) => handleInputChange('minConnections', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection Timeout (ms)
              </label>
              <input
                type="number"
                value={settings.connectionTimeout}
                onChange={(e) => handleInputChange('connectionTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1000"
                max="60000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acquire Timeout (ms)
              </label>
              <input
                type="number"
                value={settings.acquireTimeout}
                onChange={(e) => handleInputChange('acquireTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1000"
                max="120000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idle Timeout (ms)
              </label>
              <input
                type="number"
                value={settings.idleTimeout}
                onChange={(e) => handleInputChange('idleTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="30000"
                max="600000"
              />
            </div>
          </div>
        </div>

        {/* Database Options */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Database Options
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableSSL"
                checked={settings.enableSSL}
                onChange={(e) => handleInputChange('enableSSL', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableSSL" className="text-sm font-medium text-gray-700">
                Enable SSL Connection
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableCompression"
                checked={settings.enableCompression}
                onChange={(e) => handleInputChange('enableCompression', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableCompression" className="text-sm font-medium text-gray-700">
                Enable Compression
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableLogging"
                checked={settings.enableLogging}
                onChange={(e) => handleInputChange('enableLogging', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableLogging" className="text-sm font-medium text-gray-700">
                Enable Query Logging
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableSlowQueryLog"
                checked={settings.enableSlowQueryLog}
                onChange={(e) => handleInputChange('enableSlowQueryLog', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableSlowQueryLog" className="text-sm font-medium text-gray-700">
                Enable Slow Query Log
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slow Query Threshold (ms)
              </label>
              <input
                type="number"
                value={settings.slowQueryThreshold}
                onChange={(e) => handleInputChange('slowQueryThreshold', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="100"
                max="10000"
              />
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
                min="1"
                max="365"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="backupCompression"
                checked={settings.backupCompression}
                onChange={(e) => handleInputChange('backupCompression', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="backupCompression" className="text-sm font-medium text-gray-700">
                Compress Backups
              </label>
            </div>
          </div>
        </div>

        {/* Maintenance Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Maintenance Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableAutoVacuum"
                checked={settings.enableAutoVacuum}
                onChange={(e) => handleInputChange('enableAutoVacuum', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableAutoVacuum" className="text-sm font-medium text-gray-700">
                Enable Auto Vacuum
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vacuum Frequency
              </label>
              <select
                value={settings.vacuumFrequency}
                onChange={(e) => handleInputChange('vacuumFrequency', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableIndexOptimization"
                checked={settings.enableIndexOptimization}
                onChange={(e) => handleInputChange('enableIndexOptimization', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableIndexOptimization" className="text-sm font-medium text-gray-700">
                Enable Index Optimization
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableQueryOptimization"
                checked={settings.enableQueryOptimization}
                onChange={(e) => handleInputChange('enableQueryOptimization', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableQueryOptimization" className="text-sm font-medium text-gray-700">
                Enable Query Optimization
              </label>
            </div>
          </div>
        </div>

        {/* Database Statistics */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Database Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Database size={24} className="text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Database Size</h4>
                <p className="text-sm text-gray-600">245.6 MB</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <Activity size={24} className="text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Active Connections</h4>
                <p className="text-sm text-gray-600">3 / 10</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <Shield size={24} className="text-purple-600" />
              <div>
                <h4 className="font-medium text-gray-900">Last Backup</h4>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
            </div>
          </div>
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
                <RefreshCw size={16} className="animate-spin" />
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
                <Database size={16} />
                <span>Save Database Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSettings;
