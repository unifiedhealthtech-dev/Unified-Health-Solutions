// controllers/distributorOrderController.js
import RetailerOrder from '../../../database/models/RetailerOrder.js';
import RetailerOrderItem from '../../../database/models/RetailerOrderItem.js';
import Retailer from '../../../database/models/Retailer.js';
import Product from '../../../database/models/Product.js';
import Notification from '../../../database/models/Notification.js';

// Get orders for distributor
export const getDistributorOrders = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    const { status } = req.query;
    const whereConditions = { distributor_id: distributorId };
    console.log('Query status:', status);
    if (status && status !== 'all') {
      whereConditions.status = status;
    }
const page = parseInt(req.query.page, 10) || 1;
const limit = parseInt(req.query.limit, 10) || 10;

const offset = (page - 1) * limit;

const { count, rows: orders } = await RetailerOrder.findAndCountAll({
  where: whereConditions,
  include: [
    {
      model: Retailer,
      as: 'Retailer',
      attributes: ['retailer_id', 'name', 'phone', 'email']
    },
    {
      model: RetailerOrderItem,
      as: 'items',
      attributes: ['item_id', 'product_code', 'batch_number', 'quantity', 'unit_price', 'total_price'],
      include: [{
        model: Product,
        as: 'Product',
        attributes: ['generic_name', 'unit_size']
      }]
    }
  ],
  distinct: true, // Ensures correct count with joins
  order: [['created_at', 'DESC']],
  limit,
  offset
});

res.json({
  success: true,
  data: {
    orders,
    pagination: {
      current_page: page,
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

// Update order status (accept/reject)
export const updateOrderStatus = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    const { orderId } = req.params;
    const { status, reason } = req.body;

    // Map 'rejected' → 'cancelled' for DB compatibility
    const dbStatus = status === 'confirmed' ? 'confirmed' : 'cancelled';
    const actionTitle = status === 'confirmed' ? 'confirmed' : 'cancelled';

    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await RetailerOrder.findOne({
      where: { order_id: orderId, distributor_id: distributorId }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Order is already ${order.status}` 
      });
    }

    const action = status === 'confirmed' ? 'confirmed' : 'cancelled';
const defaultReason = action === 'confirmed' 
  ? 'Order confirmed successfully.' 
  : 'Order was rejected by distributor.';
const finalReason = reason?.trim() || defaultReason;

// Update order
await order.update({
  status: action,
  notes: finalReason // Store in order notes
});

// Create notification for retailer
const notification = await Notification.create({
  user_id: order.retailer_id,
  role: 'retailer',
  title: action === 'confirmed' ? 'Order Confirmed' : 'Order Rejected',
  message: `Your order #${order.order_number} has been ${action}. Reason: ${finalReason}`,
  type: action === 'confirmed' ? 'success' : 'rejected',
  related_id: order.order_id
});

    if (req.io) {
      req.io.to(`retailer_${order.retailer_id}`).emit('newNotification', notification.toJSON());
    }
res.json({
      success: true,
      data: order,
      message: `Order ${actionTitle} successfully`
    });

  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

