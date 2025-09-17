import { Op, fn, col, literal } from 'sequelize';
import Product from '../../database/models/Product.js';
import StockItem from '../../database/models/StockItem.js';
import sequelize from '../../database/db.js';

// ------------------------------
// Inventory SUMMARY
// ------------------------------
export const getInventorySummary = async (req, res) => {
  try {
    const distributorId = req.user.id;
    const { search, category, status } = req.query;

    const where = { distributor_id: distributorId };

    if (search) {
      const s = search.trim();
      where[Op.or] = [
        { '$Product.generic_name$': { [Op.iLike]: `%${s}%` } },
        { '$Product.product_code$': { [Op.iLike]: `%${s}%` } },
        { batch_number: { [Op.iLike]: `%${s}%` } }
      ];
    }
    if (category && category !== 'all') {
      where['$Product.category$'] = category;
    }
    if (status && status !== 'all') {
      if (status === 'Expired') {
        where.expiry_date = { [Op.lt]: new Date() };
      } else {
        where.status = status;
        where.expiry_date = { [Op.gte]: new Date() };
      }
    }

    const totalProducts = await StockItem.count({
      include: [{ model: Product, as: 'Product' }],
      where,
    });

    const lowStockItems = await StockItem.count({
      include: [{ model: Product, as: 'Product' }],
      where: { ...where, status: 'Low Stock' }
    });

    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const expiringSoon = await StockItem.count({
      include: [{ model: Product, as: 'Product' }],
      where: {
        ...where,
        expiry_date: { [Op.between]: [new Date(), threeMonthsFromNow] },
        is_expired: false,
      }
    });

    // ✅ Fixed total value
    const result = await StockItem.findAll({
      attributes: [[fn("SUM", literal("ptr * current_stock")), "total_value"]],
      include: [{ model: Product, as: "Product", attributes: [] }],
      where: { ...where, is_expired: false },
      raw: true,
    });

    const totalValue = result[0]?.total_value || 0;

    res.json({
      total_products: totalProducts,
      low_stock_items: lowStockItems,
      expiring_soon: expiringSoon,
      total_value: totalValue
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
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
        { '$Product.generic_name$': { [Op.iLike]: `${searchTerm}%` } },
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

    const { count, rows } = await StockItem.findAndCountAll({
      include: [{
        model: Product,
        as: 'Product',
        attributes: [
          'product_code', 'generic_name', 'unit_size',
          'mrp', 'hsn_code', 'category'
        ]
      }],
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order]],
      attributes: [
        'stock_id', 'distributor_id', 'product_code', 'batch_number', 'manufacturing_date',
        'expiry_date', 'quantity', 'minimum_stock', 'ptr', 'pts',
        'tax_rate', 'current_stock', 'is_expired', 'is_critical', 'status'
      ]
    });

    const formattedStockItems = rows.map(item => ({
      ...item.get({ plain: true }),
      ptr: Number(item.ptr),
      pts: Number(item.pts),
      tax_rate: Number(item.tax_rate),
      product_details: {
        ...item.Product.get({ plain: true }),
        mrp: Number(item.Product?.mrp || 0)
      }
    }));

    // 2. Get all categories from distributor's stock
    const categoriesResult = await Product.findAll({
      include: [{ 
        model: StockItem,
        where: { distributor_id: distributorId }
      }],
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      raw: true
    });

    const categories = [...new Set(categoriesResult.map(c => c.category).filter(Boolean))];

    res.json({
      total: count,
      data: formattedStockItems,
      categories: categories
    });

  } catch (error) {
    console.error('Error fetching stock items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ------------------------------
// ADD BULK STOCK
// ------------------------------
export const addBulkStock = async (req, res) => {
  try {
    const distributorId = req.user.id;
    const { stockItems } = req.body;

    if (!Array.isArray(stockItems) || stockItems.length === 0) {
      return res.status(400).json({ message: 'No stock items provided' });
    }

    const results = { success: [], errors: [] };

    for (const item of stockItems) {
      try {
        if (!item.product_code || item.product_code.trim() === '') {
          continue;
        }

        const { product_code, batch_number, expiry_date, quantity, ptr, pts } = item;
        
        if (!batch_number || !expiry_date || !quantity || !ptr || !pts) {
          results.errors.push({ item, error: 'Missing required fields' });
          continue;
        }

        const product = await Product.findOne({ where: { product_code } });
        if (!product) {
          results.errors.push({ item, error: 'Product not found' });
          continue;
        }

        let taxRate = 12;
        if (item.tax_rate) {
          taxRate = parseFloat(item.tax_rate);
          if (isNaN(taxRate)) taxRate = 12;
        }

        const newStockItem = await StockItem.create({
          distributor_id: distributorId,
          product_code,
          batch_number,
          manufacturing_date: item.manufacturing_date ? new Date(item.manufacturing_date) : null,
          expiry_date: new Date(expiry_date),
          quantity: parseInt(quantity),
          minimum_stock: parseInt(item.minimum_stock) || 0,
          ptr: parseFloat(ptr),
          pts: parseFloat(pts),
          tax_rate: taxRate,
          current_stock: parseInt(quantity),
          is_expired: new Date(expiry_date) < new Date(),
          status: getStockStatus(parseInt(quantity), parseInt(item.minimum_stock) || 0)
        });

        results.success.push(newStockItem);
      } catch (error) {
        console.error('Error adding stock item:', error);
        results.errors.push({ item, error: error.message });
      }
    }

    const totalProcessed = results.success.length + results.errors.length;
    res.status(201).json({
      message: `Processed ${totalProcessed} rows. Added ${results.success.length} items, ${results.errors.length} errors.`,
      ...results
    });
  } catch (error) {
    console.error('Error in bulk stock addition:', error);
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
    const { product_code, batch_number, quantity, minimum_stock, ptr, pts, tax_rate, manufacturing_date, expiry_date, mrp } = req.body;

    const stockItem = await StockItem.findOne({
      where: { stock_id: stockId, distributor_id: distributorId }
    });
    if (!stockItem) return res.status(404).json({ message: 'Stock item not found' });

    if (product_code !== undefined) {
      const product = await Product.findOne({ where: { product_code } });
      if (!product) return res.status(404).json({ message: 'Product not found' });
      stockItem.product_code = product_code;
    }

    // Parse as floats instead of integers for decimal support
    await stockItem.update({
      batch_number: batch_number !== undefined ? batch_number : stockItem.batch_number,
      quantity: quantity !== undefined ? parseFloat(quantity) : stockItem.quantity,
      minimum_stock: minimum_stock !== undefined ? parseFloat(minimum_stock) : stockItem.minimum_stock,
      mrp: mrp !== undefined ? parseFloat(mrp) : stockItem.mrp, // Added MRP handling
      ptr: ptr !== undefined ? parseFloat(ptr) : stockItem.ptr,
      pts: pts !== undefined ? parseFloat(pts) : stockItem.pts,
      tax_rate: tax_rate !== undefined ? parseFloat(tax_rate) : stockItem.tax_rate,
      manufacturing_date: manufacturing_date ? new Date(manufacturing_date) : stockItem.manufacturing_date,
      expiry_date: expiry_date ? new Date(expiry_date) : stockItem.expiry_date,
      current_stock: quantity !== undefined ? parseFloat(quantity) : stockItem.current_stock,
      is_expired: expiry_date ? new Date(expiry_date) < new Date() : stockItem.is_expired,
      status: quantity !== undefined || minimum_stock !== undefined
        ? getStockStatus(
            quantity !== undefined ? parseFloat(quantity) : stockItem.current_stock,
            minimum_stock !== undefined ? parseFloat(minimum_stock) : stockItem.minimum_stock
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
    const { productCode } = req.params;
    const distributorId = req.user.id;

    const stockItems = await StockItem.findAll({
      include: [{ model: Product, as: 'Product' }],
      where: { product_code: productCode, distributor_id: distributorId },
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
        if (!productData.product_code) continue;

        let product = await Product.findOne({ where: { product_code: productData.product_code } });
        
        if (!product) {
          product = await Product.create({
            product_code: productData.product_code,
            generic_name: productData.generic_name,
            unit_size: productData.unit_size,
            mrp: parseFloat(productData.mrp) || 0,
            hsn_code: productData.hsn_code,
            category: productData.category,
            is_active: productData.is_active ?? true
          });
        }

        const stockItem = await StockItem.create({
          distributor_id: distributorId,
          product_code: product.product_code,
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
        console.error('Failed to import product:', productData, err);
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
      include: [{ model: Product, as: 'Product', attributes: ['product_code','generic_name','unit_size','mrp','hsn_code','category'] }],
      where: { distributor_id: distributorId },
      attributes: ['stock_id','product_code','batch_number','manufacturing_date','expiry_date','quantity','minimum_stock','ptr','pts','tax_rate','current_stock','is_expired','is_critical','status']
    });

    const exportData = stockItems.map(item => ({
      'Product Code': item.product_code,
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

// ------------------------------
// GET ALL PRODUCTS
// ------------------------------
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

// ------------------------------
// GET PRODUCT BATCHES
// ------------------------------
export const getProductBatches = async (req, res) => {
  try {
    const { product_code } = req.params;
    const distributorId = req.user.id;

    const batches = await StockItem.findAll({
      where: { product_code, distributor_id: distributorId },
      attributes: [
        'stock_id',
        'batch_number',
        'manufacturing_date',
        'expiry_date',
        'quantity',
        'ptr',
        'pts',
        'tax_rate'
      ],
      order: [['expiry_date', 'ASC']]
    });

    if (!batches.length) {
      return res.status(404).json({ message: 'No batches found for this product' });
    }

    res.json(batches);
  } catch (error) {
    console.error('Error fetching product batches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
