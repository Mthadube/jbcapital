const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  dateUploaded: { type: String, required: true },
  verificationStatus: { 
    type: String, 
    enum: ['verified', 'pending', 'rejected'],
    default: 'pending'
  },
  fileSize: { type: String },
  fileType: { type: String },
  expiryDate: { type: String },
  notes: { type: String },
  fileContent: { type: Buffer }, // For storing actual file content if needed
  filePath: { type: String }     // For storing reference to file path
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', DocumentSchema); 