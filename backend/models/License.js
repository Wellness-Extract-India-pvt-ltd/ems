/**
 * License Model
 * Represents software license data in the EMS system
 */

import { DataTypes } from 'sequelize'
import sequelize from '../database/connection.js'

const License = sequelize.define(
  'License',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    license_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 255]
      }
    },
    software_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'software',
        key: 'id'
      },
      validate: {
        isInt: true,
        min: 1
      }
    },
    license_type: {
      type: DataTypes.ENUM(
        'Single User',
        'Multi User',
        'Site License',
        'Volume License',
        'Enterprise',
        'Trial',
        'Open Source',
        'Freeware'
      ),
      allowNull: false,
      validate: {
        isIn: [
          [
            'Single User',
            'Multi User',
            'Site License',
            'Volume License',
            'Enterprise',
            'Trial',
            'Open Source',
            'Freeware'
          ]
        ]
      }
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: true,
        min: 1
      }
    },
    current_users: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
        min: 0
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
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM(
        'Active',
        'Expired',
        'Suspended',
        'Available',
        'Maintenance',
        'Deprecated'
      ),
      allowNull: false,
      defaultValue: 'Active',
      validate: {
        isIn: [
          [
            'Active',
            'Expired',
            'Suspended',
            'Available',
            'Maintenance',
            'Deprecated'
          ]
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
    vendor: {
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
    renewal_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    support_level: {
      type: DataTypes.ENUM(
        'Basic',
        'Standard',
        'Premium',
        'Enterprise',
        'None'
      ),
      allowNull: true,
      defaultValue: 'Basic',
      validate: {
        isIn: [['Basic', 'Standard', 'Premium', 'Enterprise', 'None']]
      }
    },
    compliance_status: {
      type: DataTypes.ENUM(
        'Compliant',
        'Non-Compliant',
        'Pending',
        'Under Review'
      ),
      allowNull: true,
      defaultValue: 'Pending',
      validate: {
        isIn: [['Compliant', 'Non-Compliant', 'Pending', 'Under Review']]
      }
    }
  },
  {
    tableName: 'licenses',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['license_key']
      },
      {
        fields: ['software_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['assigned_to']
      },
      {
        fields: ['license_type']
      },
      {
        fields: ['vendor']
      },
      {
        fields: ['purchase_date']
      },
      {
        fields: ['expiry_date']
      },
      {
        fields: ['renewal_date']
      },
      {
        fields: ['compliance_status']
      }
    ],
    validate: {
      currentUsersNotExceedMax () {
        if (this.max_users && this.current_users > this.max_users) {
          throw new Error('Current users cannot exceed maximum users')
        }
      },
      expiryDateAfterPurchase () {
        if (
          this.purchase_date &&
          this.expiry_date &&
          new Date(this.expiry_date) <= new Date(this.purchase_date)
        ) {
          throw new Error('Expiry date must be after purchase date')
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
      maxUsersRequiredForMultiUser () {
        if (
          (this.license_type === 'Multi User' ||
            this.license_type === 'Volume License') &&
          !this.max_users
        ) {
          throw new Error(
            'Multi-user and Volume licenses must specify maximum users'
          )
        }
      },
      assignedToRequiredWhenAssigned () {
        if (
          this.status === 'Active' &&
          this.assigned_to &&
          !this.assigned_date
        ) {
          throw new Error('Assigned licenses must have an assigned date')
        }
      },
      costMustBePositive () {
        if (this.cost !== null && this.cost < 0) {
          throw new Error('License cost must be positive')
        }
      },
      renewalDateAfterExpiry () {
        if (
          this.expiry_date &&
          this.renewal_date &&
          new Date(this.renewal_date) <= new Date(this.expiry_date)
        ) {
          throw new Error('Renewal date must be after expiry date')
        }
      }
    }
  }
)

export default License
