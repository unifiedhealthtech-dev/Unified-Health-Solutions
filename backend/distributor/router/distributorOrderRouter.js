import express from 'express';
import { 
  getDistributorOrders, 
  updateOrderStatus 
} from '../controller/distributorOrderController.js';
import distributorAuth from "../middleware/authMiddleware.js"

const distributorOrderRouter = express.Router();

distributorOrderRouter.get('/', distributorAuth, getDistributorOrders);
distributorOrderRouter.put('/status/:orderId', distributorAuth, updateOrderStatus);

export default distributorOrderRouter;