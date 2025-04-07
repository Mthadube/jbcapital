const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user
router.patch('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    Object.keys(req.body).forEach(key => {
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

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await User.deleteOne({ id: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by email
router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 