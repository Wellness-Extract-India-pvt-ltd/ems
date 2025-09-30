import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

// Async thunks for ticket management
export const fetchTickets = createAsyncThunk(
  'tickets/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/tickets/all');
      return data;
    } catch (err) {
      console.error('Ticket fetch error:', err);
      console.error('Error response:', err.response?.data);
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch tickets');
    }
  }
);

export const createTicket = createAsyncThunk(
  'tickets/create',
  async (ticketData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/tickets/add', ticketData);
      return data.ticket;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateTicket = createAsyncThunk(
  'tickets/update',
  async ({ id, ticketData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/tickets/update/${id}`, ticketData);
      return data.ticket;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteTicket = createAsyncThunk(
  'tickets/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tickets/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getTicketById = createAsyncThunk(
  'tickets/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/tickets/${id}`);
      return data.ticket;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  list: [],
  selected: null,
  status: {
    fetch: 'idle',
    create: 'idle',
    update: 'idle',
    delete: 'idle',
    fetchById: 'idle'
  },
  error: {
    fetch: null,
    create: null,
    update: null,
    delete: null,
    fetchById: null
  }
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    selectTicket: (state, action) => {
      state.selected = action.payload;
    },
    clearError: (state, action) => {
      const key = action.payload;
      if (state.error[key] !== undefined) {
        state.error[key] = null;
      }
    },
    resetStatus: (state, action) => {
      const key = action.payload;
      if (state.status[key] !== undefined) {
        state.status[key] = 'idle';
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tickets
      .addCase(fetchTickets.pending, (state) => {
        state.status.fetch = 'loading';
        state.error.fetch = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.status.fetch = 'succeeded';
        state.list = action.payload.data || action.payload || [];
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.status.fetch = 'failed';
        state.error.fetch = action.payload;
      })

      // Create ticket
      .addCase(createTicket.pending, (state) => {
        state.status.create = 'loading';
        state.error.create = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.status.create = 'succeeded';
        state.list.push(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.status.create = 'failed';
        state.error.create = action.payload;
      })

      // Update ticket
      .addCase(updateTicket.pending, (state) => {
        state.status.update = 'loading';
        state.error.update = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.status.update = 'succeeded';
        const index = state.list.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.status.update = 'failed';
        state.error.update = action.payload;
      })

      // Delete ticket
      .addCase(deleteTicket.pending, (state) => {
        state.status.delete = 'loading';
        state.error.delete = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.status.delete = 'succeeded';
        state.list = state.list.filter(ticket => ticket.id !== action.payload);
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.status.delete = 'failed';
        state.error.delete = action.payload;
      })

      // Get ticket by ID
      .addCase(getTicketById.pending, (state) => {
        state.status.fetchById = 'loading';
        state.error.fetchById = null;
      })
      .addCase(getTicketById.fulfilled, (state, action) => {
        state.status.fetchById = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(getTicketById.rejected, (state, action) => {
        state.status.fetchById = 'failed';
        state.error.fetchById = action.payload;
      });
  }
});

export const { selectTicket, clearError, resetStatus } = ticketSlice.actions;
export default ticketSlice.reducer;
