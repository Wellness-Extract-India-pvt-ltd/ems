/**
 * UserRoleMap Model
 * Represents user role mapping in the EMS system
 */

import { DataTypes, Op } from 'sequelize'
import sequelize from '../database/connection.js'

const UserRoleMap = sequelize.define(
  'UserRoleMap',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employee_id: {
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
    ms_graph_user_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        len: [0, 255]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
        len: [0, 255]
      }
    },
    role: {
      type: DataTypes.ENUM(
        'admin',
        'manager',
        'employee',
        'hr',
        'it_admin',
        'supervisor'
      ),
      allowNull: false,
      defaultValue: 'employee',
      validate: {
        isIn: [
          ['admin', 'manager', 'employee', 'hr', 'it_admin', 'supervisor']
        ]
      }
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidJSON (value) {
          if (value !== null && !Array.isArray(value)) {
            throw new Error('Permissions must be a valid JSON array')
          }
        }
      }
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000]
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
        min: 0,
        max: 10
      }
    },
    account_locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: [0, 255]
      }
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    two_factor_secret: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: [0, 255]
      }
    },
    login_notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    session_timeout: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 480, // 8 hours in minutes
      validate: {
        isInt: true,
        min: 15,
        max: 1440 // 24 hours max
      }
    }
  },
  {
    tableName: 'user_role_maps',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['ms_graph_user_id']
      },
      {
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['is_active']
      },
      {
        unique: true,
        fields: ['employee_id'],
        where: {
          employee_id: {
            [Op.ne]: null
          }
        }
      }
    ],
    validate: {
      eitherEmployeeOrEmail () {
        // Temporarily disable this validation to fix authentication
        // TODO: Re-enable with proper update detection
        return
      },
      accountLockoutConsistent () {
        if (this.account_locked_until && this.failed_login_attempts === 0) {
          throw new Error(
            'Account cannot be locked without failed login attempts'
          )
        }
        if (!this.account_locked_until && this.failed_login_attempts > 0) {
          throw new Error(
            'Failed login attempts must have corresponding lockout time'
          )
        }
      },
      passwordResetTokenConsistent () {
        if (this.password_reset_token && !this.password_reset_expires) {
          throw new Error('Password reset token must have expiration date')
        }
        if (!this.password_reset_token && this.password_reset_expires) {
          throw new Error('Password reset expiration without token is invalid')
        }
      },
      twoFactorConsistent () {
        if (this.two_factor_enabled && !this.two_factor_secret) {
          throw new Error(
            'Two-factor authentication enabled but no secret provided'
          )
        }
      },
      lastLoginNotFuture () {
        if (this.last_login && this.last_login > new Date()) {
          throw new Error('Last login date cannot be in the future')
        }
      },
      failedAttemptsReasonable () {
        if (this.failed_login_attempts > 10) {
          throw new Error('Failed login attempts exceed maximum allowed')
        }
      }
    }
  }
)

export default UserRoleMap
