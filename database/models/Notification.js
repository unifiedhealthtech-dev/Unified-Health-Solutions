// database/models/Notification.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Notification = sequelize.define('Notification', {
  notification_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Retailer or Distributor ID",
  },
  role: {
    type: DataTypes.ENUM('retailer', 'distributor'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
    defaultValue: 'info',
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  related_id: {
    type: DataTypes.INTEGER,
    comment: "ID of related entity (e.g., connection request ID)",
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'notifications',
  timestamps: false,
});

export default Notification;