import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import User from './userSchema.js';

const Distributor = sequelize.define('Distributor', {
  distributor_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  license_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contact_person: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  gst_number: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  },
  state: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'distributors'
});

// ✅ Associations
User.hasOne(Distributor, { foreignKey: 'user_id', as: 'Distributor' });
Distributor.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

export default Distributor;
