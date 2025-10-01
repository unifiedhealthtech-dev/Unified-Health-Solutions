// models/RetailerReceivedItem.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const RetailerReceivedItem = sequelize.define('RetailerReceivedItem', {
  received_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  item_id: { type: DataTypes.INTEGER, allowNull: false }, // references RetailerOrderItem
  expected_quantity: { type: DataTypes.INTEGER, allowNull: false },
  received_quantity: { type: DataTypes.INTEGER, allowNull: false },
  is_missing: { type: DataTypes.BOOLEAN, defaultValue: false },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'retailer_received_items',
  timestamps: true,
  underscored: true
});

export default RetailerReceivedItem;