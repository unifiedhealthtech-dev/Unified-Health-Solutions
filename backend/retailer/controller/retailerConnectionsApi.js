// controllers/distributorConnections/retailerController.js
import ConnectedDistributors from "../../../database/models/ConnectedDistributor.js";
import Distributor from '../../../database/models/Distributor.js';
import Notification from '../../../database/models/Notification.js';
import { Op } from 'sequelize';
// ✅ Get all distributors with connection status
export const getAllDistributors = async (req, res) => {
  try {
    const  retailerId  = req.user.retailer_id;

    const distributors = await Distributor.findAll({
      where: { is_active: true },
      attributes: [
        'distributor_id','name','phone','email','address','city','state','pincode',
        'license_number','gst_number','is_active','created_at', 'contact_person'
      ],
      order: [['name', 'ASC']]
    });

    const distributorsWithStatus = await Promise.all(
      distributors.map(async (distributor) => {
        const connection = await ConnectedDistributors.findOne({
          where: { retailer_id: retailerId, distributor_id: distributor.distributor_id }
        });
        return {
          ...distributor.toJSON(),
          connection_status: connection ? connection.status : null
        };
      })
    );

    res.json({ success: true, data: distributorsWithStatus, message: 'Distributors retrieved successfully' });
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch distributors' });
  }
};

// ✅ Send a connection request (Retailer → Distributor)
export const sendConnectionRequest = async (req, res) => {
  try {
    const { distributorId } = req.body;
    const retailerId = req.user.retailer_id;

    // ✅ Check if distributor exists
    const distributor = await Distributor.findByPk(distributorId);
    if (!distributor) {
      return res.status(404).json({ success: false, message: 'Distributor not found' });
    }

    // ✅ Check if connection already exists or is pending
    const existing = await ConnectedDistributors.findOne({
      where: {
        retailer_id: retailerId,
        distributor_id: distributorId,
        status: { [Op.in]: ['pending', 'connected'] },
      },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Connection already exists or pending' });
    }

    // ✅ Create new connection request
    const newRequest = await ConnectedDistributors.create({
      retailer_id: retailerId,
      distributor_id: distributorId,
      status: 'pending',
    });

    // ✅ Create notification for distributor
    const distributorNotification = await Notification.create({
      user_id: distributorId,
      role: 'distributor',
      title: 'New Connection Request',
      message: `${req.user.name} wants to connect with you.`,
      type: 'info',
      related_id: newRequest.id,
    });

    // ✅ Emit notification via Socket.IO
    if (req.io) {
      req.io.to(`distributor_${distributorId}`).emit('newNotification', distributorNotification);
    }

    res.status(201).json({
      success: true,
      data: newRequest,
      message: 'Connection request sent successfully',
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ success: false, message: 'Failed to send connection request' });
  }
};

// ✅ Get all connected distributors for a retailer
export const getConnectedDistributors = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;
    const connectedDistributors = await ConnectedDistributors.findAll({
      where: { retailer_id: retailerId, status: 'connected' },
      include: [{
        model: Distributor,
        as: 'Distributor',
        attributes: [
          'distributor_id','name','phone','email','address','city','state','pincode',
          'license_number','gst_number','contact_person'
        ]
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: connectedDistributors, message: 'Connected distributors retrieved successfully' });
  } catch (error) {
    console.error('Error fetching connected distributors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch connected distributors' });
  }
};

// ✅ Get connection status for a retailer-distributor pair
export const getConnectionStatus = async (req, res) => {
  try {
    const { retailerId, distributorId } = req.params;
    const connection = await ConnectedDistributors.findOne({
      where: { retailer_id: retailerId, distributor_id: distributorId }
    });

    res.json({ success: true, data: connection, message: 'Connection status retrieved successfully' });
  } catch (error) {
    console.error('Error fetching connection status:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch connection status' });
  }
};

// ✅ Disconnect from a distributor
export const disconnectDistributor = async (req, res) => {
  try {
    const retailerId = req.user.retailer_id;   // ✅ comes from token
    const { distributorId } = req.params;

    console.log("Retailer ID:", retailerId, "Distributor ID:", distributorId);

    const connection = await ConnectedDistributors.findOne({
      where: { retailer_id: retailerId, distributor_id: distributorId, status: "connected" }
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "No active connection found with this distributor"
      });
    }

    await connection.destroy();
    res.json({ success: true, message: "Disconnected from distributor successfully" });

  } catch (error) {
    console.error("Error disconnecting distributor:", error);
    res.status(500).json({ success: false, message: "Failed to disconnect distributor" });
  }
};
