// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const mountRoutes = require('./routes');
const { User, Document, Loan, Application } = require('./models');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Create default admin user if none exists
const initializeAdminUser = async () => {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ 
      email: 'admin@jbcapital.com',
      role: 'admin'
    });
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      
      // Create admin user
      const adminUser = new User({
        id: "USR-ADMIN",
        firstName: "Admin",
        lastName: "User",
        email: "admin@jbcapital.com",
        password: "admin123", // This will be hashed by the pre-save hook
        phone: "+27 83 456 7890",
        idNumber: "8001015012089",
        dateOfBirth: "1980-01-01",
        gender: "Other",
        maritalStatus: "Single",
        address: "JB Capital Headquarters",
        suburb: "Business District",
        city: "Johannesburg",
        state: "Gauteng",
        zipCode: "2000",
        country: "South Africa",
        employmentStatus: "employed",
        employmentType: "full-time",
        employmentSector: "Finance",
        employerName: "JB Capital",
        jobTitle: "System Administrator",
        yearsEmployed: 10,
        monthlyIncome: 75000,
        accountStatus: "active",
        registrationDate: "2020-01-01",
        lastLogin: new Date().toISOString(),
        profileCompletionPercentage: 100,
        role: "admin",
        verificationStatus: "verified",
        documents: [],
        loans: []
      });
      
      await adminUser.save();
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
};

// Initialize admin user on server start
initializeAdminUser();

// Mount routes
mountRoutes(app);

// Data migration route for initial setup
app.post('/api/migrate-data', async (req, res) => {
  try {
    console.log('Starting data migration process...');
    const { users, documents, loans, applications } = req.body;
    
    // Clear existing data if needed
    await User.deleteMany({ role: { $ne: 'admin' } }); // Don't delete admin user
    await Document.deleteMany({});
    await Loan.deleteMany({});
    await Application.deleteMany({});
    
    console.log(`Cleared existing data (except admin users)`);
    
    // Create a map to store ObjectIds for reference updates
    const userIdMap = new Map();
    const documentIdMap = new Map();
    const loanIdMap = new Map();
    
    // First insert all users
    if (users && users.length > 0) {
      console.log(`Migrating ${users.length} users...`);
      
      // For each user, create entry in MongoDB
      for (const user of users) {
        // Store the original references
        const originalUserLoans = [...user.loans];
        const originalUserDocuments = [...user.documents];
        
        // Create user without references (will update later)
        user.loans = [];
        user.documents = [];
        
        const newUser = new User(user);
        await newUser.save();
        
        // Store the mapping between original ID and MongoDB ObjectId
        userIdMap.set(user.id, {
          _id: newUser._id,
          originalLoans: originalUserLoans,
          originalDocuments: originalUserDocuments
        });
        
        console.log(`Migrated user: ${user.id}`);
      }
    }
    
    // Insert all documents
    if (documents && documents.length > 0) {
      console.log(`Migrating ${documents.length} documents...`);
      
      for (const doc of documents) {
        const newDoc = new Document(doc);
        await newDoc.save();
        
        // Store the mapping
        documentIdMap.set(doc.id, newDoc._id);
        
        // Update the user's documents array
        const userInfo = userIdMap.get(doc.userId);
        if (userInfo) {
          await User.updateOne(
            { _id: userInfo._id },
            { $push: { documents: newDoc._id } }
          );
          console.log(`Linked document ${doc.id} to user ${doc.userId}`);
        }
        
        console.log(`Migrated document: ${doc.id}`);
      }
    }
    
    // Insert all loans
    if (loans && loans.length > 0) {
      console.log(`Migrating ${loans.length} loans...`);
      
      for (const loan of loans) {
        const newLoan = new Loan(loan);
        await newLoan.save();
        
        // Store the mapping
        loanIdMap.set(loan.id, newLoan._id);
        
        // Update the user's loans array
        const userInfo = userIdMap.get(loan.userId);
        if (userInfo) {
          await User.updateOne(
            { _id: userInfo._id },
            { $push: { loans: newLoan._id } }
          );
          console.log(`Linked loan ${loan.id} to user ${loan.userId}`);
        }
        
        console.log(`Migrated loan: ${loan.id}`);
      }
    }
    
    // Insert all applications
    if (applications && applications.length > 0) {
      console.log(`Migrating ${applications.length} applications...`);
      
      for (const application of applications) {
        const newApplication = new Application(application);
        await newApplication.save();
        console.log(`Migrated application: ${application.id}`);
      }
    }
    
    console.log('Data migration completed successfully');
    res.json({ message: 'Data migration completed successfully' });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', time: new Date().toISOString() });
});

// Temporary route to reset admin password (DELETE THIS IN PRODUCTION)
app.get('/api/reset-admin', async (req, res) => {
  try {
    const admin = await User.findOne({ email: 'admin@jbcapital.com', role: 'admin' });
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    
    admin.password = 'admin123';
    await admin.save();
    
    return res.json({ message: 'Admin password reset to admin123' });
  } catch (error) {
    console.error('Error resetting admin password:', error);
    return res.status(500).json({ message: 'Error resetting admin password' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 