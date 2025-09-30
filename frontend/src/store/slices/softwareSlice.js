import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

// Async thunks for software management
export const fetchSoftware = createAsyncThunk(
  'software/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/software/all');
      return data;
    } catch (err) {
      console.error('Software fetch error:', err);
      console.error('Error response:', err.response?.data);
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch software');
    }
  }
);

export const createSoftware = createAsyncThunk(
  'software/create',
  async (softwareData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/software/add', softwareData);
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
      const { data } = await api.put(`/software/update/${id}`, softwareData);
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
      await api.delete(`/software/delete/${id}`);
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
      const { data } = await api.get(`/software/${id}`);
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
    clearSelected: (state) => {
      state.selected = null;
    },
    clearErrors: (state) => {
      state.error = {
        fetch: null,
        create: null,
        update: null,
        delete: null,
        fetchById: null
      };
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
        state.list = action.payload.data || action.payload || [];
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
        const idx = state.list.findIndex(sw => sw.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selected && state.selected.id === action.payload.id) {
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
        state.list = state.list.filter(sw => sw.id !== action.payload);
        if (state.selected && state.selected.id === action.payload) {
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

export const { clearSelected, clearErrors } = softwareSlice.actions;
export default softwareSlice.reducer;
