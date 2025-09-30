import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

// Async thunks for time tracking operations
export const getTimeTrackingStatus = createAsyncThunk(
  'timeTracking/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/time-tracking/status');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get time tracking status');
    }
  }
);

export const checkIn = createAsyncThunk(
  'timeTracking/checkIn',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/time-tracking/check-in', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in');
    }
  }
);

export const checkOut = createAsyncThunk(
  'timeTracking/checkOut',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/time-tracking/check-out', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check out');
    }
  }
);

export const getTimeTrackingHistory = createAsyncThunk(
  'timeTracking/getHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/time-tracking/history', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get time tracking history');
    }
  }
);

export const getTeamTimeTracking = createAsyncThunk(
  'timeTracking/getTeam',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/time-tracking/team', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get team time tracking');
    }
  }
);

export const getTimeTrackingStats = createAsyncThunk(
  'timeTracking/getStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/time-tracking/stats', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get time tracking stats');
    }
  }
);

const initialState = {
  status: 'checked_out',
  currentSession: null,
  todayHours: 0,
  history: [],
  teamData: [],
  stats: {},
  loading: false,
  error: null,
  canCheckIn: true,
  canCheckOut: false
};

const timeTrackingSlice = createSlice({
  name: 'timeTracking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStatus: (state, action) => {
      state.status = action.payload;
    },
    updateCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Time Tracking Status
      .addCase(getTimeTrackingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTimeTrackingStatus.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data;
        state.status = data.status;
        state.currentSession = data.currentSession;
        state.todayHours = data.todayHours;
        state.canCheckIn = data.canCheckIn;
        state.canCheckOut = data.canCheckOut;
      })
      .addCase(getTimeTrackingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Check In
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'checked_in';
        state.currentSession = action.payload.data.session;
        state.canCheckIn = false;
        state.canCheckOut = true;
        state.error = null;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Check Out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'checked_out';
        state.currentSession = null;
        state.canCheckIn = true;
        state.canCheckOut = false;
        // Update today's hours
        if (action.payload.data.session) {
          state.todayHours += action.payload.data.session.totalHours || 0;
        }
        state.error = null;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Time Tracking History
      .addCase(getTimeTrackingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTimeTrackingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.data.sessions || [];
      })
      .addCase(getTimeTrackingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Team Time Tracking
      .addCase(getTeamTimeTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamTimeTracking.fulfilled, (state, action) => {
        state.loading = false;
        state.teamData = action.payload.data.sessions || [];
      })
      .addCase(getTeamTimeTracking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Time Tracking Stats
      .addCase(getTimeTrackingStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTimeTrackingStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data || {};
      })
      .addCase(getTimeTrackingStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, updateStatus, updateCurrentSession } = timeTrackingSlice.actions;
export default timeTrackingSlice.reducer;
