import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { financialInfoSchema, FinancialInfoFormData } from '@/utils/validation';
import { useFormContext } from '@/utils/formContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAppData } from '@/utils/AppDataContext';

const FinancialForm: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useFormContext();
  const { currentUser } = useAppData();
  
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<FinancialInfoFormData>({
    resolver: zodResolver(financialInfoSchema),
    defaultValues: {
      bankName: formData.bankName || "",
      accountType: formData.accountType || "cheque",
      accountNumber: "",
      bankingPeriod: formData.bankingPeriod || 0,
      existingLoans: formData.existingLoans || false,
      existingLoanAmount: formData.existingLoanAmount || 0,
      monthlyDebt: formData.monthlyDebt || 0,
      rentMortgage: formData.rentMortgage || 0,
      carPayment: formData.carPayment || 0,
      groceries: formData.groceries || 0,
      utilities: formData.utilities || 0,
      insurance: formData.insurance || 0,
      otherExpenses: formData.otherExpenses || 0,
      savings: formData.savings || 0,
    }
  });
  
  // If current user exists, prefill with their banking and financial details
  useEffect(() => {
    if (currentUser) {
      // Prefill banking details
      if (currentUser.bankName) setValue('bankName', currentUser.bankName);
      if (currentUser.accountType) setValue('accountType', currentUser.accountType);
      if (currentUser.accountNumber) setValue('accountNumber', currentUser.accountNumber);
      if (currentUser.bankingPeriod) setValue('bankingPeriod', currentUser.bankingPeriod);
      
      // Prefill financial details
      if (currentUser.existingLoans !== undefined) setValue('existingLoans', currentUser.existingLoans);
      if (currentUser.existingLoanAmount) setValue('existingLoanAmount', currentUser.existingLoanAmount);
      if (currentUser.monthlyDebt) setValue('monthlyDebt', currentUser.monthlyDebt);
      if (currentUser.rentMortgage) setValue('rentMortgage', currentUser.rentMortgage);
      if (currentUser.carPayment) setValue('carPayment', currentUser.carPayment);
      if (currentUser.utilities) setValue('utilities', currentUser.utilities);
      if (currentUser.insurance) setValue('insurance', currentUser.insurance);
      if (currentUser.otherExpenses) setValue('otherExpenses', currentUser.otherExpenses);
    }
  }, [currentUser, setValue]);
  
  const onSubmit = (data: FinancialInfoFormData) => {
    updateFormData({
      bankName: data.bankName,
      accountType: data.accountType,
      bankingPeriod: data.bankingPeriod,
      existingLoans: data.existingLoans,
      existingLoanAmount: data.existingLoanAmount,
      monthlyDebt: data.monthlyDebt,
      rentMortgage: data.rentMortgage,
      carPayment: data.carPayment,
      groceries: data.groceries,
      utilities: data.utilities,
      insurance: data.insurance,
      otherExpenses: data.otherExpenses,
      savings: data.savings,
      totalMonthlyExpenses: calculateTotalExpenses(data),
    });
    
      toast.success("Financial information saved!");
      nextStep();
  };
  
  const calculateTotalExpenses = (data: FinancialInfoFormData) => {
    let total = 0;
    total += Number(data.monthlyDebt) || 0;
    total += Number(data.rentMortgage) || 0;
    total += Number(data.carPayment) || 0;
    total += Number(data.groceries) || 0;
    total += Number(data.utilities) || 0;
    total += Number(data.insurance) || 0;
    total += Number(data.otherExpenses) || 0;
    return total;
  };
  
  // Watch for existing loans checkbox to conditionally show loan amount
  const hasExistingLoans = watch("existingLoans");
  
  // Common South African banks
  const sabanks = [
    "ABSA Bank",
    "Capitec Bank",
    "FNB (First National Bank)",
    "Nedbank",
    "Standard Bank",
    "African Bank",
    "Bidvest Bank",
    "Discovery Bank",
    "TymeBank",
    "Investec",
    "Other"
  ];
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <h2 className="heading-md mb-6">Banking Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="bankName" className="label">Bank Name</Label>
            <Controller 
              name="bankName"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger className={`form-select ${errors.bankName ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {sabanks.map((bank) => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.bankName && (
              <p className="text-sm text-destructive mt-1">{errors.bankName.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="accountType" className="label">Account Type</Label>
            <Controller 
              name="accountType"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger className={`form-select ${errors.accountType ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cheque">Cheque Account</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="credit">Credit Card Account</SelectItem>
                    <SelectItem value="investment">Investment Account</SelectItem>
                    <SelectItem value="business">Business Account</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.accountType && (
              <p className="text-sm text-destructive mt-1">{errors.accountType.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="accountNumber" className="label">Account Number</Label>
            <Controller
              name="accountNumber"
              control={control}
              render={({ field }) => (
                <Input 
                  id="accountNumber"
                  className={`form-input ${errors.accountNumber ? 'border-destructive' : ''}`}
                  placeholder="Enter your account number"
                  {...field}
                />
              )}
            />
            {errors.accountNumber && (
              <p className="text-sm text-destructive mt-1">{errors.accountNumber.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="bankingPeriod" className="label">Years with Bank</Label>
            <Controller
              name="bankingPeriod"
              control={control}
              render={({ field }) => (
                <Input 
                  id="bankingPeriod"
                  type="number"
                  min="0"
                  max="100"
                  className={`form-input ${errors.bankingPeriod ? 'border-destructive' : ''}`}
                  placeholder="How many years with this bank"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              )}
            />
            {errors.bankingPeriod && (
              <p className="text-sm text-destructive mt-1">{errors.bankingPeriod.message}</p>
            )}
          </div>
        </div>
              </div>
      
      <div className="glass-card p-6">
        <h2 className="heading-md mb-6">Financial Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="existingLoans"
                control={control}
                render={({ field }) => (
                  <Checkbox 
                    id="existingLoans"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label 
                htmlFor="existingLoans" 
                className="text-base font-medium cursor-pointer"
              >
                Do you have any existing loans?
              </Label>
            </div>
            
            {hasExistingLoans && (
              <div>
                <Label htmlFor="existingLoanAmount" className="label">
                  Total Outstanding Loan Amount (R)
                </Label>
                <Controller
                  name="existingLoanAmount"
                  control={control}
                  render={({ field }) => (
                    <Input 
                      id="existingLoanAmount"
                      type="number"
                      min="0"
                      className={`form-input ${errors.existingLoanAmount ? 'border-destructive' : ''}`}
                      placeholder="Total amount of outstanding loans"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  )}
                />
                {errors.existingLoanAmount && (
                  <p className="text-sm text-destructive mt-1">{errors.existingLoanAmount.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="heading-md mb-6">Monthly Expenses</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="monthlyDebt" className="label">Monthly Debt Payments (R)</Label>
            <Controller
              name="monthlyDebt"
              control={control}
              render={({ field }) => (
                <Input 
                  id="monthlyDebt"
                  type="number"
                  min="0"
                  className={`form-input ${errors.monthlyDebt ? 'border-destructive' : ''}`}
                  placeholder="Monthly debt payments"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              )}
            />
            {errors.monthlyDebt && (
              <p className="text-sm text-destructive mt-1">{errors.monthlyDebt.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="rentMortgage" className="label">Rent/Mortgage (R)</Label>
            <Controller
              name="rentMortgage"
              control={control}
              render={({ field }) => (
                <Input 
                  id="rentMortgage"
                  type="number"
                  min="0"
                  className={`form-input ${errors.rentMortgage ? 'border-destructive' : ''}`}
                  placeholder="Monthly rent or mortgage"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              )}
            />
            {errors.rentMortgage && (
              <p className="text-sm text-destructive mt-1">{errors.rentMortgage.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="carPayment" className="label">Car Payment (R)</Label>
            <Controller
              name="carPayment"
              control={control}
              render={({ field }) => (
                <Input 
                  id="carPayment"
                  type="number"
                  min="0"
                  className={`form-input ${errors.carPayment ? 'border-destructive' : ''}`}
                  placeholder="Monthly car payment"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              )}
            />
            {errors.carPayment && (
              <p className="text-sm text-destructive mt-1">{errors.carPayment.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="groceries" className="label">Groceries (R)</Label>
            <Controller
              name="groceries"
              control={control}
              render={({ field }) => (
                <Input 
                  id="groceries"
                  type="number"
                  min="0"
                  className={`form-input ${errors.groceries ? 'border-destructive' : ''}`}
                  placeholder="Monthly grocery expenses"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              )}
            />
            {errors.groceries && (
              <p className="text-sm text-destructive mt-1">{errors.groceries.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="utilities" className="label">Utilities (R)</Label>
            <Controller
              name="utilities"
              control={control}
              render={({ field }) => (
                <Input 
                  id="utilities"
                  type="number"
                  min="0"
                  className={`form-input ${errors.utilities ? 'border-destructive' : ''}`}
                  placeholder="Monthly utilities expenses"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              )}
            />
            {errors.utilities && (
              <p className="text-sm text-destructive mt-1">{errors.utilities.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="insurance" className="label">Insurance (R)</Label>
            <Controller
              name="insurance"
              control={control}
              render={({ field }) => (
                <Input 
                  id="insurance"
                  type="number"
                  min="0"
                  className={`form-input ${errors.insurance ? 'border-destructive' : ''}`}
                  placeholder="Monthly insurance expenses"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              )}
            />
            {errors.insurance && (
              <p className="text-sm text-destructive mt-1">{errors.insurance.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="otherExpenses" className="label">Other Expenses (R)</Label>
            <Controller
              name="otherExpenses"
              control={control}
              render={({ field }) => (
                <Input 
                  id="otherExpenses"
                  type="number"
                  min="0"
                  className={`form-input ${errors.otherExpenses ? 'border-destructive' : ''}`}
                  placeholder="Other monthly expenses"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              )}
            />
            {errors.otherExpenses && (
              <p className="text-sm text-destructive mt-1">{errors.otherExpenses.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="savings" className="label">Monthly Savings (R)</Label>
            <Controller
              name="savings"
              control={control}
              render={({ field }) => (
                <Input 
                  id="savings"
                  type="number"
                  min="0"
                  className={`form-input ${errors.savings ? 'border-destructive' : ''}`}
                  placeholder="Amount saved each month"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              )}
            />
            {errors.savings && (
              <p className="text-sm text-destructive mt-1">{errors.savings.message}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          size="lg"
          onClick={prevStep}
        >
          Previous
        </Button>
        <Button type="submit" size="lg">Continue</Button>
      </div>
    </form>
  );
};

export default FinancialForm;
