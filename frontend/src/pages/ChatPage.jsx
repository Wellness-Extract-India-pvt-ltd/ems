import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, getChatSessions, getChatHistory, deleteChatSession, generateChatTitle } from '../store/slices/chatSlice';
import { 
  Send, 
  Mic, 
  Paperclip, 
  Copy, 
  Heart, 
  Plus, 
  Search, 
  Bot, 
  User, 
  MoreVertical,
  Edit3,
  Trash2,
  Check,
  X
} from 'lucide-react';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { messages, loading, error, sessions, isTyping } = useSelector(state => state.chat);
  const [inputMessage, setInputMessage] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshingSessions, setIsRefreshingSessions] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Generate session ID on component mount
  useEffect(() => {
    if (!currentSessionId) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentSessionId(sessionId);
    }
  }, [currentSessionId]);

  // Load chat sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        await dispatch(getChatSessions());
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
        // Retry after a delay if rate limited
        if (error.includes('429') || error.includes('Too Many Requests')) {
          setTimeout(() => {
            dispatch(getChatSessions());
          }, 2000);
        }
      }
    };
    
    loadSessions();
  }, [dispatch]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debug logging (only in development)
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      console.log('ChatPage - messages:', messages);
      console.log('ChatPage - loading:', loading);
      console.log('ChatPage - isTyping:', isTyping);
      console.log('ChatPage - error:', error);
      console.log('ChatPage - currentSessionId:', currentSessionId);
      console.log('ChatPage - sessions:', sessions);
    }
  }, [messages, loading, isTyping, error, currentSessionId, sessions]);

  // Generate title when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      // Generate title for current session if it has messages
      if (currentSessionId && messages.length > 0) {
        dispatch(generateChatTitle(currentSessionId));
      }
    };
  }, [currentSessionId, messages.length, dispatch]);

  // Prevent any layout shifts that might affect the sidebar
  useEffect(() => {
    // Ensure the main app layout is not affected by chat interactions
    const mainElement = document.querySelector('main');
    const sidebarElement = document.querySelector('aside');
    
    if (mainElement) {
      mainElement.style.overflow = 'hidden';
    }
    
    // Ensure sidebar remains stable and logout button is not affected
    if (sidebarElement) {
      sidebarElement.style.position = 'relative';
      sidebarElement.style.zIndex = '10';
      
      // Hide logout button specifically to prevent it from appearing
      const logoutButton = sidebarElement.querySelector('button.w-full.flex.items-center.gap-3.px-4.py-2.text-sm.font-medium.rounded-lg.transition-colors.text-red-600.hover\\:bg-red-50');
      if (logoutButton) {
        logoutButton.style.display = 'none';
        logoutButton.classList.add('chat-page-hidden');
      }
    }
    
    return () => {
      if (mainElement) {
        mainElement.style.overflow = 'auto';
      }
      if (sidebarElement) {
        sidebarElement.style.position = '';
        sidebarElement.style.zIndex = '';
        
        // Restore logout button when leaving chat page
        const logoutButton = sidebarElement.querySelector('button.w-full.flex.items-center.gap-3.px-4.py-2.text-sm.font-medium.rounded-lg.transition-colors.text-red-600.hover\\:bg-red-50');
        if (logoutButton) {
          logoutButton.style.display = '';
          logoutButton.classList.remove('chat-page-hidden');
        }
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) {
      return;
    }

    const message = inputMessage.trim();
    setInputMessage(''); // Clear input immediately

    // Prevent any layout shifts that might affect the sidebar
    const sidebarElement = document.querySelector('aside');
    if (sidebarElement) {
      sidebarElement.style.position = 'relative';
      sidebarElement.style.zIndex = '10';
      
      // Hide logout button specifically to prevent it from appearing
      const logoutButton = sidebarElement.querySelector('button.w-full.flex.items-center.gap-3.px-4.py-2.text-sm.font-medium.rounded-lg.transition-colors.text-red-600.hover\\:bg-red-50');
      if (logoutButton) {
        logoutButton.style.display = 'none';
      }
    }

    try {
      const result = await dispatch(sendMessage({
        message,
        sessionId: currentSessionId
      }));
      
      if (result.type === 'chat/sendMessage/rejected') {
        console.error('Message sending failed:', result.payload);
        // Error is already handled by Redux, but we can add additional handling here
              } else {
                console.log('Message sent successfully:', result);
                // Don't refresh sessions after every message - only when switching chats
                // This prevents message timestamps from being overwritten
              }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Prevent any layout shifts that might affect the sidebar
      const sidebarElement = document.querySelector('aside');
      if (sidebarElement) {
        sidebarElement.style.position = 'relative';
        sidebarElement.style.zIndex = '10';
      }
      
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Implement file upload functionality
      console.log('File selected:', file.name);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // TODO: Show toast notification
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  // Helper function to refresh sessions with debouncing
  const refreshSessions = async () => {
    if (isRefreshingSessions) {
      console.log('Sessions refresh already in progress, skipping...');
      return;
    }
    
    setIsRefreshingSessions(true);
    try {
      await dispatch(getChatSessions());
    } catch (error) {
      console.error('Failed to refresh sessions:', error);
    } finally {
      setIsRefreshingSessions(false);
    }
  };

  const handleNewChat = async () => {
    // Generate title for current session if it has messages and no title yet
    if (currentSessionId && messages.length > 0) {
      try {
        await dispatch(generateChatTitle(currentSessionId));
        // Refresh sessions to get updated titles and timestamps
        await refreshSessions();
      } catch (error) {
        console.error('Failed to generate title for current session:', error);
      }
    }

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentSessionId(newSessionId);
    
    // Prevent any layout shifts that might affect the sidebar
    const sidebarElement = document.querySelector('aside');
    if (sidebarElement) {
      sidebarElement.style.position = 'relative';
      sidebarElement.style.zIndex = '10';
    }
    
    dispatch({ type: 'chat/clearMessages' });
    dispatch({ type: 'chat/setCurrentSession', payload: newSessionId });
  };

  const handleSessionClick = async (session) => {
    // Generate title for current session if it has messages and no title yet
    if (currentSessionId && currentSessionId !== session.sessionId && messages.length > 0) {
      try {
        await dispatch(generateChatTitle(currentSessionId));
        // Refresh sessions to get updated titles and timestamps
        await refreshSessions();
      } catch (error) {
        console.error('Failed to generate title for current session:', error);
      }
    }

    console.log('Loading session:', session.sessionId);
    setCurrentSessionId(session.sessionId);
    dispatch({ type: 'chat/setCurrentSession', payload: session.sessionId });
    
    // Clear current messages first
    dispatch({ type: 'chat/clearMessages' });
    
    try {
      const result = await dispatch(getChatHistory(session.sessionId));
      console.log('Chat history loaded:', result);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    console.log('Attempting to delete session:', sessionId);
    
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      try {
        console.log('Deleting session:', sessionId);
        const result = await dispatch(deleteChatSession(sessionId));
        console.log('Delete session result:', result);
        
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          dispatch({ type: 'chat/clearMessages' });
        }
        
        // Refresh the sessions list after a small delay
        setTimeout(() => {
          refreshSessions();
        }, 500);
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
      
      // Prevent any layout shifts that might affect the sidebar
      const sidebarElement = document.querySelector('aside');
      if (sidebarElement) {
        sidebarElement.style.position = 'relative';
        sidebarElement.style.zIndex = '10';
      }
    }
  };

  return (
    <div className="flex h-full bg-white" style={{ position: 'relative', zIndex: '1' }}>
      <style>
        {`
          .chat-page-hidden {
            display: none !important;
          }
          /* Hide logout button on chat page */
          aside button.w-full.flex.items-center.gap-3.px-4.py-2.text-sm.font-medium.rounded-lg.transition-colors.text-red-600.hover\\:bg-red-50 {
            display: none !important;
          }
        `}
      </style>
      {/* Chat Sidebar - ChatGPT Style */}
      <div className="w-64 bg-gray-900 text-white flex flex-col border-r border-gray-700 flex-shrink-0" style={{ position: 'relative', zIndex: '1' }}>
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-700">
          <button 
            onClick={handleNewChat}
            className="w-full bg-transparent hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors border border-gray-600 hover:border-gray-500"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 text-sm border border-gray-600 focus:border-gray-500 focus:outline-none"
            />
          </div>
        </div>

                {/* Recent Chats */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Recent Chats</div>
                  <div className="space-y-1">
                    {sessions.length === 0 ? (
                      <div className="text-gray-500 text-sm py-2">No recent chats</div>
                    ) : (
                      sessions.map((session) => (
                        <div
                          key={session.sessionId}
                          onClick={() => handleSessionClick(session)}
                          className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm transition-colors ${
                            currentSessionId === session.sessionId 
                              ? 'bg-gray-800 text-white' 
                              : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium mb-1">
                              {session.title || 'New Chat'}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {session.formattedTime || 'Just now'}
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                              onClick={(e) => handleDeleteSession(session.sessionId, e)}
                              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete chat"
                            >
                              <Trash2 size={14} />
                            </button>
                            <MoreVertical size={16} className="text-gray-400" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
      </div>

      {/* Main Chat Area - ChatGPT Style */}
      <div className="flex-1 flex flex-col bg-white min-h-0">
        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl mx-auto px-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome to Wellness Chat Assistant
                </h1>
                <p className="text-gray-600 mb-8">
                  I'm here to help you with employee management, HR processes, and general assistance. 
                  How can I help you today?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors">
                    <div className="font-medium text-gray-900">Employee Management</div>
                    <div className="text-sm text-gray-600">Help with employee data and processes</div>
                  </button>
                  <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors">
                    <div className="font-medium text-gray-900">HR Support</div>
                    <div className="text-sm text-gray-600">Assistance with HR policies and procedures</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {messages.filter(msg => msg.content !== '__THREAD_CREATED__').map((message, index) => (
                <div key={index} className={`group border-b border-gray-200 ${message.role === 'user' ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="flex items-start space-x-4 p-6 max-w-4xl mx-auto">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-green-600 text-white'
                    }`}>
                      {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-gray-900">
                                  {message.role === 'user' ? 'You' : 'Wellness Assistant'}
                                </span>
                                {message.timestamp && (
                                  <span className="text-xs text-gray-500">
                                    {formatTime(message.timestamp)}
                                  </span>
                                )}
                              </div>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-800">
                          {message.content}
                        </div>
                      </div>
                      {message.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
                            title="Copy"
                          >
                            <Copy size={14} />
                          </button>
                          <button 
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
                            title="Like"
                          >
                            <Heart size={14} />
                          </button>
                          <button 
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

                      {isTyping && (
                        <div className="border-b border-gray-200 bg-white">
                          <div className="flex items-start space-x-4 p-6 max-w-4xl mx-auto">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                              <Bot size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-2">Wellness Assistant</div>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {error && (
                        <div className="border-b border-gray-200 bg-red-50">
                          <div className="flex items-start space-x-4 p-6 max-w-4xl mx-auto">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center">
                              <X size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-red-900 mb-2">Error</div>
                              <div className="text-red-700 text-sm">
                                {error}
                              </div>
                              <button 
                                onClick={() => dispatch({ type: 'chat/clearError' })}
                                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="border-t border-gray-200 bg-white flex-shrink-0">
          <div className="w-full p-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }} className="relative">
              <div className="flex items-end space-x-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Attach file"
                >
                  <Paperclip size={20} />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Wellness Assistant..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white shadow-sm"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                  <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title="Voice input"
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex-shrink-0 p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl transition-colors shadow-sm"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />

            <div className="text-xs text-gray-500 mt-3 text-center">
              Wellness Assistant can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;