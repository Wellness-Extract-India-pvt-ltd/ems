import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const LICENSE_TYPES = ["commercial", "open-source", "freeware", "shareware"];
const STATUSES = ["active", "inactive", "expired"];

const License = sequelize.define('License', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  type: {
    type: DataTypes.ENUM(...LICENSE_TYPES),
    allowNull: false
  },
  vendor: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  license_key: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      len: [0, 200]
    }
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
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
  status: {
    type: DataTypes.ENUM(...STATUSES),
    allowNull: false,
    defaultValue: 'active'
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  }
}, {
  tableName: 'licenses',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['vendor']
    },
    {
      fields: ['assigned_to']
    }
  ],
  validate: {
    expiryAfterPurchase() {
      if (this.expiry_date && this.purchase_date && 
          this.expiry_date <= this.purchase_date) {
        throw new Error('Expiry date must be after purchase date');
      }
    }
  },
  hooks: {
    beforeSave: (license) => {
      if (license.expiry_date && license.expiry_date < new Date()) {
        license.status = "expired";
      }
    }
  }
});

// Define associations
License.associate = (models) => {
  License.belongsTo(models.Employee, {
    as: 'assignedEmployee',
    foreignKey: 'assigned_to'
  });
};

export default License;