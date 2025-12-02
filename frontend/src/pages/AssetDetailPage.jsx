import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getHardwareById, updateHardware } from '../store/slices/assetSlice';
import { ArrowLeft, Edit, Trash2, Calendar, User, Tag, AlertTriangle, CheckCircle } from 'lucide-react';

const AssetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selected: asset, status } = useSelector(state => state.assets);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(getHardwareById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (asset) {
      setEditForm({
        name: asset.name || '',
        type: asset.type || '',
        brand: asset.brand || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        status: asset.status || '',
        assignedTo: asset.assignedTo?._id || '',
        notes: asset.notes || ''
      });
    }
  }, [asset]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateHardware({ id: asset._id, hardwareData: editForm }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: asset.name || '',
      type: asset.type || '',
      brand: asset.brand || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      status: asset.status || '',
      assignedTo: asset.assignedTo?._id || '',
      notes: asset.notes || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in use': return <User className="w-5 h-5 text-blue-600" />;
      case 'maintenance': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'retired': return <Tag className="w-5 h-5 text-gray-600" />;
      default: return <Tag className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (status.fetchById === 'loading') {
    return (
      <div className="p-6">
        <div className="text-center">Loading asset details...</div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Asset not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/assets')}
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
                asset.name
              )}
            </h1>
            <p className="text-gray-600">Hardware Asset Details</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                {isEditing ? (
                  <select
                    name="type"
                    value={editForm.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="laptop">Laptop</option>
                    <option value="desktop">Desktop</option>
                    <option value="server">Server</option>
                    <option value="network device">Network Device</option>
                    <option value="peripheral">Peripheral</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{asset.type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="brand"
                    value={editForm.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{asset.brand || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="model"
                    value={editForm.model}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{asset.model || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="serialNumber"
                    value={editForm.serialNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-mono">{asset.serialNumber || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status and Assignment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Status & Assignment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                {isEditing ? (
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="in use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(asset.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </div>
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
                  <p className="text-gray-900">{asset.assignedTo?.name || 'Unassigned'}</p>
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
                placeholder="Add notes about this asset..."
              />
            ) : (
              <p className="text-gray-900">{asset.notes || 'No notes available'}</p>
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
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Purchase Date</p>
                  <p className="font-medium">{formatDate(asset.purchaseDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Warranty Expiry</p>
                  <p className="font-medium">{formatDate(asset.warrantyExpiryDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Asset ID</p>
                  <p className="font-medium font-mono text-sm">{asset._id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                View Assignment History
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                Generate Report
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 className="w-4 h-4 inline mr-2" />
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailPage;
