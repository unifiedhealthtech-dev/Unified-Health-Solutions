// database/models/OrderDispute.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import RetailerOrder from './RetailerOrder.js'; // ✅ Add this import

const OrderDispute = sequelize.define('OrderDispute', {
  dispute_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'retailer_orders',
      key: 'order_id'
    }
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'retailer_order_items',
      key: 'item_id'
    }
  },
  issue_type: {
    type: DataTypes.ENUM('shortage', 'expired', 'wrong_batch', 'damaged', 'other'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'resolved', 'rejected'),
    defaultValue: 'open'
  },
  resolved_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  resolution_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'order_disputes',
  timestamps: true,
  underscored: true
});



export default OrderDispute;