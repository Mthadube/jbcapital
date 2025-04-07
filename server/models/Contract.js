const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  loanId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  documentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'signed', 'completed', 'expired', 'declined'],
    default: 'draft'
  },
  dateCreated: {
    type: String,
    required: true
  },
  dateSent: {
    type: String
  },
  dateViewed: {
    type: String
  },
  dateSigned: {
    type: String
  },
  dateExpires: {
    type: String
  },
  signatureRequestId: {
    type: String
  },
  signatureUrl: {
    type: String
  },
  downloadUrl: {
    type: String
  },
  previewUrl: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  // This will add createdAt and updatedAt fields
  timestamps: true
});

module.exports = mongoose.model('Contract', contractSchema); 