import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTickets } from '../store/slices/ticketSlice';
import TicketTable from '../components/Tickets/TicketTable';
import TicketForm from '../components/Tickets/TicketForm';
import RoleBasedAccess from '../components/RoleBasedAccess';
import { useAuth } from '../auth/context/AuthProvider';
import { Plus } from 'lucide-react';

const TicketsPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { list: tickets, status } = useSelector(state => state.tickets);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchTickets());
    }
  }, [dispatch, user]);

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket);
    setShowAddForm(true);
  };

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    // TODO: Navigate to ticket detail page
    console.log('View ticket:', ticket);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setSelectedTicket(null);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setSelectedTicket(null);
    dispatch(fetchTickets()); // Refresh the list
  };

  if (status.fetch === 'loading') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading tickets...</span>
        </div>
      </div>
    );
  }

  if (status.fetch === 'failed') {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error loading tickets</div>
          <div className="text-gray-500 text-sm">{status.error?.fetch}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' 
              ? 'Manage support tickets and issues' 
              : 'View and manage your support tickets'
            }
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Create Ticket</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TicketTable 
          tickets={tickets}
          onEdit={handleEdit}
          onView={handleView}
        />
      </div>

      {showAddForm && (
        <TicketForm
          ticket={selectedTicket}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default TicketsPage;
