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
  getOrderStatistics,
  getDCItems,
  createDCItemsBulk,
  updateDCItem,
  deleteDCItem,
  verifyOrder,
  createDispute
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
retailerOrdersRouter.get('/dc-items', retailerAuth, getDCItems);

// POST APIs
retailerOrdersRouter.post('/create', retailerAuth, createOrder);
retailerOrdersRouter.post('/dc-items/bulk', retailerAuth, createDCItemsBulk);
retailerOrdersRouter.put('/dc-items/:id', retailerAuth, updateDCItem);
retailerOrdersRouter.post('/orders/:orderId/verify', retailerAuth, verifyOrder);
retailerOrdersRouter.post('/disputes', retailerAuth, createDispute);

// PUT APIs
retailerOrdersRouter.put('/cancel/:orderId', retailerAuth, cancelOrder);

retailerOrdersRouter.delete('/dc-items/:id', retailerAuth, deleteDCItem);

export default retailerOrdersRouter;