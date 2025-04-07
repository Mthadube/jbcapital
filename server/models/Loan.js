const mongoose = require('mongoose');

const ProcessingStepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  loanId: { type: String, required: true },
  status: { type: String, required: true },
  date: { type: String, required: true },
  notes: { type: String },
  processedBy: { type: String }
});

const LoanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  type: { type: String, required: true },
  purpose: { type: String },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  term: { type: Number, required: true },
  monthlyPayment: { type: Number, required: true },
  totalRepayment: { type: Number },
  status: { 
    type: String, 
    enum: ['active', 'pending', 'completed', 'rejected', 'approved'],
    required: true
  },
  dateApplied: { type: String, required: true },
  dateIssued: { type: String },
  paidAmount: { type: Number, default: 0 },
  paidMonths: { type: Number, default: 0 },
  remainingPayments: { type: Number },
  nextPaymentDue: { type: String },
  nextPaymentAmount: { type: Number },
  collateral: { type: Boolean },
  collateralType: { type: String },
  collateralValue: { type: Number },
  notes: { type: String },
  processingHistory: [ProcessingStepSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Loan', LoanSchema); 