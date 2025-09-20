// models/RetailerUser.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const RetailerUser = sequelize.define('RetailerUser', {
  retailer_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { // ✅ Added: Retailer/Pharmacy name
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Retailer or Pharmacy name'
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  hashed_password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('retailer'),
    allowNull: false,
    defaultValue: 'retailer'
  }
}, {
  timestamps: true,
  tableName: 'retailer_users',
  underscored: true,
});

export default RetailerUser;