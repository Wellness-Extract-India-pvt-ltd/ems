/**
 * Hardware Model
 * Represents hardware asset data in the EMS system
 */

import { DataTypes } from 'sequelize'
import sequelize from '../database/connection.js'

const Hardware = sequelize.define(
  'Hardware',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    asset_tag: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
        isAlphanumeric: true
      }
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 200]
      }
    },
    category: {
      type: DataTypes.ENUM(
        'Laptop',
        'Desktop',
        'Monitor',
        'Keyboard',
        'Mouse',
        'Printer',
        'Scanner',
        'Network Device',
        'Mobile Device',
        'Tablet',
        'Server',
        'Other'
      ),
      allowNull: false,
      validate: {
        isIn: [
          [
            'Laptop',
            'Desktop',
            'Monitor',
            'Keyboard',
            'Mouse',
            'Printer',
            'Scanner',
            'Network Device',
            'Mobile Device',
            'Tablet',
            'Server',
            'Other'
          ]
        ]
      }
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    serial_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        len: [0, 100]
      }
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString().split('T')[0]
      }
    },
    purchase_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    warranty_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    status: {
      type: DataTypes.ENUM(
        'Available',
        'Assigned',
        'Maintenance',
        'Retired',
        'Lost',
        'Stolen'
      ),
      allowNull: false,
      defaultValue: 'Available',
      validate: {
        isIn: [
          ['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost', 'Stolen']
        ]
      }
    },
    assigned_to: {
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
    assigned_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString().split('T')[0]
      }
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: [0, 200]
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000]
      }
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidJSON (value) {
          if (value !== null && typeof value !== 'object') {
            throw new Error('Specifications must be a valid JSON object')
          }
        }
      }
    }
  },
  {
    tableName: 'hardware',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['asset_tag']
      },
      {
        fields: ['serial_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['assigned_to']
      },
      {
        fields: ['category']
      },
      {
        fields: ['brand']
      },
      {
        fields: ['purchase_date']
      },
      {
        fields: ['warranty_expiry']
      },
      {
        fields: ['location']
      }
    ],
    validate: {
      purchasePriceMustBePositive () {
        if (this.purchase_price !== null && this.purchase_price < 0) {
          throw new Error('Purchase price must be positive')
        }
      },
      warrantyExpiryAfterPurchase () {
        if (
          this.purchase_date &&
          this.warranty_expiry &&
          new Date(this.warranty_expiry) <= new Date(this.purchase_date)
        ) {
          throw new Error('Warranty expiry must be after purchase date')
        }
      },
      assignedDateAfterPurchase () {
        if (
          this.purchase_date &&
          this.assigned_date &&
          new Date(this.assigned_date) < new Date(this.purchase_date)
        ) {
          throw new Error('Assigned date cannot be before purchase date')
        }
      },
      assignedToRequiredWhenAssigned () {
        if (this.status === 'Assigned' && !this.assigned_to) {
          throw new Error('Assigned hardware must have an assigned employee')
        }
      },
      assignedDateRequiredWhenAssigned () {
        if (this.status === 'Assigned' && !this.assigned_date) {
          throw new Error('Assigned hardware must have an assigned date')
        }
      }
    }
  }
)

export default Hardware
