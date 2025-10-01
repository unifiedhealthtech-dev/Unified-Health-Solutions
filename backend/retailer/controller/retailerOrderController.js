// controllers/retailerOrderController.js
import { Op } from 'sequelize';
import Product from '../../../database/models/Product.js';
import DistributorStockItem from '../../../database/models/DistributorStockItem.js';
import Distributor from '../../../database/models/Distributor.js';
import ConnectedDistributors from '../../../database/models/ConnectedDistributor.js';
import RetailerOrder from '../../../database/models/RetailerOrder.js';
import RetailerOrderItem from '../../../database/models/RetailerOrderItem.js';
import Notification from "../../../database/models/Notification.js";
import RetailerDCItem from '../../../database/models/RetailerDCItem.js';
import RetailerDCItemDetail from '../../../database/models/RetailerDCItemDetail.js';
import OrderDispute from '../../../database/models/OrderDispute.js';
import RetailerStockItem from '../../../database/models/RetailerStockItem.js';
import sequelize from '../../../database/db.js';

// Helper: Parse stock as integer safely
const parseStock = (val) => {
  const num = parseInt(val, 10);
  return isNaN(num) ? 0 : num;
};

// ✅ Get connected distributors for dropdown
export const getConnectedDistributorsList = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;

    const connections = await ConnectedDistributors.findAll({
      where: { retailer_id: retailerId, status: 'connected' },
      include: [{
        model: Distributor,
        as: 'Distributor',
        attributes: ['distributor_id', 'name', 'phone', 'email']
      }],
      order: [['Distributor', 'name', 'ASC']]
    });

    const distributors = connections.map(conn => ({
      id: conn.Distributor.distributor_id,
      name: conn.Distributor.name,
      phone: conn.Distributor.phone,
      email: conn.Distributor.email
    }));

    res.json({
      success: true,
      data: distributors,
      message: 'Connected distributors retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching connected distributors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch distributors' });
  }
};

