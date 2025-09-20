// models/DistributorUser.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const DistributorUser = sequelize.define('DistributorUser', {
  distributor_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { // ✅ Added: Company name for distributor
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Distributor company name'
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
    type: DataTypes.ENUM('distributor'),
    allowNull: false,
    defaultValue: 'distributor'
  }
}, {
  timestamps: true,
  tableName: 'distributor_users',
  underscored: true,
});

export default DistributorUser;