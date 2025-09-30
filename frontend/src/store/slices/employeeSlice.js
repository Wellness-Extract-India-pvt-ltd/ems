// src/store/slices/employeeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Thunks
export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/employees/all');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/create',
  async (formData, { rejectWithValue }) => {
    try {

         console.log('Form Data Payload:');
for (let [key, value] of formData.entries()) {
  console.log(`${key}:`, value instanceof File ? value.name : value);
}
      const { data } = await api.post('/employees/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.employee;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/employees/update/${id}`, payload);
      return data.employee;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/employees/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState: {
    list: [],
    selected: null,
    status: {
      fetch: 'idle',
      create: 'idle',
      update: 'idle',
      delete: 'idle'
    },
    error: {
      fetch: null,
      create: null,
      update: null,
      delete: null
    }
  },
  reducers: {
    selectEmployee: (state, action) => {
      state.selected = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state, action) => {
      const key = action.payload;
      if (state.status[key] !== undefined) {
        state.status[key] = 'idle';
      }
    },
    setEmployees: (state, action) => {
      state.list = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status.fetch = 'loading';
        state.error.fetch = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status.fetch = 'succeeded';
        // Handle both array and object responses
        state.list = Array.isArray(action.payload) ? action.payload : action.payload.employees || [];
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status.fetch = 'failed';
        state.error.fetch = action.payload;
      })

      .addCase(createEmployee.pending, (state) => {
        state.status.create = 'loading';
        state.error.create = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.status.create = 'succeeded';
        state.list.push(action.payload);
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.status.create = 'failed';
        state.error.create = action.payload;
      })

      .addCase(updateEmployee.pending, (state) => {
        state.status.update = 'loading';
        state.error.update = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.status.update = 'succeeded';
        const idx = state.list.findIndex(emp => emp._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.status.update = 'failed';
        state.error.update = action.payload;
      })

      .addCase(deleteEmployee.pending, (state) => {
        state.status.delete = 'loading';
        state.error.delete = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.status.delete = 'succeeded';
        state.list = state.list.filter(emp => emp._id !== action.payload);
        if (state.selected && state.selected._id === action.payload) {
          state.selected = null;
        }
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.status.delete = 'failed';
        state.error.delete = action.payload;
      });
  }
});

export const { selectEmployee, clearError, resetStatus, setEmployees } = employeeSlice.actions;
export default employeeSlice.reducer;
