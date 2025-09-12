import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const TicketAttachment = sequelize.define('TicketAttachment', {
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
  path: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  original_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'ticket_attachments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['ticket_id']
    },
    {
      fields: ['uploaded_by']
    }
  ]
});

// Define associations
TicketAttachment.associate = (models) => {
  TicketAttachment.belongsTo(models.Ticket, {
    as: 'ticket',
    foreignKey: 'ticket_id'
  });

  TicketAttachment.belongsTo(models.Employee, {
    as: 'uploader',
    foreignKey: 'uploaded_by'
  });
};

export default TicketAttachment;
