import { Op } from "sequelize";
import sequelize from "../../../database/db.js";
import RetailerOrder from "../../../database/models/RetailerOrder.js";
import RetailerOrderItem from "../../../database/models/RetailerOrderItem.js";
import DistributorStockItem from "../../../database/models/DistributorStockItem.js";
import Product from "../../../database/models/Product.js";
import Retailer from "../../../database/models/Retailer.js";
import Notification from "../../../database/models/Notification.js";
import OrderDispute from "../../../database/models/OrderDispute.js";
import ManualOrder from "../../../database/models/ManualOrder.js";
import ManualOrderItem from "../../../database/models/ManualOrderItem.js";
import Distributor from "../../../database/models/Distributor.js";

const getStockStatus = (currentStock, minStock) => {
  if (currentStock <= 0) return "Expired";
  if (currentStock <= minStock * 0.3) return "Critical";
  if (currentStock <= minStock) return "Low Stock";
  return "In Stock";
};

export const createManualOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const distributorId = req.user.distributor_id;
    const { retailer_info, items, notes } = req.body;

    console.log('Creating manual order for distributor:', distributorId);
    console.log('Retailer info:', retailer_info);
    console.log('Items:', items);

    // Validate required fields
    if (!retailer_info || !retailer_info.name || !retailer_info.phone) {
      await t.rollback();
      return res.status(400).json({ 
        success: false, 
        message: "Retailer name and phone are required" 
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ 
        success: false, 
        message: "At least one product item is required" 
      });
    }

    // Generate order number
    const orderCount = await ManualOrder.count({ 
      where: { distributor_id: distributorId },
      transaction: t 
    });
    const orderNumber = `ORD-M${String(orderCount + 1).padStart(6, '0')}`;

    // Calculate totals
    let totalAmount = 0;
    let totalItems = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.product_name || !item.quantity || item.quantity <= 0) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Product name and valid quantity are required for all items"
        });
      }

      const unitPrice = item.unit_price || 0;
      const itemTotal = item.quantity * unitPrice;
      totalAmount += itemTotal;
      totalItems += item.quantity;

      orderItems.push({
        product_name: item.product_name,
        product_code: item.product_code || 'MANUAL',
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: itemTotal
      });
    }

    // Create manual order
    const order = await ManualOrder.create({
      order_number: orderNumber,
      distributor_id: distributorId,
      retailer_name: retailer_info.name,
      retailer_phone: retailer_info.phone,
      retailer_address: retailer_info.address || '',
      retailer_email: retailer_info.email || '',
      total_amount: totalAmount,
      total_items: totalItems,
      status: 'processing',
      notes: notes || 'Manual order created by distributor',
      invoice_number: null
    }, { transaction: t });

    // Create manual order items
    for (const itemData of orderItems) {
      await ManualOrderItem.create({
        order_id: order.order_id,
        ...itemData
      }, { transaction: t });
    }

    await t.commit();

    console.log('Manual order created successfully:', order.order_id);

    res.status(201).json({
      success: true,
      message: "Manual order created successfully",
      data: order
    });
  } catch (error) {
    await t.rollback();
    console.error("Error creating manual order:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create manual order",
      error: error.message 
    });
  }
};

