import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const HARDWARE_TYPES = ["laptop", "desktop", "server", "network device", "peripheral"];
const STATUSES = ["available", "in use", "maintenance", "retired"];

const Hardware = sequelize.define('Hardware', {
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
    type: DataTypes.ENUM(...HARDWARE_TYPES),
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },
  model: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },
  serial_number: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      len: [0, 100]
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
  warranty_expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  status: {
    type: DataTypes.ENUM(...STATUSES),
    allowNull: false,
    defaultValue: 'available'
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
  tableName: 'hardware',
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
      fields: ['assigned_to']
    }
  ],
  validate: {
    warrantyAfterPurchase() {
      if (this.warranty_expiry_date && this.purchase_date && 
          this.warranty_expiry_date <= this.purchase_date) {
        throw new Error('Warranty expiry date must be after purchase date');
      }
    }
  }
});

// Define associations
Hardware.associate = (models) => {
  Hardware.belongsTo(models.Employee, {
    as: 'assignedEmployee',
    foreignKey: 'assigned_to'
  });

  Hardware.hasMany(models.HardwareAssignmentHistory, {
    as: 'assignmentHistory',
    foreignKey: 'hardware_id'
  });
};

export default Hardware;