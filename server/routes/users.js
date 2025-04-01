const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID (authenticated users can only get their own profile)
router.get('/:id', auth, async (req, res) => {
  try {
    // If not admin and trying to access another user's profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Unauthorized access to user profile' });
    }
    
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new user (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const user = new User(req.body);
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user (authenticated users can only update their own profile)
router.patch('/:id', auth, async (req, res) => {
  try {
    // If not admin and trying to update another user's profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Unauthorized access to user profile' });
    }
    
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // If not admin, prevent updating role or other sensitive fields
    const allowedUpdates = req.user.role === 'admin' 
      ? Object.keys(req.body) 
      : Object.keys(req.body).filter(key => 
          !['role', 'verificationStatus', 'accountStatus'].includes(key)
        );
    
    allowedUpdates.forEach(key => {
      if (key !== '_id' && key !== 'id') { // Prevent updating immutable fields
        user[key] = req.body[key];
      }
    });
    
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await User.deleteOne({ id: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by email (admin only)
router.get('/email/:email', adminAuth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 