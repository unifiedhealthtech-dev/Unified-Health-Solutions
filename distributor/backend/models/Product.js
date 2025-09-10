// models/Product.js
import { DataTypes } from 'sequelize';
import sequelize from "../db.js";

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false,
    unique: true,
    field: 'product_id' // ← Map to DB column
  },
  product_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'product_code'
  },
  generic_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'generic_name'
  },
  unit_size: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'unit_size'
  },
  mrp: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'mrp'
  },
  group: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'group_name' // ← Match your CSV column "Group Name"
  },
  hsn_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'hsn_code'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'category'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  timestamps: true,
  tableName: 'products',
  underscored: true // ← Automatically map createdAt → created_at, etc.
});

export default Product;