// controllers/distributorConnections/distributorController.js
import ConnectedDistributors from '../../../database/models/ConnectedDistributor.js';
import Retailer from '../../../database/models/Retailer.js';
import Notification from '../../../database/models/Notification.js'; 
import { Op } from 'sequelize';
export const getConnectionRequests = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    const requests = await ConnectedDistributors.findAll({
      where: { distributor_id: distributorId, status: 'pending' },
      include: [{
        model: Retailer,
        as: 'Retailer',
        attributes: [
          'retailer_id','name','phone','email','address','city','state','license_number','gst_number'
        ]
      }],
      order: [['created_at', 'DESC']]
    });
    console.log('Fetched Connection Requests:', requests);
    res.json({ success: true, data: requests, message: 'Connection requests retrieved successfully' });
  } catch (error) {
    console.error('Error fetching connection requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch connection requests' });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const distributorId = req.user.distributor_id;

    const connection = await ConnectedDistributors.findOne({
      where: { id: requestId, distributor_id: distributorId, status: 'pending' },
      include: [{ model: Retailer, as: 'Retailer' }]
    });

    if (!connection) return res.status(404).json({ success: false, message: 'Connection request not found or already processed' });

    await connection.update({ status: 'connected', updated_at: new Date() });

    // ✅ Create notification for Retailer
    const retailerNotification = await Notification.create({
      user_id: connection.retailer_id,
      role: 'retailer',
      title: 'Connection Accepted',
      message: `Your connection request to ${req.user.name} has been accepted.`,
      type: 'success',
      related_id: connection.id,
    });

    // ✅ Emit real-time notification to Retailer
    req.io.to(`retailer_${connection.retailer_id}`).emit('newNotification', retailerNotification);

    res.json({ success: true,  connection, message: 'Connection request accepted successfully' });
  } catch (error) {
    console.error('Error accepting connection request:', error);
    res.status(500).json({ success: false, message: 'Failed to accept connection request' });
  }
};


export const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const distributorId = req.user.distributor_id;

    const connection = await ConnectedDistributors.findOne({
      where: { id: requestId, distributor_id: distributorId, status: 'pending' }
    });

    if (!connection) return res.status(404).json({ success: false, message: 'Connection request not found or already processed' });

    await connection.update({ status: 'rejected', updated_at: new Date() });

    // ✅ Create notification for Retailer
    const retailerNotification = await Notification.create({
      user_id: connection.retailer_id,
      role: 'retailer',
      title: 'Connection Rejected',
      message: `Your connection request to ${req.user.name} has been rejected.`,
      type: 'error',
      related_id: connection.id,
    });

    // ✅ Emit to Retailer
    req.io.to(`retailer_${connection.retailer_id}`).emit('newNotification', retailerNotification);

    res.json({ success: true, message: 'Connection request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting connection request:', error);
    res.status(500).json({ success: false, message: 'Failed to reject connection request' });
  }
};
export const getConnectedRetailers = async (req, res) => {
  try {
    const distributorId = req.user.distributor_id;
    const connectedRetailers = await ConnectedDistributors.findAll({
      where: { distributor_id: distributorId, status: 'connected' },
      include: [{
        model: Retailer,
        as: 'Retailer',
        attributes: [
          'retailer_id','name','phone','email','address','city','state','license_number','gst_number','pincode','contact_person'
        ]
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: connectedRetailers, message: 'Connected retailers retrieved successfully' });
  } catch (error) {
    console.error('Error fetching connected retailers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch connected retailers' });
  }
};