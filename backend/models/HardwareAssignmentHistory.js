import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const HardwareAssignmentHistory = sequelize.define('HardwareAssignmentHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hardware_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'hardware',
      key: 'id'
    }
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  assigned_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  returned_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'hardware_assignment_history',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['hardware_id']
    },
    {
      fields: ['employee_id']
    },
    {
      fields: ['assigned_date']
    }
  ]
});

// Define associations
HardwareAssignmentHistory.associate = (models) => {
  HardwareAssignmentHistory.belongsTo(models.Hardware, {
    as: 'hardware',
    foreignKey: 'hardware_id'
  });

  HardwareAssignmentHistory.belongsTo(models.Employee, {
    as: 'employee',
    foreignKey: 'employee_id'
  });
};

export default HardwareAssignmentHistory;
