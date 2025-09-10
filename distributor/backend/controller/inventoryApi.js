// controllers/inventoryController.js
import { Op } from 'sequelize';
import Product from '../models/Product.js';
import StockItem from '../models/StockItem.js';
import Distributor from '../models/Distributor.js';
import sequelize from '../db.js';

// Get dashboard summary
export const getDashboardSummary = async (req, res) => {
  try {
    const totalProducts = await Product.count();

    // Count low stock items (current stock < minimum stock)
    const lowStockItems = await StockItem.count({
      where: {
        currentStock: {
          [Op.lt]: sequelize.literal('minimum_stock')
        }
      }
    });

    // Count expiring soon items (expiry date within 3 months)
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const expiringSoon = await StockItem.count({
      where: {
        expiryDate: {
          [Op.between]: [new Date(), threeMonthsFromNow]
        }
      }
    });

    // Calculate total value of inventory
    const totalValue = await StockItem.sum('ptr', {
      where: {
        isExpired: false
      }
    });

    res.json({
      totalProducts,
      lowStockItems,
      expiringSoon,
      totalValue: totalValue || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all stock items with filtering and search
export const getStockItems = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      sortBy,
      order,
      limit = 10,
      offset = 0
    } = req.query;

    const whereConditions = {};

if (search) {
  whereConditions[Op.or] = [
    { '$Product.generic_name$': { [Op.like]: `%${search}%` } },
    { '$Product.product_code$': { [Op.like]: `%${search}%` } },
    { batch_number: { [Op.like]: `%${search}%` } } // ← Use field name
  ];
}

// ✅ Fix: Only add filter if value is truthy and not 'undefined'
if (category && category !== 'undefined' && category !== 'all') {
  whereConditions['$Product.category$'] = category;
}

if (status && status !== 'undefined' && status !== 'all') {
  whereConditions.status = status; // ← status field is correctly mapped
}

const { rows : stockItems, count } = await StockItem.findAndCountAll({
  include: [{
    model: Product,
    as: 'Product',
    attributes: [
      'product_id', 'product_code', 'generic_name', 'unit_size',
      'mrp', 'group_name', 'hsn_code', 'category'
    ]
  }],
  where: whereConditions,
  limit: parseInt(limit),
  offset: parseInt(offset),
  order: [[sortBy || 'created_at', order || 'DESC']], // ← Use underscored
  attributes: [
    'stock_id', 'product_id', 'batch_number', 'manufacturing_date',
    'expiry_date', 'quantity', 'minimum_stock', 'ptr', 'pts',
    'tax_rate', 'current_stock', 'is_expired', 'is_critical', 'status'
  ]
});
    // Format response with product details
    const formattedStockItems = stockItems.map(item => ({
  ...item.get({ plain: true }), // plain object
  ptr: Number(item.ptr),
  pts: Number(item.pts),
  taxRate: Number(item.taxRate),
  productDetails: {
    ...item.Product,
    mrp: Number(item.Product?.mrp || 0)
  }
}));


    res.json({
      total: count,
      data: formattedStockItems
    });
  } catch (error) {
    console.error('Error fetching stock items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get detailed stock information for a specific product
export const getStockDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    const stockItems = await StockItem.findAll({
      include: [{
        model: Product,
        as: 'Product'
      }],
      where: {
        productId: productId
      },
      order: [['manufacturingDate', 'ASC']]
    });

    res.json(stockItems);
  } catch (error) {
    console.error('Error fetching stock details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add new stock
export const addStock = async (req, res) => {
  try {
    const {
      productId,
      batchNumber,
      manufacturingDate,
      expiryDate,
      quantity,
      minimumStock,
      ptr,
      pts,
      taxRate
    } = req.body;

    // Validate required fields
    if (!productId || !batchNumber || !manufacturingDate || !expiryDate || !quantity || !ptr || !pts) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create new stock item
    const newStockItem = await StockItem.create({
      productId,
      batchNumber,
      manufacturingDate: new Date(manufacturingDate),
      expiryDate: new Date(expiryDate),
      quantity,
      minimumStock,
      ptr,
      pts,
      taxRate,
      currentStock: quantity,
      status: getStockStatus(quantity, minimumStock)
    });

    res.status(201).json(newStockItem);
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update stock item
export const updateStock = async (req, res) => {
  try {
    const { stockId } = req.params;
    const {
      quantity,
      minimumStock,
      ptr,
      pts,
      taxRate
    } = req.body;

    const stockItem = await StockItem.findByPk(stockId);
    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    // Update stock item
    await stockItem.update({
      quantity,
      minimumStock,
      ptr,
      pts,
      taxRate,
      currentStock: quantity,
      status: getStockStatus(quantity, minimumStock)
    });

    res.json(stockItem);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete stock item
export const deleteStock = async (req, res) => {
  try {
    const { stockId } = req.params;

    const stockItem = await StockItem.findByPk(stockId);
    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    await stockItem.destroy();
    res.json({ message: 'Stock item deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function to determine stock status
function getStockStatus(currentStock, minimumStock) {
  if (currentStock === 0) {
    return 'Expired';
  }

  if (currentStock < minimumStock) {
    return 'Critical';
  }

  if (currentStock < minimumStock * 2) {
    return 'Low Stock';
  }

  return 'In Stock';
}