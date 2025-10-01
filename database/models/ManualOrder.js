import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Distributor from './Distributor.js';
import ManualOrderItem from './ManualOrderItem.js';

const ManualOrder = sequelize.define('ManualOrder', {
  order_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  distributor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Distributor,
      key: 'distributor_id'
    }
  },
  retailer_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  retailer_phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  retailer_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  retailer_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  total_items: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'confirmed', 'cancelled'),
    allowNull: false,
    defaultValue: 'processing'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  invoice_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'manual_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

ManualOrder.hasMany(ManualOrderItem, {
  foreignKey: 'order_id',
  as: 'items'
});

ManualOrder.belongsTo(Distributor, {
  foreignKey: 'distributor_id',
  as: 'distributor'
});

export default ManualOrder;