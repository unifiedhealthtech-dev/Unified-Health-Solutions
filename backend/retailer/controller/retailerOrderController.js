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

// ✅ Search medicines from connected distributors
export const searchMedicines = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const { search, distributorId } = req.query;

    if (!search) {
      return res.status(400).json({ success: false, message: 'Search term is required' });
    }

    let whereConditions = {};

    // If distributorId is provided, search only in that distributor
    if (distributorId && distributorId !== 'all') {
      // Check if retailer is connected to this distributor
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

      whereConditions.distributor_id = distributorId;
    } else {
      // Get all connected distributor IDs
      const connections = await ConnectedDistributors.findAll({
        where: { retailer_id: retailerId, status: 'connected' }
      });

      if (connections.length === 0) {
        return res.json({ success: true, data: [], message: 'No connected distributors' });
      }

      const distributorIds = connections.map(conn => conn.distributor_id);
      whereConditions.distributor_id = { [Op.in]: distributorIds };
    }

    // Add search conditions
  whereConditions[Op.and] = [
  {
    [Op.or]: [
      { '$Product.generic_name$': { [Op.iLike]: `%${search}%` } },
      { '$Product.product_code$': { [Op.iLike]: `%${search}%` } }
    ]
  }
];

    const medicines = await DistributorStockItem.findAll({
      include: [
        {
          model: Product,
          as: 'Product',
          attributes: [
            'product_code', 'generic_name', 'unit_size', 'mrp', 'category', 'hsn_code'
            // Removed brand_name and schedule
          ]
        },
        {
          model: Distributor,
          as: 'Distributor',
          attributes: ['distributor_id', 'name', 'phone', 'email']
        }
      ],
      where: whereConditions,
      attributes: [
        'stock_id', 'distributor_id', 'product_code', 'batch_number',
        'expiry_date', 'current_stock', 'ptr', 'pts', 'tax_rate', 'manufacturing_date'
      ],
      order: [
        ['current_stock', 'DESC'],
        ['Product', 'generic_name', 'ASC']
      ]
    });

    const formattedMedicines = medicines.map(medicine => ({
      stock_id: medicine.stock_id,
      distributor: {
        id: medicine.Distributor.distributor_id,
        name: medicine.Distributor.name,
        contact: medicine.Distributor.phone
      },
      product: {
        id: medicine.Product.product_code,
        code: medicine.Product.product_code,
        name: medicine.Product.generic_name,
        // Removed brand and schedule
        unit_size: medicine.Product.unit_size,
        mrp: Number(medicine.Product.mrp),
        category: medicine.Product.category
      },
      batch_info: {
        batch_number: medicine.batch_number,
        expiry_date: medicine.expiry_date,
        current_stock: medicine.current_stock,
        ptr: Number(medicine.ptr),
        pts: Number(medicine.pts),
        tax_rate: Number(medicine.tax_rate),
        manufacturing_date: medicine.manufacturing_date
      },
      availability: medicine.current_stock > 0 ? 'available' : 'out_of_stock'
    }));

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

// ✅ Get distributor stock (browse products)
export const getDistributorStock = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const { distributorId, search, page = 1, limit = 20 } = req.query;

    // Get connected distributors
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
    
    // If specific distributor is selected
    if (distributorId && distributorId !== 'all') {
      if (!distributorIds.includes(parseInt(distributorId))) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not connected to this distributor' 
        });
      }
      distributorIds = [parseInt(distributorId)];
    }

    // Build search conditions
    const whereConditions = {
      distributor_id: { [Op.in]: distributorIds },
      current_stock: { [Op.gt]: 0 } // Only show available stock
    };

    if (search && search.trim() !== '') {
      whereConditions[Op.or] = [
        { '$Product.generic_name$': { [Op.iLike]: `%${search}%` } },
        { '$Product.product_code$': { [Op.iLike]: `%${search}%` } },
        // Removed brand_name
        { batch_number: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: stockItems } = await DistributorStockItem.findAndCountAll({
      include: [
        {
          model: Product,
          as: 'Product',
          attributes: [
            'product_code', 'generic_name', 'unit_size', 'mrp', 'category', 'hsn_code'
            // Removed brand_name and schedule
          ]
        },
        {
          model: Distributor,
          as: 'Distributor',
          attributes: ['distributor_id', 'name', 'phone', 'email']
        }
      ],
      where: whereConditions,
      attributes: [
        'stock_id', 'batch_number', 'expiry_date', 'current_stock',
        'ptr', 'pts', 'tax_rate', 'manufacturing_date'
      ],
      order: [
        ['Distributor', 'name', 'ASC'],
        ['Product', 'generic_name', 'ASC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const formattedData = stockItems.map(item => ({
      stock_id: item.stock_id,
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
        // Removed brand and schedule
        unit_size: item.Product.unit_size,
        mrp: Number(item.Product.mrp),
        category: item.Product.category,
        hsn_code: item.Product.hsn_code
      },
      batch_info: {
        batch_number: item.batch_number,
        expiry_date: item.expiry_date,
        current_stock: item.current_stock,
        ptr: Number(item.ptr),
        pts: Number(item.pts),
        tax_rate: Number(item.tax_rate),
        manufacturing_date: item.manufacturing_date
      },
      availability: item.current_stock > 0 ? 'available' : 'out_of_stock'
    }));

    const distributors = connections.map(conn => ({
      id: conn.Distributor.distributor_id,
      name: conn.Distributor.name,
      phone: conn.Distributor.phone
    }));

    res.json({
      success: true,
      data: formattedData,
      distributors: distributors,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        hasNext: page * limit < count
      },
      message: 'Distributor stock retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching distributor stock:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch distributor stock' });
  }
};