export const updateManualOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const distributorId = req.user.distributor_id;
    const { order_id } = req.params;
    const { retailer_info, items, notes, status } = req.body;

    const order = await ManualOrder.findOne({
      where: { 
        order_id, 
        distributor_id: distributorId
      },
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ 
        success: false, 
        message: "Manual order not found" 
      });
    }

    if (status && ['pending', 'processing', 'confirmed', 'cancelled'].includes(status)) {
      await order.update({ status }, { transaction: t });
      
      if (status === 'confirmed' && !order.invoice_number) {
        const invoiceNumber = `INV-${order.order_number.replace("ORD-", "")}`;
        await order.update({ invoice_number: invoiceNumber }, { transaction: t });
      }
    }

    if (retailer_info) {
      await order.update({
        retailer_name: retailer_info.name || order.retailer_name,
        retailer_phone: retailer_info.phone || order.retailer_phone,
        retailer_address: retailer_info.address || order.retailer_address,
        retailer_email: retailer_info.email || order.retailer_email,
      }, { transaction: t });
    }

    if (items && Array.isArray(items)) {
      await ManualOrderItem.destroy({
        where: { order_id },
        transaction: t
      });

      let totalAmount = 0;
      let totalItems = 0;

      for (const item of items) {
        if (!item.product_name || !item.quantity || item.quantity <= 0) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: "Product name and valid quantity are required for all items"
          });
        }

        const itemTotal = item.quantity * (item.unit_price || 0);
        totalAmount += itemTotal;
        totalItems += item.quantity;

        await ManualOrderItem.create({
          order_id,
          product_name: item.product_name,
          product_code: item.product_code || 'MANUAL',
          quantity: item.quantity,
          unit_price: item.unit_price || 0,
          total_price: itemTotal
        }, { transaction: t });
      }

      await order.update({
        total_amount: totalAmount,
        total_items: totalItems,
        notes: notes || order.notes
      }, { transaction: t });
    } else if (notes) {
      await order.update({ notes }, { transaction: t });
    }

    await t.commit();

    res.json({
      success: true,
      message: "Manual order updated successfully",
      data: order
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ 
      success: false, 
      message: "Failed to update manual order"
    });
  }
};

