const express = require('express');
const router = express.Router();
const { Document, User } = require('../models');

// Get all documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get document by ID
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findOne({ id: req.params.id });
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json(document);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get documents by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.params.userId });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new document
router.post('/', async (req, res) => {
  try {
    console.log('Creating new document:', req.body);
    
    // Generate document ID if not provided
    const documentData = { ...req.body };
    if (!documentData.id || documentData.id === '') {
      const timestamp = Date.now();
      documentData.id = `DOC-${timestamp}-${Math.floor(Math.random() * 1000)}`;
      console.log(`Generated document ID: ${documentData.id}`);
    }
    
    const document = new Document(documentData);
    const newDocument = await document.save();
    console.log('Document created successfully:', newDocument.id);
    
    // Update user's document list
    const user = await User.findOne({ id: document.userId });
    
    if (!user) {
      console.error(`User with ID ${document.userId} not found when creating document`);
      return res.status(400).json({ message: `User with ID ${document.userId} not found` });
    }
    
    await User.findOneAndUpdate(
      { id: document.userId },
      { $push: { documents: newDocument._id } }
    );
    
    console.log(`Updated user ${document.userId} with new document reference`);
    res.status(201).json(newDocument);
  } catch (err) {
    console.error("Error adding document:", err);
    res.status(400).json({ message: err.message });
  }
});

// Update document
router.patch('/:id', async (req, res) => {
  try {
    const document = await Document.findOne({ id: req.params.id });
    if (!document) return res.status(404).json({ message: 'Document not found' });
    
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'id') { // Prevent updating immutable fields
        document[key] = req.body[key];
      }
    });
    
    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findOne({ id: req.params.id });
    if (!document) return res.status(404).json({ message: 'Document not found' });
    
    // Remove document from user's document list
    await User.findOneAndUpdate(
      { id: document.userId },
      { $pull: { documents: document._id } }
    );
    
    await Document.deleteOne({ id: req.params.id });
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 