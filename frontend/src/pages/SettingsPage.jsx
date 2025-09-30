import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../auth/context/AuthProvider';
import RoleBasedAccess from '../components/RoleBasedAccess';
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Database, 
  Mail, 
  Lock, 
  Globe, 
  Server, 
  Key,
  AlertTriangle,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Import settings components
import AccountSettings from '../components/Settings/AccountSettings';
import NotificationSettings from '../components/Settings/NotificationSettings';
import ThemeSettings from '../components/Settings/ThemeSettings';
import SecuritySettings from '../components/Settings/SecuritySettings';
import SystemSettings from '../components/Settings/SystemSettings';
import EmailSettings from '../components/Settings/EmailSettings';
import DatabaseSettings from '../components/Settings/DatabaseSettings';
import APISettings from '../components/Settings/APISettings';

const SettingsPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

  const settingsTabs = [
    {
      id: 'account',
      name: 'Account',
      icon: User,
      description: 'Personal account settings',
      roles: ['admin', 'manager', 'employee']
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      description: 'Notification preferences',
      roles: ['admin', 'manager', 'employee']
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: Palette,
      description: 'Theme and display settings',
      roles: ['admin', 'manager', 'employee']
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Security and authentication settings',
      roles: ['admin', 'manager']
    },
    {
      id: 'system',
      name: 'System',
      icon: Server,
      description: 'System configuration and preferences',
      roles: ['admin']
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      description: 'Email server configuration',
      roles: ['admin']
    },
    {
      id: 'database',
      name: 'Database',
      icon: Database,
      description: 'Database connection settings',
      roles: ['admin']
    },
    {
      id: 'api',
      name: 'API & Integrations',
      icon: Key,
      description: 'API keys and external integrations',
      roles: ['admin']
    }
  ];

  // Filter tabs based on user role
  const availableTabs = settingsTabs.filter(tab => 
    tab.roles.includes(user?.role || 'employee')
  );

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

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'appearance':
        return <ThemeSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'system':
        return <SystemSettings />;
      case 'email':
        return <EmailSettings />;
      case 'database':
        return <DatabaseSettings />;
      case 'api':
        return <APISettings />;
      default:
        return <AccountSettings />;
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
          <XCircle size={16} />
          <span>Error</span>
        </>
      );
    }
    return (
      <>
        <Save size={16} />
        <span>Save Changes</span>
      </>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure your application preferences and system settings
          </p>
        </div>
        
        {/* Save Button */}
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

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-2">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <div>
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
