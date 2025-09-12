// controllers/loginApi.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/userSchema.js';
import Distributor from '../models/Distributor.js';




export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: false, message: 'Username and password are required' });
  }

  try {
    // Fetch user along with distributor details
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Distributor,
          as: 'Distributor'
        }
      ]
    });

    if (!user) {
      return res.status(401).json({ status: false, message: 'Invalid credentials' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.hashed_password);
    if (!match) {
      return res.status(401).json({ status: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your_jwt_secret_change_in_prod',
      { expiresIn: '1d' }
    );

    // Set HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development',
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });
    
    // Send user + distributor details
    res.json({
      status: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      distributor: user.Distributor
        ? {
            distributor_id: user.Distributor.distributor_id,
            name: user.Distributor.name,
            license_number: user.Distributor.license_number,
            address: user.Distributor.address,
            contact_person: user.Distributor.contact_person,
            phone: user.Distributor.phone,
            email: user.Distributor.email,
            gst_number: user.Distributor.gst_number,
            state: user.Distributor.state,
            city: user.Distributor.city,
            pincode: user.Distributor.pincode,
            is_active: user.Distributor.is_active
          }
        : null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};


// controllers/loginApi.js
export const logout = (req, res) => {
 res.clearCookie('token', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'development',
  sameSite: 'strict',
  path: '/', 
});

  res.json({
    status: true,
    message: 'Logged out successfully'
  });
};
