const express = require('express');
const router = express.Router();
const axios = require('axios');

// Twilio credentials from environment variables
const TWILIO_ACCOUNT_SID = process.env.VITE_TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.VITE_TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.VITE_TWILIO_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER;

// Format a phone number to ensure it has the country code
const formatPhoneNumber = (phoneNumber) => {
  console.log(`Formatting phone number: ${phoneNumber}`);
  
  // Remove any non-digit characters
  let digits = phoneNumber.replace(/\D/g, '');
  console.log(`After removing non-digits: ${digits}`);
  
  // Handle special cases
  if (digits.length === 0) {
    console.error('Empty phone number after formatting');
    // Return a default test number or throw an error
    return '+27000000000';  // Default test number
  }
  
  // South African mobile numbers start with 0 followed by 6, 7, or 8
  // If the number starts with 0, replace it with the South Africa country code +27
  if (digits.startsWith('0')) {
    digits = `+27${digits.substring(1)}`;
    console.log(`Applied SA country code: ${digits}`);
  } 
  // If starts with 27 (without +), add + prefix
  else if (digits.startsWith('27')) {
    digits = `+${digits}`;
    console.log(`Added + to country code: ${digits}`);
  }
  // If no country code, assume South Africa
  else if (!digits.startsWith('+')) {
    // For South African numbers without leading 0 or country code
    digits = `+27${digits}`;
    console.log(`Added SA country code: ${digits}`);
  }
  
  console.log(`Final formatted number: ${digits}`);
  return digits;
};

// Send SMS message through Twilio API
router.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and message are required' 
      });
    }
    
    console.log(`API request to send SMS to ${to}`);
    
    // Format the phone number
    const formattedPhone = formatPhoneNumber(to);
    
    // Check if Twilio credentials are present
    if (!TWILIO_ACCOUNT_SID || TWILIO_ACCOUNT_SID === 'TWILIO_ACCOUNT_SID_PLACEHOLDER' || 
        !TWILIO_AUTH_TOKEN || TWILIO_AUTH_TOKEN === 'TWILIO_AUTH_TOKEN_PLACEHOLDER' ||
        !TWILIO_PHONE_NUMBER) {
      console.error('Missing Twilio credentials. SMS sending skipped.');
      return res.status(503).json({
        success: false,
        error: 'SMS service is not properly configured'
      });
    }
    
    // Create form data
    const params = new URLSearchParams();
    params.append('To', formattedPhone);
    params.append('From', TWILIO_PHONE_NUMBER);
    params.append('Body', message);
    
    // Basic auth using Twilio credentials
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    // Send request to Twilio API
    const response = await axios({
      method: 'post',
      url: `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      data: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      }
    });
    
    console.log('SMS sent successfully:', response.data);
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error sending SMS:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data || error.message 
    });
  }
});

// Send OTP verification code
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and OTP code are required' 
      });
    }
    
    const message = `Your JB Capital verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
    
    // Format the phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Check if Twilio credentials are present
    if (!TWILIO_ACCOUNT_SID || TWILIO_ACCOUNT_SID === 'TWILIO_ACCOUNT_SID_PLACEHOLDER' || 
        !TWILIO_AUTH_TOKEN || TWILIO_AUTH_TOKEN === 'TWILIO_AUTH_TOKEN_PLACEHOLDER' ||
        !TWILIO_PHONE_NUMBER) {
      console.error('Missing Twilio credentials. OTP sending skipped.');
      return res.status(503).json({
        success: false,
        error: 'SMS service is not properly configured'
      });
    }
    
    // Create form data
    const params = new URLSearchParams();
    params.append('To', formattedPhone);
    params.append('From', TWILIO_PHONE_NUMBER);
    params.append('Body', message);
    
    // Basic auth using Twilio credentials
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    // Send request to Twilio API
    const response = await axios({
      method: 'post',
      url: `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      data: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      }
    });
    
    console.log('OTP SMS sent successfully:', response.data);
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error sending OTP SMS:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data || error.message 
    });
  }
});

module.exports = router; 