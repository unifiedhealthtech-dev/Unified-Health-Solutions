import express from 'express';
import { getNotifications,  markAsRead, markAllAsRead  } from "../controller/distributorNotificationsController.js";
import distributorAuth from '../middleware/authMiddleware.js';

const distributorNotificationRouter = express.Router();

distributorNotificationRouter.get('/', distributorAuth, getNotifications);
distributorNotificationRouter.patch('/:notificationId/read', distributorAuth, markAsRead);
distributorNotificationRouter.patch('/read-all', distributorAuth, markAllAsRead);

export default distributorNotificationRouter;