import React, { useState } from 'react';
import { Palette, Sun, Moon, Monitor, CheckCircle, AlertTriangle } from 'lucide-react';

const ThemeSettings = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    primaryColor: 'blue',
    fontSize: 'medium',
    density: 'comfortable',
    animations: true,
    reducedMotion: false,
    highContrast: false,
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
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

  const themeOptions = [
    { value: 'light', label: 'Light Mode', icon: Sun, description: 'Clean and bright interface' },
    { value: 'dark', label: 'Dark Mode', icon: Moon, description: 'Easy on the eyes in low light' },
    { value: 'auto', label: 'Auto', icon: Monitor, description: 'Follows system preference' }
  ];

  const colorOptions = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'teal', label: 'Teal', color: 'bg-teal-500' }
  ];

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Palette size={24} className="text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appearance Settings</h2>
          <p className="text-gray-600">Customize the look and feel of your application</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Theme Selection */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Theme Selection
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    settings.theme === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('theme', option.value)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon size={20} className={settings.theme === option.value ? 'text-blue-600' : 'text-gray-400'} />
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Color Scheme */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Color Scheme
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Primary Color
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {colorOptions.map((color) => (
                <div
                  key={color.value}
                  className={`w-12 h-12 rounded-full cursor-pointer border-2 transition-all ${
                    settings.primaryColor === color.value
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('primaryColor', color.value)}
                >
                  <div className={`w-full h-full rounded-full ${color.color}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Display Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) => handleInputChange('fontSize', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interface Density
              </label>
              <select
                value={settings.density}
                onChange={(e) => handleInputChange('density', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Accessibility Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="animations"
                checked={settings.animations}
                onChange={(e) => handleInputChange('animations', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="animations" className="text-sm font-medium text-gray-700">
                Enable Animations
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="reducedMotion"
                checked={settings.reducedMotion}
                onChange={(e) => handleInputChange('reducedMotion', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="reducedMotion" className="text-sm font-medium text-gray-700">
                Reduce Motion
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="highContrast"
                checked={settings.highContrast}
                onChange={(e) => handleInputChange('highContrast', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="highContrast" className="text-sm font-medium text-gray-700">
                High Contrast Mode
              </label>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Regional Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Format
              </label>
              <select
                value={settings.timeFormat}
                onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="12h">12 Hour (AM/PM)</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Preview
          </h3>
          
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Sample Card</h4>
              <p className="text-gray-600 mb-4">This is how your interface will look with the current settings.</p>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                  Primary Button
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">
                  Secondary Button
                </button>
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
                <AlertTriangle size={16} />
                <span>Error</span>
              </>
            ) : (
              <>
                <Palette size={16} />
                <span>Save Appearance Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
