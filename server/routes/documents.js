const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
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

// View document content
router.get('/view/:id', async (req, res) => {
  try {
    const document = await Document.findOne({ id: req.params.id });
    if (!document) return res.status(404).json({ message: 'Document not found' });
    
    // Check if the file path exists
    if (!document.filePath) {
      return res.status(404).json({ message: 'Document file path not found' });
    }
    
    // Determine the file path
    // First check if it's a relative path or absolute path
    let filePath;
    if (document.filePath.startsWith('/')) {
      // This is already a path relative to the server root or an absolute path
      filePath = path.resolve(__dirname, '../../public', document.filePath.substring(1));
    } else {
      // This is a relative path
      filePath = path.resolve(__dirname, '../../public/documents', document.filePath);
    }
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Document file not found at path: ${filePath}`);
      // Use a sample file instead
      filePath = path.resolve(__dirname, '../../public/documents/sample-pdf.pdf');
      
      // If even the sample doesn't exist, return an error
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Document file not found' });
      }
    }
    
    // Determine content type
    let contentType = 'application/octet-stream'; // Default
    if (filePath.endsWith('.pdf')) contentType = 'application/pdf';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.png')) contentType = 'image/png';
    else if (filePath.endsWith('.txt')) contentType = 'text/plain';
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    
    // Send the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error('Error viewing document:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 