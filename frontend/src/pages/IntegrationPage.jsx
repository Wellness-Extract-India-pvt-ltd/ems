import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Cloud,
  Youtube,
  MessageCircle,
  Image,
  Database,
  Shield,
  Zap,
  Globe,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';

const IntegrationPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterCategory, setFilterCategory] = useState('all');

  // Integration data
  const integrations = [
    {
      id: 1,
      name: 'Microsoft Admin Center',
      description: 'Manage Microsoft 365 users, licenses, and security settings',
      category: 'productivity',
      status: 'available',
      icon: Building2,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: ['User Management', 'License Management', 'Security Policies'],
      connected: false
    },
    {
      id: 2,
      name: 'Amazon Web Services',
      description: 'Cloud infrastructure and services management',
      category: 'cloud',
      status: 'available',
      icon: Cloud,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      features: ['EC2 Management', 'S3 Storage', 'IAM Security'],
      connected: false
    },
    {
      id: 3,
      name: 'Google Cloud Platform',
      description: 'Google Cloud services and resource management',
      category: 'cloud',
      status: 'available',
      icon: Cloud,
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: ['Compute Engine', 'Cloud Storage', 'BigQuery'],
      connected: false
    },
    {
      id: 4,
      name: 'YouTube',
      description: 'Video content management and analytics',
      category: 'social',
      status: 'available',
      icon: Youtube,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      features: ['Channel Management', 'Analytics', 'Content Upload'],
      connected: false
    },
    {
      id: 5,
      name: 'Quora',
      description: 'Question and answer platform integration',
      category: 'social',
      status: 'available',
      icon: MessageCircle,
      color: 'bg-red-600',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      features: ['Q&A Management', 'Content Moderation', 'Analytics'],
      connected: false
    },
    {
      id: 6,
      name: 'Reddit',
      description: 'Community and discussion platform',
      category: 'social',
      status: 'available',
      icon: MessageCircle,
      color: 'bg-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      features: ['Subreddit Management', 'Post Analytics', 'Moderation Tools'],
      connected: false
    },
    {
      id: 7,
      name: 'Pinterest',
      description: 'Visual content and pin management',
      category: 'social',
      status: 'available',
      icon: Image,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      features: ['Pin Management', 'Board Analytics', 'Content Creation'],
      connected: false
    },
    {
      id: 8,
      name: 'MongoDB Atlas',
      description: 'Database management and monitoring',
      category: 'database',
      status: 'available',
      icon: Database,
      color: 'bg-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      features: ['Database Monitoring', 'Backup Management', 'Performance Analytics'],
      connected: false
    },
    {
      id: 9,
      name: 'Auth0',
      description: 'Identity and access management',
      category: 'security',
      status: 'available',
      icon: Shield,
      color: 'bg-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: ['User Authentication', 'SSO Management', 'Security Policies'],
      connected: false
    },
    {
      id: 10,
      name: 'Zapier',
      description: 'Automation and workflow integration',
      category: 'automation',
      status: 'available',
      icon: Zap,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      features: ['Workflow Automation', 'App Connections', 'Data Sync'],
      connected: false
    },
    {
      id: 11,
      name: 'Google Analytics',
      description: 'Website and app analytics',
      category: 'analytics',
      status: 'available',
      icon: BarChart3,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: ['Traffic Analytics', 'User Behavior', 'Conversion Tracking'],
      connected: false
    },
    {
      id: 12,
      name: 'Slack',
      description: 'Team communication and collaboration',
      category: 'productivity',
      status: 'available',
      icon: MessageCircle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: ['Channel Management', 'Bot Integration', 'File Sharing'],
      connected: false
    }
  ];

  // Filter categories
  const categories = [
    { id: 'all', name: 'All Integrations', count: integrations.length },
    { id: 'productivity', name: 'Productivity', count: integrations.filter(i => i.category === 'productivity').length },
    { id: 'cloud', name: 'Cloud Services', count: integrations.filter(i => i.category === 'cloud').length },
    { id: 'social', name: 'Social Media', count: integrations.filter(i => i.category === 'social').length },
    { id: 'database', name: 'Database', count: integrations.filter(i => i.category === 'database').length },
    { id: 'security', name: 'Security', count: integrations.filter(i => i.category === 'security').length },
    { id: 'automation', name: 'Automation', count: integrations.filter(i => i.category === 'automation').length },
    { id: 'analytics', name: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length }
  ];

  // Filter integrations based on search and category
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600 mt-2">
              Connect your favorite tools and services to streamline your workflow
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3X3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredIntegrations.length} of {integrations.length} integrations
        </p>
      </div>

      {/* Integrations Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIntegrations.map((integration) => {
            const IconComponent = integration.icon;
            return (
              <div
                key={integration.id}
                className={`bg-white rounded-xl shadow-sm border-2 ${integration.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer group`}
              >
                {/* Card Header */}
                <div className={`p-6 ${integration.bgColor} rounded-t-xl`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${integration.color} text-white`}>
                      <IconComponent size={24} />
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration.status)}
                      <span className="text-sm font-medium text-gray-600">
                        {getStatusText(integration.status)}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {integration.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {integration.description}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      integration.connected
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : `${integration.color} text-white hover:opacity-90`
                    }`}
                  >
                    {integration.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredIntegrations.map((integration) => {
            const IconComponent = integration.icon;
            return (
              <div
                key={integration.id}
                className="flex items-center p-6 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                {/* Icon */}
                <div className={`p-3 rounded-lg ${integration.color} text-white mr-4`}>
                  <IconComponent size={24} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {integration.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration.status)}
                      <span className="text-sm font-medium text-gray-600">
                        {getStatusText(integration.status)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3">
                    {integration.description}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="ml-4">
                  <button
                    className={`py-2 px-6 rounded-lg font-medium transition-colors ${
                      integration.connected
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : `${integration.color} text-white hover:opacity-90`
                    }`}
                  >
                    {integration.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default IntegrationPage;
