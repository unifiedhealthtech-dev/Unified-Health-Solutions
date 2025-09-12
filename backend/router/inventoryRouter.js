// routes/inventoryRoutes.js
import { Router } from 'express';
import authenticateToken  from '../middleware/authMiddleware.js';
import {
  getInventorySummary,
  getStockItems,
  getStockDetails,
  addStock,
  updateStock,
  deleteStock,
  getProducts ,
  exportProducts,
  importProducts,
} from '../controller/inventoryApi.js';

const inventoryRouter = Router();

// Inventory summary
inventoryRouter.get('/summary', authenticateToken, getInventorySummary);

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

// Get all products
inventoryRouter.get('/products', authenticateToken, getProducts);

// Export products
inventoryRouter.get('/products/export', authenticateToken, exportProducts);

// Import products from CSV
inventoryRouter.post('/products/import', authenticateToken, importProducts);

export default inventoryRouter;