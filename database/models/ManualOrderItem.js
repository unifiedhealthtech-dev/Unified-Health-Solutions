import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const ManualOrderItem = sequelize.define('ManualOrderItem', {
  item_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  product_code: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'manual_order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default ManualOrderItem;