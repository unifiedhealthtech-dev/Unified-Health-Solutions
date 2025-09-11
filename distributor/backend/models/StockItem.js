import { DataTypes } from 'sequelize';
import sequelize from "../db.js";
import Product from './Product.js';
import Distributor from './Distributor.js';

const StockItem = sequelize.define('StockItem', {
  stock_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  distributor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Distributor,
      key: 'distributor_id'
    }
  },
  product_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: {
      model: Product,
      key: 'product_id'
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
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minimum_stock: {
    type: DataTypes.INTEGER,
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
    type: DataTypes.INTEGER,
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
    defaultValue: 'In Stock'
  }
}, {
  timestamps: true,
  tableName: 'stock_items',
  underscored: true
});

// ✅ Associations
StockItem.belongsTo(Product, { foreignKey: 'product_id' });
StockItem.belongsTo(Distributor, { foreignKey: 'distributor_id', as: 'Distributor' });

Product.hasMany(StockItem, { foreignKey: 'product_id' });
Distributor.hasMany(StockItem, { foreignKey: 'distributor_id', as: 'StockItems' });

export default StockItem;
