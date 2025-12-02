import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Async thunks for ticket management
export const fetchTickets = createAsyncThunk(
  'tickets/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/tickets/all`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createTicket = createAsyncThunk(
  'tickets/create',
  async (ticketData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/tickets/add`, ticketData);
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
      const { data } = await axios.put(`${API_BASE}/tickets/update/${id}`, ticketData);
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
      await axios.delete(`${API_BASE}/tickets/delete/${id}`);
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
      const { data } = await axios.get(`${API_BASE}/tickets/${id}`);
      return data.ticket;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const uploadTicketAttachments = createAsyncThunk(
  'tickets/uploadAttachments',
  async ({ ticketId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/tickets/${ticketId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
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
    fetchById: 'idle',
    upload: 'idle'
  },
  error: {
    fetch: null,
    create: null,
    update: null,
    delete: null,
    fetchById: null,
    upload: null
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
        state.list = action.payload;
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
        const idx = state.list.findIndex(ticket => ticket._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
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
        state.list = state.list.filter(ticket => ticket._id !== action.payload);
        if (state.selected && state.selected._id === action.payload) {
          state.selected = null;
        }
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
      })

      // Upload attachments
      .addCase(uploadTicketAttachments.pending, (state) => {
        state.status.upload = 'loading';
        state.error.upload = null;
      })
      .addCase(uploadTicketAttachments.fulfilled, (state, action) => {
        state.status.upload = 'succeeded';
        // Update the selected ticket with new attachments
        if (state.selected) {
          state.selected.attachments = action.payload.attachments;
        }
      })
      .addCase(uploadTicketAttachments.rejected, (state, action) => {
        state.status.upload = 'failed';
        state.error.upload = action.payload;
      });
  }
});

export const { selectTicket, clearError, resetStatus } = ticketSlice.actions;
export default ticketSlice.reducer;
