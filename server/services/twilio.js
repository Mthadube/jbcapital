const twilio = require('twilio');
require('dotenv').config();

// Debug logging for environment variables
console.log('Twilio Environment Variables:');
console.log('TWILIO_ACCOUNT_SID exists:', !!process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_AUTH_TOKEN exists:', !!process.env.TWILIO_AUTH_TOKEN);
console.log('TWILIO_PHONE_NUMBER exists:', !!process.env.TWILIO_PHONE_NUMBER);

// Initialize Twilio client
const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Send an SMS message
 * @param {string} to - Recipient phone number (must include country code, e.g., '+27123456789')
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Twilio message object
 */
const sendSMS = async (to, message) => {
  if (!client) {
    console.error('Missing Twilio credentials. SMS sending skipped.');
    return null;
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log('SMS sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

module.exports = {
  sendSMS
}; 