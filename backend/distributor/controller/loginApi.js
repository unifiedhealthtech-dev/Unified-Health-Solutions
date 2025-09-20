// controllers/loginApi.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import DistributorUser from '../../../database/models/DistributorUser.js';
import Distributor from '../../../database/models/Distributor.js';

export const login = async (req, res) => {
  let { login_id, password } = req.body;

  if (!login_id || !password) {
    return res.status(400).json({ status: false, message: 'Login ID and password are required' });
  }

  try {
    const normalizedLogin = login_id.toString().trim();
    const distributorId = !isNaN(normalizedLogin) ? Number(normalizedLogin) : 0;

    let user;

    // First try to find by distributor_id if it's a number
    if (distributorId > 0) {
      user = await DistributorUser.findOne({
        where: { distributor_id: distributorId },
        include: [{ model: Distributor, as: 'Distributor' }]
      });
    }

    // If not found by distributor_id, try to find by phone number
    if (!user) {
      // User inputs normal number like 9876543210, we need to convert it to the DB format
      const userInputPhone = normalizedLogin.replace(/\D/g, ''); // Remove all non-digits
      
      if (userInputPhone.length >= 10) {
        // Get last 10 digits in case user entered with country code
        const last10Digits = userInputPhone.slice(-10);
        
        // Find all users and filter in JavaScript (less efficient but works)
        const allUsers = await DistributorUser.findAll({
          include: [{ model: Distributor, as: 'Distributor' }]
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
      return res.status(401).json({ status: false, message: 'Invalid Distributor ID or Phone' });
    }

    // Check role -> must be distributor
    if (user.role !== 'distributor') {
      return res.status(403).json({ status: false, message: 'Access denied: Only distributors can login' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.hashed_password);
    if (!match) {
      return res.status(401).json({ status: false, message: 'Invalid credentials' });
    }

    // JWT token
    const distributorToken = jwt.sign(
      { distributor_id: user.distributor_id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_change_in_prod',
      { expiresIn: '1d' }
    );

    res.cookie('distributorToken', distributorToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      status: true,
      message: 'Login successful',
      user: { distributor_id: user.distributor_id, phone: user.phone, role: user.role },
      distributor: user.Distributor || null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

// Logout API
export const logout = (req, res) => {
  res.clearCookie('distributorToken', {
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