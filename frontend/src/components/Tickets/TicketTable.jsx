import React from 'react';
import TicketRow from './TicketRow';

const TicketTable = ({ tickets, onEdit, onView }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Ticket ID</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created By</th>
            <th className="px-4 py-3">Created Date</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-8 text-gray-500">
                No tickets found. Create your first support ticket.
              </td>
            </tr>
          ) : (
            tickets.map(ticket => (
              <TicketRow 
                key={ticket._id} 
                ticket={ticket} 
                onEdit={onEdit}
                onView={onView}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
