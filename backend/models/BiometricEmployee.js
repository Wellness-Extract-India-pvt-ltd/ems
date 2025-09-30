/**
 * Biometric Employee Model
 * Represents employee data from the ONtime_Att biometric system
 * This is a local cache of employee data from the remote SQL Server database
 */

import { DataTypes } from 'sequelize'
import sequelize from '../database/connection.js'

const BiometricEmployee = sequelize.define(
  'BiometricEmployee',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'employee_id'
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'last_name'
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'full_name'
    },
    employeeCode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: 'employee_code'
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive', 'Terminated'),
      allowNull: false,
      defaultValue: 'Active'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    biometricId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'biometric_id'
    },
    lastSyncAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_sync_at'
    }
  },
  {
    tableName: 'biometric_employees',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['employee_id']
      },
      {
        fields: ['employee_code']
      },
      {
        fields: ['department']
      },
      {
        fields: ['status']
      },
      {
        fields: ['last_sync_at']
      }
    ],
    validate: {
      bothNamesOrFullName () {
        if ((!this.firstName || !this.lastName) && !this.fullName) {
          throw new Error(
            'Either both firstName and lastName, or fullName must be provided'
          )
        }
      }
    }
  }
)

export default BiometricEmployee
