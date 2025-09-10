// routes/inventoryRoutes.js
import { Router } from 'express';
import authenticateToken  from '../middleware/authMiddleware.js';
import {
  getDashboardSummary,
  getStockItems,
  getStockDetails,
  addStock,
  updateStock,
  deleteStock
} from '../controller/inventoryApi.js';

const inventoryRouter = Router();

// Dashboard summary
inventoryRouter.get('/dashboard', authenticateToken, getDashboardSummary);

// Stock items list with filters
inventoryRouter.get('/stock', authenticateToken, getStockItems);

// Stock details for a specific product
inventoryRouter.get('/stock/:productId', authenticateToken, getStockDetails);

// Add new stock
inventoryRouter.post('/stock', authenticateToken, addStock);

// Update stock item
inventoryRouter.put('/stock/:stockId', authenticateToken, updateStock);

// Delete stock item
inventoryRouter.delete('/stock/:stockId', authenticateToken, deleteStock);

export default inventoryRouter;