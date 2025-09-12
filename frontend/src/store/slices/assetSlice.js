<<<<<<< Updated upstream
import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit';

export const fetchAssets = createAsyncThunk(
  'assets/fetchAssets',
  async (_, thunkAPI) => {
    try {
      const response = await fetch('/api/assets')
      if (!response.ok) throw new Error('Failed to fetch assets')
      const data = await response.json()
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message)
    }
  }
)
=======
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

// Async thunks for hardware management
export const fetchHardware = createAsyncThunk(
  'hardware/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/hardware/all');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createHardware = createAsyncThunk(
  'hardware/create',
  async (hardwareData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/hardware/add', hardwareData);
      return data.hardware;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateHardware = createAsyncThunk(
  'hardware/update',
  async ({ id, hardwareData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/hardware/update/${id}`, hardwareData);
      return data.hardware;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteHardware = createAsyncThunk(
  'hardware/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/hardware/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getHardwareById = createAsyncThunk(
  'hardware/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/hardware/${id}`);
      return data.hardware;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
>>>>>>> Stashed changes

export const getHardwareByEmployee = createAsyncThunk(
  'hardware/getByEmployee',
  async (employeeId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/hardware/employee/${employeeId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
<<<<<<< Updated upstream
  assets: [],
  loading: false,
  error: null,
=======
  list: [],
  selected: null,
  employeeAssets: [],
  status: {
    fetch: 'idle',
    create: 'idle',
    update: 'idle',
    delete: 'idle',
    fetchById: 'idle',
    fetchByEmployee: 'idle'
  },
  error: {
    fetch: null,
    create: null,
    update: null,
    delete: null,
    fetchById: null,
    fetchByEmployee: null
  }
>>>>>>> Stashed changes
};

const assetSlice = createSlice({
    name: 'assets',
    initialState,
    reducers: {
        addAsset: {
          reducer: (state, action) => {
            state.assets.push(action.payload)
        },
        prepare: (payload) => {
          return { payload: { id: nanoid(), ...payload }}
        }
      },
        updateAsset: (state, action) => {
            const { id, ...updates } = action.payload;
            const index = state.assets.findIndex((asset) => asset.id === id);
            if (index !== -1) {
                state.assets[index] = { ...state.assets[index], ...updates };
            }
        },

        deleteAsset: (state, action) => {
            state.assets = state.assets.filter((asset) => asset.id !== action.payload);
        }
    },

    extraReducers: (builder) => {
      builder
        .addCase(fetchAssets.pending, (state) => {
          state.loading = true
          state.error = null
        })
        .addCase(fetchAssets.fulfilled, (state, action) => {
          state.loading = false
          state.assets = action.payload
        })
        .addCase(fetchAssets.rejected, (state, action) => {
          state.loading = false
          state.error = action.payload || 'Failed to fetch assets'
        })
    }
<<<<<<< Updated upstream
=======
  },
  extraReducers: (builder) => {
    builder
      // Fetch all hardware
      .addCase(fetchHardware.pending, (state) => {
        state.status.fetch = 'loading';
        state.error.fetch = null;
      })
      .addCase(fetchHardware.fulfilled, (state, action) => {
        state.status.fetch = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchHardware.rejected, (state, action) => {
        state.status.fetch = 'failed';
        state.error.fetch = action.payload;
      })

      // Create hardware
      .addCase(createHardware.pending, (state) => {
        state.status.create = 'loading';
        state.error.create = null;
      })
      .addCase(createHardware.fulfilled, (state, action) => {
        state.status.create = 'succeeded';
        state.list.push(action.payload);
      })
      .addCase(createHardware.rejected, (state, action) => {
        state.status.create = 'failed';
        state.error.create = action.payload;
      })

      // Update hardware
      .addCase(updateHardware.pending, (state) => {
        state.status.update = 'loading';
        state.error.update = null;
      })
      .addCase(updateHardware.fulfilled, (state, action) => {
        state.status.update = 'succeeded';
        const idx = state.list.findIndex(hw => hw._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateHardware.rejected, (state, action) => {
        state.status.update = 'failed';
        state.error.update = action.payload;
      })

      // Delete hardware
      .addCase(deleteHardware.pending, (state) => {
        state.status.delete = 'loading';
        state.error.delete = null;
      })
      .addCase(deleteHardware.fulfilled, (state, action) => {
        state.status.delete = 'succeeded';
        state.list = state.list.filter(hw => hw._id !== action.payload);
        if (state.selected && state.selected._id === action.payload) {
          state.selected = null;
        }
      })
      .addCase(deleteHardware.rejected, (state, action) => {
        state.status.delete = 'failed';
        state.error.delete = action.payload;
      })

      // Get hardware by ID
      .addCase(getHardwareById.pending, (state) => {
        state.status.fetchById = 'loading';
        state.error.fetchById = null;
      })
      .addCase(getHardwareById.fulfilled, (state, action) => {
        state.status.fetchById = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(getHardwareById.rejected, (state, action) => {
        state.status.fetchById = 'failed';
        state.error.fetchById = action.payload;
      })

      // Get hardware by employee
      .addCase(getHardwareByEmployee.pending, (state) => {
        state.status.fetchByEmployee = 'loading';
        state.error.fetchByEmployee = null;
      })
      .addCase(getHardwareByEmployee.fulfilled, (state, action) => {
        state.status.fetchByEmployee = 'succeeded';
        state.employeeAssets = action.payload;
      })
      .addCase(getHardwareByEmployee.rejected, (state, action) => {
        state.status.fetchByEmployee = 'failed';
        state.error.fetchByEmployee = action.payload;
      });
  }
>>>>>>> Stashed changes
});

export const { addAsset, updateAsset, deleteAsset } = assetSlice.actions;
export default assetSlice.reducer;