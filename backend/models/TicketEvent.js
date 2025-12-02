import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const TicketEvent = sequelize.define('TicketEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticket_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tickets',
      key: 'id'
    }
  },
  field: {
    type: DataTypes.ENUM('status', 'assigned_to', 'priority'),
    allowNull: false
  },
  from_value: {
    type: DataTypes.STRING,
    allowNull: true
  },
  to_value: {
    type: DataTypes.STRING,
    allowNull: true
  },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  }
}, {
  tableName: 'ticket_events',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['ticket_id']
    },
    {
      fields: ['changed_by']
    },
    {
      fields: ['field']
    }
  ]
});

// Define associations
TicketEvent.associate = (models) => {
  TicketEvent.belongsTo(models.Ticket, {
    as: 'ticket',
    foreignKey: 'ticket_id'
  });

  TicketEvent.belongsTo(models.Employee, {
    as: 'changer',
    foreignKey: 'changed_by'
  });
};

export default TicketEvent;
