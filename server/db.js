const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// MongoDB connection string from .env file or hardcoded fallback
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mthadube:uDRRd9wntR1F0FJx@cluster0.hagnbde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'jbcapital';

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Using connection string (first 20 chars):', MONGODB_URI.substring(0, 20) + '...');
    
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 