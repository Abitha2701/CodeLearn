const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB Atlas connection error:', err));

app.post('/api/signup', async (req, res) => {
  const { name, email, password, confirmPassword, preferredLanguages } = req.body;
console.log('📦 Incoming Signup Data:', req.body);

if (password !== confirmPassword) {
  return res.status(400).json({ message: 'Passwords do not match' });
}

  try {
    const user = new User({ name, email, password, preferredLanguages });
    await user.save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    res.status(400).json({ message: 'Signup failed', error: err.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Login request:', req.body);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({ message: 'Login successful', user: {
      name: user.name,
      email: user.email,
      preferredLanguages: user.preferredLanguages
    }});
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Add this below your signup route
app.get('/api/profile', async (req, res) => {
  const { email } = req.query; // e.g. /api/profile?email=abc@example.com

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      preferredLanguages: user.preferredLanguages
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});
