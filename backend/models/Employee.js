import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const GENDERS = ["Male", "Female", "Other"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];
const EMPLOYMENT_TYPES = ["Full-time", "Intern", "Contractor"];
const STATUSES = ["Active", "Inactive", "Onboarding", "Suspended", "Terminated"];

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Personal Information
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  middle_name: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString().split('T')[0]
    }
  },
  gender: {
    type: DataTypes.ENUM(...GENDERS),
    allowNull: false
  },
  marital_status: {
    type: DataTypes.ENUM(...MARITAL_STATUSES),
    allowNull: true
  },
  photo_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resume_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  id_proof_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar_path: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Contact Information
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^[0-9]{10,15}$/,
      notEmpty: true
    }
  },
  emergency_contact: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^[0-9]{10,15}$/
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Employment Information
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 20]
    }
  },
  join_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  employment_type: {
    type: DataTypes.ENUM(...EMPLOYMENT_TYPES),
    allowNull: false
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  status: {
    type: DataTypes.ENUM(...STATUSES),
    defaultValue: "Active"
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  work_location: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  work_schedule: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },

  // Bank Information
  bank_name: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  account_number: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 20]
    }
  },
  ifsc_code: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 11]
    }
  },
  passbook_path: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Microsoft Graph Integration
  ms_graph_user_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },

  // Legacy field for compatibility
  contact_email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  }
}, {
  tableName: 'employees',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['department_id']
    },
    {
      fields: ['manager_id']
    },
    {
      fields: ['status']
    }
  ]
});

// Define associations
Employee.associate = (models) => {
  // Self-referencing association for manager
  Employee.belongsTo(models.Employee, {
    as: 'manager',
    foreignKey: 'manager_id'
  });

  Employee.hasMany(models.Employee, {
    as: 'subordinates',
    foreignKey: 'manager_id'
  });

  // Association with Department
  Employee.belongsTo(models.Department, {
    as: 'department',
    foreignKey: 'department_id'
  });

  // Association with Education
  Employee.hasMany(models.EmployeeEducation, {
    as: 'educations',
    foreignKey: 'employee_id'
  });

  // Association with Organization (Work Experience)
  Employee.hasMany(models.EmployeeOrganization, {
    as: 'organizations',
    foreignKey: 'employee_id'
  });

  // Association with Tickets
  Employee.hasMany(models.Ticket, {
    as: 'createdTickets',
    foreignKey: 'created_by'
  });

  Employee.hasMany(models.Ticket, {
    as: 'assignedTickets',
    foreignKey: 'assigned_to'
  });
};

export default Employee;