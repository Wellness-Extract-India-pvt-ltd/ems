import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

// Async thunks for hardware operations
export const fetchHardware = createAsyncThunk(
  'hardware/fetchHardware',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search, category, status, brand, assigned_to } = params;
      const queryParams = new URLSearchParams();
      
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      if (search) queryParams.append('search', search);
      if (category) queryParams.append('category', category);
      if (status) queryParams.append('status', status);
      if (brand) queryParams.append('brand', brand);
      if (assigned_to) queryParams.append('assigned_to', assigned_to);
      
      const response = await api.get(`/hardware/all?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hardware');
    }
  }
);

export const createHardware = createAsyncThunk(
  'hardware/createHardware',
  async (hardwareData, { rejectWithValue }) => {
    try {
      const response = await api.post('/hardware/add', hardwareData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create hardware');
    }
  }
);

export const updateHardware = createAsyncThunk(
  'hardware/updateHardware',
  async ({ id, hardwareData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/hardware/update/${id}`, hardwareData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update hardware');
    }
  }
);

export const deleteHardware = createAsyncThunk(
  'hardware/deleteHardware',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/hardware/delete/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete hardware');
    }
  }
);

export const getHardwareById = createAsyncThunk(
  'hardware/getHardwareById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/hardware/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hardware details');
    }
  }
);

const initialState = {
  hardware: [],
  currentHardware: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  filters: {
    search: '',
    category: '',
    status: '',
    brand: '',
    assigned_to: ''
  }
};

const hardwareSlice = createSlice({
  name: 'hardware',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        status: '',
        brand: '',
        assigned_to: ''
      };
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Hardware
      .addCase(fetchHardware.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHardware.fulfilled, (state, action) => {
        state.loading = false;
        state.hardware = action.payload.data.hardware || [];
        state.pagination = {
          currentPage: action.payload.data.pagination?.currentPage || 1,
          totalPages: action.payload.data.pagination?.totalPages || 1,
          totalItems: action.payload.data.pagination?.totalItems || 0,
          itemsPerPage: action.payload.data.pagination?.itemsPerPage || 10
        };
      })
      .addCase(fetchHardware.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Hardware
      .addCase(createHardware.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHardware.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new hardware to the list
        state.hardware.unshift(action.payload.data);
        state.pagination.totalItems += 1;
      })
      .addCase(createHardware.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Hardware
      .addCase(updateHardware.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHardware.fulfilled, (state, action) => {
        state.loading = false;
        const updatedHardware = action.payload.data;
        const index = state.hardware.findIndex(h => h.id === updatedHardware.id);
        if (index !== -1) {
          state.hardware[index] = updatedHardware;
        }
      })
      .addCase(updateHardware.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Hardware
      .addCase(deleteHardware.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHardware.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.meta.arg;
        state.hardware = state.hardware.filter(h => h.id !== deletedId);
        state.pagination.totalItems -= 1;
      })
      .addCase(deleteHardware.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Hardware By ID
      .addCase(getHardwareById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHardwareById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHardware = action.payload.data;
      })
      .addCase(getHardwareById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setFilters, clearFilters, setCurrentPage } = hardwareSlice.actions;
export default hardwareSlice.reducer;
