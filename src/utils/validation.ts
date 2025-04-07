import { z } from "zod";

// Helper function to validate SA ID number
const validateSAID = (id: string) => {
  // Check if input contains only digits
  if (!/^\d+$/.test(id)) {
    return { valid: false, message: "ID number must contain only digits" };
  }

  // Check length
  if (id.length !== 13) {
    return { valid: false, message: `ID number must be exactly 13 digits (currently ${id.length} digits)` };
  }

  // Extract date components
  const year = parseInt(id.substring(0, 2));
  const month = parseInt(id.substring(2, 4));
  const day = parseInt(id.substring(4, 6));
  
  // Validate month
  if (month < 1 || month > 12) {
    return { valid: false, message: `Invalid birth month '${month}' in ID number (must be between 01-12)` };
  }

  // Validate day based on month
  const daysInMonth = new Date(2000, month, 0).getDate(); // Using 2000 as it's a leap year
  if (day < 1 || day > daysInMonth) {
    return { valid: false, message: `Invalid birth day '${day}' for month ${month} (must be between 01-${daysInMonth})` };
  }
  
  // Gender validation (7-digit sequence between 0000 and 9999)
  const genderDigits = parseInt(id.substring(6, 10));
  const isFemale = genderDigits < 5000;
  
  // Citizenship validation (0 for SA citizen, 1 for permanent resident)
  const citizenship = parseInt(id.substring(10, 11));
  if (citizenship !== 0 && citizenship !== 1) {
    return { valid: false, message: "Citizenship digit must be 0 (SA citizen) or 1 (permanent resident)" };
  }
  
  // Calculate age
  const currentYear = new Date().getFullYear();
  let birthYear = year;
  // Determine century (1900s or 2000s)
  if (year >= 0 && year <= 23) { // Assuming the system will be used until 2023
    birthYear += 2000;
  } else {
    birthYear += 1900;
  }
  
  const birthDate = new Date(birthYear, month - 1, day);
  const age = currentYear - birthYear;
  
  // Check if person is at least 18
  if (age < 18 || (age === 18 && birthDate > new Date())) {
    const dateString = birthDate.toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });
    return { 
      valid: false, 
      message: `Applicant must be 18 years or older (birth date: ${dateString}, current age: ${age} years)` 
    };
  }

  // If all validations pass, return success with gender and citizenship info
  return { 
    valid: true, 
    message: `Valid SA ID number (${isFemale ? 'Female' : 'Male'}, ${citizenship === 0 ? 'SA Citizen' : 'Permanent Resident'})` 
  };
};

/**
 * Parse a South African ID number and extract information from it
 * @param idNumber - The 13-digit South African ID number
 * @returns Object containing the extracted information or null if invalid
 */
export const parseSouthAfricanID = (idNumber: string) => {
  // Basic validation
  if (!idNumber || idNumber.length !== 13 || !/^\d+$/.test(idNumber)) {
    return null;
  }

  // Extract components
  const birthYearPrefix = parseInt(idNumber.substring(0, 2)) < 50 ? "20" : "19";
  const birthYear = birthYearPrefix + idNumber.substring(0, 2);
  const birthMonth = idNumber.substring(2, 4);
  const birthDay = idNumber.substring(4, 6);
  const genderDigit = parseInt(idNumber.substring(6, 7));
  const citizenshipDigit = parseInt(idNumber.substring(10, 11));

  // Validate birth date
  const parsedDate = new Date(`${birthYear}-${birthMonth}-${birthDay}`);
  if (isNaN(parsedDate.getTime())) {
    return null; // Invalid date
  }

  // Calculate age correctly
  const today = new Date();
  let age = today.getFullYear() - parsedDate.getFullYear();
  const m = today.getMonth() - parsedDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < parsedDate.getDate())) {
    age--;
  }

  // Create formatted date string (DD Month YYYY)
  const formattedBirthDate = parsedDate.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // ISO format for database storage
  const isoDateString = parsedDate.toISOString().split('T')[0];

  return {
    birthDate: parsedDate,
    formattedBirthDate,
    isoDateString,
    age,
    gender: genderDigit < 5 ? "Female" : "Male",
    citizenship: citizenshipDigit === 0 ? "SA Citizen" : "Permanent Resident"
  };
};

