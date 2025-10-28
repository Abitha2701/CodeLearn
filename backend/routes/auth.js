const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Signup Route with Password Hashing
router.post('/signup', async (req, res) => {
  const { name, email, password, confirmPassword, preferredLanguages } = req.body;
  console.log('📦 Incoming Signup Data:', { name, email, preferredLanguages });

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      preferredLanguages
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ User signed up successfully:', email);
    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguages: user.preferredLanguages
      }
    });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(400).json({ message: 'Signup failed', error: err.message });
  }
});

// Login Route with JWT
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Login attempt for:', email);

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({ message: 'Invalid email or password' });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ User logged in successfully:', email);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguages: user.preferredLanguages
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Protected Profile Route
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      preferredLanguages: user.preferredLanguages,
    });
  } catch (err) {
    console.error('❌ Profile fetch error:', err.message);
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});

// Logout Route (Token Blacklist - Simple Version)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    console.log('🔒 User logged out:', req.user.email);
    // In a production app, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error('❌ Logout error:', err.message);
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
});

// Verify Token Route
router.get('/verify-token', authenticateToken, (req, res) => {
  res.status(200).json({
    valid: true,
    user: {
      userId: req.user.userId,
      email: req.user.email
    }
  });
});

module.exports = router;
