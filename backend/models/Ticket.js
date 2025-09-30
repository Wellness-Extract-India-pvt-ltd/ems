/**
 * Ticket Model
 * Represents support ticket data in the EMS system
 */

import { DataTypes } from 'sequelize'
import sequelize from '../database/connection.js'

const Ticket = sequelize.define(
  'Ticket',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ticket_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50]
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 5000]
      }
    },
    category: {
      type: DataTypes.ENUM(
        'Hardware',
        'Software',
        'Network',
        'Account',
        'Security',
        'Access',
        'Email',
        'VPN',
        'Printer',
        'Phone',
        'Mobile',
        'Other'
      ),
      allowNull: false,
      validate: {
        isIn: [
          [
            'Hardware',
            'Software',
            'Network',
            'Account',
            'Security',
            'Access',
            'Email',
            'VPN',
            'Printer',
            'Phone',
            'Mobile',
            'Other'
          ]
        ]
      }
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical', 'Emergency'),
      allowNull: false,
      defaultValue: 'Medium',
      validate: {
        isIn: [['Low', 'Medium', 'High', 'Critical', 'Emergency']]
      }
    },
    status: {
      type: DataTypes.ENUM(
        'Open',
        'In Progress',
        'Resolved',
        'Closed',
        'Cancelled',
        'On Hold',
        'Escalated'
      ),
      allowNull: false,
      defaultValue: 'Open',
      validate: {
        isIn: [
          [
            'Open',
            'In Progress',
            'Resolved',
            'Closed',
            'Cancelled',
            'On Hold',
            'Escalated'
          ]
        ]
      }
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      },
      validate: {
        isInt: true,
        min: 1
      }
    },
    assigned_to: {
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
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    resolved_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 5000]
      }
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidJSON (value) {
          if (value !== null && !Array.isArray(value)) {
            throw new Error('Attachments must be a valid JSON array')
          }
        }
      }
    },
    estimated_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        isDecimal: true,
        min: 0,
        max: 999.99
      }
    },
    actual_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        isDecimal: true,
        min: 0,
        max: 999.99
      }
    },
    escalation_level: {
      type: DataTypes.ENUM('None', 'Level 1', 'Level 2', 'Management'),
      allowNull: true,
      defaultValue: 'None',
      validate: {
        isIn: [['None', 'Level 1', 'Level 2', 'Management']]
      }
    },
    escalation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    sla_deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidJSON (value) {
          if (value !== null && !Array.isArray(value)) {
            throw new Error('Tags must be a valid JSON array')
          }
        }
      }
    },
    impact: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
      allowNull: true,
      defaultValue: 'Medium',
      validate: {
        isIn: [['Low', 'Medium', 'High', 'Critical']]
      }
    },
    urgency: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
      allowNull: true,
      defaultValue: 'Medium',
      validate: {
        isIn: [['Low', 'Medium', 'High', 'Critical']]
      }
    }
  },
  {
    tableName: 'tickets',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['ticket_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['created_by']
      }
    ],
    validate: {
      dueDateMustBeFuture () {
        if (this.due_date && new Date(this.due_date) <= new Date()) {
          throw new Error('Due date must be in the future')
        }
      },
      resolvedDateAfterCreated () {
        if (
          this.resolved_date &&
          new Date(this.resolved_date) < new Date(this.created_at)
        ) {
          throw new Error(
            'Resolved date cannot be before ticket creation date'
          )
        }
      },
      escalationDateAfterCreated () {
        if (
          this.escalation_date &&
          new Date(this.escalation_date) < new Date(this.created_at)
        ) {
          throw new Error(
            'Escalation date cannot be before ticket creation date'
          )
        }
      },
      slaDeadlineAfterCreated () {
        if (
          this.sla_deadline &&
          new Date(this.sla_deadline) < new Date(this.created_at)
        ) {
          throw new Error('SLA deadline cannot be before ticket creation date')
        }
      },
      assignedToRequiredForInProgress () {
        if (this.status === 'In Progress' && !this.assigned_to) {
          throw new Error('In Progress tickets must have an assigned employee')
        }
      },
      resolutionRequiredForResolved () {
        if (
          (this.status === 'Resolved' || this.status === 'Closed') &&
          !this.resolution
        ) {
          throw new Error('Resolved or Closed tickets must have a resolution')
        }
      },
      actualHoursNotExceedEstimate () {
        if (
          this.estimated_hours &&
          this.actual_hours &&
          this.actual_hours > this.estimated_hours * 2
        ) {
          throw new Error(
            'Actual hours significantly exceed estimate - review required'
          )
        }
      },
      escalatedTicketsMustHaveEscalationDate () {
        if (
          this.escalation_level &&
          this.escalation_level !== 'None' &&
          !this.escalation_date
        ) {
          throw new Error('Escalated tickets must have an escalation date')
        }
      }
    }
  }
)

export default Ticket
