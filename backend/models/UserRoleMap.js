import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const UserRoleMap = sequelize.define('UserRoleMap', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ms_graph_user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'employee'),
    allowNull: false
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'user_role_maps',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['role']
    },
    {
      fields: ['employee_id']
    }
  ]
});

// Define associations
UserRoleMap.associate = (models) => {
  UserRoleMap.belongsTo(models.Employee, {
    as: 'employee',
    foreignKey: 'employee_id'
  });
};

export default UserRoleMap;