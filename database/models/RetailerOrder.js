// database/models/RetailerOrder.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Retailer from './Retailer.js';
import Distributor from './Distributor.js';
import OrderDispute from './OrderDispute.js';

const RetailerOrder = sequelize.define('RetailerOrder', {
  order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  retailer_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: { model: Retailer, key: 'retailer_id' } 
  },
  distributor_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: { model: Distributor, key: 'distributor_id' } 
  },
  order_number: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  total_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  total_items: { type: DataTypes.INTEGER, allowNull: false },
  status: { 
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'), 
    defaultValue: 'pending' 
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
  order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: null
  },
}, {
  tableName: 'retailer_orders',
  timestamps: true,
  underscored: true
});

// Associations
RetailerOrder.belongsTo(Retailer, { foreignKey: 'retailer_id', as: 'Retailer' });
RetailerOrder.belongsTo(Distributor, { foreignKey: 'distributor_id', as: 'Distributor' });
RetailerOrder.hasMany(OrderDispute, { foreignKey: 'order_id', as: 'disputes' });

export default RetailerOrder;