import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanDetailsSchema, LoanDetailsFormData } from '@/utils/validation';
import { useFormContext } from '@/utils/formContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLoanCalculatorData } from '@/utils/loanDataStorage';
import { PieChart, ArrowRight } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const LoanDetailsForm: React.FC = () => {
  const { formData, updateFormData, prevStep, nextStep } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    monthlyPayment: 0,
    totalRepayment: 0,
    totalInterest: 0,
    initiationFee: 0,
    monthlyServiceFee: 69,
    monthlyInsurance: 0,
    interestRate: 14
  });
  
  // Try to get saved calculator data on initial render
  useEffect(() => {
    const savedData = getLoanCalculatorData();
    if (savedData) {
      // Just use the loan duration in months
      const loanTermMonths = Math.min(savedData.loanDuration, 4);
      
      // Pre-populate form with saved data
      setValue('loanAmount', savedData.loanAmount);
      setValue('loanTerm', loanTermMonths);
      
      // Update calculated values
      setCalculatedValues({
        monthlyPayment: savedData.monthlyPayment,
        totalRepayment: savedData.totalRepayment,
        totalInterest: savedData.totalInterest,
        initiationFee: savedData.initiationFee,
        monthlyServiceFee: savedData.monthlyServiceFee,
        monthlyInsurance: savedData.monthlyInsurance,
        interestRate: savedData.interestRate
      });
    }
  }, []);
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<LoanDetailsFormData>({
    resolver: zodResolver(loanDetailsSchema),
    defaultValues: {
      loanAmount: formData.loanAmount || 10000,
      loanPurpose: formData.loanPurpose || "personal",
      loanTerm: formData.loanTerm || 3,
    }
  });
  
  const loanAmount = watch('loanAmount') || 10000;
  const loanTerm = watch('loanTerm') || 3;
  
  // Recalculate values when form inputs change
  useEffect(() => {
    // Interest rate (using the saved rate or default to 14%)
    const interestRate = calculatedValues.interestRate;
    
    // Monthly interest rate
    const monthlyRate = interestRate / 100 / 12;
    
    // Calculate monthly payment using the loan formula
    const monthsTerms = loanTerm; // Now directly in months
    const x = Math.pow(1 + monthlyRate, monthsTerms);
    const monthly = (loanAmount * x * monthlyRate) / (x - 1);
    
    // Calculate fees
    const initiationFee = Math.min(1050 + (loanAmount * 0.0175), 5000);
    const monthlyServiceFee = 69;
    const monthlyInsurance = loanAmount * 0.00175;
    
    // Total payment over the loan lifetime
    const baseTotal = monthly * monthsTerms;
    const interest = baseTotal - loanAmount;
    const totalServiceFee = monthlyServiceFee * monthsTerms;
    const totalInsurance = monthlyInsurance * monthsTerms;
    const totalRepayment = baseTotal + initiationFee + totalServiceFee + totalInsurance;
    
    setCalculatedValues({
      monthlyPayment: isNaN(monthly) ? 0 : monthly,
      totalRepayment: isNaN(totalRepayment) ? 0 : totalRepayment,
      totalInterest: isNaN(interest) ? 0 : interest,
      initiationFee,
      monthlyServiceFee,
      monthlyInsurance,
      interestRate
    });
  }, [loanAmount, loanTerm]);
  
  const onSubmit = (data: LoanDetailsFormData) => {
    setIsSubmitting(true);
    
    updateFormData({
      ...data,
      // Also store the calculated values for later use
      loanCalculation: {
        monthlyPayment: calculatedValues.monthlyPayment,
        totalRepayment: calculatedValues.totalRepayment,
        totalInterest: calculatedValues.totalInterest,
        initiationFee: calculatedValues.initiationFee,
        monthlyServiceFee: calculatedValues.monthlyServiceFee,
        monthlyInsurance: calculatedValues.monthlyInsurance
      }
    });
    
    // Simulate processing delay
    setTimeout(() => {
      nextStep(); // Go to the document upload step
      setIsSubmitting(false);
    }, 500);
  };
  
  const loanPurposes = [
    { value: "home", label: "Home Purchase or Refinance" },
    { value: "auto", label: "Vehicle Finance" },
    { value: "education", label: "Education" },
    { value: "personal", label: "Personal Loan" },
    { value: "business", label: "Business Loan" },
    { value: "debt_consolidation", label: "Debt Consolidation" },
    { value: "other", label: "Other" },
  ];
  
  const formatter = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const formatAmount = (amount: number | string): string => {
    if (typeof amount === 'string') amount = parseFloat(amount);
    return formatter.format(amount).replace('ZAR', 'R');
  };
  
  // Total monthly payment including all fees
  const totalMonthlyPayment = calculatedValues.monthlyPayment + 
                            calculatedValues.monthlyServiceFee + 
                            calculatedValues.monthlyInsurance;
  
  // Chart data for the breakdown pie chart
  const chartData = [
    { name: 'Principal', value: loanAmount, color: '#0066cc' },
    { name: 'Interest', value: calculatedValues.totalInterest, color: '#9333ea' },
    { name: 'Fees', value: calculatedValues.initiationFee + 
                          (calculatedValues.monthlyServiceFee * loanTerm) + 
                          (calculatedValues.monthlyInsurance * loanTerm), 
      color: '#22c55e' }
  ];
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <h2 className="heading-md mb-6">Loan Details</h2>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="loanAmount" className="label">Loan Amount (R)</Label>
            <div className="space-y-2">
              <Controller
                name="loanAmount"
                control={control}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Input 
                    id="loanAmount"
                    type="number"
                    className={`form-input ${errors.loanAmount ? 'border-destructive' : ''}`}
                    placeholder="10000"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                    min={1000}
                    max={1000000}
                    step={1000}
                    {...rest}
                  />
                )}
              />
              {errors.loanAmount && (
                <p className="text-sm text-destructive mt-1">{errors.loanAmount.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="loanPurpose" className="label">Loan Purpose</Label>
            <Controller
              name="loanPurpose"
              control={control}
              render={({ field }) => (
                <select
                  id="loanPurpose"
                  className={`form-input ${errors.loanPurpose ? 'border-destructive' : ''}`}
                  {...field}
                >
                  <option value="">Select loan purpose</option>
                  {loanPurposes.map((purpose) => (
                    <option key={purpose.value} value={purpose.value}>
                      {purpose.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.loanPurpose && (
              <p className="text-sm text-destructive mt-1">{errors.loanPurpose.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="loanTerm" className="label">Loan Term (Months)</Label>
            <div className="space-y-2">
              <Controller
                name="loanTerm"
                control={control}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Input 
                    id="loanTerm"
                    type="number"
                    className={`form-input ${errors.loanTerm ? 'border-destructive' : ''}`}
                    placeholder="3"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                    min={1}
                    max={4}
                    step={1}
                    {...rest}
                  />
                )}
              />
              {errors.loanTerm && (
                <p className="text-sm text-destructive mt-1">{errors.loanTerm.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="heading-md mb-6">Loan Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h3 className="text-lg font-medium text-foreground mb-1">Estimated Monthly Payment</h3>
              <p className="text-3xl font-bold text-primary">
                {formatAmount(totalMonthlyPayment)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Based on {loanTerm} months term at {calculatedValues.interestRate}% APR
              </p>
            </div>
            
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h3 className="text-lg font-medium text-foreground mb-1">Total Cost of Credit</h3>
              <p className="text-3xl font-bold text-primary">
                {formatAmount(calculatedValues.totalRepayment)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Includes principal, interest, and all fees
              </p>
            </div>
            
            {/* Fee Breakdown Section */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <button 
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex items-center justify-between w-full text-sm font-medium text-primary"
              >
                <span>View Cost Breakdown</span>
                <ArrowRight className={`h-4 w-4 transition-transform ${showBreakdown ? 'rotate-90' : ''}`} />
              </button>
              
              {showBreakdown && (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Principal Amount</span>
                    <span className="font-medium">{formatAmount(loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Total Interest</span>
                    <span className="font-medium">{formatAmount(calculatedValues.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Initiation Fee</span>
                    <span className="font-medium">{formatAmount(calculatedValues.initiationFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Monthly Service Fee</span>
                    <span className="font-medium">{formatAmount(calculatedValues.monthlyServiceFee)}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Monthly Insurance</span>
                    <span className="font-medium">{formatAmount(calculatedValues.monthlyInsurance)}/month</span>
                  </div>
                  <div className="border-t border-primary/10 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total Monthly Payment</span>
                      <span className="text-primary">{formatAmount(totalMonthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between font-medium mt-1">
                      <span>Total Cost of Credit</span>
                      <span className="text-primary">{formatAmount(calculatedValues.totalRepayment)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full aspect-square relative mx-auto max-w-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <PieChart className="h-6 w-6 text-primary mb-1" />
              <div className="text-sm text-foreground/70">Total Repayment</div>
              <div className="text-xl font-bold">{formatAmount(calculatedValues.totalRepayment)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <button 
          type="button" 
          className="btn-secondary min-w-[150px]"
          onClick={prevStep}
        >
          Back
        </button>
        <button 
          type="submit" 
          className="btn-primary min-w-[180px] relative"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="opacity-0">Continue</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </form>
  );
};

export default LoanDetailsForm;