export const getDistributorOrders = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    const { status, page = 1, limit = 10, order_type = 'all' } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // --- Batch helper (only for automatic orders) ---
    const getAvailableBatches = async (distributorId, productCode) => {
      const batches = await DistributorStockItem.findAll({
        where: {
          distributor_id: distributorId,
          product_code: productCode,
          current_stock: { [Op.gt]: 0 },
          expiry_date: { [Op.gte]: new Date() },
          is_expired: false,
        },
        attributes: [
          "stock_id",
          "batch_number",
          "expiry_date",
          "current_stock",
          "ptr",
          "pts",
          "tax_rate",
          "product_code"
        ],
        order: [['expiry_date', 'ASC']]
      });

      return batches.map(batch => {
        const plain = batch.toJSON ? batch.toJSON() : batch;
        return {
          stock_id: plain.stock_id,
          batch_number: plain.batch_number,
          expiry_date: plain.expiry_date,
          current_stock: parseFloat(plain.current_stock),
          ptr: parseFloat(plain.ptr),
          pts: parseFloat(plain.pts),
          tax_rate: parseFloat(plain.tax_rate),
          product_code: plain.product_code
        };
      });
    };

    // --- Enrich ONLY automatic orders ---
    const enrichAutomaticOrder = async (order) => {
      const orderPlain = order.toJSON ? order.toJSON() : order;
      const isBillable = ['processing', 'pending'].includes(orderPlain.status);

      if (isBillable) {
        const enrichedItems = [];
        for (const item of orderPlain.items || []) {
          const batches = item.product_code
            ? await getAvailableBatches(distributorId, item.product_code)
            : [];
          enrichedItems.push({ ...item, available_batches: batches });
        }
        orderPlain.items = enrichedItems;
      } else {
        // Ensure consistent shape
        orderPlain.items = (orderPlain.items || []).map(i => ({
          ...i,
          available_batches: i.available_batches || []
        }));
      }

      return { ...orderPlain, is_manual: false };
    };

    // --- Process manual orders (NO Product include, NO batches) ---
    const processManualOrder = (order) => {
      const orderPlain = order.toJSON ? order.toJSON() : order;
      orderPlain.items = (orderPlain.items || []).map(item => ({
        ...item,
        available_batches: [], // manual orders never use batches
        Product: null // no association, so explicitly null
      }));
      return { ...orderPlain, is_manual: true };
    };

    let allOrders = [];
    let totalCount = 0;

    // --- Fetch AUTOMATIC orders (with Product association) ---
    if (order_type === 'automatic' || order_type === 'all') {
      const whereClause = { distributor_id: distributorId };
      if (status && status !== 'all') whereClause.status = status;

      const automaticResult = await RetailerOrder.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: RetailerOrderItem,
            as: 'items',
            required: false,
            include: [{
              model: Product,
              as: 'Product',
              attributes: ['generic_name', 'unit_size'],
              required: false
            }]
          },
          {
            model: Retailer,
            as: 'Retailer',
            attributes: ['name', 'phone', 'email', 'address'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']],
        distinct: true
      });

      const enrichedAutomatic = [];
      for (const order of automaticResult.rows) {
        enrichedAutomatic.push(await enrichAutomaticOrder(order));
      }

      if (order_type === 'automatic') {
        allOrders = enrichedAutomatic;
        totalCount = automaticResult.count;
      } else {
        allOrders.push(...enrichedAutomatic);
        totalCount += automaticResult.count;
      }
    }

    // --- Fetch MANUAL orders (NO Product include) ---
    if (order_type === 'manual' || order_type === 'all') {
      const whereClause = { distributor_id: distributorId };
      if (status && status !== 'all') whereClause.status = status;

      const manualResult = await ManualOrder.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: ManualOrderItem,
            as: 'items',
            required: false
            // ⚠️ NO include of Product — it's not associated!
          }
        ],
        order: [['created_at', 'DESC']],
        distinct: true
      });

      const processedManual = manualResult.rows.map(processManualOrder);

      if (order_type === 'manual') {
        allOrders = processedManual;
        totalCount = manualResult.count;
      } else {
        allOrders.push(...processedManual);
        totalCount += manualResult.count;
      }
    }

    // --- Final sort & paginate (only for 'all') ---
    if (order_type === 'all') {
      allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const startIndex = offset;
      const endIndex = startIndex + limitNum;
      allOrders = allOrders.slice(startIndex, endIndex);
    }

    const pagination = {
      current_page: pageNum,
      total_pages: Math.ceil(totalCount / limitNum),
      total_orders: totalCount,
      limit: limitNum
    };

    res.json({
      success: true,
      data: {
        orders: allOrders,
        pagination
      },
      message: "Orders retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching distributor orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};
export const deleteManualOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const distributorId = req.user.distributor_id;
    const { order_id } = req.params;

    const order = await ManualOrder.findOne({
      where: { 
        order_id, 
        distributor_id: distributorId
      },
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ 
        success: false, 
        message: "Manual order not found" 
      });
    }

    await ManualOrderItem.destroy({
      where: { order_id },
      transaction: t
    });

    await order.destroy({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: "Manual order deleted successfully"
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete manual order" 
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    const { orderId } = req.params;

    // Check if it's a manual order first
    let order = await ManualOrder.findOne({
      where: { 
        order_id: orderId, 
        distributor_id: distributorId 
      },
      include: [
        {
          model: ManualOrderItem,
          as: 'items',
          required: false
        }
      ]
    });

    if (order) {
      // It's a manual order
      const orderPlain = order.toJSON();
      orderPlain.is_manual = true;
      
      return res.json({
        success: true,
        data: orderPlain,
        message: "Manual order retrieved successfully",
      });
    }

    // If not manual, check automatic orders
    order = await RetailerOrder.findOne({
      where: { 
        order_id: orderId, 
        distributor_id: distributorId 
      },
      include: [
        {
          model: Retailer,
          as: "Retailer",
          attributes: ["retailer_id", "name", "phone", "email", "address"],
        },
        {
          model: RetailerOrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["product_code", "generic_name", "unit_size", "mrp", "manufacturer"],
            },
          ],
        },
        {
          model: OrderDispute,
          as: 'disputes',
          required: false
        }
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Enrich with available batches for processing orders
    const orderPlain = order.toJSON();
    orderPlain.is_manual = false;
    
    if (orderPlain.status === "processing") {
      const enrichedItems = [];
      for (const item of orderPlain.items) {
        const batches = await DistributorStockItem.findAll({
          where: {
            distributor_id: distributorId,
            product_code: item.product_code,
            current_stock: { [Op.gt]: 0 },
            expiry_date: { [Op.gte]: new Date() },
            is_expired: false,
          },
          attributes: [
            "stock_id",
            "batch_number",
            "expiry_date",
            "current_stock",
            "ptr",
            "pts",
            "tax_rate",
          ],
        });

        const batchData = batches.map((b) => {
          const batchPlain = b.toJSON ? b.toJSON() : b.dataValues;
          return {
            stock_id: batchPlain.stock_id,
            batch_number: batchPlain.batch_number,
            expiry_date: batchPlain.expiry_date,
            current_stock: parseFloat(batchPlain.current_stock),
            ptr: parseFloat(batchPlain.ptr),
            pts: parseFloat(batchPlain.pts),
            tax_rate: parseFloat(batchPlain.tax_rate),
          };
        });

        enrichedItems.push({
          ...item,
          available_batches: batchData,
        });
      }
      orderPlain.items = enrichedItems;
    }

    res.json({
      success: true,
      data: orderPlain,
      message: "Order retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};

export const confirmOrder = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    const { orderId } = req.params;

    const order = await RetailerOrder.findOne({
      where: { order_id: orderId, distributor_id: distributorId },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ success: false, message: `Order is already ${order.status}` });
    }

    const invoiceNumber = `INV-${order.order_number.replace("ORD-", "")}`;
    await order.update({
      status: "processing",
      invoice_number: invoiceNumber
    });

    res.json({
      success: true,
      message: "Order confirmed and moved to billing",
      data: order,
    });
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ success: false, message: "Failed to confirm order" });
  }
};

export const rejectOrder = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required" });
    }

    const order = await RetailerOrder.findOne({
      where: { order_id: orderId, distributor_id: distributorId },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: `Order is already ${order.status}` });
    }

    await order.update({
      status: "cancelled",
      notes: `Rejected by distributor: ${reason.trim()}`,
    });

    const notification = await Notification.create({
      user_id: order.retailer_id,
      role: "retailer",
      title: "Order Rejected",
      message: `Your order #${order.order_number} was rejected: ${reason}`,
      type: "rejected",
      related_id: order.order_id,
    });

    if (req.io) {
      req.io
        .to(`retailer_${order.retailer_id}`)
        .emit("newNotification", notification.toJSON());
    }

    res.json({
      success: true,
      message: "Order rejected successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error rejecting order:", error);
    res.status(500).json({ success: false, message: "Failed to reject order" });
  }
};

