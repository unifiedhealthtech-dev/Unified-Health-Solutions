// models/StockItem.js
import { DataTypes } from 'sequelize';
import sequelize from "../db.js";
import Product from './Product.js';

const StockItem = sequelize.define('StockItem', {
  stock_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'stock_id'
  },
  product_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: {
      model: Product,
      key: 'product_id'
    },
    field: 'product_id' // ← Critical fix
  },
  batch_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'batch_number'
  },
  manufacturing_date: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'manufacturing_date'
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expiry_date'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'quantity'
  },
  minimum_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'minimum_stock' // ← Match DB column
  },
  ptr: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'ptr'
  },
  pts: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'pts'
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'tax_rate'
  },
  current_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'current_stock' // ← Critical fix
  },
  is_expired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_expired'
  },
  is_critical: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_critical'
  },
  status: {
    type: DataTypes.ENUM('In Stock', 'Low Stock', 'Critical', 'Expired'),
    defaultValue: 'In Stock',
    field: 'status'
  }
}, {
  timestamps: true,
  tableName: 'stock_items',
  underscored: true // ← Map createdAt → created_at, updatedAt → updated_at
});

StockItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(StockItem, { foreignKey: 'product_id' });

export default StockItem;