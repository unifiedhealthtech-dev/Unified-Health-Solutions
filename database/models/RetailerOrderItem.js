// database/models/RetailerOrderItem.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Product from './Product.js';
import RetailerOrder from './RetailerOrder.js';

const RetailerOrderItem = sequelize.define('RetailerOrderItem', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: null
  },
  product_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: { model: Product, key: 'product_code' }
  },
  stock_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  batch_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  /** ✅ New Field */
  expiry_date: {
    type: DataTypes.DATEONLY, // DATEONLY = YYYY-MM-DD
    allowNull: true,
    defaultValue: null
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  }
}, {
  tableName: 'retailer_order_items',
  timestamps: true,
  underscored: true
});

// Associations
RetailerOrder.hasMany(RetailerOrderItem, { foreignKey: 'order_id', as: 'items' });
RetailerOrderItem.belongsTo(RetailerOrder, { foreignKey: 'order_id', as: 'order' });
RetailerOrderItem.belongsTo(Product, { foreignKey: 'product_code', as: 'Product' });

export default RetailerOrderItem;