export const exportOrders = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    const { status = "all", startDate, endDate, order_type = "all" } = req.query;

    let orders = [];

    if (order_type === 'automatic' || order_type === 'all') {
      const where = { distributor_id: distributorId };
      if (status !== "all") {
        where.status = status;
      }
      if (startDate && endDate) {
        where.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const automaticOrders = await RetailerOrder.findAll({
        where,
        include: [
          {
            model: Retailer,
            as: "Retailer",
            attributes: ["name", "phone", "email"],
          },
          {
            model: RetailerOrderItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "Product",
                attributes: ["generic_name", "unit_size"],
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      orders = orders.concat(automaticOrders.map(order => ({
        ...order.toJSON(),
        is_manual: false,
        type: 'Automatic'
      })));
    }

    if (order_type === 'manual' || order_type === 'all') {
      const where = { distributor_id: distributorId };
      if (status !== "all") {
        where.status = status;
      }
      if (startDate && endDate) {
        where.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const manualOrders = await ManualOrder.findAll({
        where,
        include: [
          {
            model: ManualOrderItem,
            as: 'items',
            required: false
          }
        ],
        order: [["created_at", "DESC"]],
      });

      orders = orders.concat(manualOrders.map(order => ({
        ...order.toJSON(),
        is_manual: true,
        type: 'Manual',
        retailer_name: order.retailer_name,
        retailer_phone: order.retailer_phone
      })));
    }

    // Convert to CSV format
    const csvData = orders.map(order => ({
      'Order Number': order.order_number,
      'Type': order.type,
      'Retailer Name': order.is_manual ? order.retailer_name : (order.Retailer?.name || 'N/A'),
      'Retailer Phone': order.is_manual ? order.retailer_phone : (order.Retailer?.phone || 'N/A'),
      'Total Amount': order.total_amount,
      'Total Items': order.total_items,
      'Status': order.status,
      'Order Date': order.created_at.toISOString().split('T')[0],
      'Invoice Number': order.invoice_number || 'N/A'
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${Date.now()}.csv`);

    // Simple CSV conversion
    if (csvData.length > 0) {
      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).map(field => 
        `"${String(field).replace(/"/g, '""')}"`
      ).join(','));
      const csv = [headers, ...rows].join('\n');
      res.send(csv);
    } else {
      res.send('No data to export');
    }
  } catch (error) {
    console.error("Error exporting orders:", error);
    res.status(500).json({ success: false, message: "Failed to export orders" });
  }
};

export const getBillingDetails = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    const { orderId } = req.params;
    console.log('Distributor ID:', distributorId);
    console.log('Order ID:', orderId);
    console.log('Fetching billing details for order:', orderId, 'distributor:', distributorId);

    const order = await RetailerOrder.findOne({
      where: {
        order_id: orderId,
        distributor_id: distributorId,
        status: "processing",
      },
      include: [
        { 
          model: Retailer, 
          as: "Retailer", 
          attributes: ["name", "phone", "email", "address"] 
        },
        {
          model: RetailerOrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: [ "product_code", "generic_name", "unit_size", "mrp"],
            },
          ],
        },
      ],
    });

    if (!order) {
      console.log('Order not found or not in processing status');
      return res.status(404).json({
        success: false,
        message: "Order not found or not ready for billing",
      });
    }

    console.log('Order found, processing items:', order.items.length);

    const enrichedItems = [];
    for (const item of order.items) {
      console.log('Checking stock for product:', item.product_code);
      
      const batches = await DistributorStockItem.findAll({
        where: {
          distributor_id: distributorId,
          product_code: item.product_code,
          current_stock: { [Op.gt]: 0 },
          expiry_date: { [Op.gte]: new Date() },
          is_expired: false,
        },
        attributes: [
          "stock_id",
          "batch_number",
          "expiry_date",
          "current_stock",
          "ptr",
          "pts",
          "tax_rate",
        ],
        order: [['expiry_date', 'ASC']] // Oldest first for FIFO
      });

      console.log(`Found ${batches.length} batches for product ${item.product_code}`);

      enrichedItems.push({
        ...item.toJSON(),
        available_batches: batches.map((batch) => ({
          stock_id: batch.stock_id,
          batch_number: batch.batch_number,
          expiry_date: batch.expiry_date,
          current_stock: parseFloat(batch.current_stock),
          ptr: parseFloat(batch.ptr),
          pts: parseFloat(batch.pts),
          tax_rate: parseFloat(batch.tax_rate || 0),
        })),
      });
    }

    res.json({
      success: true,
      data: { 
        ...order.toJSON(), 
        items: enrichedItems, 
        is_manual: false 
      },
      message: "Billing details retrieved",
    });
  } catch (error) {
    console.error("Error fetching billing details:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to load billing details",
      error: error.message 
    });
  }
};

