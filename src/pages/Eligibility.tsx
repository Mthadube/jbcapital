import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from "sonner";
import { ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const eligibilitySchema = z.object({
  annualIncome: z.number().min(0, "Income cannot be negative"),
  creditScore: z.number().min(300, "Credit score must be at least 300").max(850, "Credit score must be below 850"),
  monthlyDebt: z.number().min(0, "Monthly debt cannot be negative"),
  employmentStatus: z.enum(["employed", "self-employed", "unemployed", "retired"], {
    errorMap: () => ({ message: "Please select an employment status" }),
  }),
  loanAmount: z.number().min(1000, "Loan amount must be at least R1,000").max(1000000, "Loan amount cannot exceed R1,000,000"),
  loanTerm: z.number().min(1, "Loan term must be at least 1 year").max(30, "Loan term cannot exceed 30 years"),
});

type EligibilityFormData = z.infer<typeof eligibilitySchema>;

const Eligibility: React.FC = () => {
  const [showResults, setShowResults] = useState(false);
  const [eligibilityScore, setEligibilityScore] = useState(0);
  const [maxLoanAmount, setMaxLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<EligibilityFormData>({
    resolver: zodResolver(eligibilitySchema),
    defaultValues: {
      annualIncome: 50000,
      creditScore: 700,
      monthlyDebt: 1500,
      employmentStatus: "employed",
      loanAmount: 25000,
      loanTerm: 5,
    }
  });
  
  const onSubmit = (data: EligibilityFormData) => {
    const debtToIncomeRatio = (data.monthlyDebt * 12) / data.annualIncome;
    const creditScorePercentile = (data.creditScore - 300) / (850 - 300);
    const employmentFactor = 
      data.employmentStatus === "employed" ? 1 : 
      data.employmentStatus === "self-employed" ? 0.9 : 
      data.employmentStatus === "retired" ? 0.8 : 0.5;
    
    const calculatedScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (creditScorePercentile * 50) + 
          ((1 - Math.min(0.5, debtToIncomeRatio) / 0.5) * 30) + 
          (employmentFactor * 20)
        )
      )
    );
    
    const calculatedMaxLoan = Math.round(
      (data.annualIncome * 0.28 - data.monthlyDebt * 12) * 
      (data.loanTerm < 10 ? data.loanTerm / 2 : 5)
    );
    
    const calculatedRate = 
      calculatedScore > 80 ? 4.5 :
      calculatedScore > 70 ? 5.5 :
      calculatedScore > 60 ? 6.5 :
      calculatedScore > 50 ? 8.0 :
      calculatedScore > 40 ? 10.0 : 12.0;
    
    setEligibilityScore(calculatedScore);
    setMaxLoanAmount(Math.max(0, calculatedMaxLoan));
    setInterestRate(calculatedRate);
    setShowResults(true);
    toast.success("Eligibility check completed!");
    
    setTimeout(() => {
      const resultsElement = document.getElementById('eligibility-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="chip mx-auto">Loan Eligibility</div>
              <h1 className="heading-lg mt-4">Check Your Eligibility</h1>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto mt-4">
                Complete the form below to check your loan eligibility. This quick assessment will help you understand your loan options.
              </p>
            </div>
            
            <div className="glass-card p-6 mb-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="annualIncome" className="label">Annual Income (R)</Label>
                    <Controller
                      name="annualIncome"
                      control={control}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <Input 
                          id="annualIncome"
                          type="number"
                          className={`form-input ${errors.annualIncome ? 'border-destructive' : ''}`}
                          placeholder="50000"
                          value={value || ''}
                          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                          min={0}
                          step={1000}
                          {...rest}
                        />
                      )}
                    />
                    {errors.annualIncome && (
                      <p className="text-sm text-destructive mt-1">{errors.annualIncome.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="creditScore" className="label">Credit Score</Label>
                    <Controller
                      name="creditScore"
                      control={control}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <Input 
                          id="creditScore"
                          type="number"
                          className={`form-input ${errors.creditScore ? 'border-destructive' : ''}`}
                          placeholder="700"
                          value={value || ''}
                          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                          min={300}
                          max={850}
                          {...rest}
                        />
                      )}
                    />
                    {errors.creditScore && (
                      <p className="text-sm text-destructive mt-1">{errors.creditScore.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="monthlyDebt" className="label">Monthly Debt Payments (R)</Label>
                    <Controller
                      name="monthlyDebt"
                      control={control}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <Input 
                          id="monthlyDebt"
                          type="number"
                          className={`form-input ${errors.monthlyDebt ? 'border-destructive' : ''}`}
                          placeholder="1500"
                          value={value || ''}
                          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                          min={0}
                          step={100}
                          {...rest}
                        />
                      )}
                    />
                    {errors.monthlyDebt && (
                      <p className="text-sm text-destructive mt-1">{errors.monthlyDebt.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="employmentStatus" className="label">Employment Status</Label>
                    <Controller
                      name="employmentStatus"
                      control={control}
                      render={({ field }) => (
                        <select
                          id="employmentStatus"
                          className={`form-input ${errors.employmentStatus ? 'border-destructive' : ''}`}
                          {...field}
                        >
                          <option value="employed">Employed</option>
                          <option value="self-employed">Self-Employed</option>
                          <option value="unemployed">Unemployed</option>
                          <option value="retired">Retired</option>
                        </select>
                      )}
                    />
                    {errors.employmentStatus && (
                      <p className="text-sm text-destructive mt-1">{errors.employmentStatus.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="loanAmount" className="label">Desired Loan Amount (R)</Label>
                    <Controller
                      name="loanAmount"
                      control={control}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <Input 
                          id="loanAmount"
                          type="number"
                          className={`form-input ${errors.loanAmount ? 'border-destructive' : ''}`}
                          placeholder="25000"
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
                  
                  <div>
                    <Label htmlFor="loanTerm" className="label">Loan Term (Years)</Label>
                    <Controller
                      name="loanTerm"
                      control={control}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <Input 
                          id="loanTerm"
                          type="number"
                          className={`form-input ${errors.loanTerm ? 'border-destructive' : ''}`}
                          placeholder="5"
                          value={value || ''}
                          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                          min={1}
                          max={30}
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
                
                <div className="flex justify-center mt-8">
                  <button type="submit" className="btn-primary min-w-[200px]">
                    Check Eligibility
                  </button>
                </div>
              </form>
            </div>
            
            {showResults && (
              <div id="eligibility-results" className="glass-card p-6 animate-fade-in">
                <h2 className="heading-md mb-6">Your Eligibility Results</h2>
                
                <div className="space-y-6">
                  <div className="relative pt-6 pb-3">
                    <div className="text-center mb-2">
                      <span className="text-sm text-muted-foreground">Eligibility Score</span>
                      <div className="text-4xl font-bold text-primary">{eligibilityScore}</div>
                    </div>
                    
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${eligibilityScore}%`,
                          background: `linear-gradient(to right, 
                            ${eligibilityScore < 40 ? '#ef4444' : '#f97316'}, 
                            ${eligibilityScore < 70 ? '#f97316' : '#22c55e'})`
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-1">Estimated Max Loan Amount</h3>
                      <p className="text-3xl font-bold text-primary">
                        R{maxLoanAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on your income and debt ratio
                      </p>
                    </div>
                    
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-1">Estimated Interest Rate</h3>
                      <p className="text-3xl font-bold text-primary">
                        {interestRate.toFixed(2)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on your credit score and profile
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
                    <Link to="/application" className="btn-primary">
                      <span className="flex items-center">
                        Start Your Application <ChevronRight className="ml-1 h-4 w-4" />
                      </span>
                    </Link>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setShowResults(false)}
                    >
                      Recalculate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Eligibility;
