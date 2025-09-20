// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import RetailerUser from '../../../database/models/RetailerUser.js';

const retailerAuth = async (req, res, next) => {
  try {
    const token = req.cookies.retailerToken;
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find user by retailer_id (email is optional, used for info only)
    const user = await RetailerUser.findOne({ where: { retailer_id: decoded.retailer_id } });

    if (!user) return res.status(401).json({ message: 'Invalid token' });

    // Attach user info to request
    req.user = {
      retailer_id: user.retailer_id,
      email: user.email,
      role: decoded.role || user.role || 'retailer',
      user_id: user.retailer_id,// Standardize to user_id for notifications
      name: user.name
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default retailerAuth;
