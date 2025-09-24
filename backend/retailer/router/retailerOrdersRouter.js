// routes/retailer/orders.js
import express from 'express';
import {
  getConnectedDistributorsList,
  searchMedicines,
  getDistributorStock,
  createOrder,
  getRetailerOrders,
  getOrderDetails,
  cancelOrder,
  getOrderStatistics
} from '../controller/retailerOrderController.js';
import retailerAuth from '../middleware/authMiddleware.js';

const retailerOrdersRouter = express.Router();

// GET APIs
retailerOrdersRouter.get('/connected-distributors', retailerAuth, getConnectedDistributorsList);
retailerOrdersRouter.get('/search-medicines', retailerAuth, searchMedicines);
retailerOrdersRouter.get('/distributor-stock', retailerAuth, getDistributorStock);
retailerOrdersRouter.get('/my-orders', retailerAuth, getRetailerOrders);
retailerOrdersRouter.get('/details/:orderId', retailerAuth, getOrderDetails);
retailerOrdersRouter.get('/statistics', retailerAuth, getOrderStatistics);

// POST APIs
retailerOrdersRouter.post('/create', retailerAuth, createOrder);

// PUT APIs
retailerOrdersRouter.put('/cancel/:orderId', retailerAuth, cancelOrder);

export default retailerOrdersRouter;