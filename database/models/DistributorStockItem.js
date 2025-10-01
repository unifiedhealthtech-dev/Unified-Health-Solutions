// Updated DistributorStockItem model with schedule and rack_no fields
import { DataTypes } from 'sequelize';
import sequelize from "../db.js";
import Product from './Product.js';
import Distributor from './Distributor.js';

const DistributorStockItem = sequelize.define('DistributorStockItem', {
  stock_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  distributor_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: {
      model: Distributor,
      key: 'distributor_id'
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
    type: DataTypes.ENUM('In Stock', 'Low Stock', 'Critical', 'Expired', 'Out of Stock'),
    defaultValue: 'In Stock'
  },
  // New fields
  schedule: {
    type: DataTypes.ENUM('None', 'Schedule G', 'Schedule C', 'Schedule C1', 'Schedule F', 'Schedule J', 'Schedule K', 'Schedule H', 'Schedule H1', 'Schedule X'),
    defaultValue: 'None'
  },
  rack_no: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'distributor_stock_items',
  underscored: true
});

// Associations
DistributorStockItem.belongsTo(Product, { foreignKey: 'product_code' });
DistributorStockItem.belongsTo(Distributor, { foreignKey: 'distributor_id', as: 'Distributor' });

Product.hasMany(DistributorStockItem, { foreignKey: 'product_code' });
Distributor.hasMany(DistributorStockItem, { foreignKey: 'distributor_id', as: 'DistributorStockItems' });

export default DistributorStockItem;