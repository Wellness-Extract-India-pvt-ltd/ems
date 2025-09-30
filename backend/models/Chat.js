/**
 * Chat Model
 * Represents chat conversations with AI assistant in the EMS system
 */

import { DataTypes } from 'sequelize'
import sequelize from '../database/connection.js'

const Chat = sequelize.define(
  'Chat',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user_role_maps',
        key: 'id'
      },
      validate: {
        isInt: true,
        min: 1
      }
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255]
      }
    },
    session_title: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    thread_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: [0, 255]
      }
    },
    message_type: {
      type: DataTypes.ENUM('user', 'assistant'),
      allowNull: false,
      validate: {
        isIn: [['user', 'assistant']]
      }
    },
    message_content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 10000] // Max 10KB per message
      }
    },
    tokens_used: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: true,
        min: 0
      }
    },
    model_used: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    response_time: {
      type: DataTypes.INTEGER, // in milliseconds
      allowNull: true,
      validate: {
        isInt: true,
        min: 0
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'chats',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['session_id']
      },
      {
        fields: ['session_title']
      },
      {
        fields: ['message_type']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['is_active']
      }
    ],
    validate: {
      messageContentRequired () {
        if (!this.message_content || this.message_content.trim().length === 0) {
          throw new Error('Message content is required')
        }
      },
      sessionIdRequired () {
        if (!this.session_id || this.session_id.trim().length === 0) {
          throw new Error('Session ID is required')
        }
      }
    }
  }
)

export default Chat