// Personal Information Schema
const personalInfoBaseSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  idNumber: z.string().refine(
    (id) => {
      const validation = validateSAID(id);
      return validation.valid;
    },
    (id) => {
      const validation = validateSAID(id);
      return { message: validation.message };
    }
  ),
  phoneNumber: z.string().regex(/^0\d{9}$/, "Please enter a valid 10-digit phone number starting with 0"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  suburb: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  province: z.string().min(2, "Please select a province"),
  postalCode: z.string().regex(/^\d{4}$/, "Please enter a valid 4-digit postal code"),
});

export const personalInfoSchema = personalInfoBaseSchema.refine(
  (data) => data.password === data.confirmPassword, 
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

// Employment Information Schema
export const employmentInfoSchema = z.object({
  employmentStatus: z.enum(["employed", "self-employed", "unemployed", "retired"], {
    errorMap: () => ({ message: "Please select an employment status" }),
  }),
  employerName: z.string().min(2, "Employer name must be at least 2 characters").optional().or(z.literal("")),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters").optional().or(z.literal("")),
  yearsEmployed: z.number().min(0, "Years employed cannot be negative").optional(),
  monthlyIncome: z.number().min(0, "Monthly income cannot be negative"),
  paymentDate: z.string().optional(),
  employmentType: z.enum(["full-time", "part-time", "contract", "temporary", "other"], {
    errorMap: () => ({ message: "Please select an employment type" }),
  }).optional(),
  employmentSector: z.string().optional(),
});

// Financial Information Schema
export const financialInfoSchema = z.object({
  creditScore: z.number().min(300, "Credit score must be at least 300").max(850, "Credit score cannot exceed 850"),
  existingLoans: z.boolean(),
  existingLoanAmount: z.number().min(0, "Loan amount cannot be negative"),
  monthlyDebt: z.number().min(0, "Monthly debt cannot be negative"),
  // Additional fields
  rentMortgage: z.number().min(0, "Amount cannot be negative"),
  carPayment: z.number().min(0, "Amount cannot be negative"),
  groceries: z.number().min(0, "Amount cannot be negative"),
  utilities: z.number().min(0, "Amount cannot be negative"),
  insurance: z.number().min(0, "Amount cannot be negative"),
  otherExpenses: z.number().min(0, "Amount cannot be negative"),
  savings: z.number().min(0, "Amount cannot be negative"),
  bankName: z.string().optional(),
  accountType: z.string().optional(),
  bankingPeriod: z.number().min(0, "Banking period cannot be negative").optional(),
});

// Loan Details Schema
export const loanDetailsSchema = z.object({
  loanAmount: z.number().min(1000, "Loan amount must be at least R1,000").max(1000000, "Loan amount cannot exceed R1,000,000"),
  loanPurpose: z.enum(["home", "auto", "education", "personal", "business", "debt_consolidation", "other"], {
    errorMap: () => ({ message: "Please select a loan purpose" }),
  }),
  loanTerm: z.number().min(1, "Loan term must be at least 1 month").max(4, "Loan term cannot exceed 4 months"),
  loanReason: z.string().optional(),
  requestedDisbursementDate: z.string().optional(),
  collateral: z.boolean().optional(),
  collateralType: z.string().optional(),
  collateralValue: z.number().min(0, "Value cannot be negative").optional(),
});

// Document Schema
export const documentSchema = z.object({
  documentsUploaded: z.boolean(),
  uploadedDocuments: z.record(z.array(z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    type: z.string(),
  }))).optional(),
});

// Combined schema for the entire form - use spread instead of merge
export const completeFormSchema = z.object({
  ...personalInfoBaseSchema.shape,
  ...employmentInfoSchema.shape,
  ...financialInfoSchema.shape,
  ...loanDetailsSchema.shape,
  ...documentSchema.shape
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type EmploymentInfoFormData = z.infer<typeof employmentInfoSchema>;
export type FinancialInfoFormData = z.infer<typeof financialInfoSchema>;
export type LoanDetailsFormData = z.infer<typeof loanDetailsSchema>;
export type CompleteFormData = z.infer<typeof completeFormSchema>;