export const generateInvoice = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const distributorId = req.user.distributor_id;
    const { order_id, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items provided" });
    }

    // Fetch order in "processing" status
    const order = await RetailerOrder.findOne({
      where: { order_id, distributor_id: distributorId, status: "processing" },
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Order not found or not in "processing" status' });
    }

    // Load existing order items
    const orderItems = await RetailerOrderItem.findAll({ where: { order_id }, transaction: t });
    const orderItemMap = new Map(orderItems.map(item => [item.item_id, item]));

    // Validate and update each item
    for (const inputItem of items) {
      const { retailer_order_item_id, stock_id, quantity } = inputItem;
      const orderItem = orderItemMap.get(retailer_order_item_id);

      if (!orderItem) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Invalid order item ID: ${retailer_order_item_id}` });
      }

      if (quantity !== orderItem.quantity) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Quantity mismatch for ${orderItem.product_code}` });
      }

      // Validate stock batch
      const stockItem = await DistributorStockItem.findOne({
        where: {
          stock_id,
          distributor_id: distributorId,
          product_code: orderItem.product_code,
          current_stock: { [Op.gte]: quantity },
          expiry_date: { [Op.gte]: new Date() }
        },
        transaction: t
      });

      if (!stockItem) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Invalid, insufficient, or expired stock for batch ${stock_id} (Product: ${orderItem.product_code})` });
      }

      // Update order item with real batch details
      const expiryDateForUpdate = stockItem.expiry_date ? new Date(stockItem.expiry_date) : null;
      await orderItem.update({
        stock_id: stockItem.stock_id,
        batch_number: stockItem.batch_number,
        expiry_date: expiryDateForUpdate,
        unit_price: parseFloat(stockItem.ptr),
        tax_rate: parseFloat(stockItem.tax_rate || 0)
      }, { transaction: t });

      console.log(`Updated order item ${retailer_order_item_id}: Batch ${stockItem.batch_number}, Expiry ${expiryDateForUpdate}, Price ${stockItem.ptr}`);

      // Deduct stock
      await DistributorStockItem.decrement('current_stock', {
        by: quantity,
        where: { stock_id },
        transaction: t
      });
    }

    // Finalize order
    const invoiceNumber = `INV-${order.order_number.replace("ORD-", "")}`;
    await order.update({
      status: "confirmed",
      invoice_number: invoiceNumber
    }, { transaction: t });

    // Notify retailer
    const notification = await Notification.create({
      user_id: order.retailer_id,
      role: "retailer",
      title: "Order Confirmed & Invoiced",
      message: `Your order #${order.order_number} has been confirmed.`,
      type: "success",
      related_id: order.order_id
    }, { transaction: t });

    if (req.io) {
      req.io.to(`retailer_${order.retailer_id}`).emit("newNotification", notification.toJSON());
    }

    await t.commit();

    res.json({ success: true, message: "Invoice generated and stock updated", data: { order_id, invoice_number: invoiceNumber } });
  } catch (error) {
    await t.rollback();
    console.error("Invoice generation error:", error);
    res.status(500).json({ success: false, message: "Failed to generate invoice", error: error.message });
  }
};

