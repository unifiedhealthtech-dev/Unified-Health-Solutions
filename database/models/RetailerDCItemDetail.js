// models/RetailerDCItemDetail.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import RetailerDCItem from './RetailerDCItem.js'; // Import the main DC model

// DC Item Detail Model
const RetailerDCItemDetail = sequelize.define('RetailerDCItemDetail', {
  dc_detail_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dc_id: { // Foreign key linking to the main DC record
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: RetailerDCItem, key: 'dc_id' }
  },
  product_name: { type: DataTypes.STRING(255), allowNull: true }, // Optional
  batch_number: { type: DataTypes.STRING(100), allowNull: true }, // Optional
  manufacturing_date: { type: DataTypes.DATEONLY, allowNull: true }, // Optional
  expiry_date: { type: DataTypes.DATEONLY, allowNull: true }, // Optional
  quantity: { type: DataTypes.INTEGER, allowNull: true }, // Optional
  rate: { type: DataTypes.DECIMAL(10, 2), allowNull: true }, // Optional
  mrp: { type: DataTypes.DECIMAL(10, 2), allowNull: true }, // Optional
  tax_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: true }, // Optional
  // Add other item-specific fields here if needed
}, {
  tableName: 'retailer_dc_item_details',
  timestamps: true, // Adds createdAt, updatedAt
  underscored: true // Uses snake_case for timestamps
});

// Association
RetailerDCItemDetail.belongsTo(RetailerDCItem, { foreignKey: 'dc_id', as: 'RetailerDC' });
RetailerDCItem.hasMany(RetailerDCItemDetail, { foreignKey: 'dc_id', as: 'Details' });

export default RetailerDCItemDetail;