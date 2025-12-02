import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const EmployeeEducation = sequelize.define('EmployeeEducation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  qualification: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  field: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  year_of_completion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1950,
      max: new Date().getFullYear()
    }
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 20]
    }
  },
  certificate_path: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'employee_educations',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['employee_id']
    },
    {
      fields: ['year_of_completion']
    }
  ]
});

// Define associations
EmployeeEducation.associate = (models) => {
  EmployeeEducation.belongsTo(models.Employee, {
    as: 'employee',
    foreignKey: 'employee_id'
  });
};

export default EmployeeEducation;
