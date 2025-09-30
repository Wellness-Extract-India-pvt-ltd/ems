import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

// Async thunk for fetching dashboard statistics
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
);

const initialState = {
  stats: {
    employees: {
      total: 0,
      active: 0,
      newThisMonth: 0,
      newThisWeek: 0
    },
    assets: {
      total: 0,
      assigned: 0,
      available: 0,
      maintenance: 0
    },
    software: {
      total: 0,
      installed: 0,
      available: 0
    },
    licenses: {
      total: 0,
      active: 0,
      expiringSoon: 0,
      expired: 0
    },
    tickets: {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      newToday: 0
    },
    biometrics: {
      totalEmployees: 0,
      activeToday: 0,
      activeThisWeek: 0
    },
    chat: {
      totalSessions: 0,
      messagesToday: 0,
      activeUsers: 0
    }
  },
  loading: false,
  error: null,
  lastUpdated: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data.stats;
        state.lastUpdated = action.payload.data.lastUpdated;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setLoading } = dashboardSlice.actions;
export default dashboardSlice.reducer;
