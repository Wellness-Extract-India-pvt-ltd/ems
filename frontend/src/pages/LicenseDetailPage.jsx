import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getLicenseById, updateLicense } from '../store/slices/licenseSlice';
import { ArrowLeft, Edit, Trash2, Calendar, Users, Key, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';

const LicenseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selected: license, status } = useSelector(state => state.licenses);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(getLicenseById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (license) {
      setEditForm({
        softwareName: license.softwareName || '',
        licenseKey: license.licenseKey || '',
        licenseType: license.licenseType || '',
        totalSeats: license.totalSeats || '',
        usedSeats: license.usedSeats || '',
        purchaseDate: license.purchaseDate ? license.purchaseDate.split('T')[0] : '',
        expiryDate: license.expiryDate ? license.expiryDate.split('T')[0] : '',
        vendor: license.vendor || '',
        cost: license.cost || '',
        notes: license.notes || ''
      });
    }
  }, [license]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const submitData = {
        ...editForm,
        totalSeats: parseInt(editForm.totalSeats) || 0,
        usedSeats: parseInt(editForm.usedSeats) || 0,
        cost: parseFloat(editForm.cost) || 0
      };
      await dispatch(updateLicense({ id: license._id, licenseData: submitData }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating license:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      softwareName: license.softwareName || '',
      licenseKey: license.licenseKey || '',
      licenseType: license.licenseType || '',
      totalSeats: license.totalSeats || '',
      usedSeats: license.usedSeats || '',
      purchaseDate: license.purchaseDate ? license.purchaseDate.split('T')[0] : '',
      expiryDate: license.expiryDate ? license.expiryDate.split('T')[0] : '',
      vendor: license.vendor || '',
      cost: license.cost || '',
      notes: license.notes || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getLicenseTypeColor = (type) => {
    switch (type) {
      case 'perpetual': return 'bg-blue-100 text-blue-800';
      case 'subscription': return 'bg-purple-100 text-purple-800';
      case 'trial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getLicenseStatus = () => {
    if (isExpired(license?.expiryDate)) return 'expired';
    if (isExpiringSoon(license?.expiryDate)) return 'expiring_soon';
    return license?.status || 'active';
  };

  const getSeatUsagePercentage = () => {
    if (!license?.totalSeats) return 0;
    return Math.round((license.usedSeats / license.totalSeats) * 100);
  };

  if (status.fetchById === 'loading') {
    return (
      <div className="p-6">
        <div className="text-center">Loading license details...</div>
      </div>
    );
  }

  if (!license) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">License not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/licenses')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? (
                <input
                  type="text"
                  name="softwareName"
                  value={editForm.softwareName}
                  onChange={handleInputChange}
                  className="bg-transparent border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                license.softwareName
              )}
            </h1>
            <p className="text-gray-600">Software License Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* License Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">License Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Key</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="licenseKey"
                    value={editForm.licenseKey}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-mono text-sm">{license.licenseKey || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
                {isEditing ? (
                  <select
                    name="licenseType"
                    value={editForm.licenseType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="perpetual">Perpetual</option>
                    <option value="subscription">Subscription</option>
                    <option value="trial">Trial</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLicenseTypeColor(license.licenseType)}`}>
                    {license.licenseType}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="vendor"
                    value={editForm.vendor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{license.vendor || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="cost"
                    value={editForm.cost}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formatCurrency(license.cost)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seat Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Seat Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="totalSeats"
                    value={editForm.totalSeats}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{license.totalSeats || 0}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Used Seats</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="usedSeats"
                    value={editForm.usedSeats}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{license.usedSeats || 0}</p>
                )}
              </div>
            </div>
            
            {!isEditing && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Seat Usage</span>
                  <span className="text-sm font-medium">{getSeatUsagePercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${getSeatUsagePercentage()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {license.usedSeats || 0} of {license.totalSeats || 0} seats used
                </p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Important Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="purchaseDate"
                    value={editForm.purchaseDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formatDate(license.purchaseDate)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="expiryDate"
                    value={editForm.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-900">{formatDate(license.expiryDate)}</p>
                    {isExpired(license.expiryDate) && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Expired</span>
                    )}
                    {isExpiringSoon(license.expiryDate) && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Expiring Soon</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            {isEditing ? (
              <textarea
                name="notes"
                value={editForm.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes about this license..."
              />
            ) : (
              <p className="text-gray-900">{license.notes || 'No notes available'}</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* License Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">License Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getLicenseStatus())}`}>
                  {getLicenseStatus()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Type</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLicenseTypeColor(license.licenseType)}`}>
                  {license.licenseType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Seats Available</span>
                <span className="font-medium">
                  {(license.totalSeats || 0) - (license.usedSeats || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">License ID</p>
                  <p className="font-medium font-mono text-sm">{license._id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">{formatDate(license.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">{formatDate(license.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Alerts */}
          {(isExpired(license.expiryDate) || isExpiringSoon(license.expiryDate)) && (
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                Compliance Alert
              </h3>
              <div className="space-y-2">
                {isExpired(license.expiryDate) && (
                  <p className="text-sm text-red-600">
                    ⚠️ This license has expired and needs immediate attention.
                  </p>
                )}
                {isExpiringSoon(license.expiryDate) && (
                  <p className="text-sm text-yellow-600">
                    ⚠️ This license expires within 30 days.
                  </p>
                )}
                <button className="w-full mt-3 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm">
                  Renew License
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <Users size={16} />
                <span>View Seat Assignments</span>
              </button>
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <DollarSign size={16} />
                <span>View Cost Analysis</span>
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                Generate Compliance Report
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 className="w-4 h-4 inline mr-2" />
                Delete License
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseDetailPage;
