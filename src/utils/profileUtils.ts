import { User, Document } from './AppDataContext';

/**
 * Calculate the profile completion percentage based on the user's data
 * @param user User data object
 * @returns Percentage of profile completion (0-100)
 */
export const calculateProfileCompletion = (user: User): number => {
  if (!user) return 0;
  
  let totalFields = 0;
  let completedFields = 0;
  
  // Personal Information (6 required fields)
  const personalFields = ['firstName', 'lastName', 'email', 'phone', 'idNumber', 'dateOfBirth'];
  totalFields += personalFields.length;
  personalFields.forEach(field => {
    if (user[field as keyof User]) completedFields++;
  });
  
  // Address Information (5 required fields)
  const addressFields = ['address', 'suburb', 'city', 'state', 'zipCode'];
  totalFields += addressFields.length;
  addressFields.forEach(field => {
    if (user[field as keyof User]) completedFields++;
  });
  
  // Employment Information (5 required fields)
  const employmentFields = ['employmentStatus', 'employerName', 'jobTitle', 'yearsEmployed', 'monthlyIncome'];
  totalFields += employmentFields.length;
  employmentFields.forEach(field => {
    if (user[field as keyof User]) completedFields++;
  });
  
  // Financial Information (4 required fields)
  const financialFields = ['bankName', 'accountType', 'creditScore', 'monthlyDebt'];
  totalFields += financialFields.length;
  financialFields.forEach(field => {
    if (user[field as keyof User]) completedFields++;
  });
  
  // Required Documents (4 required documents)
  const requiredDocumentTypes = ['id', 'proof_of_residence', 'bank_statement', 'payslip'];
  totalFields += requiredDocumentTypes.length;
  
  // Count verified documents as 1 point, pending documents as 0.5 points
  if (user.documents && user.documents.length > 0) {
    requiredDocumentTypes.forEach(docType => {
      const matchingDocs = user.documents.filter(doc => doc.type === docType);
      if (matchingDocs.length > 0) {
        // If any document of this type is verified, count as complete
        if (matchingDocs.some(doc => doc.verificationStatus === 'verified')) {
          completedFields += 1;
        } 
        // If any document of this type is pending, count as partial
        else if (matchingDocs.some(doc => doc.verificationStatus === 'pending')) {
          completedFields += 0.5;
        }
      }
    });
  }
  
  // Calculate percentage and round to nearest integer
  const percentage = Math.round((completedFields / totalFields) * 100);
  
  return Math.min(100, percentage); // Cap at 100%
};

/**
 * Get a list of items that need to be completed in the user's profile
 * @param user User data object
 * @returns Array of strings describing incomplete profile items
 */
export const getIncompleteProfileItems = (user: User): string[] => {
  if (!user) return [];
  
  const incompleteItems: string[] = [];
  
  // Check personal information
  const personalFields = ['firstName', 'lastName', 'email', 'phone', 'idNumber', 'dateOfBirth'];
  const hasIncompletePersonal = personalFields.some(field => !user[field as keyof User]);
  if (hasIncompletePersonal) {
    incompleteItems.push('Complete personal information');
  }
  
  // Check address information
  const addressFields = ['address', 'suburb', 'city', 'state', 'zipCode'];
  const hasIncompleteAddress = addressFields.some(field => !user[field as keyof User]);
  if (hasIncompleteAddress) {
    incompleteItems.push('Add your address details');
  }
  
  // Check employment information
  const employmentFields = ['employmentStatus', 'employerName', 'jobTitle', 'yearsEmployed', 'monthlyIncome'];
  const hasIncompleteEmployment = employmentFields.some(field => !user[field as keyof User]);
  if (hasIncompleteEmployment) {
    incompleteItems.push('Complete employment details');
  }
  
  // Check financial information
  const financialFields = ['bankName', 'accountType', 'creditScore', 'monthlyDebt'];
  const hasIncompleteFinancial = financialFields.some(field => !user[field as keyof User]);
  if (hasIncompleteFinancial) {
    incompleteItems.push('Add financial information');
  }
  
  // Check required documents
  const requiredDocumentTypes = ['id', 'proof_of_residence', 'bank_statement', 'payslip'];
  
  if (!user.documents || user.documents.length === 0) {
    incompleteItems.push('Upload required documents');
  } else {
    requiredDocumentTypes.forEach(docType => {
      if (!user.documents.some(doc => doc.type === docType)) {
        incompleteItems.push(`Upload ${getDocumentTypeDisplayName(docType)}`);
      } else if (!user.documents.some(doc => doc.type === docType && doc.verificationStatus === 'verified')) {
        // Only show document as incomplete if it's not verified (pending counts as incomplete)
        if (user.documents.some(doc => doc.type === docType && doc.verificationStatus === 'rejected')) {
          incompleteItems.push(`Reupload ${getDocumentTypeDisplayName(docType)} (rejected)`);
        }
      }
    });
  }
  
  return incompleteItems;
};

/**
 * Get a user-friendly display name for a document type
 * @param type Document type identifier
 * @returns User-friendly display name
 */
export const getDocumentTypeDisplayName = (type: string): string => {
  switch (type) {
    case 'id':
      return 'ID Document';
    case 'proof_of_residence':
      return 'Proof of Residence';
    case 'bank_statement':
      return 'Bank Statements';
    case 'payslip':
      return 'Latest Payslip';
    case 'proof_of_income':
      return 'Proof of Income';
    case 'employment_verification':
      return 'Employment Verification';
    default:
      return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}; 