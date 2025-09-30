import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Search,
  BarChart3,
  FileText,
  Settings,
  Bell,
  Shield,
  Activity,
  MapPin,
  Timer,
  UserCheck,
  UserX,
  Clock3,
  Zap,
  Database,
  Wifi,
  WifiOff,
  ChevronDown,
  MoreHorizontal,
  Printer,
  Mail,
  Share2,
  Target,
  TrendingDown,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAuth } from '../auth/context/AuthProvider';
import api from '../api/axios';

const BiometricsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [stats, setStats] = useState({
    activeDevices: 0,
    todayCheckIns: 0,
    lateArrivals: 0,
    absentEmployees: 0,
    recentPunches: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Enterprise-level state management
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('recent'); // 'recent', 'summary', 'analytics'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'present', 'absent', 'late'
    timeRange: 'today', // 'today', 'week', 'month', 'custom'
    device: 'all'
  });

  useEffect(() => {
    initializeBiometrics();
  }, []);

  const initializeBiometrics = async () => {
    try {
      setLoading(true);
      
      // Test connection first
      const connectionResponse = await api.get('/biometrics/test-connection');
      setConnectionStatus(connectionResponse.data.success);
      
      if (connectionResponse.data.success) {
        await Promise.all([
          loadStats(),
          loadRecentAttendance(),
          loadDepartments()
        ]);
      }
    } catch (error) {
      console.error('Error initializing biometrics:', error);
      setConnectionStatus(false);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [devicesResponse, attendanceResponse, recentResponse] = await Promise.all([
        api.get('/biometrics/devices/status'),
        api.get(`/biometrics/attendance/today`),
        api.get('/biometrics/attendance/recent?limit=10')
      ]);

      setStats({
        activeDevices: devicesResponse.data.data?.activeDevices || 0,
        todayCheckIns: attendanceResponse.data.data?.totalCheckIns || 0,
        lateArrivals: attendanceResponse.data.data?.lateArrivals || 0,
        absentEmployees: attendanceResponse.data.data?.absentEmployees || 0,
        recentPunches: recentResponse.data.data?.recentAttendance?.length || 0
      });
    } catch (error) {
      console.error('Error loading biometric stats:', error);
      // Set default values if API calls fail
      setStats({
        activeDevices: 0,
        todayCheckIns: 0,
        lateArrivals: 0,
        absentEmployees: 0,
        recentPunches: 0
      });
    }
  };

  const loadRecentAttendance = async () => {
    try {
      const response = await api.get('/biometrics/attendance/recent?limit=10');
      setRecentAttendance(response.data.data);
    } catch (error) {
      console.error('Error loading recent attendance:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await api.get('/biometrics/departments');
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleRefresh = () => {
    initializeBiometrics();
  };

  const handleDepartmentFilter = async (department) => {
    setSelectedDepartment(department);
    // Implement department-specific data loading
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateTime) => {
    return new Date(dateTime).toLocaleDateString('en-US');
  };

  const getPunchTypeColor = (punchType) => {
    switch (punchType) {
      case 'IN': return 'bg-green-100 text-green-800';
      case 'OUT': return 'bg-red-100 text-red-800';
      case 'BREAK_IN': return 'bg-blue-100 text-blue-800';
      case 'BREAK_OUT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Enterprise-level functions
  const loadFilteredData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadRecentAttendance(),
        loadAttendanceSummary()
      ]);
    } catch (error) {
      console.error('Error loading filtered data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceSummary = async () => {
    try {
      const response = await api.get('/biometrics/attendance/summary', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          department: selectedDepartment
        }
      });
      setAttendanceSummary(response.data.data?.summary || []);
    } catch (error) {
      console.error('Error loading attendance summary:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Filter recent attendance based on search
    const filtered = recentAttendance.filter(record => 
      record.fullName.toLowerCase().includes(query.toLowerCase()) ||
      record.employeeCode.toLowerCase().includes(query.toLowerCase())
    );
    // Update display with filtered results
  };

  const handleExport = async (format = 'excel') => {
    try {
      setExportLoading(true);
      const response = await api.get('/biometrics/export', {
        params: {
          format,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          department: selectedDepartment
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const toggleRealTimeMode = () => {
    setRealTimeMode(!realTimeMode);
    if (!realTimeMode) {
      // Start real-time updates
      const interval = setInterval(() => {
        loadRecentAttendance();
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    // Show detailed employee attendance modal
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading BioMetrics data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-7 w-7 text-blue-600" />
            BioMetrics Attendance
          </h1>
          <p className="text-gray-600 mt-1">Manage and monitor employee attendance from biometric devices</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connectionStatus ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Disconnected</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Connection Status Alert */}
      {!connectionStatus && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Connection Failed</h3>
              <p className="text-sm text-red-600 mt-1">
                Unable to connect to the biometric database. Please check the connection settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Section - Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('recent')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'recent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Activity className="h-4 w-4 inline mr-1" />
                Recent
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'summary' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-1" />
                Summary
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Analytics
              </button>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Real-time Toggle */}
            <button
              onClick={toggleRealTimeMode}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                realTimeMode 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="h-4 w-4" />
              {realTimeMode ? 'Live' : 'Static'}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleExport('excel')}
                disabled={exportLoading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {exportLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export
              </button>
            </div>

            {/* Settings */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Devices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDevices}</p>
              <p className="text-xs text-gray-500 mt-1">Biometric devices online</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayCheckIns}</p>
              <p className="text-xs text-gray-500 mt-1">Successful biometric scans</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lateArrivals}</p>
              <p className="text-xs text-gray-500 mt-1">Employees who arrived late</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock3 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.absentEmployees}</p>
              <p className="text-xs text-gray-500 mt-1">No biometric check-in today</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
          </div>
          <button 
            onClick={() => {
              setSelectedDepartment('');
              setDateRange({
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
              });
              setSearchQuery('');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => handleDepartmentFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.name} value={dept.name}>
                  {dept.name} ({dept.employeeCount})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Recent Attendance */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Attendance</h2>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  realTimeMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {realTimeMode ? 'Live Updates' : 'Static View'}
                </div>
                <div className="text-sm text-gray-500">
                  {recentAttendance.length} records
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleExport('excel')}
                disabled={exportLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {exportLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                <Eye className="h-4 w-4" />
                View All
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {recentAttendance.length > 0 ? (
            <div className="space-y-4">
              {recentAttendance.map((record, index) => (
                <div 
                  key={`${record.attendanceId}-${record.employeeId}-${index}`} 
                  className="group flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleEmployeeClick(record)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{record.fullName}</p>
                      <p className="text-sm text-gray-600">{record.department} • {record.employeeCode}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{record.location || 'Main Office'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Database className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{record.deviceName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatTime(record.punchTime)}</p>
                      <p className="text-xs text-gray-600">{formatDate(record.punchDate)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock3 className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Just now</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPunchTypeColor(record.punchType)}`}>
                        {record.punchType}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent attendance records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Enterprise Alerts & Notifications */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                alert.type === 'error' ? 'bg-red-50 border-red-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-center gap-2">
                  {alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                   alert.type === 'error' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
                   <Info className="h-4 w-4 text-blue-600" />}
                  <span className="font-medium text-gray-900">{alert.title}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Generate Report</p>
              <p className="text-sm text-gray-600">Create attendance summary</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Mail className="h-5 w-5 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Send Notifications</p>
              <p className="text-sm text-gray-600">Alert managers about attendance</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="h-5 w-5 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Device Settings</p>
              <p className="text-sm text-gray-600">Configure biometric devices</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BiometricsPage;
