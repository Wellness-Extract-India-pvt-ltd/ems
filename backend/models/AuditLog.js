/**
 * Audit Log Model
 * Comprehensive audit trail for enterprise-level compliance and security
 */

import { DataTypes } from 'sequelize'
import sequelize from '../database/connection.js'

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'user_role_maps', key: 'id' },
    validate: { isInt: true, min: 1 }
  },
  user_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { len: [1, 255] }
  },
  user_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { isEmail: true }
  },
  user_role: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { len: [1, 50] }
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { len: [1, 100] }
  },
  resource_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { len: [1, 50] }
  },
  resource_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: { len: [0, 100] }
  },
  resource_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: { len: [0, 255] }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: { len: [0, 2000] }
  },
  old_values: {
    type: DataTypes.JSON,
    allowNull: true
  },
  new_values: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    validate: { len: [0, 45] }
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: { len: [0, 1000] }
  },
  session_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: { len: [0, 255] }
  },
  severity: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
    defaultValue: 'MEDIUM'
  },
  status: {
    type: DataTypes.ENUM('SUCCESS', 'FAILURE', 'WARNING'),
    allowNull: false,
    defaultValue: 'SUCCESS'
  },
  category: {
    type: DataTypes.ENUM(
      'AUTHENTICATION',
      'AUTHORIZATION',
      'DATA_ACCESS',
      'DATA_MODIFICATION',
      'DATA_DELETION',
      'SYSTEM_CONFIGURATION',
      'SECURITY_EVENT',
      'COMPLIANCE',
      'ADMINISTRATIVE',
      'USER_MANAGEMENT',
      'ASSET_MANAGEMENT',
      'LICENSE_MANAGEMENT',
      'TICKET_MANAGEMENT',
      'INTEGRATION',
      'BACKUP',
      'RESTORE',
      'EXPORT',
      'IMPORT',
      'OTHER'
    ),
    allowNull: false,
    defaultValue: 'OTHER'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  is_sensitive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  retention_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action'] },
    { fields: ['resource_type'] },
    { fields: ['resource_id'] },
    { fields: ['severity'] },
    { fields: ['status'] },
    { fields: ['category'] },
    { fields: ['created_at'] },
    { fields: ['ip_address'] },
    { fields: ['session_id'] },
    { fields: ['is_sensitive'] },
    { fields: ['retention_date'] },
    { fields: ['user_email'] },
    { fields: ['user_role'] }
  ],
  validate: {
    actionRequired() {
      if (!this.action || this.action.trim().length === 0) {
        throw new Error('Action is required')
      }
    },
    resourceTypeRequired() {
      if (!this.resource_type || this.resource_type.trim().length === 0) {
        throw new Error('Resource type is required')
      }
    },
    userNameRequired() {
      if (!this.user_name || this.user_name.trim().length === 0) {
        throw new Error('User name is required')
      }
    }
  }
})

export default AuditLog
