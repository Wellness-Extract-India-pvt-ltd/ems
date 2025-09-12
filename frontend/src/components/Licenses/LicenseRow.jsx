import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteLicense } from '../../store/slices/licenseSlice';
import { Edit, Trash2, Eye, Key } from 'lucide-react';

const LicenseRow = ({ license, onEdit, onView }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, name, license_key, type, purchase_date, expiry_date, status } = license;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this license?')) {
      dispatch(deleteLicense(id));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

  const getLicenseTypeColor = (type) => {
    switch (type) {
      case 'perpetual': return 'bg-blue-100 text-blue-800';
      case 'subscription': return 'bg-purple-100 text-purple-800';
      case 'trial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
    if (isExpired(expiry_date)) return 'expired';
    if (isExpiringSoon(expiry_date)) return 'expiring_soon';
    return status || 'active';
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900">
        {name}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <Key size={14} className="text-gray-400" />
          <span className="font-mono text-sm text-gray-600">
            {license_key ? `${license_key.slice(0, 8)}...` : 'N/A'}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLicenseTypeColor(type)}`}>
          {type}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600">
        <div className="flex items-center space-x-2">
          <span>1/1</span>
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-600">
        {formatDate(purchase_date)}
      </td>
      <td className="px-4 py-3 text-gray-600">
        {formatDate(expiry_date)}
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getLicenseStatus())}`}>
          {getLicenseStatus()}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/licenses/${id}`)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit && onEdit(license)}
            className="p-1 text-green-600 hover:text-green-800"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default LicenseRow;
