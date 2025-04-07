import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { 
  CircleDollarSign, 
  CalendarDays, 
  ArrowRight, 
  PieChart
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { saveLoanCalculatorData } from '@/utils/loanDataStorage';

interface LoanCalculatorProps {
  className?: string;
}

const LoanCalculator: React.FC<LoanCalculatorProps> = ({ className }) => {
  const [loanAmount, setLoanAmount] = useState(25000);
  const [loanDuration, setLoanDuration] = useState(3);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalRepayment, setTotalRepayment] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const interestRate = 28.75; // Annual interest rate (%)
  const initiationFee = Math.min(1050 + (loanAmount * 0.0175), 5000); // R1050 + 1.75% of loan amount, capped at R5000
  const monthlyServiceFee = 69; // Monthly service fee
  const totalServiceFee = monthlyServiceFee * loanDuration;
  const monthlyInsurance = loanAmount * 0.00175; // Credit life insurance rate of 0.175% of loan amount
  const totalInsurance = monthlyInsurance * loanDuration;
  
  const formatter = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  const formatAmount = (amount: number): string => {
    return formatter.format(amount).replace('ZAR', 'R');
  };
  
  useEffect(() => {
    // Monthly interest rate
    const monthlyRate = interestRate / 100 / 12;
    
    // Calculate monthly payment using the loan formula
    const x = Math.pow(1 + monthlyRate, loanDuration);
    const monthly = (loanAmount * x * monthlyRate) / (x - 1);
    
    // Total payment over the loan lifetime
    const total = monthly * loanDuration;
    const interest = total - loanAmount;
    
    setMonthlyPayment(isNaN(monthly) ? 0 : monthly);
    setTotalInterest(isNaN(interest) ? 0 : interest);
    setTotalRepayment(isNaN(total) ? 0 : total + initiationFee + totalServiceFee + totalInsurance);
  }, [loanAmount, loanDuration, interestRate, initiationFee, totalServiceFee, totalInsurance]);
  
  const chartData = [
    { name: 'Principal', value: loanAmount, color: '#0066cc' },
    { name: 'Interest', value: totalInterest, color: '#9333ea' },
    { name: 'Fees', value: initiationFee + totalServiceFee + totalInsurance, color: '#22c55e' }
  ];

  const totalMonthlyPayment = monthlyPayment + monthlyServiceFee + monthlyInsurance;
  
  const handleApplyNow = () => {
    // Save loan calculator data before navigating to application
    saveLoanCalculatorData({
      loanAmount,
      loanDuration,
      interestRate,
      monthlyPayment,
      totalInterest,
      totalRepayment,
      initiationFee,
      monthlyServiceFee,
      monthlyInsurance
    });
  };
  
  return (
    <div className={`glass-card p-6 shadow-xl ${className}`}>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Loan Calculator</h2>
        <div className="text-xs font-medium text-foreground/70 bg-primary/10 text-primary rounded-full px-2 py-1">
          {interestRate}% Interest Rate
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side: Input controls */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="label flex items-center">
                <CircleDollarSign className="h-4 w-4 mr-2 text-primary" />
                Loan Amount
              </label>
              <span className="font-mono font-medium">{formatAmount(loanAmount)}</span>
            </div>
            <Slider
              value={[loanAmount]}
              min={1000}
              max={100000}
              step={1000}
              onValueChange={(values) => setLoanAmount(values[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-foreground/70 mt-1">
              <span>R1,000</span>
              <span>R100,000</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="label flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                Loan Duration (Months)
              </label>
              <span className="font-mono font-medium">{loanDuration} months</span>
            </div>
            <Slider
              value={[loanDuration]}
              min={1}
              max={4}
              step={1}
              onValueChange={(values) => setLoanDuration(values[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-foreground/70 mt-1">
              <span>1 Month</span>
              <span>4 Months</span>
            </div>
          </div>

          {/* Fee Breakdown Section */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <button 
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
                  <span className="font-medium">{formatAmount(totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Initiation Fee</span>
                  <span className="font-medium">{formatAmount(initiationFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Monthly Service Fee</span>
                  <span className="font-medium">{formatAmount(monthlyServiceFee)}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Monthly Insurance</span>
                  <span className="font-medium">{formatAmount(monthlyInsurance)}/month</span>
                </div>
                <div className="border-t border-primary/10 pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Monthly Payment</span>
                    <span className="text-primary">{formatAmount(totalMonthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between font-medium mt-1">
                    <span>Total Cost of Credit</span>
                    <span className="text-primary">{formatAmount(totalRepayment)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Link 
            to="/application" 
            className="btn-primary w-full mt-8 flex items-center justify-center"
            onClick={handleApplyNow}
          >
            Apply Now <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
        
        {/* Right side: Results and Chart */}
        <div className="space-y-4">
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
              <div className="text-xl font-bold">{formatAmount(totalRepayment)}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-secondary/50 p-4 rounded-lg">
              <div className="text-sm text-foreground/70 mb-1">Monthly Payment</div>
              <div className="text-xl font-medium text-primary">
                {formatAmount(monthlyPayment)}
              </div>
            </div>
            
            <div className="bg-secondary/50 p-4 rounded-lg">
              <div className="text-sm text-foreground/70 mb-1">Total Interest</div>
              <div className="text-xl font-medium text-primary/80">
                {formatAmount(totalInterest)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
