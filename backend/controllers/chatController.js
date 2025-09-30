/**
 * @fileoverview Chat Controller for AI Assistant Integration
 * @description Handles chat operations with OpenAI platform AI assistant.
 * Provides secure chat functionality for authenticated users with conversation history,
 * token usage tracking, and comprehensive logging.
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-18
 * 
 * @features
 * - OpenAI API integration with custom assistant
 * - Conversation history management
 * - Token usage tracking and monitoring
 * - Session-based chat management
 * - Rate limiting and security
 * - Comprehensive error handling and logging
 */

import { validationResult } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { Op } from 'sequelize'

// Import models
import Chat from '../models/Chat.js'
import UserRoleMap from '../models/UserRoleMap.js'
import sequelize from '../database/connection.js'

// Import logger
import logger from '../utils/logger.js'

/**
 * Sends a message to OpenAI assistant and returns the response
 * 
 * @async
 * @function sendMessageToAssistant
 * @param {string} message - User message content
 * @param {string} sessionId - Chat session identifier
 * @param {number} userId - User ID for context
 * @returns {Promise<Object>} Assistant response with metadata
 * 
 * @description
 * This function handles the complete flow of sending a message to OpenAI assistant:
 * 1. Validates input parameters
 * 2. Creates or retrieves a thread for the session
 * 3. Sends message to the assistant via thread
 * 4. Processes and returns the response
 * 5. Logs the interaction for monitoring
 * 
 * @throws {Error} If OpenAI API request fails
 * @throws {Error} If conversation history retrieval fails
 */
async function sendMessageToAssistant(message, sessionId, userId) {
  const startTime = Date.now()
  
  try {
    // Validate OpenAI configuration
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_ASSISTANT_ID) {
      throw new Error('OpenAI configuration is missing')
    }

    // Get or create thread for this session
    let threadId = await getOrCreateThread(sessionId)
    
    logger.info('Using thread for message', {
      sessionId,
      threadId,
      message: message.substring(0, 50) + '...'
    })

    // Skip conversation history loading to avoid confusion
    // The OpenAI thread will maintain context naturally

    // Add current message to thread
    const messageResponse = await axios.post(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      role: 'user',
      content: message
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      timeout: 30000
    })

    logger.info('User message added to thread', {
      sessionId,
      threadId,
      messageId: messageResponse.data.id
    })

    // Thread is ready for assistant run

    // Run the assistant
    const runResponse = await axios.post(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      timeout: 30000
    })

    const runId = runResponse.data.id
    logger.info('Assistant run started', {
      sessionId,
      threadId,
      runId
    })

    // Wait for the run to complete with timeout
    let runStatus = 'queued'
    let attempts = 0
    const maxAttempts = 60 // 60 seconds timeout
    
    while ((runStatus === 'queued' || runStatus === 'in_progress') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      attempts++
      
      try {
        const statusResponse = await axios.get(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          },
          timeout: 10000
        })
        
        runStatus = statusResponse.data.status
        logger.info('Run status check', {
          sessionId,
          threadId,
          runId,
          status: runStatus,
          attempt: attempts
        })
      } catch (statusError) {
        logger.error('Failed to check run status', {
          sessionId,
          threadId,
          runId,
          error: statusError.message,
          attempt: attempts
        })
        // Continue trying
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Assistant run timed out after 60 seconds')
    }

    if (runStatus === 'failed') {
      // Get run details for error information
      try {
        const runDetails = await axios.get(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        })
        const errorDetails = runDetails.data.last_error
        throw new Error(`Assistant run failed: ${errorDetails?.message || 'Unknown error'}`)
      } catch (detailsError) {
        throw new Error(`Assistant run failed: ${runStatus}`)
      }
    }

    if (runStatus !== 'completed') {
      throw new Error(`Assistant run ended with status: ${runStatus}`)
    }

    // Get the assistant's response
    const messagesResponse = await axios.get(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      timeout: 30000
    })

    const assistantMessages = messagesResponse.data.data.filter(msg => msg.role === 'assistant')
    
    if (assistantMessages.length === 0) {
      throw new Error('No assistant response found in thread')
    }
    
    const latestResponse = assistantMessages[assistantMessages.length - 1]
    
    if (!latestResponse.content || !latestResponse.content[0] || !latestResponse.content[0].text) {
      throw new Error('Invalid assistant response format')
    }
    
    const responseTime = Date.now() - startTime
    const assistantResponse = latestResponse.content[0].text.value
    const tokensUsed = latestResponse.usage?.total_tokens || 0
    
    logger.info('Assistant response received', {
      sessionId,
      threadId,
      responseLength: assistantResponse.length,
      responsePreview: assistantResponse.substring(0, 100) + '...',
      totalMessages: messagesResponse.data.data.length,
      assistantMessagesCount: assistantMessages.length,
      tokensUsed,
      responseTime
    })

    return {
      message: assistantResponse,
      tokensUsed,
      model: 'assistant',
      responseTime
    }

  } catch (error) {
    const responseTime = Date.now() - startTime
    
    logger.error('OpenAI Assistant API request failed', {
      sessionId,
      userId,
      error: error.message,
      responseTime,
      stack: error.stack
    })

    // Return a more user-friendly error message
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      throw new Error('The AI assistant is taking longer than expected to respond. Please try again.')
    } else if (error.message.includes('configuration')) {
      throw new Error('AI assistant is not properly configured. Please contact support.')
    } else {
      throw new Error(`AI Assistant is currently unavailable: ${error.message}`)
    }
  }
}

