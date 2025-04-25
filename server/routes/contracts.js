const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Contract, Loan, User } = require('../models');
const { sendSMS } = require('../services/twilio');

// Get all contracts
router.get('/', async (req, res) => {
  try {
    const contracts = await Contract.find();
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific contract
router.get('/:id', async (req, res) => {
  try {
    const contract = await Contract.findOne({ id: req.params.id });
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate a contract for a loan
router.post('/generate/:loanId', async (req, res) => {
  try {
    const loanId = req.params.loanId;
    const loan = await Loan.findOne({ id: loanId });
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    const user = await User.findOne({ id: loan.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create a new contract
    const contractId = `CONTRACT-${Date.now().toString().substring(8)}`;
    
    // In a real implementation, you would generate a PDF contract
    // For now, we're just returning mock data
    const documentPath = '/documents/sample-pdf.pdf';
    
    const contract = new Contract({
      id: contractId,
      loanId: loanId,
      userId: loan.userId,
      status: 'draft',
      dateCreated: new Date().toISOString(),
      downloadUrl: documentPath,
      previewUrl: documentPath
    });
    
    await contract.save();
    
    res.status(201).json({
      contractId: contractId,
      downloadUrl: documentPath,
      previewUrl: documentPath
    });
  } catch (err) {
    console.error('Contract generation error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Send a contract for signature
router.post('/:contractId/sign', async (req, res) => {
  try {
    const contract = await Contract.findOne({ id: req.params.contractId });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Get user details for SMS
    const user = await User.findOne({ id: contract.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update contract status
    contract.status = 'sent';
    contract.dateSent = new Date().toISOString();
    contract.signatureRequestId = `SIG-${Date.now().toString().substring(8)}`;
    contract.signatureUrl = `/sign-contract/${contract.id}`;
    
    await contract.save();

    // Send SMS notification with contract link
    try {
      const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
      const contractUrl = `${baseUrl}/sign-contract/${contract.id}`;
      const smsMessage = `Hello ${user.firstName}, your JB Capital loan contract is ready for signature. Click here to view and sign: ${contractUrl}`;
      
      // Format phone number if needed
      let phoneNumber = user.phone;
      console.log('Formatting phone number:', phoneNumber);
      if (!phoneNumber.startsWith('+')) {
        if (phoneNumber.startsWith('0')) {
          phoneNumber = '+27' + phoneNumber.substring(1);
        } else if (phoneNumber.startsWith('27')) {
          phoneNumber = '+' + phoneNumber;
        }
      }
      console.log('Formatted phone number:', phoneNumber);
      
      await sendSMS(phoneNumber, smsMessage);
      console.log('Contract SMS sent successfully to:', phoneNumber);
    } catch (smsError) {
      console.error('Failed to send contract SMS:', smsError);
      // Don't fail the request if SMS fails
    }
    
    res.json({
      signatureRequestId: contract.signatureRequestId,
      signatureUrl: contract.signatureUrl
    });
  } catch (err) {
    console.error('Error in contract signing route:', err);
    res.status(500).json({ message: err.message });
  }
});

// Handle contract signing page
router.get('/:contractId/view', async (req, res) => {
  try {
    const contract = await Contract.findOne({ id: req.params.contractId });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    const loan = await Loan.findOne({ id: contract.loanId });
    const user = await User.findOne({ id: contract.userId });
    
    if (!loan || !user) {
      return res.status(404).json({ message: 'Contract details not found' });
    }

    // Update contract viewed date
    if (!contract.dateViewed) {
      contract.dateViewed = new Date().toISOString();
      await contract.save();
    }

    res.json({
      contract,
      loan,
      user,
      downloadUrl: contract.downloadUrl,
      previewUrl: contract.previewUrl
    });
  } catch (err) {
    console.error('Error viewing contract:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get contract status
router.get('/:contractId/status', async (req, res) => {
  try {
    const contract = await Contract.findOne({ id: req.params.contractId });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    res.json({
      status: contract.status,
      viewedAt: contract.dateViewed,
      signedAt: contract.dateSigned,
      expiresAt: contract.dateExpires,
      downloadUrl: contract.downloadUrl
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Download signed contract
router.get('/:contractId/download', async (req, res) => {
  try {
    const contract = await Contract.findOne({ id: req.params.contractId });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    res.json({ downloadUrl: contract.downloadUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel signature request
router.post('/:contractId/cancel', async (req, res) => {
  try {
    const contract = await Contract.findOne({ id: req.params.contractId });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    contract.status = 'draft';
    await contract.save();
    
    res.json({ message: 'Signature request canceled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Resend signature request
router.post('/:contractId/resend', async (req, res) => {
  try {
    const contract = await Contract.findOne({ id: req.params.contractId });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    const user = await User.findOne({ id: contract.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send SMS notification with contract link
    try {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const contractUrl = `${baseUrl}/contracts/${contract.id}/sign`;
      const smsMessage = `Hello ${user.firstName}, here's your JB Capital loan contract link again. Click here to view and sign: ${contractUrl}`;
      
      // Format phone number if needed
      let phoneNumber = user.phone;
      if (!phoneNumber.startsWith('+')) {
        if (phoneNumber.startsWith('0')) {
          phoneNumber = '+27' + phoneNumber.substring(1);
        } else if (phoneNumber.startsWith('27')) {
          phoneNumber = '+' + phoneNumber;
        }
      }
      
      await sendSMS(phoneNumber, smsMessage);
      console.log('Contract SMS resent successfully to:', phoneNumber);
    } catch (smsError) {
      console.error('Failed to resend contract SMS:', smsError);
      // Don't fail the request if SMS fails
    }
    
    res.json({ message: 'Signature request resent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get contracts by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const contracts = await Contract.find({ userId: req.params.userId });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get contracts by loan ID
router.get('/loan/:loanId', async (req, res) => {
  try {
    const contracts = await Contract.find({ loanId: req.params.loanId });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 