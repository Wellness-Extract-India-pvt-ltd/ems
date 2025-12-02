import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const EmployeeOrganization = sequelize.define('EmployeeOrganization', {
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
  company_name: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  experience_years: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    validate: {
      min: 0,
      max: 50
    }
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  responsibilities: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  experience_letter_path: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'employee_organizations',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['employee_id']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    }
  ]
});

// Define associations
EmployeeOrganization.associate = (models) => {
  EmployeeOrganization.belongsTo(models.Employee, {
    as: 'employee',
    foreignKey: 'employee_id'
  });
};

export default EmployeeOrganization;
