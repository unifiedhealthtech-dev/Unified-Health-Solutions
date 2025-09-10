// routes/dashboardRoutes.js
import express from 'express';
import  authenticateToken  from '../middleware/authMiddleware.js';
import { getDashboardSummary, getRecentOrders } from '../controller/dashboardApi.js';

const router = express.Router();

// Dashboard summary
router.get('/dashboard', authenticateToken, getDashboardSummary);

// Recent orders
router.get('/orders/recent', authenticateToken, getRecentOrders);

export default router;
