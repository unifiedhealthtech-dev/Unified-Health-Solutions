import express from 'express';
import {
  getInventorySummary,
  getStockItems,
  addBulkStock,
  updateStock,
  deleteStock,
  getStockDetails,
  getProducts,
  getProductBatches,
  importProducts,
  exportProducts
} from '../controller/inventoryApi.js';
import retailerAuth from '../middleware/authMiddleware.js';

const retailerInventoryRouter = express.Router();

retailerInventoryRouter.get('/summary', retailerAuth, getInventorySummary);
retailerInventoryRouter.get('/stock', retailerAuth, getStockItems);
retailerInventoryRouter.post('/bulk-stock', retailerAuth, addBulkStock);
retailerInventoryRouter.put('/stock/:stockId', retailerAuth, updateStock);
retailerInventoryRouter.delete('/stock/:stockId', retailerAuth, deleteStock);
retailerInventoryRouter.get('/stock/:productCode', retailerAuth, getStockDetails);
retailerInventoryRouter.get('/products', retailerAuth, getProducts);
retailerInventoryRouter.get('/products/:product_code/batches', retailerAuth, getProductBatches);
retailerInventoryRouter.post('/products/import', retailerAuth, importProducts);
retailerInventoryRouter.get('/products/export', retailerAuth, exportProducts);

export default retailerInventoryRouter;