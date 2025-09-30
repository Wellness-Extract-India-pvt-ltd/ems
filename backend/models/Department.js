/**
 * Department Model
 * Represents department data in the EMS system
 */

import { DataTypes } from 'sequelize'
import sequelize from '../database/connection.js'

const Department = sequelize.define(
  'Department',
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    manager_id: {
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
    budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: [0, 200]
      }
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
      validate: {
        isIn: [['Active', 'Inactive']]
      }
    }
  },
  {
    tableName: 'departments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['status']
      },
      {
        fields: ['manager_id']
      },
      {
        fields: ['location']
      }
    ],
    validate: {
      budgetMustBePositive () {
        if (this.budget !== null && this.budget < 0) {
          throw new Error('Budget must be positive')
        }
      },
      managerMustBeValid () {
        if (this.manager_id && this.manager_id < 1) {
          throw new Error('Manager ID must be a positive integer')
        }
      }
    }
  }
)

export default Department
