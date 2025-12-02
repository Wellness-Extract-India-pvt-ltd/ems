import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteTicket } from '../../store/slices/ticketSlice';
import { Edit, Trash2, Eye, MessageSquare } from 'lucide-react';

const TicketRow = ({ ticket, onEdit, onView }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { _id, title, description, priority, status, createdBy, createdAt, comments } = ticket;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      dispatch(deleteTicket(_id));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3 font-mono text-sm text-gray-600">
        #{_id.slice(-8)}
      </td>
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {description}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
          {priority}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600">
        {createdBy?.name || 'Unknown'}
      </td>
      <td className="px-4 py-3 text-gray-600">
        {formatDate(createdAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/tickets/${_id}`)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit && onEdit(ticket)}
            className="p-1 text-green-600 hover:text-green-800"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          {comments && comments.length > 0 && (
            <button
              className="p-1 text-purple-600 hover:text-purple-800"
              title={`${comments.length} comments`}
            >
              <MessageSquare size={16} />
            </button>
          )}
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

export default TicketRow;
