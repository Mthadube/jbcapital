/**
 * Server start script with environment variables
 * This is useful for Windows PowerShell where && syntax doesn't work
 */
require('dotenv').config();
console.log('Starting JB Capital API server...');
console.log(`PORT: ${process.env.PORT || 5001}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
require('./server'); 