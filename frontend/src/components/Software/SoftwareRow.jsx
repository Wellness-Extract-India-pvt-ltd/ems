// components/Software/SoftwareRow.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { deleteSoftware } from '../../store/slices/softwareSlice';

const SoftwareRow = ({ software, onEdit, onView }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, name, version, vendor, license_key, purchase_date, expiry_date, assignedEmployee } = software;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this software?')) {
      dispatch(deleteSoftware(id));
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
          license_key ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {license_key ? 'Commercial' : 'Open Source'}
        </span>
      </td>
      <td className="px-4 py-2">{formatDate(purchase_date)}</td>
      <td className="px-4 py-2">{formatDate(expiry_date)}</td>
      <td className="px-4 py-2">
        {assignedEmployee ? `${assignedEmployee.first_name} ${assignedEmployee.last_name}` : 'Unassigned'}
      </td>
      <td className="px-4 py-2">
        <div className="flex space-x-2">
          <button
            onClick={() => onView && onView(software)}
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