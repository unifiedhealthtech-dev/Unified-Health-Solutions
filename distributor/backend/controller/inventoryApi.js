// controllers/inventoryController.js
import { Op } from 'sequelize';
import Product from '../models/Product.js';
import StockItem from '../models/StockItem.js';
import User from '../models/userSchema.js';
import sequelize from '../db.js';

// ------------------------------
// DASHBOARD SUMMARY
// ------------------------------
export const getDashboardSummary = async (req, res) => {
  try {
    const distributorId = req.user.id; // Distributor ID from authenticated user

    const totalProducts = await StockItem.count({
      where: { distributor_id: distributorId }
    });

    // Low stock items
    const lowStockItems = await StockItem.count({
      where: {
        distributor_id: distributorId,
        current_stock: { [Op.lt]: sequelize.literal('"minimum_stock"') },
        status: { [Op.not]: 'Expired' }
      }
    });

    // Expiring soon items (within 3 months)
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const expiringSoon = await StockItem.count({
      where: {
        distributor_id: distributorId,
        expiry_date: { [Op.between]: [new Date(), threeMonthsFromNow] },
        status: { [Op.not]: 'Expired' }
      }
    });

    // Total inventory value
    const totalValue = await StockItem.sum('ptr', {
      where: { distributor_id: distributorId, is_expired: false }
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

// ------------------------------
// GET STOCK ITEMS WITH FILTERS/SEARCH
// ------------------------------
export const getStockItems = async (req, res) => {
  try {
    const distributorId = req.user.id;
    const { search, category, status, sortBy = 'created_at', order = 'DESC', limit = 10, offset = 0 } = req.query;

    const whereConditions = { distributor_id: distributorId };

   if (search) {
  const searchTerm = search.trim();

  whereConditions[Op.or] = [
    { '$Product.generic_name$': { [Op.iLike]: `${searchTerm}%` } },  // starts with
    { '$Product.product_code$': { [Op.iLike]: `${searchTerm}%` } },
    { batch_number: { [Op.iLike]: `${searchTerm}%` } }
  ];
}

    if (category && category !== 'undefined' && category !== 'all') {
      whereConditions['$Product.category$'] = category;
    }

    if (status && status !== 'undefined' && status !== 'all') {
      if (status === 'Expired') {
        whereConditions.status = { [Op.not]: 'Expired' };
        whereConditions.expiry_date = { [Op.lt]: new Date() };
      } else {
        whereConditions.status = status;
        whereConditions.expiry_date = { [Op.gte]: new Date() };
      }
    }

    // 1. Get paginated stock items
    const { count, rows } = await StockItem.findAndCountAll({
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
      order: [[sortBy, order]],
      attributes: [
        'stock_id', 'distributor_id', 'product_id', 'batch_number', 'manufacturing_date',
        'expiry_date', 'quantity', 'minimum_stock', 'ptr', 'pts',
        'tax_rate', 'current_stock', 'is_expired', 'is_critical', 'status'
      ]
    });

    const formattedStockItems = rows.map(item => ({
      ...item.get({ plain: true }),
      ptr: Number(item.ptr),
      pts: Number(item.pts),
      taxRate: Number(item.tax_rate),
      productDetails: {
        ...item.Product.get({ plain: true }),
        mrp: Number(item.Product?.mrp || 0)
      }
    }));

    // 2. Get **all categories** from distributor’s stock (ignoring pagination)
    const categories = await Product.findAll({
      include: [{ 
        model: StockItem,
        where: { distributor_id: distributorId }
      }],
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      raw: true
    });

    res.json({
      total: count,
      data: formattedStockItems,
      categories: categories.map(c => c.category).filter(Boolean)  // send array of categories
    });

  } catch (error) {
    console.error('Error fetching stock items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// ------------------------------
// ADD STOCK
// ------------------------------
export const addStock = async (req, res) => {
  try {
    const distributorId = req.user.id;
    const {
      product_id, // product_code from frontend
      batch_number,
      manufacturing_date,
      expiry_date,
      quantity,
      minimum_stock,
      ptr,
      pts,
      tax_rate
    } = req.body;

    if (!product_id || !batch_number || !manufacturing_date || !expiry_date || !quantity || !ptr || !pts) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    console.log("Trying to find product with code:", product_id);

    const product = await Product.findOne({
      where: { product_code: product_id }
    });

    if (!product) {
      console.error("Product not found for product_code:", product_id);
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log("Product found:", product.id);

    const newStockItem = await StockItem.create({
      distributor_id: distributorId,
      product_id: product.product_id, // CORRECT, matches your model's PK
      batch_number,
      manufacturing_date: new Date(manufacturing_date),
      expiry_date: new Date(expiry_date),
      quantity: parseInt(quantity),
      minimum_stock: parseInt(minimum_stock) || 0,
      ptr: parseFloat(ptr),
      pts: parseFloat(pts),
      tax_rate: parseFloat(tax_rate) || 12,
      current_stock: parseInt(quantity),
      is_expired: new Date(expiry_date) < new Date(),
      status: getStockStatus(parseInt(quantity), parseInt(minimum_stock) || 0)
    });

    res.status(201).json(newStockItem);
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// ------------------------------
// UPDATE STOCK
// ------------------------------
export const updateStock = async (req, res) => {
  try {
    const distributorId = req.user.id;
    const { stockId } = req.params;
    const {
      product_id,  // this is actually product_code received from frontend
      quantity,
      minimum_stock,
      ptr,
      pts,
      tax_rate,
      manufacturing_date,
      expiry_date
    } = req.body;

    // Find the stock item for given stockId and distributor
    const stockItem = await StockItem.findOne({
      where: { stock_id: stockId, distributor_id: distributorId }
    });
    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    // If product_id (actually product_code) is provided, find corresponding product_id PK
    if (product_id !== undefined) {
      const product = await Product.findOne({
        where: { product_code: product_id }  // product_code matches frontend product_id field
      });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      stockItem.product_id = product.product_id;  // set correct product PK from DB
    }

    // Update other stock details, parsing values appropriately
    await stockItem.update({
      quantity: quantity !== undefined ? parseInt(quantity) : stockItem.quantity,
      minimum_stock: minimum_stock !== undefined ? parseInt(minimum_stock) : stockItem.minimum_stock,
      ptr: ptr !== undefined ? parseFloat(ptr) : stockItem.ptr,
      pts: pts !== undefined ? parseFloat(pts) : stockItem.pts,
      tax_rate: tax_rate !== undefined ? parseFloat(tax_rate) : stockItem.tax_rate,
      manufacturing_date: manufacturing_date ? new Date(manufacturing_date) : stockItem.manufacturing_date,
      expiry_date: expiry_date ? new Date(expiry_date) : stockItem.expiry_date,
      current_stock: quantity !== undefined ? parseInt(quantity) : stockItem.current_stock,
      is_expired: expiry_date ? new Date(expiry_date) < new Date() : stockItem.is_expired,
      status: quantity !== undefined || minimum_stock !== undefined
        ? getStockStatus(
            quantity !== undefined ? parseInt(quantity) : stockItem.current_stock,
            minimum_stock !== undefined ? parseInt(minimum_stock) : stockItem.minimum_stock
          )
        : stockItem.status
    });

    res.json(stockItem);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// ------------------------------
// DELETE STOCK
// ------------------------------
export const deleteStock = async (req, res) => {
  try {
    const distributorId = req.user.id;
    const { stockId } = req.params;

    const stockItem = await StockItem.findOne({
      where: { stock_id: stockId, distributor_id: distributorId }
    });

    if (!stockItem) return res.status(404).json({ message: 'Stock item not found' });

    await stockItem.destroy();
    res.json({ message: 'Stock item deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ------------------------------
// GET STOCK DETAILS BY PRODUCT
// ------------------------------
export const getStockDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const distributorId = req.user.id;

    const stockItems = await StockItem.findAll({
      include: [{ model: Product, as: 'Product' }],
      where: { product_id: productId, distributor_id: distributorId },
      order: [['manufacturing_date', 'ASC']]
    });

    res.json(stockItems);
  } catch (error) {
    console.error('Error fetching stock details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ------------------------------
// IMPORT PRODUCTS
// ------------------------------
export const importProducts = async (req, res) => {
  try {
    const distributorId = req.user.id;
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No products provided for import' });
    }

    const importedProducts = [];

    for (const productData of products) {
      try {
        if (!productData.product_id) {
          console.error('Missing product_id. Skipping record:', productData);
          continue;
        }

        // Check if product exists by product_code
        let product = await Product.findOne({ where: { product_code: productData.product_code } });
        
        if (!product) {
          // Create new product - must provide product_id explicitly
          product = await Product.create({
            product_id: productData.product_id,  // Required; string PK not auto-incremented
            product_code: productData.product_code,
            generic_name: productData.generic_name,
            unit_size: productData.unit_size,
            mrp: parseFloat(productData.mrp) || 0,
            group: productData.group_name,
            hsn_code: productData.hsn_code,
            category: productData.category,
            is_active: productData.is_active ?? true
          });
        }

        // Create stock item linked to this product
        const stockItem = await StockItem.create({
          distributor_id: distributorId,
          product_id: product.product_id,
          batch_number: productData.batch_number,
          manufacturing_date: new Date(productData.manufacturing_date),
          expiry_date: new Date(productData.expiry_date),
          quantity: parseInt(productData.quantity) || 0,
          minimum_stock: parseInt(productData.minimum_stock) || 0,
          ptr: parseFloat(productData.ptr) || 0,
          pts: parseFloat(productData.pts) || 0,
          tax_rate: parseFloat(productData.tax_rate) || 12,
          current_stock: parseInt(productData.quantity) || 0,
          is_expired: new Date(productData.expiry_date) < new Date(),
          status: getStockStatus(parseInt(productData.quantity) || 0, parseInt(productData.minimum_stock) || 0)
        });

        importedProducts.push(stockItem);

      } catch (err) {
        console.error('Failed to import this product:', productData, err);
      }
    }

    res.status(201).json({ message: `${importedProducts.length} products imported successfully`, imported: importedProducts.length });
  } catch (error) {
    console.error('Error importing products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ------------------------------
// EXPORT PRODUCTS
// ------------------------------
export const exportProducts = async (req, res) => {
  try {
    const distributorId = req.user.id;

    const stockItems = await StockItem.findAll({
      include: [{ model: Product, as: 'Product', attributes: ['product_id','product_code','generic_name','unit_size','mrp','group_name','hsn_code','category'] }],
      where: { distributor_id: distributorId },
      attributes: ['stock_id','product_id','batch_number','manufacturing_date','expiry_date','quantity','minimum_stock','ptr','pts','tax_rate','current_stock','is_expired','is_critical','status']
    });

    const exportData = stockItems.map(item => ({
      'Product ID': item.product_id,
      'Product Name': item.Product?.generic_name || '',
      'Batch Number': item.batch_number,
      'Manufacturing Date': item.manufacturing_date ? new Date(item.manufacturing_date).toISOString().split('T')[0] : '',
      'Expiry Date': item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : '',
      'Quantity': item.quantity,
      'Minimum Stock': item.minimum_stock,
      'PTR': item.ptr,
      'PTS': item.pts,
      'Tax Rate (%)': item.tax_rate,
      'Current Stock': item.current_stock,
      'Status': item.status,
      'Is Expired': item.is_expired ? 'Yes' : 'No'
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory_export.csv');

    const headers = Object.keys(exportData[0] || {}).join(',') + '\n';
    const rows = exportData.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');

    res.send(headers + rows);
  } catch (error) {
    console.error('Error exporting products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ------------------------------
// HELPER FUNCTION: GET STOCK STATUS
// ------------------------------
function getStockStatus(currentStock, minimumStock) {
  if (currentStock === 0) return 'Expired';
  if (currentStock < minimumStock) return 'Critical';
  if (currentStock < minimumStock * 2) return 'Low Stock';
  return 'In Stock';
}



export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: [
        'product_code',
        'generic_name',
        'unit_size',
        'mrp',
        'category',
        'hsn_code'
      ],
      order: [['product_code', 'ASC']],
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};