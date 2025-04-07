interface LoanCalculatorData {
  loanAmount: number;
  loanDuration: number; // in months
  interestRate: number;
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  initiationFee: number;
  monthlyServiceFee: number;
  monthlyInsurance: number;
}

const STORAGE_KEY = 'jbcapital_loan_calculator_data';

export const saveLoanCalculatorData = (data: LoanCalculatorData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving loan calculator data:', error);
  }
};

export const getLoanCalculatorData = (): LoanCalculatorData | null => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return null;
    return JSON.parse(storedData) as LoanCalculatorData;
  } catch (error) {
    console.error('Error retrieving loan calculator data:', error);
    return null;
  }
};

export const clearLoanCalculatorData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing loan calculator data:', error);
  }
}; 