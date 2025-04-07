import axios from 'axios';

// Twilio credentials from environment variables
const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID || 'TWILIO_ACCOUNT_SID_PLACEHOLDER';
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN || 'TWILIO_AUTH_TOKEN_PLACEHOLDER';
const TWILIO_PHONE_NUMBER = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '+15555555555';

// Base64 encode the SID and Auth Token for basic auth
const basicAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

// Message types
export const MESSAGE_TYPES = {
  LOAN_APPLICATION: 'loan_application',
  LOAN_APPROVED: 'loan_approved',
  PAYMENT_REMINDER: 'payment_reminder',
  PAYMENT_RECEIVED: 'payment_received',
  OTP_VERIFICATION: 'otp_verification',
};

/**
 * Send an SMS message using Twilio API directly
 * @param to Phone number to send to (must include country code)
 * @param message Text message content
 * @returns Promise with the result of the SMS send operation
 */
export const sendSMS = async (to: string, message: string): Promise<any> => {
  try {
    // Format the phone number to ensure it has the country code
    const formattedPhone = formatPhoneNumber(to);
    
    console.log(`Attempting to send SMS to ${formattedPhone}`);
    
    // Create the request body in the format Twilio expects
    const params = new URLSearchParams();
    params.append('To', formattedPhone);
    params.append('From', TWILIO_PHONE_NUMBER);
    params.append('Body', message);
    
    // Send the request to Twilio's API
    const response = await axios({
      method: 'post',
      url: `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      data: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`
      },
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors to handle them manually
    });
    
    if (response.status >= 400) {
      console.error('Twilio API error:', response.status, response.data);
      return {
        success: false,
        error: response.data?.message || `API Error: ${response.status}`
      };
    }
    
    console.log('SMS sent successfully:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending SMS:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Format a phone number to ensure it has the country code
 * @param phoneNumber Phone number to format
 * @returns Formatted phone number with country code
 */
const formatPhoneNumber = (phoneNumber: string): string => {
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

/**
 * Send a loan application confirmation message
 * @param phoneNumber User's phone number
 * @param firstName User's first name
 * @param applicationId Application ID or reference number
 * @returns Promise with the result of the SMS send operation
 */
export const sendLoanApplicationConfirmation = async (
  phoneNumber: string, 
  firstName: string, 
  applicationId: string
): Promise<any> => {
  const message = `Hi ${firstName}, thank you for your loan application with JB Capital. Your application reference number is ${applicationId}. We're processing your application and will update you soon.`;
  return sendSMS(phoneNumber, message);
};

/**
 * Send an SMS notification when the loan application status changes
 * @param phoneNumber User's phone number
 * @param firstName User's first name
 * @param status New status of the application
 * @param applicationId Application ID
 * @returns Promise with the result of the SMS send operation
 */
export const sendLoanStatusUpdate = async (
  phoneNumber: string,
  firstName: string,
  status: string,
  applicationId: string
): Promise<any> => {
  let message = `Hi ${firstName}, the status of your JB Capital loan application (Ref: ${applicationId}) has been updated to: ${status}.`;
  
  if (status.toLowerCase() === 'approved') {
    message += ' Congratulations! Please log in to your account to view the details and complete the process.';
  } else if (status.toLowerCase() === 'rejected') {
    message += ' Please contact our customer support for more information.';
  }
  
  return sendSMS(phoneNumber, message);
};

/**
 * Send a payment reminder SMS
 * @param phoneNumber User's phone number
 * @param firstName User's first name
 * @param amount Payment amount
 * @param dueDate Due date of the payment
 * @returns Promise with the result of the SMS send operation
 */
export const sendPaymentReminder = async (
  phoneNumber: string,
  firstName: string,
  amount: number,
  dueDate: string
): Promise<any> => {
  // Format the amount as currency
  const formattedAmount = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('ZAR', 'R');
  
  const message = `Hi ${firstName}, this is a reminder that your loan payment of ${formattedAmount} is due on ${dueDate}. Please ensure your account has sufficient funds for the debit order.`;
  return sendSMS(phoneNumber, message);
};

/**
 * Send an SMS notification for successful payment
 * @param phoneNumber User's phone number
 * @param firstName User's first name
 * @param amount Payment amount
 * @returns Promise with the result of the SMS send operation
 */
export const sendPaymentConfirmation = async (
  phoneNumber: string,
  firstName: string,
  amount: number
): Promise<any> => {
  // Format the amount as currency
  const formattedAmount = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('ZAR', 'R');
  
  const message = `Hi ${firstName}, we've received your payment of ${formattedAmount}. Thank you! You can view your updated loan statement by logging into your JB Capital account.`;
  return sendSMS(phoneNumber, message);
};

/**
 * Send an OTP (One-Time Password) for account verification
 * @param phoneNumber User's phone number
 * @param otp The one-time password
 * @returns Promise with the result of the SMS send operation
 */
export const sendOTP = async (
  phoneNumber: string,
  otp: string
): Promise<any> => {
  const message = `Your JB Capital verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
  return sendSMS(phoneNumber, message);
};