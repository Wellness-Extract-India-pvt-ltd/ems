import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSoftwareById, updateSoftware } from '../store/slices/softwareSlice';
import { ArrowLeft, Edit, Trash2, Calendar, User, Tag, Download, ExternalLink } from 'lucide-react';

const SoftwareDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selected: software, status } = useSelector(state => state.software);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(getSoftwareById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (software) {
      setEditForm({
        name: software.name || '',
        version: software.version || '',
        vendor: software.vendor || '',
        licenseType: software.licenseType || '',
        purchaseDate: software.purchaseDate ? software.purchaseDate.split('T')[0] : '',
        expiryDate: software.expiryDate ? software.expiryDate.split('T')[0] : '',
        assignedTo: software.assignedTo?._id || '',
        description: software.description || ''
      });
    }
  }, [software]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateSoftware({ id: software._id, softwareData: editForm }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating software:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: software.name || '',
      version: software.version || '',
      vendor: software.vendor || '',
      licenseType: software.licenseType || '',
      purchaseDate: software.purchaseDate ? software.purchaseDate.split('T')[0] : '',
      expiryDate: software.expiryDate ? software.expiryDate.split('T')[0] : '',
      assignedTo: software.assignedTo?._id || '',
      description: software.description || ''
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
      case 'commercial': return 'bg-blue-100 text-blue-800';
      case 'open-source': return 'bg-green-100 text-green-800';
      case 'freeware': return 'bg-gray-100 text-gray-800';
      case 'shareware': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

  if (status.fetchById === 'loading') {
    return (
      <div className="p-6">
        <div className="text-center">Loading software details...</div>
      </div>
    );
  }

  if (!software) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Software not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/software')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="bg-transparent border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                software.name
              )}
            </h1>
            <p className="text-gray-600">Software Application Details</p>
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
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="version"
                    value={editForm.version}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{software.version}</p>
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
                  <p className="text-gray-900">{software.vendor}</p>
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
                    <option value="commercial">Commercial</option>
                    <option value="open-source">Open Source</option>
                    <option value="freeware">Freeware</option>
                    <option value="shareware">Shareware</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLicenseTypeColor(software.licenseType)}`}>
                    {software.licenseType}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="assignedTo"
                    value={editForm.assignedTo}
                    onChange={handleInputChange}
                    placeholder="Employee ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{software.assignedTo?.name || 'Unassigned'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Dates</h2>
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
                  <p className="text-gray-900">{formatDate(software.purchaseDate)}</p>
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
                    <p className="text-gray-900">{formatDate(software.expiryDate)}</p>
                    {isExpired(software.expiryDate) && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Expired</span>
                    )}
                    {isExpiringSoon(software.expiryDate) && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Expiring Soon</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            {isEditing ? (
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the software and its purpose..."
              />
            ) : (
              <p className="text-gray-900">{software.description || 'No description available'}</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Software ID</p>
                  <p className="font-medium font-mono text-sm">{software._id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">{formatDate(software.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">{formatDate(software.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* License Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">License Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isExpired(software.expiryDate) ? 'bg-red-100 text-red-800' :
                  isExpiringSoon(software.expiryDate) ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {isExpired(software.expiryDate) ? 'Expired' :
                   isExpiringSoon(software.expiryDate) ? 'Expiring Soon' :
                   'Active'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Type</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLicenseTypeColor(software.licenseType)}`}>
                  {software.licenseType}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <Download size={16} />
                <span>Download Software</span>
              </button>
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <ExternalLink size={16} />
                <span>View Documentation</span>
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                View Usage Statistics
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 className="w-4 h-4 inline mr-2" />
                Delete Software
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoftwareDetailPage;
