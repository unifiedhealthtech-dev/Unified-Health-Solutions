// models/RetailerDCItem.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Retailer from './Retailer.js'; // Assuming you have a Retailer model

// Main DC Record Model
const RetailerDCItem = sequelize.define('RetailerDCItem', {
  dc_id: { // Changed primary key name for clarity
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  retailer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Retailer, key: 'retailer_id' }
  },
  order_number: { type: DataTypes.STRING(100), allowNull: true }, // Optional
  distributor_name: { type: DataTypes.STRING(255), allowNull: true }, // Optional
  date: { type: DataTypes.DATEONLY, allowNull: true }, // Optional date of DC
  notes: { type: DataTypes.TEXT, allowNull: true }, // Optional notes
  // Add other potentially useful fields here, all optional
  // e.g., total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  // e.g., verified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'retailer_dc_items',
  timestamps: true, // Adds createdAt, updatedAt
  underscored: true // Uses snake_case for timestamps
});

// Association
RetailerDCItem.belongsTo(Retailer, { foreignKey: 'retailer_id', as: 'Retailer' });
// The 'hasMany' association to details will be defined in the detail model

export default RetailerDCItem;