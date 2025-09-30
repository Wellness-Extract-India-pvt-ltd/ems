import { DataTypes } from 'sequelize'
import sequelize from '../database/connection.js'

const TimeTracking = sequelize.define('TimeTracking', {
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
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'employees', key: 'id' },
    validate: { isInt: true, min: 1 }
  },
  check_in_time: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: { isDate: true }
  },
  check_out_time: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: { isDate: true }
  },
  check_in_location: {
    type: DataTypes.JSON,
    allowNull: true,
    validate: {
      isValidLocation(location) {
        if (location && typeof location === 'object') {
          if (location.latitude && !location.longitude) {
            throw new Error('Longitude is required when latitude is provided')
          }
          if (location.longitude && !location.latitude) {
            throw new Error('Latitude is required when longitude is provided')
          }
          if (location.latitude && (location.latitude < -90 || location.latitude > 90)) {
            throw new Error('Latitude must be between -90 and 90')
          }
          if (location.longitude && (location.longitude < -180 || location.longitude > 180)) {
            throw new Error('Longitude must be between -180 and 180')
          }
        }
      }
    }
  },
  check_out_location: {
    type: DataTypes.JSON,
    allowNull: true,
    validate: {
      isValidLocation(location) {
        if (location && typeof location === 'object') {
          if (location.latitude && !location.longitude) {
            throw new Error('Longitude is required when latitude is provided')
          }
          if (location.longitude && !location.latitude) {
            throw new Error('Latitude is required when longitude is provided')
          }
          if (location.latitude && (location.latitude < -90 || location.latitude > 90)) {
            throw new Error('Latitude must be between -90 and 90')
          }
          if (location.longitude && (location.longitude < -180 || location.longitude > 180)) {
            throw new Error('Longitude must be between -180 and 180')
          }
        }
      }
    }
  },
  work_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: { isDate: true }
  },
  total_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: { 
      isDecimal: true,
      min: 0,
      max: 24
    }
  },
  break_duration: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    validate: { 
      isDecimal: true,
      min: 0,
      max: 24
    }
  },
  overtime_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    validate: { 
      isDecimal: true,
      min: 0,
      max: 24
    }
  },
  status: {
    type: DataTypes.ENUM('checked_in', 'checked_out', 'on_break', 'completed'),
    allowNull: false,
    defaultValue: 'checked_out',
    validate: { isIn: [['checked_in', 'checked_out', 'on_break', 'completed']] }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: { len: [0, 1000] }
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
  device_info: {
    type: DataTypes.JSON,
    allowNull: true
  },
  is_manual: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'user_role_maps', key: 'id' },
    validate: { isInt: true, min: 1 }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: { isDate: true }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'time_tracking',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['employee_id'] },
    { fields: ['work_date'] },
    { fields: ['status'] },
    { fields: ['check_in_time'] },
    { fields: ['check_out_time'] },
    { fields: ['is_active'] },
    { fields: ['user_id', 'work_date'] },
    { fields: ['employee_id', 'work_date'] },
    { fields: ['status', 'work_date'] }
  ],
  validate: {
    // Simplified validation to avoid conflicts
    validWorkDate() {
      if (this.work_date && !this.work_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new Error('Work date must be in YYYY-MM-DD format')
      }
    }
  }
})

export default TimeTracking
