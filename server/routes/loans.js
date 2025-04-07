const express = require('express');
const router = express.Router();
const { Loan, User } = require('../models');

// Get all loans
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find();
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get loan by ID
router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findOne({ id: req.params.id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get loans by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.params.userId });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new loan
router.post('/', async (req, res) => {
  try {
    console.log('Creating new loan:', req.body);
    
    const loan = new Loan(req.body);
    const newLoan = await loan.save();
    console.log('Loan created successfully:', newLoan.id);
    
    // Update user's loan list
    const user = await User.findOne({ id: loan.userId });
    
    if (!user) {
      console.error(`User with ID ${loan.userId} not found when creating loan`);
      return res.status(400).json({ message: `User with ID ${loan.userId} not found` });
    }
    
    await User.findOneAndUpdate(
      { id: loan.userId },
      { $push: { loans: newLoan._id } }
    );
    
    console.log(`Updated user ${loan.userId} with new loan reference`);
    res.status(201).json(newLoan);
  } catch (err) {
    console.error("Error adding loan:", err);
    res.status(400).json({ message: err.message });
  }
});

// Update loan
router.patch('/:id', async (req, res) => {
  try {
    const loan = await Loan.findOne({ id: req.params.id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'id') { // Prevent updating immutable fields
        if (key === 'processingHistory' && Array.isArray(req.body[key])) {
          // Add to processing history
          loan.processingHistory = [...(loan.processingHistory || []), ...req.body[key]];
        } else {
          loan[key] = req.body[key];
        }
      }
    });
    
    const updatedLoan = await loan.save();
    res.json(updatedLoan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete loan
router.delete('/:id', async (req, res) => {
  try {
    const loan = await Loan.findOne({ id: req.params.id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    
    // Remove loan from user's loan list
    await User.findOneAndUpdate(
      { id: loan.userId },
      { $pull: { loans: loan._id } }
    );
    
    await Loan.deleteOne({ id: req.params.id });
    res.json({ message: 'Loan deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 