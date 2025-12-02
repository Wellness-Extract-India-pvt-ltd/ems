import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const TicketComment = sequelize.define('TicketComment', {
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
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  is_internal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'ticket_comments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['ticket_id']
    },
    {
      fields: ['author_id']
    }
  ]
});

// Define associations
TicketComment.associate = (models) => {
  TicketComment.belongsTo(models.Ticket, {
    as: 'ticket',
    foreignKey: 'ticket_id'
  });

  TicketComment.belongsTo(models.Employee, {
    as: 'author',
    foreignKey: 'author_id'
  });
};

export default TicketComment;
