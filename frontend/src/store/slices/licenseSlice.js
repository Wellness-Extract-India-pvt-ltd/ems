import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

// Async thunks for license management
export const fetchLicenses = createAsyncThunk(
  'licenses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/licenses/all');
      return data;
    } catch (err) {
      console.error('License fetch error:', err);
      console.error('Error response:', err.response?.data);
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch licenses');
    }
  }
);

export const createLicense = createAsyncThunk(
  'licenses/create',
  async (licenseData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/licenses/add', licenseData);
      return data.license;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateLicense = createAsyncThunk(
  'licenses/update',
  async ({ id, licenseData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/licenses/update/${id}`, licenseData);
      return data.license;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteLicense = createAsyncThunk(
  'licenses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/licenses/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getLicenseById = createAsyncThunk(
  'licenses/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/licenses/${id}`);
      return data.license;
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

const licenseSlice = createSlice({
  name: 'licenses',
  initialState,
  reducers: {
    selectLicense: (state, action) => {
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
      // Fetch all licenses
      .addCase(fetchLicenses.pending, (state) => {
        state.status.fetch = 'loading';
        state.error.fetch = null;
      })
      .addCase(fetchLicenses.fulfilled, (state, action) => {
        state.status.fetch = 'succeeded';
        state.list = action.payload.data || action.payload || [];
      })
      .addCase(fetchLicenses.rejected, (state, action) => {
        state.status.fetch = 'failed';
        state.error.fetch = action.payload;
      })

      // Create license
      .addCase(createLicense.pending, (state) => {
        state.status.create = 'loading';
        state.error.create = null;
      })
      .addCase(createLicense.fulfilled, (state, action) => {
        state.status.create = 'succeeded';
        state.list.push(action.payload);
      })
      .addCase(createLicense.rejected, (state, action) => {
        state.status.create = 'failed';
        state.error.create = action.payload;
      })

      // Update license
      .addCase(updateLicense.pending, (state) => {
        state.status.update = 'loading';
        state.error.update = null;
      })
      .addCase(updateLicense.fulfilled, (state, action) => {
        state.status.update = 'succeeded';
        const idx = state.list.findIndex(lic => lic.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selected && state.selected.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateLicense.rejected, (state, action) => {
        state.status.update = 'failed';
        state.error.update = action.payload;
      })

      // Delete license
      .addCase(deleteLicense.pending, (state) => {
        state.status.delete = 'loading';
        state.error.delete = null;
      })
      .addCase(deleteLicense.fulfilled, (state, action) => {
        state.status.delete = 'succeeded';
        state.list = state.list.filter(lic => lic.id !== action.payload);
        if (state.selected && state.selected.id === action.payload) {
          state.selected = null;
        }
      })
      .addCase(deleteLicense.rejected, (state, action) => {
        state.status.delete = 'failed';
        state.error.delete = action.payload;
      })

      // Get license by ID
      .addCase(getLicenseById.pending, (state) => {
        state.status.fetchById = 'loading';
        state.error.fetchById = null;
      })
      .addCase(getLicenseById.fulfilled, (state, action) => {
        state.status.fetchById = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(getLicenseById.rejected, (state, action) => {
        state.status.fetchById = 'failed';
        state.error.fetchById = action.payload;
      });
  }
});

export const { selectLicense, clearError, resetStatus } = licenseSlice.actions;
export default licenseSlice.reducer;
