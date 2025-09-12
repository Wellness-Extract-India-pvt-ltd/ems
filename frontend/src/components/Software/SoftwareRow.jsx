// components/Software/SoftwareRow.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteSoftware } from '../../store/slices/softwareSlice';
import { Edit, Trash2, Eye } from 'lucide-react';

const SoftwareRow = ({ software, onEdit, onView }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { _id, name, version, vendor, licenseType, purchaseDate, expiryDate, assignedTo } = software;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this software?')) {
      dispatch(deleteSoftware(_id));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-2 font-medium">{name}</td>
      <td className="px-4 py-2">{version}</td>
      <td className="px-4 py-2">{vendor}</td>
      <td className="px-4 py-2">
        <span className={`px-2 py-1 rounded-full text-xs ${
          licenseType === 'commercial' ? 'bg-blue-100 text-blue-800' :
          licenseType === 'open-source' ? 'bg-green-100 text-green-800' :
          licenseType === 'freeware' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {licenseType}
        </span>
      </td>
      <td className="px-4 py-2">{formatDate(purchaseDate)}</td>
      <td className="px-4 py-2">{formatDate(expiryDate)}</td>
      <td className="px-4 py-2">{assignedTo?.name || 'Unassigned'}</td>
      <td className="px-4 py-2">
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/software/${_id}`)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit && onEdit(software)}
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

export default SoftwareRow;