// ✅ Create order from retailer to distributor
export const createOrder = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const retailerName = req.user.name;
    const { distributorId, items, notes } = req.body;

    // Validate input
    if (!distributorId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Distributor ID and items are required' 
      });
    }

    // Check connection
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

    // Validate stock availability and calculate totals
    let totalAmount = 0;
    let totalItems = 0;
    const orderItems = [];
    const stockUpdates = [];

    for (const item of items) {
      const stock = await DistributorStockItem.findOne({
        where: { 
          stock_id: item.stock_id,
          distributor_id: distributorId
        },
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['product_code', 'generic_name'] // Only select existing fields
        }]
      });

      if (!stock) {
        return res.status(400).json({
          success: false,
          message: `Product not found in distributor stock`
        });
      }

      if (stock.current_stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${stock.Product.generic_name}. Available: ${stock.current_stock}`
        });
      }

      const itemTotal = stock.ptr * item.quantity;
      totalAmount += itemTotal;
      totalItems += item.quantity;

      orderItems.push({
        product_code: stock.product_code, // Use product_code from stock
        stock_id: item.stock_id,
        // Removed the duplicate 'product_code: item.product_code,' line
        batch_number: stock.batch_number,
        quantity: item.quantity,
        unit_price: stock.ptr,
        total_price: itemTotal,
        tax_rate: stock.tax_rate
      });

      // Prepare stock update
      stockUpdates.push({
        stock_id: stock.stock_id,
        newStock: stock.current_stock - item.quantity
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

    // Create order items
    await RetailerOrderItem.bulkCreate(
      orderItems.map(item => ({
        ...item,
        order_id: order.order_id
      }))
    );

    // Update distributor stock (reserve the items)
    for (const update of stockUpdates) {
      await DistributorStockItem.update(
        { current_stock: update.newStock },
        { where: { stock_id: update.stock_id } }
      );
    }

    // Create notification for distributor
    const notification = await Notification.create({
      user_id: distributorId,
      role: 'distributor',
      title: 'New Order Received',
      message: `New order #${order.order_number} from ${retailerName}`,
      type: 'new order',
      related_id: order.order_id,
    });

    // Emit real-time notification
  if (req.io) {
      req.io.to(`distributor_${distributorId}`).emit('newNotification', notification.toJSON()
);
    }

    res.status(201).json({
      success: true,
      data: {
        order: order.toJSON(),
        items: orderItems
      },
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// ✅ Get orders for retailer
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
          attributes: ['distributor_id', 'name', 'phone', 'email']
        },
        {
          model: RetailerOrderItem,
          as: 'items', // ✅ match model alias
          attributes: ['item_id', 'product_code', 'batch_number', 'quantity', 'unit_price', 'total_price'],
          include: [{
            model: Product,
            as: 'Product',
            attributes: ['generic_name', 'unit_size']
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
// ✅ Get order details
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
          as: 'items', // ✅ match model alias
          attributes: ['item_id', 'product_code', 'batch_number', 'quantity', 'unit_price', 'total_price', 'tax_rate'],
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
// ✅ Cancel order
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

    // Restore stock
    const orderItems = await RetailerOrderItem.findAll({
      where: { order_id: orderId }
    });

    for (const item of orderItems) {
      await DistributorStockItem.increment('current_stock', {
        by: item.quantity,
        where: { stock_id: item.stock_id }
      });
    }

    // Update order status
    await order.update({ 
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled by retailer'
    });

    // Create notification for distributor
    const notification = await Notification.create({
      user_id: order.distributor_id,
      role: 'distributor',
      title: 'Order Cancelled',
      message: `Order #${order.order_number} has been cancelled by retailer`,
      type: 'order cancelled',
      related_id: order.order_id
    });

    // Emit real-time notification
  if (req.io) {
      req.io.to(`distributor_${order.distributor_id}`).emit('newNotification', notification.toJSON()
);
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

// ✅ Get order statistics
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
      where: { retailer_id: retailerId, status: ['confirmed', 'delivered'] } 
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


// ✅ Get all D/C items for retailer
export const getDCItems = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    console.log(retailerId);
    const items = await RetailerDCItem.findAll({
      where: { retailer_id: retailerId },
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching D/C items:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch D/C items' });
  }
};

// ✅ Create new D/C item
export const createDCItem = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    
    const {
      product_code,
      product_name,
      batch_number,
      quantity,
      rate,
      mrp,
      tax_rate = 12,
      distributor_name
    } = req.body;

    if (!product_code || !product_name || !distributor_name || !quantity || !rate || !mrp) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newItem = await RetailerDCItem.create({
      retailer_id: retailerId,
      product_code,
      product_name,
      batch_number: batch_number || 'MANUAL',
      quantity: parseInt(quantity),
      rate: parseFloat(rate),
      mrp: parseFloat(mrp),
      tax_rate: parseFloat(tax_rate),
      distributor_name
    });

    res.status(201).json({ success: true, data: newItem, message: 'D/C item added successfully' });
  } catch (error) {
    console.error('Error creating D/C item:', error);
    res.status(500).json({ success: false, message: 'Failed to add D/C item' });
  }
};

// ✅ Delete D/C item
export const deleteDCItem = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const { id } = req.params;

    const item = await RetailerDCItem.findOne({ where: { dc_item_id: id, retailer_id: retailerId } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'D/C item not found' });
    }

    await item.destroy();
    res.json({ success: true, message: 'D/C item deleted successfully' });
  } catch (error) {
    console.error('Error deleting D/C item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete D/C item' });
  }
};