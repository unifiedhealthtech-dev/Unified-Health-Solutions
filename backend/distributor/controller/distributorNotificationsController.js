// controllers/notificationsController.js
import Notification from '../../../database/models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
   const { distributor_id, role } = req.user;
const notifications = await Notification.findAll({
  where: { user_id: distributor_id, role: role },
  order: [['created_at', 'DESC']],
});


    res.json({ success: true,  notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { distributor_id, role } = req.user;

    const notification = await Notification.findOne({
      where: { notification_id: notificationId, user_id: distributor_id, role: role }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.update({ is_read: true });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { distributor_id, role } = req.user;

    await Notification.update(
      { is_read: true },
      { where: { user_id: distributor_id, role: role, is_read: false } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};
