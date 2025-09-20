import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const DistributorUser = sequelize.define('DistributorUser', {
  distributor_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
