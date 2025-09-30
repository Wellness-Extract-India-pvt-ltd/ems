/**
 * Integration Model
 * Represents integration data in the EMS system
 */

import { DataTypes } from 'sequelize'
import sequelize from '../database/connection.js'

const Integration = sequelize.define(
  'Integration',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    type: {
      type: DataTypes.ENUM(
        'API',
        'Database',
        'File Transfer',
        'Webhook',
        'SSH',
        'FTP',
        'SFTP',
        'Email',
        'SMS',
        'Other'
      ),
      allowNull: false,
      validate: {
        isIn: [
          [
            'API',
            'Database',
            'File Transfer',
            'Webhook',
            'SSH',
            'FTP',
            'SFTP',
            'Email',
            'SMS',
            'Other'
          ]
        ]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    endpoint_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500],
        isUrl: true
      }
    },
    authentication_type: {
      type: DataTypes.ENUM(
        'API Key',
        'OAuth',
        'OAuth2',
        'Basic Auth',
        'Bearer Token',
        'JWT',
        'Certificate',
        'SSH Key',
        'None'
      ),
      allowNull: true,
      validate: {
        isIn: [
          [
            'API Key',
            'OAuth',
            'OAuth2',
            'Basic Auth',
            'Bearer Token',
            'JWT',
            'Certificate',
            'SSH Key',
            'None'
          ]
        ]
      }
    },
    credentials: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidJSON (value) {
          if (value !== null && typeof value !== 'object') {
            throw new Error('Credentials must be a valid JSON object')
          }
        }
      }
    },
    configuration: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidJSON (value) {
          if (value !== null && typeof value !== 'object') {
            throw new Error('Configuration must be a valid JSON object')
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM(
        'Active',
        'Inactive',
        'Error',
        'Maintenance',
        'Testing',
        'Deprecated'
      ),
      allowNull: false,
      defaultValue: 'Active',
      validate: {
        isIn: [
          [
            'Active',
            'Inactive',
            'Error',
            'Maintenance',
            'Testing',
            'Deprecated'
          ]
        ]
      }
    },
    last_sync: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    sync_frequency: {
      type: DataTypes.ENUM(
        'Real-time',
        'Every 5 minutes',
        'Every 15 minutes',
        'Every 30 minutes',
        'Hourly',
        'Daily',
        'Weekly',
        'Monthly',
        'Manual'
      ),
      allowNull: true,
      validate: {
        isIn: [
          [
            'Real-time',
            'Every 5 minutes',
            'Every 15 minutes',
            'Every 30 minutes',
            'Hourly',
            'Daily',
            'Weekly',
            'Monthly',
            'Manual'
          ]
        ]
      }
    },
    managed_by: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidJSON (value) {
          if (value !== null && !Array.isArray(value)) {
            throw new Error('Managed by must be a valid JSON array')
          }
        }
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000]
      }
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id'
      },
      validate: {
        isInt: true,
        min: 1
      }
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id'
      },
      validate: {
        isInt: true,
        min: 1
      }
    }
  },
  {
    tableName: 'integrations',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['authentication_type']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['last_sync']
      },
      {
        fields: ['sync_frequency']
      }
    ],
    validate: {
      endpointUrlRequiredForAPI () {
        if (this.type === 'API' && !this.endpoint_url) {
          throw new Error('API integrations must have an endpoint URL')
        }
      },
      authenticationTypeRequiredForAPI () {
        if (this.type === 'API' && !this.authentication_type) {
          throw new Error('API integrations must have an authentication type')
        }
      },
      credentialsRequiredForAuth () {
        if (
          this.authentication_type &&
          this.authentication_type !== 'None' &&
          !this.credentials
        ) {
          throw new Error(
            'Credentials are required when authentication type is specified'
          )
        }
      },
      syncFrequencyRequiredForActive () {
        if (
          this.status === 'Active' &&
          this.type !== 'Webhook' &&
          !this.sync_frequency
        ) {
          throw new Error('Active integrations must have a sync frequency')
        }
      },
      managedByMustBeArray () {
        if (this.managed_by && !Array.isArray(this.managed_by)) {
          throw new Error('Managed by must be an array')
        }
      }
    }
  }
)

export default Integration
