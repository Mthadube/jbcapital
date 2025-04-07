const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Document, User } = require('../models');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    const uploadDir = path.resolve(__dirname, '../../public/documents');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

// File filter to accept only certain types
const fileFilter = (req, file, cb) => {
  // Accept only pdf, jpg, jpeg, png
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG, and DOC files are allowed.'), false);
  }
};

// Setup multer upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max size
  }
});

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
    
    // Delete physical file if it exists
    if (document.filePath) {
      const filePath = path.join(__dirname, '../../public', document.filePath.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    }
    
    await Document.deleteOne({ id: req.params.id });
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// View document content
router.get('/view/:id', async (req, res) => {
  try {
    console.log(`Trying to view document with ID: ${req.params.id}`);
    
    // Find the document in the database using various ID formats
    const document = await Document.findOne({ 
      $or: [
        { id: req.params.id },
        { id: req.params.id.toUpperCase() },
        { id: req.params.id.toLowerCase() }
      ]
    });
    
    if (!document) {
      console.log(`Document not found with ID: ${req.params.id}`);
      return res.status(404).send(`Document with ID ${req.params.id} not found. 
        <br><br>
        <a href="/">Return to Home</a>
      `);
    }
    
    console.log('Document found:', document);
    
    // Get the file path from the document record
    let filePath;
    if (document.filePath) {
      // Handle different path formats
      if (document.filePath.startsWith('/')) {
        // Resolve path relative to public directory
        filePath = path.resolve(__dirname, '../../public', document.filePath.substring(1));
      } else {
        filePath = path.resolve(__dirname, '../../public/documents', document.filePath);
      }
      
      console.log(`Resolved file path: ${filePath}`);
    } else {
      console.log('No file path in document record, using filename to find file');
      
      // Try to find by filename if no path
      const docsDir = path.resolve(__dirname, '../../public/documents');
      const files = fs.readdirSync(docsDir);
      
      // Look for a file that matches the document name
      const matchingFile = files.find(file => {
        return file.toLowerCase().includes(document.name.toLowerCase());
      });
      
      if (matchingFile) {
        filePath = path.join(docsDir, matchingFile);
        console.log(`Found matching file: ${matchingFile}`);
      } else {
        console.log('No matching file found in documents directory');
        filePath = path.resolve(__dirname, '../../public/documents/sample-pdf.pdf');
      }
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found at path: ${filePath}`);
      
      // Try one more approach - search for any file containing the document ID
      const docsDir = path.resolve(__dirname, '../../public/documents');
      
      if (fs.existsSync(docsDir)) {
        const files = fs.readdirSync(docsDir);
        const fileIdMatch = files.find(file => file.includes(req.params.id.toLowerCase()));
        
        if (fileIdMatch) {
          filePath = path.join(docsDir, fileIdMatch);
          console.log(`Found file by ID match: ${fileIdMatch}`);
        } else {
          console.log('No file matching document ID found, using sample PDF');
          filePath = path.resolve(__dirname, '../../public/documents/sample-pdf.pdf');
          
          // Create sample PDF if it doesn't exist
          if (!fs.existsSync(filePath)) {
            // Create directory if it doesn't exist
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            
            // Create a basic PDF with the minimum valid structure
            const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Resources<<>>/Contents 4 0 R/Parent 2 0 R>>endobj
4 0 obj<</Length 21>>stream
BT /F1 12 Tf 100 700 Td (JB Capital Sample Document) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
0000000192 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
263
%%EOF`;
            fs.writeFileSync(filePath, pdfContent);
            console.log('Created sample PDF file for fallback');
          }
        }
      } else {
        console.log('Documents directory does not exist');
        return res.status(404).send('Document not found');
      }
    }
    
    // Determine the content type based on file extension
    let contentType = 'application/octet-stream'; // Default
    if (filePath.endsWith('.pdf')) contentType = 'application/pdf';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.png')) contentType = 'image/png';
    else if (filePath.endsWith('.txt')) contentType = 'text/plain';
    
    console.log(`Serving file with content type: ${contentType}`);
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    
    // Send the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (err) => {
      console.error('Error reading file stream:', err);
      res.status(500).send('Error reading document');
    });
    
    fileStream.pipe(res);
  } catch (err) {
    console.error('Error viewing document:', err);
    res.status(500).json({ message: err.message });
  }
});

// File upload route with document creation
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Document upload request received');

    // Make sure file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get file details
    const file = req.file;
    console.log('File uploaded:', file);

    // Get relative path for storage in DB
    const relativePath = '/documents/' + path.basename(file.path);

    // Create document record
    const documentData = {
      name: req.body.name || file.originalname,
      type: req.body.type || 'document',
      userId: req.body.userId,
      filePath: relativePath,
      fileSize: formatFileSize(file.size),
      dateUploaded: new Date(),
      verificationStatus: 'pending',
      description: req.body.description || '',
      notes: req.body.notes || ''
    };

    // Generate document ID if not provided
    if (!documentData.id || documentData.id === '') {
      const timestamp = Date.now();
      documentData.id = `DOC-${timestamp}-${Math.floor(Math.random() * 1000)}`;
    }

    // Save document to database
    const document = new Document(documentData);
    const newDocument = await document.save();
    console.log('Document saved to database:', newDocument);

    // Update user's document list if userId is provided
    if (documentData.userId) {
      const user = await User.findOne({ id: documentData.userId });
      
      if (user) {
        await User.findOneAndUpdate(
          { id: documentData.userId },
          { $push: { documents: newDocument._id } }
        );
        console.log(`Updated user ${documentData.userId} with new document reference`);
      } else {
        console.warn(`User with ID ${documentData.userId} not found, document created without user reference`);
      }
    }

    res.status(201).json(newDocument);
  } catch (err) {
    console.error('Error uploading document:', err);
    
    // If there's a multer error
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 5MB limit' });
      }
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    }
    
    res.status(500).json({ message: err.message });
  }
});

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

module.exports = router; 