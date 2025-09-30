/**
 * Employee Model
 * Represents employee data in the EMS system
 */

import { DataTypes } from 'sequelize'
import sequelize from '../database/connection.js'

const Employee = sequelize.define(
  'Employee',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employee_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
        isAlphanumeric: true
      }
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    middle_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
        len: [0, 255]
      }
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
        len: [0, 255]
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [0, 20],
        isNumeric: true
      }
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString().split('T')[0]
      }
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: true,
      validate: {
        isIn: [['Male', 'Female', 'Other']]
      }
    },
    marital_status: {
      type: DataTypes.ENUM('Single', 'Married', 'Divorced', 'Widowed'),
      allowNull: true,
      validate: {
        isIn: [['Single', 'Married', 'Divorced', 'Widowed']]
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    zip_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [0, 20]
      }
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    join_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString().split('T')[0]
      }
    },
    employment_type: {
      type: DataTypes.ENUM('Full-time', 'Part-time', 'Intern', 'Contractor'),
      allowNull: false,
      validate: {
        isIn: [['Full-time', 'Part-time', 'Intern', 'Contractor']]
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
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    salary: {
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
        'Inactive',
        'Onboarding',
        'Suspended',
        'Terminated'
      ),
      allowNull: false,
      defaultValue: 'Active',
      validate: {
        isIn: [['Active', 'Inactive', 'Onboarding', 'Suspended', 'Terminated']]
      }
    },
    emergency_contact_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    emergency_contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [0, 20],
        isNumeric: true
      }
    },
    emergency_contact_relationship: {
      type: DataTypes.ENUM(
        'Spouse',
        'Parent',
        'Sibling',
        'Child',
        'Friend',
        'Other'
      ),
      allowNull: true,
      validate: {
        isIn: [['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other']]
      }
    },
    profile_picture_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    resume_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    id_proof_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    manager_id: {
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
    work_location: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: [0, 200]
      }
    },
    work_schedule: {
      type: DataTypes.ENUM('Regular', 'Flexible', 'Remote', 'Hybrid'),
      allowNull: true,
      validate: {
        isIn: [['Regular', 'Flexible', 'Remote', 'Hybrid']]
      }
    },
    bank_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    account_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50],
        isNumeric: true
      }
    },
    ifsc_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [0, 20],
        isAlphanumeric: true
      }
    },
    passbook_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    ms_graph_user_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        len: [0, 255]
      }
    }
  },
  {
    tableName: 'employees',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['employee_id'],
        unique: true
      },
      {
        fields: ['email'],
        unique: true
      },
      {
        fields: ['status']
      },
      {
        fields: ['department_id']
      },
      {
        fields: ['email', 'contact_email'],
        name: 'idx_employee_email_search'
      }
    ],
    validate: {
      salaryMustBePositive () {
        if (this.salary !== null && this.salary < 0) {
          throw new Error('Salary must be positive')
        }
      },
      managerCannotBeSelf () {
        if (this.manager_id && this.manager_id === this.id) {
          throw new Error('Employee cannot be their own manager')
        }
      },
      joinDateMustBeValid () {
        if (this.join_date && this.join_date > new Date()) {
          throw new Error('Join date cannot be in the future')
        }
      },
      birthDateMustBeValid () {
        if (this.date_of_birth && this.date_of_birth >= new Date()) {
          throw new Error('Date of birth cannot be today or in the future')
        }
      }
    }
  }
)

export default Employee
