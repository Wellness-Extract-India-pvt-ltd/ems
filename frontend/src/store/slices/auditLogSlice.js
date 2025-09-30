import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

// Async thunks for audit log management
export const fetchAuditLogs = createAsyncThunk(
  'auditLogs/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/audit-logs', { params });
      return data;
    } catch (err) {
      console.error('Audit logs fetch error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle rate limit errors specifically
      if (err.response?.status === 429) {
        const retryAfter = err.response?.data?.retryAfter || 900;
        return rejectWithValue(`Rate limit exceeded. Please wait ${Math.ceil(retryAfter / 60)} minutes before trying again.`);
      }
      
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch audit logs');
    }
  }
);

export const fetchAuditLogStats = createAsyncThunk(
  'auditLogs/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/audit-logs/stats');
      return data;
    } catch (err) {
      console.error('Audit log stats error:', err);
      
      // Handle rate limit errors specifically
      if (err.response?.status === 429) {
        const retryAfter = err.response?.data?.retryAfter || 900;
        return rejectWithValue(`Rate limit exceeded. Please wait ${Math.ceil(retryAfter / 60)} minutes before trying again.`);
      }
      
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch audit log statistics');
    }
  }
);

export const exportAuditLogs = createAsyncThunk(
  'auditLogs/export',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/audit-logs/export', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      console.error('Audit logs export error:', err);
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to export audit logs');
    }
  }
);

export const cleanupAuditLogs = createAsyncThunk(
  'auditLogs/cleanup',
  async (retentionDays, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/audit-logs/cleanup', { retention_days: retentionDays });
      return data;
    } catch (err) {
      console.error('Audit logs cleanup error:', err);
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to cleanup audit logs');
    }
  }
);

const initialState = {
  logs: [],
  stats: null,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    limit: 50,
    has_next_page: false,
    has_prev_page: false
  },
  filters: {
    search: '',
    action: '',
    resource_type: '',
    severity: '',
    status: '',
    category: '',
    user_email: '',
    date_from: '',
    date_to: '',
    ip_address: ''
  },
  sort: {
    field: 'created_at',
    order: 'DESC'
  },
  status: {
    fetch: 'idle',
    stats: 'idle',
    export: 'idle',
    cleanup: 'idle'
  },
  error: {
    fetch: null,
    stats: null,
    export: null,
    cleanup: null
  }
};

const auditLogSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSort: (state, action) => {
      state.sort = { ...state.sort, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        action: '',
        resource_type: '',
        severity: '',
        status: '',
        category: '',
        user_email: '',
        date_from: '',
        date_to: '',
        ip_address: ''
      };
    },
    clearError: (state, action) => {
      const key = action.payload;
      if (state.error[key] !== undefined) {
        state.error[key] = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch audit logs
      .addCase(fetchAuditLogs.pending, (state) => {
        state.status.fetch = 'loading';
        state.error.fetch = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.status.fetch = 'succeeded';
        state.logs = action.payload.data.audit_logs || [];
        // Only update pagination, don't update filters and sort from API response
        // to prevent infinite loops
        state.pagination = action.payload.data.pagination || state.pagination;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.status.fetch = 'failed';
        state.error.fetch = action.payload;
      })

      // Fetch audit log stats
      .addCase(fetchAuditLogStats.pending, (state) => {
        state.status.stats = 'loading';
        state.error.stats = null;
      })
      .addCase(fetchAuditLogStats.fulfilled, (state, action) => {
        state.status.stats = 'succeeded';
        state.stats = action.payload.data;
      })
      .addCase(fetchAuditLogStats.rejected, (state, action) => {
        state.status.stats = 'failed';
        state.error.stats = action.payload;
      })

      // Export audit logs
      .addCase(exportAuditLogs.pending, (state) => {
        state.status.export = 'loading';
        state.error.export = null;
      })
      .addCase(exportAuditLogs.fulfilled, (state) => {
        state.status.export = 'succeeded';
      })
      .addCase(exportAuditLogs.rejected, (state, action) => {
        state.status.export = 'failed';
        state.error.export = action.payload;
      })

      // Cleanup audit logs
      .addCase(cleanupAuditLogs.pending, (state) => {
        state.status.cleanup = 'loading';
        state.error.cleanup = null;
      })
      .addCase(cleanupAuditLogs.fulfilled, (state) => {
        state.status.cleanup = 'succeeded';
      })
      .addCase(cleanupAuditLogs.rejected, (state, action) => {
        state.status.cleanup = 'failed';
        state.error.cleanup = action.payload;
      });
  }
});

export const { 
  setFilters, 
  setSort, 
  setPagination, 
  clearFilters, 
  clearError 
} = auditLogSlice.actions;

export default auditLogSlice.reducer;