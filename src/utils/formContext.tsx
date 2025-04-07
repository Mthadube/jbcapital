import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  address: string;
  suburb?: string;
  city: string;
  state: string;
  zipCode: string;
  
  // ID information extracted from ID number
  dateOfBirth?: string;
  gender?: string;
  age?: number;
  
  // Employment Information
  employmentStatus: "employed" | "self-employed" | "unemployed" | "retired";
  employerName: string;
  jobTitle: string;
  yearsEmployed: number;
  monthlyIncome: number;
  paymentDate?: string;
  employmentType?: "full-time" | "part-time" | "contract" | "temporary" | "other";
  employmentSector?: string;
  
  // Financial Information
  creditScore: number;
  existingLoans: boolean;
  existingLoanAmount: number;
  monthlyDebt: number;
  rentMortgage?: number;
  carPayment?: number;
  groceries?: number;
  utilities?: number;
  insurance?: number;
  otherExpenses?: number;
  savings?: number;
  totalMonthlyExpenses?: number;
  bankName?: string;
  accountType?: string;
  bankingPeriod?: number;
  
  // Loan Details
  loanAmount: number;
  loanPurpose: "auto" | "home" | "education" | "personal" | "business" | "debt_consolidation" | "other";
  loanTerm: number;
  loanReason?: string;
  requestedDisbursementDate?: string;
  collateral?: boolean;
  collateralType?: string;
  collateralValue?: number;
  // Loan Calculation
  loanCalculation?: {
    monthlyPayment: number;
    totalRepayment: number;
    totalInterest: number;
    initiationFee: number;
    monthlyServiceFee: number;
    monthlyInsurance: number;
  };
  
  // Document Upload
  documentsUploaded: boolean;
  uploadedDocuments?: Record<string, any[]>;
}

interface FormContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  setInitialFormData: (data: Partial<FormData>) => void;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  isLastStep: boolean;
  progress: number;
}

const defaultFormData: FormData = {
  firstName: '',
  lastName: '',
  idNumber: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  address: '',
  suburb: '',
  city: '',
  state: '',
  zipCode: '',
  employmentStatus: "employed",
  employerName: '',
  jobTitle: '',
  yearsEmployed: 0,
  monthlyIncome: 0,
  creditScore: 0,
  existingLoans: false,
  existingLoanAmount: 0,
  monthlyDebt: 0,
  rentMortgage: 0,
  carPayment: 0,
  groceries: 0,
  utilities: 0,
  insurance: 0,
  otherExpenses: 0,
  savings: 0,
  bankName: '',
  accountType: 'cheque',
  bankingPeriod: 0,
  loanAmount: 0,
  loanPurpose: "personal",
  loanTerm: 0,
  documentsUploaded: false,
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6; // Total number of form steps
  
  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  const setInitialFormData = (data: Partial<FormData>) => {
    setFormData({ ...defaultFormData, ...data });
  };
  
  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Directly force the update instead of using the setter function
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      // Set state directly instead of using the setter function
      setCurrentStep(step);
      
      // Force a rerender by updating some other piece of state if needed
      setFormData(prev => ({...prev}));
      
      window.scrollTo(0, 0);
    }
  };
  
  const isLastStep = currentStep === totalSteps;
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <FormContext.Provider 
      value={{
        formData,
        updateFormData,
        setInitialFormData,
        currentStep,
        nextStep,
        prevStep,
        goToStep,
        isLastStep,
        progress
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