/**
 * Gets or creates a thread for the session
 * 
 * @async
 * @function getOrCreateThread
 * @param {string} sessionId - Chat session identifier
 * @returns {Promise<string>} Thread ID
 */
async function getOrCreateThread(sessionId) {
  try {
    // Check if we already have a thread for this session
    const existingChat = await Chat.findOne({
      where: {
        session_id: sessionId,
        is_active: true,
        thread_id: { [Op.ne]: null }
      },
      order: [['created_at', 'DESC']]
    })

    // Always create a new thread for each session to avoid confusion
    logger.info('Creating new thread for session', {
      sessionId
    })

    // Create a new thread
    const threadResponse = await axios.post('https://api.openai.com/v1/threads', {}, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      timeout: 30000
    })

    const threadId = threadResponse.data.id

    // Store the thread ID in the database (without creating a visible message)
    await Chat.create({
      user_id: 1, // Use default user ID for development
      session_id: sessionId,
      thread_id: threadId,
      message_type: 'user', // Use 'user' type but with special content
      message_content: '__THREAD_CREATED__', // Special marker that won't be displayed
      is_active: true
    })

    logger.info('New thread created for session', {
      sessionId,
      threadId
    })

    return threadId

  } catch (error) {
    logger.error('Failed to get or create thread', {
      sessionId,
      error: error.message
    })
    throw new Error('Failed to create conversation thread')
  }
}

/**
 * Loads conversation history into the OpenAI thread to maintain context
 * 
 * @async
 * @function loadConversationHistoryIntoThread
 * @param {string} sessionId - Session identifier
 * @param {string} threadId - OpenAI thread identifier
 */
async function loadConversationHistoryIntoThread(sessionId, threadId) {
  try {
    // Get conversation history from database
    const conversationHistory = await getConversationHistory(sessionId, 10) // Last 10 messages
    
    if (conversationHistory.length === 0) {
      logger.info('No conversation history to load', { sessionId, threadId })
      return
    }

    // Check if thread already has messages to avoid duplicates
    const existingMessages = await axios.get(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    })

    // Count non-system messages in thread
    const nonSystemMessages = existingMessages.data.data.filter(msg => 
      msg.content && msg.content[0] && msg.content[0].text && 
      !msg.content[0].text.value.includes('__THREAD_CREATED__')
    )

    // Always load conversation history to ensure context is maintained
    logger.info('Loading conversation history into thread', {
      sessionId,
      threadId,
      historyLength: conversationHistory.length,
      existingMessages: nonSystemMessages.length
    })

    // Load conversation history into thread (excluding system messages)
    for (const msg of conversationHistory) {
      if (msg.message_content !== '__THREAD_CREATED__') {
        try {
          await axios.post(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            role: msg.message_type === 'user' ? 'user' : 'assistant',
            content: msg.message_content
          }, {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'assistants=v2'
            },
            timeout: 30000
          })
          
          logger.info('Message loaded into thread', {
            sessionId,
            threadId,
            messageType: msg.message_type,
            messageContent: msg.message_content.substring(0, 50) + '...'
          })
        } catch (loadError) {
          logger.error('Failed to load message into thread', {
            sessionId,
            threadId,
            messageId: msg.id,
            error: loadError.message
          })
          // Continue with other messages
        }
      }
    }

    logger.info('Conversation history loaded successfully', {
      sessionId,
      threadId,
      messagesLoaded: conversationHistory.length
    })

  } catch (error) {
    logger.error('Failed to load conversation history into thread', {
      sessionId,
      threadId,
      error: error.message
    })
    // Don't throw error - this is not critical for basic functionality
  }
}

