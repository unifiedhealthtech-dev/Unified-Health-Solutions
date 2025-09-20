import express from 'express';
import { getNotifications,  markAsRead, markAllAsRead  } from "../controller/retailerNotificationsController.js";
import retailerAuth from '../middleware/authMiddleware.js';

const retailerNotificationRouter = express.Router();

retailerNotificationRouter.get('/', retailerAuth, getNotifications);
retailerNotificationRouter.patch('/:notificationId/read', retailerAuth, markAsRead);
retailerNotificationRouter.patch('/read-all', retailerAuth, markAllAsRead);

export default retailerNotificationRouter;