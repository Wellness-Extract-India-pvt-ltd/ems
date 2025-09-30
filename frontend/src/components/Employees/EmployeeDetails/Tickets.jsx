import React from 'react';

const dummyTickets = [
  {
    id: 101,
    subject: 'Laptop not booting',
    status: 'Open',
    createdOn: '2024-05-01',
    priority: 'High',
  },
  {
    id: 102,
    subject: 'Email sync issue',
    status: 'Resolved',
    createdOn: '2024-04-20',
    priority: 'Medium',
  },
];

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getPriorityStyle = (priority) => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-700';
    case 'Medium': return 'bg-orange-100 text-orange-700';
    case 'Low': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const Tickets = () => {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Support Tickets</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white shadow-sm rounded">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="text-left px-4 py-2">Subject</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Priority</th>
              <th className="text-left px-4 py-2">Created On</th>
            </tr>
          </thead>
          <tbody>
            {dummyTickets.map((ticket) => (
              <tr key={ticket.id} className="border-t hover:bg-gray-50 text-sm text-gray-800">
                <td className="px-4 py-2">{ticket.subject}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded font-semibold ${
                    ticket.status === 'Resolved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded font-semibold ${getPriorityStyle(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-4 py-2">{formatDate(ticket.createdOn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tickets;
