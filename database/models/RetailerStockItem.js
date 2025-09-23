// models/RetailerStockItem.js
import { DataTypes } from 'sequelize';
import sequelize from "../db.js";
import Product from './Product.js';
import Retailer from './Retailer.js';

const RetailerStockItem = sequelize.define('RetailerStockItem', {
  stock_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  retailer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Retailer,
      key: 'retailer_id'
    }
  },
  product_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: Product,
      key: 'product_code'
    }
  },
  batch_number: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  manufacturing_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  minimum_stock: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  ptr: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pts: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  current_stock: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  is_expired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_critical: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('In Stock', 'Low Stock', 'Critical', 'Expired'),
    defaultValue: 'In Stock',
    allowNull: false
  },
  schedule: {
    type: DataTypes.ENUM('None', 'Schedule G', 'Schedule C', 'Schedule C1', 'Schedule F', 'Schedule J', 'Schedule K', 'Schedule H', 'Schedule H1', 'Schedule X'),
    defaultValue: 'None',
    allowNull: false
  },
  rack_no: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'retailer_stock_items',
  underscored: true
});

// Associations
RetailerStockItem.belongsTo(Product, { foreignKey: 'product_code' });
RetailerStockItem.belongsTo(Retailer, { foreignKey: 'retailer_id', as: 'Retailer' });

Product.hasMany(RetailerStockItem, { foreignKey: 'product_code' });
Retailer.hasMany(RetailerStockItem, { foreignKey: 'retailer_id', as: 'RetailerStockItems' });

export default RetailerStockItem;