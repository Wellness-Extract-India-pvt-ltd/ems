import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const STATUSES = ["enabled", "disabled", "disconnected"];

const Integration = sequelize.define('Integration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  config: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM(...STATUSES),
    allowNull: false,
    defaultValue: "enabled"
  },
  connected_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_synced_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  allowed_roles: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  oauth_refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  oauth_access_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  oauth_expiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'integrations',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['provider']
    },
    {
      fields: ['status']
    }
  ]
});

// Define associations
Integration.associate = (models) => {
  Integration.belongsToMany(models.Employee, {
    through: 'IntegrationManagers',
    as: 'managedBy',
    foreignKey: 'integration_id',
    otherKey: 'employee_id'
  });
};

export default Integration;