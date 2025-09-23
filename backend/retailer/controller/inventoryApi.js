// controllers/retailerInventoryController.js
import { Op, fn, col, literal } from 'sequelize';
import Product from '../../../database/models/Product.js';
import RetailerStockItem from '../../../database/models/RetailerStockItem.js';
import sequelize from '../../../database/db.js';

// ------------------------------
// Inventory SUMMARY
// ------------------------------
export const getInventorySummary = async (req, res) => {
  try {
    const retailer_id = req.user.retailer_id;
    const { search, category, status, schedule, rack_no } = req.query;

    const where = { retailer_id: retailer_id };

    if (search) {
      const s = search.trim();
      where[Op.or] = [
        { '$Product.generic_name$': { [Op.iLike]: `%${s}%` } },
        { '$Product.product_code$': { [Op.iLike]: `%${s}%` } },
        { batch_number: { [Op.iLike]: `%${s}%` } }
      ];
      
      if (rack_no === undefined || rack_no === '') {
        where[Op.or].push({ rack_no: { [Op.iLike]: `%${s}%` } });
      }
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
    
    if (schedule && schedule !== 'all' && schedule !== '') {
      where.schedule = { [Op.eq]: schedule };
    }
    
    if (rack_no && rack_no.trim() !== '') {
      where.rack_no = { [Op.iLike]: `%${rack_no.trim()}%` };
    }

    const totalProducts = await RetailerStockItem.count({
      include: [{ model: Product, as: 'Product' }],
      where,
    });

    const lowStockItems = await RetailerStockItem.count({
      include: [{ model: Product, as: 'Product' }],
      where: { ...where, status: 'Low Stock' }
    });

    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const expiringSoon = await RetailerStockItem.count({
      include: [{ model: Product, as: 'Product' }],
      where: {
        ...where,
        expiry_date: { [Op.between]: [new Date(), threeMonthsFromNow] },
        is_expired: false,
      }
    });

    const result = await RetailerStockItem.findAll({
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
// ADD BULK STOCK
// ------------------------------
export const addBulkStock = async (req, res) => {
  try {
    const retailer_id = req.user.retailer_id;
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

        const schedule = item.schedule || 'None';
        const rack_no = item.rack_no || null;

        const newStockItem = await RetailerStockItem.create({
          retailer_id,
          product_code: product.product_code,
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
          status: getStockStatus(parseInt(quantity), parseInt(item.minimum_stock) || 0),
          schedule,
          rack_no
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
    const retailer_id = req.user.retailer_id;
    const { stockId } = req.params;
    const {
      product_code,
      batch_number,
      quantity,
      minimum_stock,
      ptr,
      pts,
      tax_rate,
      manufacturing_date,
      expiry_date,
      mrp,
      schedule,
      rack_no
    } = req.body;

    const item = await RetailerStockItem.findOne({
      where: { stock_id: stockId, retailer_id: retailer_id }
    });
    if (!item) return res.status(404).json({ message: 'Stock item not found' });

    if (product_code !== undefined) {
      const product = await Product.findOne({ where: { product_code } });
      if (!product) return res.status(404).json({ message: 'Product not found' });
      item.product_code = product_code;
    }

    await item.update({
      batch_number: batch_number ?? item.batch_number,
      quantity: quantity !== undefined ? parseFloat(quantity) : item.quantity,
      minimum_stock: minimum_stock !== undefined ? parseFloat(minimum_stock) : item.minimum_stock,
      ptr: ptr !== undefined ? parseFloat(ptr) : item.ptr,
      pts: pts !== undefined ? parseFloat(pts) : item.pts,
      tax_rate: tax_rate !== undefined ? parseFloat(tax_rate) : item.tax_rate,
      manufacturing_date: manufacturing_date ? new Date(manufacturing_date) : item.manufacturing_date,
      expiry_date: expiry_date ? new Date(expiry_date) : item.expiry_date,
      current_stock: quantity !== undefined ? parseFloat(quantity) : item.current_stock,
      is_expired: expiry_date ? new Date(expiry_date) < new Date() : item.is_expired,
      status:
        quantity !== undefined || minimum_stock !== undefined
          ? getStockStatus(
              quantity !== undefined ? parseFloat(quantity) : item.current_stock,
              minimum_stock !== undefined ? parseFloat(minimum_stock) : item.minimum_stock
            )
          : item.status,
      schedule: schedule !== undefined ? schedule : item.schedule,
      rack_no: rack_no !== undefined ? rack_no : item.rack_no
    });

    res.json(item);
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
    const retailer_id = req.user.retailer_id;
    const { stockId } = req.params;

    const item = await RetailerStockItem.findOne({
      where: { stock_id: stockId, retailer_id }
    });

    if (!item) return res.status(404).json({ message: 'Stock item not found' });

    await item.destroy();
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
    const retailer_id = req.user.retailer_id;

    const stockItems = await RetailerStockItem.findAll({
      include: [{ model: Product, as: 'Product' }],
      where: { product_code: productCode, retailer_id },
      order: [['manufacturing_date', 'ASC']]
    });

    res.json(stockItems);
  } catch (error) {
    console.error('Error fetching stock details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ------------------------------
// GET STOCK ITEMS WITH FILTERS/SEARCH
// ------------------------------
export const getStockItems = async (req, res) => {
  try {
    const retailer_id = req.user.retailer_id;
    const { search, category, status, schedule, rack_no, sortBy = 'created_at', order = 'DESC', limit = 10, offset = 0 } = req.query;

    const whereConditions = { retailer_id: retailer_id };

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      whereConditions[Op.or] = [
        { '$Product.generic_name$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$Product.product_code$': { [Op.iLike]: `%${searchTerm}%` } },
        { batch_number: { [Op.iLike]: `%${searchTerm}%` } },
        { rack_no: { [Op.iLike]: `%${searchTerm}%` } }
      ];
    }

    if (category && category !== 'undefined' && category !== 'all') {
      whereConditions['$Product.category$'] = category;
    }

    if (status && status !== 'undefined' && status !== 'all') {
      if (status === 'Expired') {
        whereConditions.expiry_date = { [Op.lt]: new Date() };
      } else {
        whereConditions.status = status;
        whereConditions.expiry_date = { [Op.gte]: new Date() };
      }
    }

    if (schedule && schedule !== 'undefined' && schedule !== 'all' && schedule.trim() !== '') {
      whereConditions.schedule = { [Op.eq]: schedule };
    }

    if (rack_no && rack_no !== 'undefined' && rack_no.trim() !== '') {
      whereConditions.rack_no = { [Op.iLike]: `%${rack_no.trim()}%` };
    }

    const { count, rows } = await RetailerStockItem.findAndCountAll({
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
        'stock_id', 'retailer_id', 'product_code', 'batch_number', 'manufacturing_date',
        'expiry_date', 'quantity', 'minimum_stock', 'ptr', 'pts',
        'tax_rate', 'current_stock', 'is_expired', 'is_critical', 'status',
        'schedule', 'rack_no', 'created_at', 'updated_at'
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

    const categoriesResult = await Product.findAll({
      include: [{ 
        model: RetailerStockItem,
        where: { retailer_id: retailer_id },
        attributes: []
      }],
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      raw: true
    });

    const categories = [...new Set(categoriesResult.map(c => c.category).filter(Boolean))];

    const rackNumbers = await RetailerStockItem.findAll({
      where: { retailer_id: retailer_id },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('rack_no')), 'rack_no']],
      raw: true
    });

    const schedules = await RetailerStockItem.findAll({
      where: { retailer_id: retailer_id },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('schedule')), 'schedule']],
      raw: true
    });

    const rackNos = rackNumbers.map(r => r.rack_no).filter(Boolean);
    const scheduleList = schedules.map(s => s.schedule).filter(Boolean);

    res.json({
      total: count,
      data: formattedStockItems,
      categories: categories,
      rack_nos: rackNos,
      schedules: scheduleList
    });

  } catch (error) {
    console.error('Error fetching stock items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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
    const retailer_id = req.user.retailer_id;

    const batches = await RetailerStockItem.findAll({
      where: { product_code, retailer_id },
      attributes: [
        'stock_id',
        'batch_number',
        'manufacturing_date',
        'expiry_date',
        'quantity',
        'ptr',
        'pts',
        'tax_rate',
        'schedule',
        'rack_no'
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

// ------------------------------
// IMPORT PRODUCTS
// ------------------------------
export const importProducts = async (req, res) => {
  try {
    const retailer_id = req.user.retailer_id;
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

        const schedule = productData.schedule || 'None';
        const rack_no = productData.rack_no || null;

        const stockItem = await RetailerStockItem.create({
          retailer_id,
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
          status: getStockStatus(parseInt(productData.quantity) || 0, parseInt(productData.minimum_stock) || 0),
          schedule,
          rack_no
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
    const retailer_id = req.user.retailer_id;

    const stockItems = await RetailerStockItem.findAll({
      include: [{ model: Product, as: 'Product', attributes: ['product_code','generic_name','unit_size','mrp','hsn_code','category'] }],
      where: { retailer_id },
      attributes: ['stock_id','product_code','batch_number','manufacturing_date','expiry_date','quantity','minimum_stock','ptr','pts','tax_rate','current_stock','is_expired','is_critical','status','schedule','rack_no']
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
      'Schedule': item.schedule,
      'Rack No': item.rack_no || '',
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
  if (currentStock === 0) return 'Out of Stock';
  if (currentStock <= minimumStock) return 'Low Stock';
  return 'In Stock';
}