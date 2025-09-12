import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const STATUSES = ['open', 'in-progress', 'resolved', 'closed', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  status: {
    type: DataTypes.ENUM(...STATUSES),
    allowNull: false,
    defaultValue: 'open'
  },
  priority: {
    type: DataTypes.ENUM(...PRIORITIES),
    allowNull: false,
    defaultValue: 'medium'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  closed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_escalated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'tickets',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['assigned_to']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['status', 'priority']
    },
    {
      fields: ['due_date']
    }
  ],
  hooks: {
    beforeUpdate: (ticket) => {
      if (ticket.changed('status')) {
        if (['resolved'].includes(ticket.status)) {
          ticket.resolved_at = new Date();
          ticket.closed_at = null;
        } else if (ticket.status === 'closed') {
          if (!ticket.resolved_at) {
            ticket.resolved_at = new Date();
          }
          ticket.closed_at = new Date();
        } else {
          ticket.resolved_at = null;
          ticket.closed_at = null;
        }
      }
    }
  }
});

// Define associations
Ticket.associate = (models) => {
  Ticket.belongsTo(models.Employee, {
    as: 'creator',
    foreignKey: 'created_by'
  });

  Ticket.belongsTo(models.Employee, {
    as: 'assignee',
    foreignKey: 'assigned_to'
  });

  Ticket.hasMany(models.TicketAttachment, {
    as: 'attachments',
    foreignKey: 'ticket_id'
  });

  Ticket.hasMany(models.TicketComment, {
    as: 'comments',
    foreignKey: 'ticket_id'
  });

  Ticket.hasMany(models.TicketEvent, {
    as: 'events',
    foreignKey: 'ticket_id'
  });
};

export default Ticket;