// ✅ SEARCH MEDICINES — GROUPED (NO BATCHES VISIBLE TO RETAILER)
export const searchMedicines = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const { search, distributorId } = req.query;

    if (!search) {
      return res.status(400).json({ success: false, message: 'Search term is required' });
    }

    // Step 1: Get allowed distributor IDs
    let allowedDistributorIds = [];
    if (distributorId && distributorId !== 'all') {
      const connection = await ConnectedDistributors.findOne({
        where: { 
          retailer_id: retailerId, 
          distributor_id: distributorId, 
          status: 'connected' 
        }
      });

      if (!connection) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not connected to this distributor' 
        });
      }
      allowedDistributorIds = [parseInt(distributorId)];
    } else {
      const connections = await ConnectedDistributors.findAll({
        where: { retailer_id: retailerId, status: 'connected' }
      });

      if (connections.length === 0) {
        return res.json({ success: true, data: [], message: 'No connected distributors' });
      }
      allowedDistributorIds = connections.map(conn => conn.distributor_id);
    }

    // Step 2: Fetch all non-expired, available stock items
    const stockItems = await DistributorStockItem.findAll({
      include: [
        {
          model: Product,
          as: 'Product',
          attributes: ['product_code', 'generic_name', 'unit_size', 'mrp', 'category', 'hsn_code']
        },
        {
          model: Distributor,
          as: 'Distributor',
          attributes: ['distributor_id', 'name', 'phone', 'email']
        }
      ],
      where: {
        distributor_id: { [Op.in]: allowedDistributorIds },
        expiry_date: { [Op.gt]: new Date() },
        current_stock: { [Op.gt]: 0 }, // Only show available stock
        [Op.or]: [
          { '$Product.generic_name$': { [Op.iLike]: `%${search}%` } },
          { '$Product.product_code$': { [Op.iLike]: `%${search}%` } }
        ]
      },
      attributes: [
        'product_code', 'distributor_id', 'current_stock',
        'ptr', 'pts', 'tax_rate'
      ]
    });

    if (stockItems.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No matching medicines found'
      });
    }

    // Step 3: GROUP by product + pricing signature
    const grouped = {};
    for (const item of stockItems) {
      const key = `${item.product_code}-${item.distributor_id}-${item.ptr}-${item.pts}-${item.tax_rate}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          product_code: item.product_code,
          distributor: {
            id: item.Distributor.distributor_id,
            name: item.Distributor.name,
            contact: item.Distributor.phone
          },
          product: {
            id: item.Product.product_code,
            code: item.Product.product_code,
            name: item.Product.generic_name,
            unit_size: item.Product.unit_size,
            mrp: Number(item.Product.mrp),
            category: item.Product.category
          },
          ptr: Number(item.ptr),
          pts: Number(item.pts),
          tax_rate: Number(item.tax_rate),
          total_available_stock: 0
        };
      }
      grouped[key].total_available_stock += parseStock(item.current_stock);
    }

    const formattedMedicines = Object.values(grouped).map(group => ({
      product_code: group.product_code,
      distributor: group.distributor,
      product: group.product,
      pricing: {
        ptr: group.ptr,
        pts: group.pts,
        tax_rate: group.tax_rate
      },
      total_available_stock: group.total_available_stock,
      availability: group.total_available_stock > 0 ? 'available' : 'out_of_stock'
    }));

    // Sort by product name
    formattedMedicines.sort((a, b) => a.product.name.localeCompare(b.product.name));

    res.json({
      success: true,
      data: formattedMedicines,
      message: 'Medicines retrieved successfully'
    });

  } catch (error) {
    console.error('Error searching medicines:', error);
    res.status(500).json({ success: false, message: 'Failed to search medicines' });
  }
};

// ✅ Get distributor stock — GROUPED (NO BATCHES)
export const getDistributorStock = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const { distributorId, search, page = 1, limit = 20 } = req.query;

    const connections = await ConnectedDistributors.findAll({
      where: { retailer_id: retailerId, status: 'connected' },
      include: [{
        model: Distributor,
        as: 'Distributor',
        attributes: ['distributor_id', 'name', 'phone', 'email']
      }]
    });

    if (connections.length === 0) {
      return res.json({ 
        success: true, 
        data: [], 
        distributors: [],
        pagination: { total: 0, pages: 0, currentPage: 1 }
      });
    }

    let distributorIds = connections.map(conn => conn.distributor_id);
    
    if (distributorId && distributorId !== 'all') {
      if (!distributorIds.includes(parseInt(distributorId))) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not connected to this distributor' 
        });
      }
      distributorIds = [parseInt(distributorId)];
    }

    const whereConditions = {
      distributor_id: { [Op.in]: distributorIds },
      current_stock: { [Op.gt]: 0 },
      expiry_date: { [Op.gt]: new Date() }
    };

    if (search && search.trim() !== '') {
      whereConditions[Op.or] = [
        { '$Product.generic_name$': { [Op.iLike]: `%${search}%` } },
        { '$Product.product_code$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const stockItems = await DistributorStockItem.findAll({
      include: [
        {
          model: Product,
          as: 'Product',
          attributes: ['product_code', 'generic_name', 'unit_size', 'mrp', 'category', 'hsn_code']
        },
        {
          model: Distributor,
          as: 'Distributor',
          attributes: ['distributor_id', 'name', 'phone', 'email']
        }
      ],
      where: whereConditions,
      attributes: ['product_code', 'distributor_id', 'current_stock', 'ptr', 'pts', 'tax_rate']
    });

    // Group logic
    const grouped = {};
    for (const item of stockItems) {
      const key = `${item.product_code}-${item.distributor_id}-${item.ptr}-${item.pts}-${item.tax_rate}`;
      if (!grouped[key]) {
        grouped[key] = {
          product_code: item.product_code,
          distributor: {
            id: item.Distributor.distributor_id,
            name: item.Distributor.name,
            phone: item.Distributor.phone,
            email: item.Distributor.email
          },
          product: {
            id: item.Product.product_code,
            code: item.Product.product_code,
            name: item.Product.generic_name,
            unit_size: item.Product.unit_size,
            mrp: Number(item.Product.mrp),
            category: item.Product.category,
            hsn_code: item.Product.hsn_code
          },
          ptr: Number(item.ptr),
          pts: Number(item.pts),
          tax_rate: Number(item.tax_rate),
          total_available_stock: 0
        };
      }
      grouped[key].total_available_stock += parseStock(item.current_stock);
    }

    const groupedArray = Object.values(grouped);
    groupedArray.sort((a, b) => 
      a.distributor.name.localeCompare(b.distributor.name) || 
      a.product.name.localeCompare(b.product.name)
    );

    const totalCount = groupedArray.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = groupedArray.slice(startIndex, startIndex + limit);

    const distributors = connections.map(conn => ({
      id: conn.Distributor.distributor_id,
      name: conn.Distributor.name,
      phone: conn.Distributor.phone
    }));

    res.json({
      success: true,
      data: paginatedData,
      distributors: distributors,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
        hasNext: startIndex + limit < totalCount
      },
      message: 'Distributor stock retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching distributor stock:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch distributor stock' });
  }
};


// ✅ CREATE ORDER — store NULL for batch fields
export const createOrder = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const retailerName = req.user.name;
    const { distributorId, items, notes } = req.body;

    if (!distributorId || !items?.length) {
      return res.status(400).json({ success: false, message: 'Distributor ID and items are required' });
    }

    const connection = await ConnectedDistributors.findOne({
      where: { retailer_id: retailerId, distributor_id: distributorId, status: 'connected' }
    });
    if (!connection) return res.status(403).json({ success: false, message: 'Not connected to this distributor' });

    let totalAmount = 0;
    let totalItems = 0;
    const orderItems = [];

    // Validate total stock per product
    for (const item of items) {
      const { product_code, quantity } = item;
      if (!product_code || !quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid item: product_code and quantity required' });
      }

      const availableBatches = await DistributorStockItem.findAll({
        where: {
          distributor_id: distributorId,
          product_code,
          current_stock: { [Op.gt]: 0 },
          expiry_date: { [Op.gt]: new Date() }
        }
      });

      const totalAvailable = availableBatches.reduce((sum, b) => sum + parseStock(b.current_stock), 0);
      if (totalAvailable < quantity) {
        const product = await Product.findOne({ where: { product_code } });
        const name = product?.generic_name || product_code;
        return res.status(400).json({ success: false, message: `Insufficient stock for ${name}. Available: ${totalAvailable}` });
      }

      // Use pricing from first batch (assumes grouped pricing is consistent)
      const firstBatch = availableBatches[0];
      const unitPrice = parseFloat(firstBatch.ptr);
      const itemTotal = unitPrice * quantity;

      totalAmount += itemTotal;
      totalItems += quantity;

      // 🔥 Store WITHOUT stock_id or batch_number
      orderItems.push({
        product_code,
        quantity,
        unit_price: unitPrice,
        total_price: itemTotal,
        tax_rate: parseFloat(firstBatch.tax_rate || 0),
        // stock_id: null,        ← implicit
        // batch_number: null,    ← implicit
      });
    }

    // Create order
    const order = await RetailerOrder.create({
      retailer_id: retailerId,
      distributor_id: distributorId,
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      total_amount: totalAmount,
      total_items: totalItems,
      status: 'pending',
      notes: notes || null
    });

    // Create order items (batch fields = NULL)
    await RetailerOrderItem.bulkCreate(
      orderItems.map(item => ({ ...item, order_id: order.order_id }))
    );

    // 🔥 DO NOT deduct stock here — only during billing

    // Notification
    const notification = await Notification.create({
      user_id: distributorId,
      role: 'distributor',
      title: 'New Order Received',
      message: `New order #${order.order_number} from ${retailerName}`,
      type: 'new order',
      related_id: order.order_id,
      metadata: JSON.stringify({
        order_id: order.order_id,
        order_number: order.order_number,
        retailer_id: retailerId,
        retailer_name: retailerName,
        total_amount: totalAmount,
        total_items: totalItems,
        items: orderItems
      })
    });

    if (req.io) {
      req.io.to(`distributor_${distributorId}`).emit('newNotification', notification.toJSON()
      );
    }

    res.status(201).json({
      success: true,
      data: { order: order.toJSON(), items: orderItems },
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

export const getRetailerOrders = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const { status, page = 1, limit = 10 } = req.query;
    const whereConditions = { retailer_id: retailerId };
    if (status && status !== 'all') {
      whereConditions.status = status;
    }
    const offset = (page - 1) * limit;
    const { count, rows: orders } = await RetailerOrder.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Distributor,
          as: 'Distributor',
          attributes: ['distributor_id', 'name', 'phone', 'email', 'address']
        },
        {
          model: RetailerOrderItem,
          as: 'items',
          attributes: [
            'item_id', 
            'product_code', 
            'batch_number', 
            'expiry_date', // ✅ INCLUDE THIS
            'quantity', 
            'unit_price', 
            'total_price', 
            'tax_rate'
          ],
          include: [{
            model: Product,
            as: 'Product',
            attributes: ['generic_name', 'unit_size', 'mrp']
          }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_orders: count,
          has_next: page * limit < count
        }
      },
      message: 'Orders retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// ✅ Get order details (unchanged)
export const getOrderDetails = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const { orderId } = req.params;
    const order = await RetailerOrder.findOne({
      where: { order_id: orderId, retailer_id: retailerId },
      include: [
        {
          model: Distributor,
          as: 'Distributor',
          attributes: ['distributor_id', 'name', 'phone', 'email', 'address']
        },
        {
          model: RetailerOrderItem,
          as: 'items',
          attributes: [
            'item_id', 
            'product_code', 
            'batch_number', 
            'expiry_date', // ✅ INCLUDE THIS
            'quantity', 
            'unit_price', 
            'total_price', 
            'tax_rate'
          ],
          include: [{
            model: Product,
            as: 'Product',
            attributes: ['generic_name', 'unit_size', 'mrp']
          }]
        }
      ]
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({
      success: true,
      data: order,
      message: 'Order details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
};

// ✅ Cancel order (updated to restore stock without stock_id in order item)
export const cancelOrder = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await RetailerOrder.findOne({
      where: { order_id: orderId, retailer_id: retailerId }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel order with status: ${order.status}` 
      });
    }

    const orderItems = await RetailerOrderItem.findAll({
      where: { order_id: orderId }
    });

    // For each item, find matching batches and restore stock (FIFO reverse not needed — just add back)
    for (const item of orderItems) {
      // Find any batch with this product_code and distributor to restore to
      // In real system, you'd store allocation, but for simplicity, we add to earliest batch
      const batchToUpdate = await DistributorStockItem.findOne({
        where: {
          distributor_id: order.distributor_id,
          product_code: item.product_code,
          expiry_date: { [Op.gt]: new Date() }
        },
        order: [['expiry_date', 'ASC']]
      });

      if (batchToUpdate) {
        await DistributorStockItem.increment('current_stock', {
          by: item.quantity,
          where: { stock_id: batchToUpdate.stock_id }
        });
      }
      // If no valid batch, create a new one or log — but for now, skip
    }

    await order.update({ 
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled by retailer'
    });

    const notification = await Notification.create({
      user_id: order.distributor_id,
      role: 'distributor',
      title: 'Order Cancelled',
      message: `Order #${order.order_number} has been cancelled by retailer`,
      type: 'order cancelled',
      related_id: order.order_id
    });

    if (req.io) {
      req.io.to(`distributor_${order.distributor_id}`).emit('newNotification', notification.toJSON());
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};

// ✅ Get order statistics (unchanged)
export const getOrderStatistics = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;

    const statistics = await RetailerOrder.findAll({
      where: { retailer_id: retailerId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('order_id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
      ],
      group: ['status'],
      raw: true
    });

    const totalOrders = await RetailerOrder.count({ where: { retailer_id: retailerId } });
    const pendingOrders = await RetailerOrder.count({ 
      where: { retailer_id: retailerId, status: 'pending' } 
    });
    const totalSpent = await RetailerOrder.sum('total_amount', { 
      where: { retailer_id: retailerId, status: ['confirmed', 'processing'] } 
    });

    res.json({
      success: true,
      data: {
        total_orders: totalOrders,
        pending_orders: pendingOrders,
        total_spent: totalSpent || 0,
        by_status: statistics
      },
      message: 'Order statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};


// controllers/dcController.js
export const getDCItems = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const dcRecords = await RetailerDCItem.findAll({
      where: { retailer_id: retailerId },
      include: [{ model: RetailerDCItemDetail, as: 'Details' }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: dcRecords });
  } catch (error) {
    console.error('Error fetching D/C records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch D/C records' });
  }
};

export const deleteDCItem = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const { id } = req.params;

    const dcRecord = await RetailerDCItem.findOne({
      where: { dc_id: id, retailer_id: retailerId }
    });
    
    if (!dcRecord) {
      return res.status(404).json({ success: false, message: 'D/C record not found' });
    }

    // Delete details first if cascade not set
    await RetailerDCItemDetail.destroy({ where: { dc_id: id } });
    
    // Delete main record
    await dcRecord.destroy();
    
    res.json({ success: true, message: 'D/C record and its items deleted successfully' });
  } catch (error) {
    console.error('Error deleting D/C record:', error);
    res.status(500).json({ success: false, message: 'Failed to delete D/C record' });
  }
};

export const createDCItemsBulk = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const retailerId = req.user.retailer_id;
    const { order_number, distributor_name, date, notes, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }

    // Validate required fields
    for (const item of items) {
      if (!item.product_name || !item.quantity || !item.rate || !item.mrp) {
        return res.status(400).json({ 
          success: false, 
          message: 'All items must have product name, quantity, rate, and MRP' 
        });
      }
    }

    // Create main DC record
    const newDCRecord = await RetailerDCItem.create({
      retailer_id: retailerId,
      order_number: order_number || null,
      distributor_name: distributor_name || null,
      date: date || new Date(),
      notes: notes || null,
    }, { transaction });

    // Prepare details
    const detailsToCreate = items.map(item => ({
      dc_id: newDCRecord.dc_id,
      product_name: item.product_name,
      batch_number: item.batch_number || null,
      manufacturing_date: item.manufacturing_date || null,
      expiry_date: item.expiry_date || null,
      quantity: parseInt(item.quantity, 10),
      rate: parseFloat(item.rate),
      mrp: parseFloat(item.mrp),
      tax_rate: item.tax_rate ? parseFloat(item.tax_rate) : 12,
    }));

    await RetailerDCItemDetail.bulkCreate(detailsToCreate, { transaction });
    await transaction.commit();

    // Fetch created record with details
    const createdRecord = await RetailerDCItem.findByPk(newDCRecord.dc_id, {
      include: [{ model: RetailerDCItemDetail, as: 'Details' }]
    });

    res.status(201).json({
      success: true,
      data: createdRecord,
      message: `D/C record and ${detailsToCreate.length} item(s) added successfully`
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating D/C record:', error);
    res.status(500).json({ success: false, message: 'Failed to add D/C record and items' });
  }
};

export const updateDCItem = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const retailerId = req.user.retailer_id;
    const { id } = req.params;
    const { order_number, distributor_name, date, notes, items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items must be an array' });
    }

    const dcRecord = await RetailerDCItem.findOne({
      where: { dc_id: id, retailer_id: retailerId },
      include: [{ model: RetailerDCItemDetail, as: 'Details' }]
    });

    if (!dcRecord) {
      return res.status(404).json({ success: false, message: 'D/C record not found' });
    }

    // Update main record
    await dcRecord.update({
      order_number: order_number !== undefined ? order_number : dcRecord.order_number,
      distributor_name: distributor_name !== undefined ? distributor_name : dcRecord.distributor_name,
      date: date !== undefined ? date : dcRecord.date,
      notes: notes !== undefined ? notes : dcRecord.notes,
    }, { transaction });

    // Delete all existing details and create new ones (simpler approach)
    await RetailerDCItemDetail.destroy({ where: { dc_id: id }, transaction });

    // Create new details
    const detailsToCreate = items.map(item => ({
      dc_id: id,
      product_name: item.product_name,
      batch_number: item.batch_number || null,
      manufacturing_date: item.manufacturing_date || null,
      expiry_date: item.expiry_date || null,
      quantity: parseInt(item.quantity, 10),
      rate: parseFloat(item.rate),
      mrp: parseFloat(item.mrp),
      tax_rate: item.tax_rate ? parseFloat(item.tax_rate) : 12,
    }));

    await RetailerDCItemDetail.bulkCreate(detailsToCreate, { transaction });
    await transaction.commit();

    // Fetch updated record
    const updatedRecord = await RetailerDCItem.findByPk(id, {
      include: [{ model: RetailerDCItemDetail, as: 'Details' }]
    });

    res.json({
      success: true,
      data: updatedRecord,
      message: 'D/C record updated successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error updating D/C record:', error);
    res.status(500).json({ success: false, message: 'Failed to update D/C record' });
  }
};

export const getDCItemById = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const { id } = req.params;

    const dcRecord = await RetailerDCItem.findOne({
      where: { dc_id: id, retailer_id: retailerId },
      include: [{ model: RetailerDCItemDetail, as: 'Details' }]
    });

    if (!dcRecord) {
      return res.status(404).json({ success: false, message: 'D/C record not found' });
    }

    res.json({ success: true, data: dcRecord });
  } catch (error) {
    console.error('Error fetching D/C record:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch D/C record' });
  }
};