export const getDisputes = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    const { status = 'open' } = req.query;

    // Get all disputes
    const disputes = await OrderDispute.findAll({
      where: status !== 'all' ? { status } : {},
      order: [['created_at', 'DESC']]
    });
    // Filter disputes by distributor and enrich with order data
    const disputesWithOrders = [];

    for (const dispute of disputes) {
      const order = await RetailerOrder.findOne({
        where: { 
          order_id: dispute.order_id,
          distributor_id: distributorId 
        },
        include: [{
          model: Retailer,
          as: 'Retailer',
          attributes: ['retailer_id', 'name', 'phone']
        }]
      });

      if (order) {
        disputesWithOrders.push({
          ...dispute.toJSON(),
          RetailerOrder: order
        });
      }
    }

    res.json({
      success: true,
      data: disputesWithOrders,
      message: 'Disputes retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch disputes'
    });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    const { disputeId } = req.params;
    const { resolutionNotes, action } = req.body;

    // Find dispute
    const dispute = await OrderDispute.findByPk(disputeId);

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    // Verify order belongs to distributor
    const order = await RetailerOrder.findOne({
      where: { 
        order_id: dispute.order_id,
        distributor_id: distributorId 
      }
    });

    if (!order) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Handle resolution
    if (action === 'reinvoice') {
      await order.update({ status: 'processing' });
      
      await Notification.create({
        user_id: order.retailer_id,
        role: 'retailer',
        title: 'Order Reopened for Billing',
        message: `Order #${order.order_number} reopened due to dispute resolution`,
        type: 'info',
        related_id: order.order_id
      });
    }

    await dispute.update({
      status: 'resolved',
      resolved_by: distributorId,
      resolution_notes: resolutionNotes
    });

    res.json({ success: true, message: 'Dispute resolved successfully' });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resolve dispute'
    });
  }
};


// Test endpoint for debugging
export const testOrders = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    
    const manualCount = await ManualOrder.count({ 
      where: { distributor_id: distributorId } 
    });
    
    const automaticCount = await RetailerOrder.count({ 
      where: { distributor_id: distributorId } 
    });

    res.json({
      success: true,
      data: {
        manual_orders: manualCount,
        automatic_orders: automaticCount,
        distributor_id: distributorId
      }
    });
  } catch (error) {
    console.error("Test error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};