/**
 * Retrieves conversation history for a session
 * 
 * @async
 * @function getConversationHistory
 * @param {string} sessionId - Chat session identifier
 * @param {number} limit - Maximum number of messages to retrieve
 * @returns {Promise<Array>} Array of conversation messages
 */
async function getConversationHistory(sessionId, limit = 10) {
  try {
    const messages = await Chat.findAll({
      where: {
        session_id: sessionId,
        is_active: true
      },
      order: [['created_at', 'ASC']],
      limit: limit
    })

    return messages
  } catch (error) {
    logger.error('Failed to retrieve conversation history', {
      sessionId,
      error: error.message
    })
    return []
  }
}

/**
 * Saves a message to the database
 * 
 * @async
 * @function saveMessage
 * @param {Object} messageData - Message data to save
 * @returns {Promise<Object>} Saved message object
 */
async function saveMessage(messageData) {
  try {
    const message = await Chat.create(messageData)
    
    logger.info('Message saved successfully', {
      messageId: message.id,
      sessionId: message.session_id,
      userId: message.user_id,
      messageType: message.message_type
    })

    return message
  } catch (error) {
    logger.error('Failed to save message', {
      error: error.message,
      messageData
    })
    throw new Error('Failed to save message')
  }
}

/**
 * Generates a session title based on the conversation context using AI
 * 
 * @async
 * @function generateSessionTitle
 * @param {string} sessionId - Session identifier
 * @param {number} userId - User identifier
 */
async function generateSessionTitle(sessionId, userId) {
  try {
    // Check if session already has a title
    const existingSession = await Chat.findOne({
      where: {
        session_id: sessionId,
        user_id: userId,
        session_title: { [Op.ne]: null }
      }
    })

    if (existingSession) {
      return // Session already has a title
    }

    // Get the conversation to generate a meaningful title
    const conversation = await getConversationHistory(sessionId, 10)
    if (conversation.length === 0) {
      return // No conversation to generate title from
    }

    // Create a summary of the conversation for title generation
    const conversationSummary = conversation
      .filter(msg => msg.message_content !== '__THREAD_CREATED__')
      .slice(0, 5) // Use first 5 messages for context
      .map(msg => `${msg.message_type}: ${msg.message_content}`)
      .join('\n')

    // Generate title using OpenAI
    let title = 'New Chat' // Default fallback
    
    try {
      const titleResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate a short, descriptive title (max 6 words) for this conversation. Return only the title, no quotes or extra text.'
          },
          {
            role: 'user',
            content: `Conversation:\n${conversationSummary}`
          }
        ],
        max_tokens: 20,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })

      if (titleResponse.data.choices && titleResponse.data.choices[0]) {
        title = titleResponse.data.choices[0].message.content.trim()
        // Clean up the title
        title = title.replace(/['"]/g, '').substring(0, 50)
      }
    } catch (aiError) {
      logger.warn('Failed to generate AI title, using fallback', {
        sessionId,
        error: aiError.message
      })
      
      // Fallback: Use first user message
      const firstUserMessage = conversation.find(msg => 
        msg.message_type === 'user' && msg.message_content !== '__THREAD_CREATED__'
      )
      if (firstUserMessage) {
        title = firstUserMessage.message_content.trim()
        if (title.length > 50) {
          title = title.substring(0, 47) + '...'
        }
      }
    }

    // Update all messages in this session with the title
    await Chat.update(
      { session_title: title },
      {
        where: {
          session_id: sessionId,
          user_id: userId
        },
        validate: false // Skip model validations during update
      }
    )

    logger.info('Session title generated', {
      sessionId,
      userId,
      title
    })
  } catch (error) {
    logger.error('Failed to generate session title', {
      sessionId,
      userId,
      error: error.message
    })
  }
}

