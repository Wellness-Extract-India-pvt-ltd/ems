import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 10],
      isUppercase: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  head_of_department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  parent_department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  }
}, {
  tableName: 'departments',
  timestamps: true,
  underscored: true,
  indexes: []
});

// Define associations
Department.associate = (models) => {
  // Self-referencing association for parent department
  Department.belongsTo(models.Department, {
    as: 'parentDepartment',
    foreignKey: 'parent_department_id'
  });
  
  Department.hasMany(models.Department, {
    as: 'subDepartments',
    foreignKey: 'parent_department_id'
  });

  // Association with Employee for manager and head of department
  Department.belongsTo(models.Employee, {
    as: 'manager',
    foreignKey: 'manager_id'
  });

  Department.belongsTo(models.Employee, {
    as: 'headOfDepartment',
    foreignKey: 'head_of_department_id'
  });

  // Association with Employee for department employees
  Department.hasMany(models.Employee, {
    as: 'employees',
    foreignKey: 'department_id'
  });
};

export default Department;
