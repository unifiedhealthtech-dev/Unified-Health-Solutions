// src/routes/distributorOrderRoutes.js
import express from 'express';
import {
  getDistributorOrders,
  confirmOrder,
  rejectOrder,
  getOrderById,
  exportOrders,
  createManualOrder,
  updateManualOrder,
  deleteManualOrder,
  getBillingDetails,
  generateInvoice,
  resolveDispute,
  getDisputes,
} from '../controller/distributorOrderControllerApi.js';
import distributorAuth from '../middleware/authMiddleware.js';

const distributorOrderRouter = express.Router();

// Static routes FIRST
distributorOrderRouter.get('/', distributorAuth, getDistributorOrders);
distributorOrderRouter.get('/export', distributorAuth, exportOrders);
distributorOrderRouter.get('/disputes/list', distributorAuth, getDisputes); // ✅ moved up

// Dynamic routes AFTER
distributorOrderRouter.get('/:orderId', distributorAuth, getOrderById);
distributorOrderRouter.get('/billing/:orderId', distributorAuth, getBillingDetails);

// Actions
distributorOrderRouter.put('/confirm/:orderId', distributorAuth, confirmOrder);
distributorOrderRouter.put('/reject/:orderId', distributorAuth, rejectOrder);

// Manual orders
distributorOrderRouter.post('/manual', distributorAuth, createManualOrder);
distributorOrderRouter.put('/manual/:order_id', distributorAuth, updateManualOrder);
distributorOrderRouter.delete('/manual/:order_id', distributorAuth, deleteManualOrder);

// Billing and disputes
distributorOrderRouter.post('/billing/generate', distributorAuth, generateInvoice);
distributorOrderRouter.patch('/disputes/:disputeId/resolve', distributorAuth, resolveDispute);

export default distributorOrderRouter;