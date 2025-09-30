/**
 * Software Model
 * Represents software asset data in the EMS system
 */

import { DataTypes } from 'sequelize'
import sequelize from '../database/connection.js'

const Software = sequelize.define(
  'Software',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 200]
      }
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    vendor: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: [0, 200]
      }
    },
    category: {
      type: DataTypes.ENUM(
        'Operating System',
        'Office Suite',
        'Development Tools',
        'Design Software',
        'Database',
        'Security',
        'Web Browser',
        'Media Player',
        'Antivirus',
        'Backup Software',
        'Cloud Service',
        'Other'
      ),
      allowNull: false,
      validate: {
        isIn: [
          [
            'Operating System',
            'Office Suite',
            'Development Tools',
            'Design Software',
            'Database',
            'Security',
            'Web Browser',
            'Media Player',
            'Antivirus',
            'Backup Software',
            'Cloud Service',
            'Other'
          ]
        ]
      }
    },
    license_type: {
      type: DataTypes.ENUM(
        'Perpetual',
        'Subscription',
        'Open Source',
        'Freeware',
        'Trial',
        'Enterprise',
        'Volume License'
      ),
      allowNull: false,
      validate: {
        isIn: [
          [
            'Perpetual',
            'Subscription',
            'Open Source',
            'Freeware',
            'Trial',
            'Enterprise',
            'Volume License'
          ]
        ]
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
    renewal_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    status: {
      type: DataTypes.ENUM(
        'Active',
        'Inactive',
        'Expired',
        'Suspended',
        'Maintenance',
        'Deprecated'
      ),
      allowNull: false,
      defaultValue: 'Active',
      validate: {
        isIn: [
          [
            'Active',
            'Inactive',
            'Expired',
            'Suspended',
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
    installation_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000]
      }
    },
    system_requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidJSON (value) {
          if (value !== null && typeof value !== 'object') {
            throw new Error('System requirements must be a valid JSON object')
          }
        }
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
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id'
      },
      validate: {
        isInt: true,
        min: 1
      }
    }
  },
  {
    tableName: 'software',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['vendor']
      },
      {
        fields: ['category']
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
        fields: ['department_id']
      },
      {
        fields: ['purchase_date']
      },
      {
        fields: ['renewal_date']
      },
      {
        fields: ['compliance_status']
      }
    ],
    validate: {
      purchasePriceMustBePositive () {
        if (this.purchase_price !== null && this.purchase_price < 0) {
          throw new Error('Purchase price must be positive')
        }
      },
      renewalDateAfterPurchase () {
        if (
          this.purchase_date &&
          this.renewal_date &&
          new Date(this.renewal_date) <= new Date(this.purchase_date)
        ) {
          throw new Error('Renewal date must be after purchase date')
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
        if (
          this.status === 'Active' &&
          this.assigned_to &&
          !this.assigned_date
        ) {
          throw new Error('Assigned software must have an assigned date')
        }
      },
      subscriptionMustHaveRenewalDate () {
        if (this.license_type === 'Subscription' && !this.renewal_date) {
          throw new Error('Subscription software must have a renewal date')
        }
      },
      versionRequiredForActive () {
        if (this.status === 'Active' && !this.version) {
          throw new Error('Active software should have a version specified')
        }
      }
    }
  }
)

export default Software