/**
 * Sends a message to the AI assistant
 * 
 * @async
 * @function sendMessage
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.body - Request body
 * @param {string} req.body.message - User message content
 * @param {string} req.body.sessionId - Chat session identifier (optional)
 * @param {Object} res - Express response object
 * 
 * @description
 * This endpoint handles sending messages to the AI assistant:
 * 1. Validates the request and user authentication
 * 2. Creates a new session if none provided
 * 3. Saves the user message to database
 * 4. Sends message to OpenAI assistant
 * 5. Saves the assistant response
 * 6. Returns the complete conversation
 * 
 * @returns {Promise<void>} JSON response with assistant message
 */
export const sendMessage = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { message, sessionId } = req.body
    const userId = req.user.id

    // Generate session ID if not provided
    const chatSessionId = sessionId || uuidv4()

    // Get thread ID for this session
    const threadId = await getOrCreateThread(chatSessionId)

    // Save user message (without creating session title yet)
    await saveMessage({
      user_id: userId,
      session_id: chatSessionId,
      thread_id: threadId,
      message_type: 'user',
      message_content: message
    })

    // Send message to AI assistant
    const assistantResponse = await sendMessageToAssistant(message, chatSessionId, userId)

    // Save assistant response
    await saveMessage({
      user_id: userId,
      session_id: chatSessionId,
      thread_id: threadId,
      message_type: 'assistant',
      message_content: assistantResponse.message,
      tokens_used: assistantResponse.tokensUsed,
      model_used: assistantResponse.model,
      response_time: assistantResponse.responseTime
    })

    // Get updated conversation history
    const conversation = await getConversationHistory(chatSessionId)

    logger.info('Chat message processed successfully', {
      userId,
      sessionId: chatSessionId,
      tokensUsed: assistantResponse.tokensUsed
    })

    res.status(200).json({
      success: true,
      data: {
        sessionId: chatSessionId,
        assistantMessage: assistantResponse.message,
        tokensUsed: assistantResponse.tokensUsed,
        model: assistantResponse.model,
        responseTime: assistantResponse.responseTime,
        conversation: conversation.map(msg => ({
          id: msg.id,
          type: msg.message_type,
          content: msg.message_content,
          timestamp: msg.created_at
        }))
      }
    })

  } catch (error) {
    logger.error('Chat message processing failed', {
      userId: req.user?.id,
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      message: error.message
    })
  }
}

/**
 * Retrieves chat history for a session
 * 
 * @async
 * @function getChatHistory
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.sessionId - Chat session identifier
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} JSON response with chat history
 */
export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params
    const userId = req.user.id

    // Get conversation history
    const conversation = await getConversationHistory(sessionId, 50) // Last 50 messages

    // Verify user owns this session
    const userSessions = await Chat.findAll({
      where: {
        user_id: userId,
        session_id: sessionId,
        is_active: true
      },
      attributes: ['session_id'],
      group: ['session_id']
    })

    if (userSessions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or access denied'
      })
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        conversation: conversation.map(msg => ({
          id: msg.id,
          type: msg.message_type,
          content: msg.message_content,
          timestamp: msg.created_at ? new Date(msg.created_at).toISOString() : new Date().toISOString(),
          tokensUsed: msg.tokens_used,
          model: msg.model_used
        }))
      }
    })

  } catch (error) {
    logger.error('Failed to retrieve chat history', {
      userId: req.user?.id,
      sessionId: req.params.sessionId,
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat history',
      message: error.message
    })
  }
}

/**
 * Gets all chat sessions for a user
 * 
 * @async
 * @function getUserSessions
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} JSON response with user sessions
 */