export const createDispute = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const { orderId, itemId, issueType, description } = req.body;

    const order = await RetailerOrder.findOne({
      where: { order_id: orderId, retailer_id: retailerId, status: 'confirmed' }
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const dispute = await OrderDispute.create({
      order_id: orderId,
      item_id: itemId || null,
      issue_type: issueType,
      description
    });

    const notification = await Notification.create({
      user_id: order.distributor_id,
      role: 'distributor',
      title: 'Order Dispute Raised',
      message: `Dispute for order #${order.order_number}`,
      type: 'dispute',
      related_id: dispute.dispute_id
    });
    if (req.io) {
      req.io.to(`distributor_${order.distributor_id}`).emit('newNotification', notification.toJSON());
    }
    res.status(201).json({ success: true,  dispute, message: 'Dispute created' });
  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(500).json({ success: false, message: 'Failed to create dispute' });
  }
};

// controllers/retailerOrderController.js
export const verifyOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const retailerId = req.user.retailer_id;
    const { orderId } = req.params;

    // Fetch order
    const order = await RetailerOrder.findOne({
      where: { 
        order_id: orderId, 
        retailer_id: retailerId, 
        status: 'confirmed', 
        is_verified: false 
      },
      transaction: t
    });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or already verified' 
      });
    }

    // Mark order as verified
    await order.update({ is_verified: true }, { transaction: t });

    // ✅ Resolve all open disputes
    await OrderDispute.update(
      { 
        status: 'resolved',
        resolved_by: retailerId,
        resolution_notes: 'Resolved automatically upon order verification'
      },
      {
        where: { 
          order_id: orderId,
          status: 'open'
        },
        transaction: t
      }
    );

    const notification = await Notification.create({
      user_id: order.distributor_id,
      role: 'distributor',
      title: 'Order Verified',
      message: `Order #${order.order_number} has been verified by retailer`,
      type: 'success',
      related_id: order.order_id
    }, { transaction: t });
    if (req.io) {
      req.io.to(`distributor_${order.distributor_id}`).emit('newNotification', notification.toJSON());
    }

    // Add stock to retailer inventory
    const orderItems = await RetailerOrderItem.findAll({ 
      where: { order_id: orderId },
      transaction: t
    });

    for (const item of orderItems) {
      // ✅ Parse numeric values
      const quantity = parseInt(item.quantity, 10) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;

      // ✅ Normalize expiry_date to Date object for accurate comparison
      const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null;
      if (expiryDate && isNaN(expiryDate.getTime())) {
        console.warn(`Invalid expiry_date for item ${item.item_id}: ${item.expiry_date}`);
        continue; // Skip invalid dates
      }

      // ✅ Find existing stock with SAME batch_number AND expiry_date
      const existingStock = await RetailerStockItem.findOne({
        where: {
          retailer_id: retailerId,
          product_code: item.product_code,
          batch_number: item.batch_number,
          expiry_date: expiryDate // Sequelize handles Date comparison correctly
        },
        transaction: t
      });

      if (existingStock) {
        // ✅ Increment as integer
        await RetailerStockItem.increment('current_stock', {
          by: quantity,
          where: { stock_id: existingStock.stock_id },
          transaction: t
        });
      } else {
        const product = await Product.findOne({ 
          where: { product_code: item.product_code },
          transaction: t
        });

        // ✅ Create new stock item with parsed values
        await RetailerStockItem.create({
          retailer_id: retailerId,
          product_code: item.product_code,
          batch_number: item.batch_number || 'DEFAULT',
          manufacturing_date: new Date(),
          expiry_date: expiryDate,
          quantity: quantity,
          minimum_stock: 0,
          ptr: unitPrice,
          pts: unitPrice * 0.9,
          tax_rate: taxRate,
          current_stock: quantity, // ✅ Integer
          is_expired: false,
          is_critical: false,
          status: 'In Stock',
          schedule: product?.schedule || 'None',
          rack_no: 'DEFAULT'
        }, { transaction: t });
      }
    }

    await t.commit();
    res.json({ 
      success: true, 
      message: 'Order verified, stock added, and disputes resolved' 
    });
  } catch (error) {
    await t.rollback();
    console.error('Error verifying order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify order' 
    });
  }
};
