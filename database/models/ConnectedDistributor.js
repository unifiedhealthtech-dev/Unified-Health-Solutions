// models/ConnectedDistributors.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Retailer from './Retailer.js';
import Distributor from './Distributor.js';

const ConnectedDistributors = sequelize.define('ConnectedDistributors', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  retailer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'retailers',
      key: 'retailer_id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  distributor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'distributors',
      key: 'distributor_id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('pending', 'connected', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'connected_distributors',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// ✅ Associations
ConnectedDistributors.belongsTo(Retailer, {
  foreignKey: 'retailer_id',
  targetKey: 'retailer_id',
  as: 'Retailer'
});

ConnectedDistributors.belongsTo(Distributor, {
  foreignKey: 'distributor_id',
  targetKey: 'distributor_id',
  as: 'Distributor'
});

export default ConnectedDistributors;
