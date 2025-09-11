import { DataTypes } from 'sequelize';
import sequelize from "../db.js";

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  product_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  generic_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  unit_size: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  mrp: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  group: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'group_name'
  },
  hsn_code: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'products',
  underscored: true
});

export default Product;
