// controllers/authController.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/userSchema.js';

export const login = async (req, res) => {
  const { username, password } = req.body;
  // Validate request body
  if (!username || !password) {
    return res.status(400).json({ status: false, message: 'Username and password are required' });
  }

  try {
    // Find user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ status: false, message: 'Invalid credentials' });
    }

    // ✅ Compare plain-text password with stored hashed password
    const match = await bcrypt.compare(password, user.hashedpassword); // ← FIXED: use hashedpassword
    if (!match) {
      return res.status(401).json({ status: false, message: 'Invalid credentials' });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your_jwt_secret_change_in_prod',
      { expiresIn: '1d' }
    );

    // ✅ Set HttpOnly cookie — frontend can't access it (secure!)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in prod (HTTPS)
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });

    // ✅ Send minimal response — no token in body
    res.json({
      status: true,
      message: 'Login successful',
      user: {
        username: user.username,
        // 👉 Don't send token — it's in HttpOnly cookie
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};