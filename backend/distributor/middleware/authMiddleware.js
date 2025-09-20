// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import DistributorUser from '../../../database/models/DistributorUser.js';

 const distributorAuth  = async (req, res, next) => {
  try {
    const distributorToken = req.cookies.distributorToken;
    if (!distributorToken) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const decoded = jwt.verify(distributorToken, process.env.JWT_SECRET);
    // Find user by distributor_id (email is optional, used for info only)
    const user = await DistributorUser.findOne({ where: { distributor_id: decoded.distributor_id } });

    if (!user) return res.status(401).json({ message: 'Invalid token' });

    // Attach user info to request
    req.user = {
      distributor_id: user.distributor_id,
      email: user.email,
      role: decoded.role || user.role || 'distributor'
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

export default distributorAuth;
