import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Retailer from './Retailer.js';

const RetailerDCItem = sequelize.define('RetailerDCItem', {
  dc_item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  retailer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Retailer, key: 'retailer_id' }
  },
  product_code: { type: DataTypes.STRING(50), allowNull: false },
  product_name: { type: DataTypes.STRING(255), allowNull: false },
  batch_number: { type: DataTypes.STRING(100), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  mrp: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 12.00 },
  distributor_name: { type: DataTypes.STRING(255), allowNull: false },
  added_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
}, {
  tableName: 'retailer_dc_items',
  timestamps: true,
  underscored: true
});

RetailerDCItem.belongsTo(Retailer, { foreignKey: 'retailer_id', as: 'Retailer' });

export default RetailerDCItem;