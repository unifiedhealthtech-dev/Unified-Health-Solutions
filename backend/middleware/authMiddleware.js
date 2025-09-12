// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../../database/models/userSchema.js';

const authenticateToken = async (req, res, next) => {
  try {
    // ✅ Read token from cookies (NOT headers)
    const token = req.cookies.token; // ← FIXED: read from cookie
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user in database
    const user = await User.findByPk(decoded.id); // ← Use decoded.id (not userId)
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default authenticateToken;