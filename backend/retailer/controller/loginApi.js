// controllers/retailerLoginApi.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import RetailerUser from '../../../database/models/RetailerUser.js';
import Retailer from '../../../database/models/Retailer.js';

export const login = async (req, res) => {
  const { login_id, password } = req.body;

  if (!login_id || !password) {
    return res.status(400).json({ status: false, message: 'Login ID and password are required' });
  }

  try {
    const normalizedLogin = login_id.toString().trim();
    const retailerId = !isNaN(normalizedLogin) ? Number(normalizedLogin) : 0;

    let user;

    // First try to find by retailer_id if it's a number
    if (retailerId > 0) {
      user = await RetailerUser.findOne({
        where: { retailer_id: retailerId },
        include: [{ model: Retailer, as: 'Retailer' }]
      });
    }

    // If not found by retailer_id, try to find by phone number
    if (!user) {
      // User inputs normal number like 9876543210, we need to match against DB formatted numbers
      const userInputPhone = normalizedLogin.replace(/\D/g, ''); // Remove all non-digits
      
      if (userInputPhone.length >= 10) {
        // Get last 10 digits in case user entered with country code
        const last10Digits = userInputPhone.slice(-10);
        
        // Find all retailer users and filter in JavaScript
        const allUsers = await RetailerUser.findAll({
          include: [{ model: Retailer, as: 'Retailer' }]
        });

        user = allUsers.find(u => {
          if (!u.phone) return false;
          
          // Extract just the digits from the stored phone number
          const storedDigits = u.phone.replace(/\D/g, '');
          // Get last 10 digits of stored number
          const storedLast10 = storedDigits.slice(-10);
          
          return storedLast10 === last10Digits;
        });
      }
    }

    if (!user) {
      return res.status(401).json({ status: false, message: 'Invalid Retailer ID or Phone' });
    }

    // Check role -> must be retailer
    if (user.role !== 'retailer') {
      return res.status(403).json({ status: false, message: 'Access denied: Only retailers can login' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.hashed_password);
    if (!match) {
      return res.status(401).json({ status: false, message: 'Invalid credentials' });
    }

    // JWT token
    const retailerToken = jwt.sign(
      { retailer_id: user.retailer_id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_change_in_prod',
      { expiresIn: '1d' }
    );

    res.cookie('retailerToken', retailerToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      status: true,
      message: 'Login successful',
      user: { retailer_id: user.retailer_id, phone: user.phone, role: user.role },
      retailer: user.Retailer || null
    });
  } catch (error) {
    console.error('Retailer login error:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

// Logout API
export const logout = (req, res) => {
  res.clearCookie('retailerToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    path: '/', 
  });

  res.json({
    status: true,
    message: 'Logged out successfully'
  });
};