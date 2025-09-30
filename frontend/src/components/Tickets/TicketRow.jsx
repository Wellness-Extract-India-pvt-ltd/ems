import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

const TicketRow = ({ ticket, onEdit, onView }) => {
  const {
    id,
    ticket_number,
    title,
    priority = 'Medium',
    status = 'Open',
    assigned_to = null,
    created_at
  } = ticket || {};

  const priorityColors = {
    'Low': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  };

  const statusColors = {
    'Open': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Resolved': 'bg-green-100 text-green-800',
    'Closed': 'bg-gray-100 text-gray-800'
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 font-medium text-gray-900">
        {ticket_number || `#${id}`}
      </td>
      <td className="px-4 py-3 text-gray-800">
        <div className="max-w-xs truncate" title={title}>
          {title || 'Untitled Ticket'}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          priorityColors[priority] || 'bg-gray-100 text-gray-800'
        }`}>
          {priority}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600">
        {assigned_to ? assigned_to.name || 'Assigned' : 'Unassigned'}
      </td>
      <td className="px-4 py-3 text-gray-600">
        {formatDate(created_at)}
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">
          <button
            onClick={() => onView && onView(ticket)}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit && onEdit(ticket)}
            className="p-1 text-green-600 hover:text-green-800 transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            className="p-1 text-red-600 hover:text-red-800 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TicketRow;
