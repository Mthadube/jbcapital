const express = require('express');
const router = express.Router();
const { Application, User } = require('../models');

// Get all applications
router.get('/', async (req, res) => {
  try {
    const applications = await Application.find();
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get application by ID
router.get('/:id', async (req, res) => {
  try {
    const application = await Application.findOne({ id: req.params.id });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get applications by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.params.userId });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new application
router.post('/', async (req, res) => {
  try {
    console.log('Creating new application:', req.body);
    
    // Process application data
    const applicationData = { ...req.body };
    
    // Generate application ID if not provided
    if (!applicationData.id || applicationData.id === '') {
      const timestamp = Date.now();
      applicationData.id = `APP-${timestamp}-${Math.floor(Math.random() * 1000)}`;
      console.log(`Generated application ID: ${applicationData.id}`);
    }
    
    // Set submittedAt if not provided
    if (!applicationData.submittedAt) {
      applicationData.submittedAt = new Date().toISOString();
    }
    
    // Process dob - set to a placeholder if empty
    if (!applicationData.dob || applicationData.dob === '') {
      applicationData.dob = applicationData.personalInfo?.dateOfBirth || '1900-01-01';
      console.log(`Set placeholder DOB: ${applicationData.dob}`);
    }
    
    // Process monthly income - remove currency symbols and commas
    if (applicationData.employmentInfo?.monthlyIncome) {
      applicationData.employmentInfo.monthlyIncome = Number(
        applicationData.employmentInfo.monthlyIncome
          .replace(/[^\d.-]/g, '') // Remove non-numeric characters except dots
      );
      console.log(`Processed monthly income: ${applicationData.employmentInfo.monthlyIncome}`);
    }
    
    const application = new Application(applicationData);
    const newApplication = await application.save();
    console.log('Application created successfully:', newApplication.id);
    
    const user = await User.findOne({ id: application.userId });
    
    if (!user) {
      console.error(`User with ID ${application.userId} not found when creating application`);
      return res.status(400).json({ message: `User with ID ${application.userId} not found` });
    }
    
    await User.findOneAndUpdate(
      { id: application.userId },
      { $push: { applications: newApplication._id } }
    );
    
    console.log(`Updated user ${application.userId} with new application reference`);
    res.status(201).json(newApplication);
  } catch (err) {
    console.error("Error adding application:", err);
    res.status(400).json({ message: err.message });
  }
});

// Update application
router.patch('/:id', async (req, res) => {
  try {
    const application = await Application.findOne({ id: req.params.id });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'id') { // Prevent updating immutable fields
        application[key] = req.body[key];
      }
    });
    
    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete application
router.delete('/:id', async (req, res) => {
  try {
    const application = await Application.findOne({ id: req.params.id });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    
    await Application.deleteOne({ id: req.params.id });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 