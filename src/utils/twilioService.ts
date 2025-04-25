import axios from 'axios';
import { API_BASE_URL } from './api';

// Message types
export const MESSAGE_TYPES = {
  LOAN_APPLICATION: 'loan_application',
  LOAN_APPROVED: 'loan_approved',
  PAYMENT_REMINDER: 'payment_reminder',
  PAYMENT_RECEIVED: 'payment_received',
  OTP_VERIFICATION: 'otp_verification',
};

/**
 * Send an SMS message using our backend API that connects to Twilio
 * @param to Phone number to send to
 * @param message Text message content
 * @returns Promise with the result of the SMS send operation
 */
export const sendSMS = async (to: string, message: string): Promise<any> => {
  try {
    console.log(`Attempting to send SMS to ${to}`);
    
    // Send the request to our backend API endpoint
    const response = await axios({
      method: 'post',
      url: `${API_BASE_URL}/sms/send`,
      data: { to, message },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.data.success) {
      console.error('SMS API error:', response.data.error);
      return {
        success: false,
        error: response.data.error || 'SMS sending failed'
      };
    }
    
    console.log('SMS sent successfully:', response.data);
    return {
      success: true,
      data: response.data.data
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
  } else if (status.toLowerCase() === 'loan created') {
    message += ' Your loan has been created and is being processed. We will notify you once the funds are ready for disbursement.';
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
  try {
    console.log(`Attempting to send OTP to ${phoneNumber}`);
    
    // Use the dedicated OTP endpoint
    const response = await axios({
      method: 'post',
      url: `${API_BASE_URL}/sms/send-otp`,
      data: { phoneNumber, otp },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.data.success) {
      console.error('OTP API error:', response.data.error);
      return {
        success: false,
        error: response.data.error || 'OTP sending failed'
      };
    }
    
    console.log('OTP sent successfully:', response.data);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}; 