// routes/inventoryRoutes.js
import { Router } from 'express';
import distributorAuth from '../middleware/authMiddleware.js';
import {
  getInventorySummary,
  getStockItems,
  getStockDetails,
  addBulkStock,
  updateStock,
  deleteStock,
  getProducts,
  exportProducts,
  importProducts,
  getProductBatches,
} from '../controller/inventoryApi.js';

const distributorInventoryRouter = Router();

// Inventory summary
distributorInventoryRouter.get('/summary', distributorAuth, getInventorySummary);

// Stock items list with filters
distributorInventoryRouter.get('/stock', distributorAuth, getStockItems);

// Stock details (use product_code instead of productId)
distributorInventoryRouter.get('/stock/:productCode', distributorAuth, getStockDetails);

// Add new stock
distributorInventoryRouter.post('/bulk-stock', distributorAuth, addBulkStock);

// Update stock item
distributorInventoryRouter.put('/stock/:stockId', distributorAuth, updateStock);

// Delete stock item
distributorInventoryRouter.delete('/stock/:stockId', distributorAuth, deleteStock);

// Get all products
distributorInventoryRouter.get('/products', distributorAuth, getProducts);

// Export products
distributorInventoryRouter.get('/products/export', distributorAuth, exportProducts);

// Import products from CSV
distributorInventoryRouter.post('/products/import', distributorAuth, importProducts);


distributorInventoryRouter.get('/products/:product_code/batches', distributorAuth, getProductBatches);

export default distributorInventoryRouter;
