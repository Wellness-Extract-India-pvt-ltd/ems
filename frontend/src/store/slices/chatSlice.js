import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

// Async thunks for chat operations
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, sessionId }, { rejectWithValue }) => {
    try {
      console.log('Sending message:', { message, sessionId });
      console.log('Current token:', localStorage.getItem('token') || localStorage.getItem('authToken'));
      
      const response = await api.post('/chat/send', {
        message,
        sessionId
      }, {
        timeout: 120000 // 2 minutes timeout for AI requests
      });
      console.log('Send message response:', response.data);
      return {
        userMessage: message,
        assistantResponse: response.data.data?.assistantMessage || response.data.message || response.data.response,
        sessionId: response.data.data?.sessionId || response.data.sessionId || sessionId
      };
    } catch (error) {
      console.error('Send message error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      // Handle different types of errors
      if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        return rejectWithValue('The AI assistant is taking longer than expected to respond. Please try again.');
      } else if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      } else if (error.message) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('Failed to send message');
      }
    }
  }
);

export const getChatSessions = createAsyncThunk(
  'chat/getChatSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat/sessions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get chat sessions');
    }
  }
);

export const getChatHistory = createAsyncThunk(
  'chat/getChatHistory',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/history/${sessionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get chat history');
    }
  }
);

export const deleteChatSession = createAsyncThunk(
  'chat/deleteChatSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/chat/session/${sessionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete chat session');
    }
  }
);

export const generateChatTitle = createAsyncThunk(
  'chat/generateChatTitle',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/chat/generate-title/${sessionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate chat title');
    }
  }
);

const initialState = {
  messages: [],
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
  isTyping: false
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push({
        ...action.payload,
        timestamp: new Date().toISOString()
      });
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Send Message
      .addCase(sendMessage.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.isTyping = true;
        
        // Add user message immediately when request starts
        const { message } = action.meta.arg;
        state.messages.push({
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        });
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.isTyping = false;
        
        // Handle the actual backend response structure
        const response = action.payload;
        console.log('Send message fulfilled:', response);
        
        // Add assistant response (from backend)
        if (response.assistantResponse || response.assistantMessage) {
          state.messages.push({
            role: 'assistant',
            content: response.assistantResponse || response.assistantMessage,
            timestamp: new Date().toISOString()
          });
        }
        
        // Note: Sessions will be refreshed by the component after sending message
        // to get updated timestamps
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.isTyping = false;
        state.error = action.payload;
      })
      
      // Get Chat Sessions
      .addCase(getChatSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChatSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload.data.sessions || [];
      })
      .addCase(getChatSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Chat History
      .addCase(getChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        // Transform the conversation data to match the expected format
        const conversation = action.payload.data?.conversation || [];
        state.messages = conversation
          .filter(msg => msg.content !== '__THREAD_CREATED__') // Filter out system messages
          .map(msg => ({
            role: msg.type,
            content: msg.content,
            timestamp: msg.timestamp
          }));
      })
      .addCase(getChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Chat Session
      .addCase(deleteChatSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChatSession.fulfilled, (state, action) => {
        state.loading = false;
        // Get the sessionId from the meta.arg (the original argument passed to the thunk)
        const sessionId = action.meta.arg;
        state.sessions = state.sessions.filter(session => session.sessionId !== sessionId);
        if (state.currentSession === sessionId) {
          state.currentSession = null;
          state.messages = [];
        }
      })
              .addCase(deleteChatSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
              })
              
              // Generate Chat Title
              .addCase(generateChatTitle.pending, (state) => {
                state.loading = true;
                state.error = null;
              })
              .addCase(generateChatTitle.fulfilled, (state, action) => {
                state.loading = false;
                // Refresh sessions to get updated titles
                // This will be handled by calling getChatSessions after this action
              })
              .addCase(generateChatTitle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
              });
  }
});

export const { 
  clearMessages, 
  addMessage, 
  setCurrentSession, 
  clearError, 
  setTyping 
} = chatSlice.actions;

export default chatSlice.reducer;
