/**
 * Generates a random ID with a specified prefix
 * @param prefix - The prefix to use for the ID (e.g., 'USR', 'LN', 'APP')
 * @returns A string ID with the format PREFIX-XXXXXXXX
 */
export const generateRandomId = (prefix: string): string => {
  // Generate 8 random hexadecimal characters
  const randomPart = Math.random().toString(16).substring(2, 10).toUpperCase();
  return `${prefix}-${randomPart}`;
};

/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - The currency symbol (default: 'R')
 * @returns A formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'R'): string => {
  return `${currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Formats a date string to a readable format
 * @param dateString - The date string to format
 * @returns A formatted date string
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Calculates the number of days between two dates
 * @param startDateString - The start date string
 * @param endDateString - The end date string (defaults to current date)
 * @returns The number of days between the dates
 */
export const daysBetweenDates = (startDateString: string, endDateString?: string): number => {
  const startDate = new Date(startDateString);
  const endDate = endDateString ? new Date(endDateString) : new Date();
  
  // Calculate the difference in milliseconds
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  
  // Convert to days
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Truncates a string to a specified length
 * @param str - The string to truncate
 * @param maxLength - The maximum length
 * @returns The truncated string with ellipsis if needed
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}; 