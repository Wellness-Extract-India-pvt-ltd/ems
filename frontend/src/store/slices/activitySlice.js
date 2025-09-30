import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

// Async thunks for activity operations
export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/activities', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

export const createActivity = createAsyncThunk(
  'activities/createActivity',
  async (activityData, { rejectWithValue }) => {
    try {
      const response = await api.post('/activities', activityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create activity');
    }
  }
);

export const fetchActivityStats = createAsyncThunk(
  'activities/fetchActivityStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/activities/stats', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity stats');
    }
  }
);

export const deleteActivity = createAsyncThunk(
  'activities/deleteActivity',
  async (activityId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/activities/${activityId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete activity');
    }
  }
);

const initialState = {
  activities: [],
  stats: {},
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  }
};

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addActivity: (state, action) => {
      state.activities.unshift(action.payload);
    },
    removeActivity: (state, action) => {
      state.activities = state.activities.filter(activity => activity.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.data.activities || [];
        state.pagination = action.payload.data.pagination || state.pagination;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Activity
      .addCase(createActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.loading = false;
        // Add new activity to the beginning of the list
        state.activities.unshift(action.payload.data.activity);
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Activity Stats
      .addCase(fetchActivityStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data || {};
      })
      .addCase(fetchActivityStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Activity
      .addCase(deleteActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.loading = false;
        // Remove activity from the list
        const activityId = action.meta.arg;
        state.activities = state.activities.filter(activity => activity.id !== activityId);
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, addActivity, removeActivity } = activitySlice.actions;
export default activitySlice.reducer;
