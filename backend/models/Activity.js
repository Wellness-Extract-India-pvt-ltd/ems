import { DataTypes } from 'sequelize'
import sequelize from '../database/connection.js'

const Activity = sequelize.define('Activity', {
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
  activity_type: {
    type: DataTypes.ENUM(
      'employee_created',
      'employee_updated', 
      'employee_deleted',
      'asset_assigned',
      'asset_unassigned',
      'asset_created',
      'asset_updated',
      'license_created',
      'license_updated',
      'license_expiring',
      'ticket_created',
      'ticket_updated',
      'ticket_resolved',
      'biometric_checkin',
      'biometric_checkout',
      'system_login',
      'system_logout',
      'profile_updated',
      'settings_changed',
      'report_generated',
      'data_exported',
      'password_changed',
      'role_assigned',
      'permission_granted',
      'permission_revoked'
    ),
    allowNull: false,
    validate: { isIn: [['employee_created', 'employee_updated', 'employee_deleted', 'asset_assigned', 'asset_unassigned', 'asset_created', 'asset_updated', 'license_created', 'license_updated', 'license_expiring', 'ticket_created', 'ticket_updated', 'ticket_resolved', 'biometric_checkin', 'biometric_checkout', 'system_login', 'system_logout', 'profile_updated', 'settings_changed', 'report_generated', 'data_exported', 'password_changed', 'role_assigned', 'permission_granted', 'permission_revoked']] }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { len: [1, 255] }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: { len: [0, 1000] }
  },
  entity_type: {
    type: DataTypes.ENUM('employee', 'asset', 'license', 'ticket', 'user', 'system', 'biometric'),
    allowNull: true,
    validate: { isIn: [['employee', 'asset', 'license', 'ticket', 'user', 'system', 'biometric']] }
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { isInt: true, min: 1 }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    validate: { isIP: true }
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'low',
    validate: { isIn: [['low', 'medium', 'high', 'critical']] }
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'activities',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['activity_type'] },
    { fields: ['entity_type'] },
    { fields: ['entity_id'] },
    { fields: ['severity'] },
    { fields: ['is_public'] },
    { fields: ['created_at'] },
    { fields: ['is_active'] },
    { fields: ['user_id', 'created_at'] },
    { fields: ['activity_type', 'created_at'] }
  ],
  validate: {
    titleRequired() {
      if (!this.title || this.title.trim().length === 0) {
        throw new Error('Activity title is required')
      }
    },
    validEntityReference() {
      if (this.entity_id && !this.entity_type) {
        throw new Error('Entity type is required when entity_id is provided')
      }
    }
  }
})

export default Activity
