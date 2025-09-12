import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Async thunks for software management
export const fetchSoftware = createAsyncThunk(
  'software/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/software/all`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createSoftware = createAsyncThunk(
  'software/create',
  async (softwareData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/software/add`, softwareData);
      return data.software;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateSoftware = createAsyncThunk(
  'software/update',
  async ({ id, softwareData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_BASE}/software/update/${id}`, softwareData);
      return data.software;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteSoftware = createAsyncThunk(
  'software/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/software/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getSoftwareById = createAsyncThunk(
  'software/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/software/${id}`);
      return data.software;
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

const softwareSlice = createSlice({
  name: 'software',
  initialState,
  reducers: {
    selectSoftware: (state, action) => {
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
      // Fetch all software
      .addCase(fetchSoftware.pending, (state) => {
        state.status.fetch = 'loading';
        state.error.fetch = null;
      })
      .addCase(fetchSoftware.fulfilled, (state, action) => {
        state.status.fetch = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchSoftware.rejected, (state, action) => {
        state.status.fetch = 'failed';
        state.error.fetch = action.payload;
      })

      // Create software
      .addCase(createSoftware.pending, (state) => {
        state.status.create = 'loading';
        state.error.create = null;
      })
      .addCase(createSoftware.fulfilled, (state, action) => {
        state.status.create = 'succeeded';
        state.list.push(action.payload);
      })
      .addCase(createSoftware.rejected, (state, action) => {
        state.status.create = 'failed';
        state.error.create = action.payload;
      })

      // Update software
      .addCase(updateSoftware.pending, (state) => {
        state.status.update = 'loading';
        state.error.update = null;
      })
      .addCase(updateSoftware.fulfilled, (state, action) => {
        state.status.update = 'succeeded';
        const idx = state.list.findIndex(sw => sw._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateSoftware.rejected, (state, action) => {
        state.status.update = 'failed';
        state.error.update = action.payload;
      })

      // Delete software
      .addCase(deleteSoftware.pending, (state) => {
        state.status.delete = 'loading';
        state.error.delete = null;
      })
      .addCase(deleteSoftware.fulfilled, (state, action) => {
        state.status.delete = 'succeeded';
        state.list = state.list.filter(sw => sw._id !== action.payload);
        if (state.selected && state.selected._id === action.payload) {
          state.selected = null;
        }
      })
      .addCase(deleteSoftware.rejected, (state, action) => {
        state.status.delete = 'failed';
        state.error.delete = action.payload;
      })

      // Get software by ID
      .addCase(getSoftwareById.pending, (state) => {
        state.status.fetchById = 'loading';
        state.error.fetchById = null;
      })
      .addCase(getSoftwareById.fulfilled, (state, action) => {
        state.status.fetchById = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(getSoftwareById.rejected, (state, action) => {
        state.status.fetchById = 'failed';
        state.error.fetchById = action.payload;
      });
  }
});

export const { selectSoftware, clearError, resetStatus } = softwareSlice.actions;
export default softwareSlice.reducer;
