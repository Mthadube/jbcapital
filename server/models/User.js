const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String, required: true },
  idNumber: { type: String, required: true },
  dateOfBirth: { type: String },
  gender: { type: String },
  maritalStatus: { type: String },
  dependents: { type: Number },
  address: { type: String, required: true },
  suburb: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String },
  employmentStatus: { type: String },
  employmentType: { type: String },
  employmentSector: { type: String },
  employerName: { type: String },
  jobTitle: { type: String },
  yearsEmployed: { type: Number },
  monthlyIncome: { type: Number, required: true },
  paymentDate: { type: String },
  bankName: { type: String },
  accountType: { type: String },
  accountNumber: { type: String },
  bankingPeriod: { type: Number },
  creditScore: { type: Number },
  existingLoans: { type: Boolean },
  existingLoanAmount: { type: Number },
  monthlyDebt: { type: Number },
  rentMortgage: { type: Number },
  carPayment: { type: Number },
  groceries: { type: Number },
  utilities: { type: Number },
  insurance: { type: Number },
  otherExpenses: { type: Number },
  totalMonthlyExpenses: { type: Number },
  accountStatus: { type: String, required: true },
  registrationDate: { type: String, required: true },
  lastLogin: { type: String },
  profileCompletionPercentage: { type: Number, required: true },
  incompleteProfileItems: [{ type: String }],
  verificationStatus: { type: String },
  role: { type: String, default: 'user' },
  // Reference to documents and loans
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  loans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Loan' }],
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }]
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // Enable virtuals when converting to JSON
  toObject: { virtuals: true } // Enable virtuals when converting to object
});

// Add middleware to populate references when finding users
UserSchema.pre('find', function() {
  this.populate('documents');
  this.populate('loans');
  this.populate('applications');
});

UserSchema.pre('findOne', function() {
  this.populate('documents');
  this.populate('loans');
  this.populate('applications');
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password') || !user.password) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password along with the new salt
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to validate password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); 