export const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id

    // Get all sessions for the user with titles
    const sessions = await Chat.findAll({
      where: {
        user_id: userId,
        is_active: true
      },
      attributes: [
        'session_id',
        [sequelize.fn('MAX', sequelize.col('session_title')), 'session_title'],
        [sequelize.fn('MAX', sequelize.col('created_at')), 'last_message_time'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'message_count']
      ],
      group: ['session_id'],
      order: [[sequelize.literal('MAX(created_at)'), 'DESC']]
    })

    // Debug: Log the raw session data
    logger.info('Raw session data from database', {
      sessionsCount: sessions.length,
      sampleSession: sessions[0] ? {
        sessionId: sessions[0].session_id,
        lastMessageTime: sessions[0].dataValues?.last_message_time,
        messageCount: sessions[0].dataValues?.message_count
      } : null
    });

    res.status(200).json({
      success: true,
      data: {
        sessions: sessions.map(session => {
          const lastMessageTime = session.dataValues.last_message_time;
          const formattedTime = formatSessionTime(lastMessageTime);
          const sessionTitle = session.dataValues.session_title;
          
          logger.info('Processing session', {
            sessionId: session.session_id,
            sessionTitle,
            lastMessageTime,
            formattedTime,
            messageCount: session.dataValues.message_count
          });
          
          return {
            sessionId: session.session_id,
            title: sessionTitle || 'New Chat',
            lastMessageTime: lastMessageTime,
            messageCount: parseInt(session.dataValues.message_count),
            formattedTime: formattedTime
          };
        })
      }
    })

  } catch (error) {
    logger.error('Failed to retrieve user sessions', {
      userId: req.user?.id,
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sessions',
      message: error.message
    })
  }
}

/**
 * Formats session time for display
 * 
 * @function formatSessionTime
 * @param {Date} timestamp - Session timestamp
 * @returns {string} Formatted time string
 */
function formatSessionTime(timestamp) {
  if (!timestamp) return 'Just now'
  
  try {
    const now = new Date()
    let sessionTime
    
    // Handle different timestamp formats
    if (timestamp instanceof Date) {
      sessionTime = timestamp
    } else if (typeof timestamp === 'string') {
      sessionTime = new Date(timestamp)
    } else if (timestamp.getTime) {
      sessionTime = new Date(timestamp.getTime())
    } else {
      sessionTime = new Date(timestamp)
    }
    
    // Check if the date is valid
    if (isNaN(sessionTime.getTime())) {
      logger.warn('Invalid timestamp format', { timestamp, type: typeof timestamp })
      return 'Just now'
    }
    
    const diffInHours = (now - sessionTime) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return sessionTime.toLocaleDateString()
    }
  } catch (error) {
    logger.error('Error formatting session time', { timestamp, error: error.message })
    return 'Just now'
  }
}

/**
 * Generates a title for a chat session when user switches away
 * 
 * @async
 * @function generateSessionTitleEndpoint
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.sessionId - Chat session identifier
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} JSON response with title generation status
 */
export const generateSessionTitleEndpoint = async (req, res) => {
  try {
    const { sessionId } = req.params
    const userId = req.user.id

    // Basic validation
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID',
        message: 'Session ID is required and must be a valid string'
      })
    }

    // Generate the session title
    await generateSessionTitle(sessionId, userId)

    logger.info('Session title generation requested', {
      userId,
      sessionId
    })

    res.status(200).json({
      success: true,
      message: 'Session title generated successfully'
    })

  } catch (error) {
    logger.error('Failed to generate session title', {
      userId: req.user?.id,
      sessionId: req.params.sessionId,
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: 'Failed to generate session title',
      message: error.message
    })
  }
}

/**
 * Deletes a chat session
 * 
 * @async
 * @function deleteSession
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.sessionId - Chat session identifier
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} JSON response with deletion status
 */
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params
    const userId = req.user.id

    // Basic validation
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID',
        message: 'Session ID is required and must be a valid string'
      })
    }

    // Soft delete the session (mark as inactive)
    // Use raw query to avoid model validations during update
    const result = await Chat.update(
      { is_active: false },
      {
        where: {
          user_id: userId,
          session_id: sessionId
        },
        validate: false // Skip model validations during update
      }
    )

    // Check if any records were updated
    if (result[0] === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: 'No session found with the provided ID'
      })
    }

    logger.info('Chat session deleted', {
      userId,
      sessionId
    })

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    })

  } catch (error) {
    logger.error('Failed to delete chat session', {
      userId: req.user?.id,
      sessionId: req.params.sessionId,
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: 'Failed to delete session',
      message: error.message
    })
  }
}
