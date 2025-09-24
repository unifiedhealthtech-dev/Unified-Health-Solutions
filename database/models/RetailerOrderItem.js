import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Product from './Product.js';
import RetailerOrder from './RetailerOrder.js'; // import after defining RetailerOrder

const RetailerOrderItem = sequelize.define('RetailerOrderItem', {
  item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  product_code: { type: DataTypes.STRING(50), allowNull: false, references: { model: Product, key: 'product_code' } },
  stock_id: { type: DataTypes.INTEGER, allowNull: false },
  batch_number: { type: DataTypes.STRING(100), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 }
}, {
  tableName: 'retailer_order_items',
  timestamps: true,
  underscored: true
});

// 🔥 Define associations **after both models are imported**
RetailerOrder.hasMany(RetailerOrderItem, { foreignKey: 'order_id', as: 'items' });
RetailerOrderItem.belongsTo(RetailerOrder, { foreignKey: 'order_id', as: 'order' });
RetailerOrderItem.belongsTo(Product, { foreignKey: 'product_code', as: 'Product' });

export default RetailerOrderItem;
