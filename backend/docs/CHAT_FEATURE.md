# Chat with AI Feature

## Overview

The Chat with AI feature allows authenticated users to interact with an OpenAI platform AI assistant through the EMS backend. This feature enables multiple users to share a single OpenAI API key and assistant, eliminating the need for individual ChatGPT Plus subscriptions.

## Features

- **Secure Authentication**: Only authenticated users can access the chat feature
- **Session Management**: Each conversation is tracked with unique session IDs
- **Conversation History**: Full conversation history is stored and retrievable
- **Token Usage Tracking**: Monitor OpenAI API usage and costs
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **Multi-User Support**: Multiple users can chat simultaneously with different sessions

## API Endpoints

### 1. Send Message
```
POST /api/v1/chat/send
```

**Request Body:**
```json
{
  "message": "Hello, can you help me with employee management?",
  "sessionId": "optional-session-id" // If not provided, a new session will be created
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-session-id",
    "assistantMessage": "I'd be happy to help you with employee management...",
    "tokensUsed": 150,
    "model": "gpt-3.5-turbo",
    "responseTime": 1250,
    "conversation": [
      {
        "id": 1,
        "type": "user",
        "content": "Hello, can you help me with employee management?",
        "timestamp": "2025-09-18T10:30:00Z"
      },
      {
        "id": 2,
        "type": "assistant",
        "content": "I'd be happy to help you with employee management...",
        "timestamp": "2025-09-18T10:30:01Z"
      }
    ]
  }
}
```

### 2. Get Chat History
```
GET /api/v1/chat/history/:sessionId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-session-id",
    "conversation": [
      {
        "id": 1,
        "type": "user",
        "content": "Hello",
        "timestamp": "2025-09-18T10:30:00Z",
        "tokensUsed": null,
        "model": null
      },
      {
        "id": 2,
        "type": "assistant",
        "content": "Hello! How can I help you?",
        "timestamp": "2025-09-18T10:30:01Z",
        "tokensUsed": 25,
        "model": "gpt-3.5-turbo"
      }
    ]
  }
}
```

### 3. Get User Sessions
```
GET /api/v1/chat/sessions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "uuid-session-1",
        "lastMessageTime": "2025-09-18T10:30:00Z",
        "messageCount": 5
      },
      {
        "sessionId": "uuid-session-2",
        "lastMessageTime": "2025-09-18T09:15:00Z",
        "messageCount": 12
      }
    ]
  }
}
```

### 4. Delete Session
```
DELETE /api/v1/chat/session/:sessionId
```

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
# OpenAI Configuration (AI Assistant)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_ASSISTANT_ID=your-assistant-id-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
```

### OpenAI Setup

1. **Create an OpenAI Account**: Sign up at [OpenAI Platform](https://platform.openai.com/)
2. **Generate API Key**: Go to API Keys section and create a new key
3. **Create Assistant** (Optional): You can create a custom assistant or use the default model
4. **Configure Environment**: Add your API key and assistant ID to the environment variables

## Database Schema

### Chat Table

```sql
CREATE TABLE chats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  message_type ENUM('user', 'assistant') NOT NULL,
  message_content TEXT NOT NULL,
  tokens_used INT,
  model_used VARCHAR(100),
  response_time INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES user_role_maps(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_created_at (created_at)
);
```

## Security Features

- **Authentication Required**: All endpoints require valid JWT tokens
- **Rate Limiting**: 50 requests per 15 minutes per IP
- **Input Validation**: Message content is validated and sanitized
- **Session Isolation**: Users can only access their own conversations
- **Token Tracking**: Monitor API usage to prevent abuse

## Usage Examples

### Frontend Integration

```javascript
// Send a message
const sendMessage = async (message, sessionId = null) => {
  const response = await fetch('/api/v1/chat/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      sessionId
    })
  });
  
  return await response.json();
};

// Get chat history
const getChatHistory = async (sessionId) => {
  const response = await fetch(`/api/v1/chat/history/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

### Testing

Run the chat API tests:

```bash
# Set your test JWT token
export TEST_JWT_TOKEN="your-jwt-token-here"

# Run the tests
node tests/chat/chat-api-test.js
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Invalid input or validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: OpenAI API errors or server issues

## Monitoring and Logging

- All chat interactions are logged with user ID, session ID, and token usage
- Response times are tracked for performance monitoring
- Token usage is recorded for cost analysis
- Error logs include detailed information for debugging

## Cost Management

- Token usage is tracked per user and session
- Rate limiting prevents excessive API calls
- Conversation history is limited to prevent context overflow
- Configurable token limits per request

## Future Enhancements

- **File Upload Support**: Allow users to upload documents for AI analysis
- **Voice Integration**: Add voice-to-text and text-to-voice capabilities
- **Custom Prompts**: Allow users to set custom system prompts
- **Analytics Dashboard**: Track usage patterns and costs
- **Multi-Language Support**: Support for multiple languages
- **Integration with EMS Data**: Allow AI to access employee data for better assistance
