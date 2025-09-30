import React, { useState } from 'react';
import { Key, Globe, Shield, RefreshCw, CheckCircle, XCircle, AlertTriangle, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

const APISettings = () => {
  const [settings, setSettings] = useState({
    // API Configuration
    apiVersion: 'v1',
    apiBaseUrl: 'https://api.mywellness.com',
    apiTimeout: 30000,
    apiRateLimit: 1000,
    apiRateWindow: 3600,
    
    // Authentication
    jwtSecret: '',
    jwtExpiry: 24,
    refreshTokenExpiry: 7,
    enableApiKeys: true,
    enableOAuth: false,
    
    // External APIs
    openaiApiKey: '',
    openaiAssistantId: '',
    microsoftClientId: '',
    microsoftClientSecret: '',
    googleClientId: '',
    googleClientSecret: '',
    
    // Webhooks
    enableWebhooks: true,
    webhookSecret: '',
    webhookTimeout: 5000,
    webhookRetries: 3,
    
    // CORS Settings
    corsOrigins: 'https://mywellness.com,https://app.mywellness.com',
    corsMethods: 'GET,POST,PUT,DELETE,OPTIONS',
    corsHeaders: 'Content-Type,Authorization,X-Requested-With',
    
    // Security
    enableApiLogging: true,
    enableRequestValidation: true,
    enableResponseCompression: true,
    enableApiDocumentation: true
  });

  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Mobile App', key: 'ak_1234567890abcdef', permissions: ['read', 'write'], createdAt: '2024-01-15', lastUsed: '2024-01-20' },
    { id: 2, name: 'Webhook Service', key: 'ak_abcdef1234567890', permissions: ['read'], createdAt: '2024-01-10', lastUsed: '2024-01-19' }
  ]);

  const [newApiKey, setNewApiKey] = useState({ name: '', permissions: [] });
  const [showSecrets, setShowSecrets] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleApiKeyChange = (field, value) => {
    setNewApiKey(prev => ({ ...prev, [field]: value }));
  };

  const toggleSecretVisibility = (field) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const generateApiKey = () => {
    const key = 'ak_' + Math.random().toString(36).substr(2, 16);
    return key;
  };

  const addApiKey = () => {
    if (!newApiKey.name) return;
    
    const key = {
      id: Date.now(),
      name: newApiKey.name,
      key: generateApiKey(),
      permissions: newApiKey.permissions,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    };
    
    setApiKeys(prev => [...prev, key]);
    setNewApiKey({ name: '', permissions: [] });
  };

  const deleteApiKey = (id) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
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
        <Key size={24} className="text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API & Integrations</h2>
          <p className="text-gray-600">Configure API settings and external integrations</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* API Configuration */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center">
            <Globe size={20} className="mr-2" />
            API Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Version
              </label>
              <input
                type="text"
                value={settings.apiVersion}
                onChange={(e) => handleInputChange('apiVersion', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="v1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Base URL
              </label>
              <input
                type="url"
                value={settings.apiBaseUrl}
                onChange={(e) => handleInputChange('apiBaseUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://api.mywellness.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Timeout (ms)
              </label>
              <input
                type="number"
                value={settings.apiTimeout}
                onChange={(e) => handleInputChange('apiTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1000"
                max="300000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Limit (requests)
              </label>
              <input
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) => handleInputChange('apiRateLimit', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="100"
                max="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Limit Window (seconds)
              </label>
              <input
                type="number"
                value={settings.apiRateWindow}
                onChange={(e) => handleInputChange('apiRateWindow', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="60"
                max="86400"
              />
            </div>
          </div>
        </div>

        {/* Authentication Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center">
            <Shield size={20} className="mr-2" />
            Authentication Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JWT Secret
              </label>
              <div className="relative">
                <input
                  type={showSecrets.jwtSecret ? "text" : "password"}
                  value={settings.jwtSecret}
                  onChange={(e) => handleInputChange('jwtSecret', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter JWT secret"
                />
                <Key size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('jwtSecret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets.jwtSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JWT Expiry (hours)
              </label>
              <input
                type="number"
                value={settings.jwtExpiry}
                onChange={(e) => handleInputChange('jwtExpiry', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="168"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh Token Expiry (days)
              </label>
              <input
                type="number"
                value={settings.refreshTokenExpiry}
                onChange={(e) => handleInputChange('refreshTokenExpiry', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="30"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableApiKeys"
                checked={settings.enableApiKeys}
                onChange={(e) => handleInputChange('enableApiKeys', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableApiKeys" className="text-sm font-medium text-gray-700">
                Enable API Keys
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableOAuth"
                checked={settings.enableOAuth}
                onChange={(e) => handleInputChange('enableOAuth', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableOAuth" className="text-sm font-medium text-gray-700">
                Enable OAuth 2.0
              </label>
            </div>
          </div>
        </div>

        {/* External API Keys */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            External API Keys
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets.openaiApiKey ? "text" : "password"}
                  value={settings.openaiApiKey}
                  onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="sk-..."
                />
                <Key size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('openaiApiKey')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets.openaiApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI Assistant ID
              </label>
              <input
                type="text"
                value={settings.openaiAssistantId}
                onChange={(e) => handleInputChange('openaiAssistantId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="asst_..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Microsoft Client ID
              </label>
              <input
                type="text"
                value={settings.microsoftClientId}
                onChange={(e) => handleInputChange('microsoftClientId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Microsoft Client ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Microsoft Client Secret
              </label>
              <div className="relative">
                <input
                  type={showSecrets.microsoftClientSecret ? "text" : "password"}
                  value={settings.microsoftClientSecret}
                  onChange={(e) => handleInputChange('microsoftClientSecret', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Microsoft Client Secret"
                />
                <Key size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('microsoftClientSecret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets.microsoftClientSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Client ID
              </label>
              <input
                type="text"
                value={settings.googleClientId}
                onChange={(e) => handleInputChange('googleClientId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Google Client ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Client Secret
              </label>
              <div className="relative">
                <input
                  type={showSecrets.googleClientSecret ? "text" : "password"}
                  value={settings.googleClientSecret}
                  onChange={(e) => handleInputChange('googleClientSecret', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Google Client Secret"
                />
                <Key size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('googleClientSecret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets.googleClientSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys Management */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            API Keys Management
          </h3>
          
          {/* Add New API Key */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">Add New API Key</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newApiKey.name}
                  onChange={(e) => handleApiKeyChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mobile App, Webhook Service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newApiKey.permissions.includes('read')}
                      onChange={(e) => {
                        const perms = e.target.checked 
                          ? [...newApiKey.permissions, 'read']
                          : newApiKey.permissions.filter(p => p !== 'read');
                        handleApiKeyChange('permissions', perms);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Read</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newApiKey.permissions.includes('write')}
                      onChange={(e) => {
                        const perms = e.target.checked 
                          ? [...newApiKey.permissions, 'write']
                          : newApiKey.permissions.filter(p => p !== 'write');
                        handleApiKeyChange('permissions', perms);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Write</span>
                  </label>
                </div>
              </div>
            </div>
            <button
              onClick={addApiKey}
              className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              <span>Add API Key</span>
            </button>
          </div>

          {/* Existing API Keys */}
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{key.name}</h4>
                      <span className="text-sm text-gray-500">{key.key}</span>
                      <button
                        onClick={() => copyToClipboard(key.key)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy API Key"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Permissions: {key.permissions.join(', ')}</span>
                      <span>Created: {key.createdAt}</span>
                      <span>Last Used: {key.lastUsed}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteApiKey(key.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete API Key"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CORS Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            CORS Settings
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed Origins
              </label>
              <textarea
                value={settings.corsOrigins}
                onChange={(e) => handleInputChange('corsOrigins', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://mywellness.com,https://app.mywellness.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Methods
                </label>
                <input
                  type="text"
                  value={settings.corsMethods}
                  onChange={(e) => handleInputChange('corsMethods', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="GET,POST,PUT,DELETE,OPTIONS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Headers
                </label>
                <input
                  type="text"
                  value={settings.corsHeaders}
                  onChange={(e) => handleInputChange('corsHeaders', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Content-Type,Authorization,X-Requested-With"
                />
              </div>
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
                id="enableApiLogging"
                checked={settings.enableApiLogging}
                onChange={(e) => handleInputChange('enableApiLogging', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableApiLogging" className="text-sm font-medium text-gray-700">
                Enable API Logging
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableRequestValidation"
                checked={settings.enableRequestValidation}
                onChange={(e) => handleInputChange('enableRequestValidation', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableRequestValidation" className="text-sm font-medium text-gray-700">
                Enable Request Validation
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableResponseCompression"
                checked={settings.enableResponseCompression}
                onChange={(e) => handleInputChange('enableResponseCompression', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableResponseCompression" className="text-sm font-medium text-gray-700">
                Enable Response Compression
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableApiDocumentation"
                checked={settings.enableApiDocumentation}
                onChange={(e) => handleInputChange('enableApiDocumentation', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableApiDocumentation" className="text-sm font-medium text-gray-700">
                Enable API Documentation
              </label>
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
                <Key size={16} />
                <span>Save API Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default APISettings;
