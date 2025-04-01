const mongoose = require('mongoose');

// Nested schemas for application sections
const LoanInfoSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  term: { type: Number, required: true },
  purpose: { type: String },
  interestRate: { type: Number },
  monthlyPayment: { type: Number }
});

const PersonalInfoSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  phone: { type: String },
  gender: { type: String },
  maritalStatus: { type: String },
  dependents: { type: Number },
  address: { type: String },
  province: { type: String },
  postalCode: { type: String },
  dateOfBirth: { type: String }
});

const EmploymentInfoSchema = new mongoose.Schema({
  employmentStatus: { type: String },
  employmentType: { type: String },
  employer: { type: String },
  position: { type: String },
  jobTitle: { type: String },
  yearsAtCurrentEmployer: { type: Number },
  employmentLength: { type: String },
  monthlyIncome: { type: Number },
  paymentDate: { type: String }
});

const ExistingLoanSchema = new mongoose.Schema({
  type: { type: String },
  amount: { type: String },
  remaining: { type: String }
});

const FinancialInfoSchema = new mongoose.Schema({
  bankName: { type: String },
  accountType: { type: String },
  accountNumber: { type: String },
  creditScore: { type: Number },
  debtToIncomeRatio: { type: Number },
  monthlyExpenses: { type: Number },
  bankruptcies: { type: Boolean },
  foreclosures: { type: Boolean },
  existingLoans: [ExistingLoanSchema],
  monthlyDebt: { type: String }
});

const ApplicationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: String, required: true },
  status: { type: String, required: true },
  date: { type: String, required: true },
  submittedAt: { type: String, default: () => new Date().toISOString() },
  dob: { type: String, default: '1900-01-01' },
  documents: { type: Array },
  completion: { type: Number },
  requiredAction: { type: String },
  notes: { type: String },
  loanDetails: {
    purpose: { type: String },
    requestedAmount: { type: String },
    interestRate: { type: String },
    term: { type: String },
    monthlyPayment: { type: String }
  },
  personalInfo: {
    gender: { type: String },
    maritalStatus: { type: String },
    dependents: { type: Number },
    address: { type: String },
    province: { type: String },
    postalCode: { type: String },
    dateOfBirth: { type: String }
  },
  employmentInfo: {
    employmentStatus: { type: String },
    employmentType: { type: String },
    employer: { type: String },
    jobTitle: { type: String },
    employmentLength: { type: String },
    monthlyIncome: { type: Number }
  },
  financialInfo: {
    bankName: { type: String },
    accountType: { type: String },
    accountNumber: { type: String },
    creditScore: { type: Number },
    existingLoans: { type: Array },
    monthlyDebt: { type: String }
  },
  email: { type: String },
  phone: { type: String },
  idNumber: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', ApplicationSchema); 