import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employmentInfoSchema, EmploymentInfoFormData } from '@/utils/validation';
import { useFormContext } from '@/utils/formContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppData } from '@/utils/AppDataContext';

const EmploymentForm: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useFormContext();
  const { currentUser } = useAppData();
  
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<EmploymentInfoFormData>({
    resolver: zodResolver(employmentInfoSchema),
    defaultValues: {
      employmentStatus: formData.employmentStatus || "employed",
      employerName: formData.employerName || "",
      jobTitle: formData.jobTitle || "",
      yearsEmployed: formData.yearsEmployed || 0,
      monthlyIncome: formData.monthlyIncome || 0,
      employmentType: formData.employmentType || "full-time",
      otherEmploymentType: formData.otherEmploymentType || "",
      employmentSector: formData.employmentSector || "",
      workAddress: (formData as any).workAddress || "",
      workCity: (formData as any).workCity || "",
      workCountry: (formData as any).workCountry || "South Africa",
      workPostalCode: (formData as any).workPostalCode || "",
      workEmail: (formData as any).workEmail || "",
      workPhoneNumber: (formData as any).workPhoneNumber || "",
      paymentDate: formData.paymentDate || "25",
    }
  });
  
  // Pre-fill with user employment data if available
  useEffect(() => {
    if (currentUser) {
      if (currentUser.employmentStatus) setValue('employmentStatus', currentUser.employmentStatus as any);
      if (currentUser.employmentType) setValue('employmentType', currentUser.employmentType as any);
      if (currentUser.employmentSector) setValue('employmentSector', currentUser.employmentSector);
      if (currentUser.employerName) setValue('employerName', currentUser.employerName);
      if (currentUser.jobTitle) setValue('jobTitle', currentUser.jobTitle);
      if (currentUser.yearsEmployed) setValue('yearsEmployed', currentUser.yearsEmployed);
      if (currentUser.monthlyIncome) setValue('monthlyIncome', currentUser.monthlyIncome);
      if ((currentUser as any).workAddress) setValue('workAddress', (currentUser as any).workAddress);
      if ((currentUser as any).workCity) setValue('workCity', (currentUser as any).workCity);
      if ((currentUser as any).workCountry) setValue('workCountry', (currentUser as any).workCountry);
      if ((currentUser as any).workPostalCode) setValue('workPostalCode', (currentUser as any).workPostalCode);
      if ((currentUser as any).workEmail) setValue('workEmail', (currentUser as any).workEmail);
      if ((currentUser as any).workPhoneNumber) setValue('workPhoneNumber', (currentUser as any).workPhoneNumber);
      if (currentUser.paymentDate) setValue('paymentDate', currentUser.paymentDate);
      if ((currentUser as any).otherEmploymentType) setValue('otherEmploymentType', (currentUser as any).otherEmploymentType);
    }
  }, [currentUser, setValue]);
  
  const onSubmit = (data: EmploymentInfoFormData) => {
    updateFormData({
      employmentStatus: data.employmentStatus,
      employerName: data.employerName,
      jobTitle: data.jobTitle,
      yearsEmployed: data.yearsEmployed,
      monthlyIncome: data.monthlyIncome,
      employmentType: data.employmentType,
      employmentSector: data.employmentSector,
      // Use the type casting to work around TypeScript errors until interface updates
      ...{
        workAddress: data.workAddress,
        workCity: data.workCity, 
        workCountry: data.workCountry,
        workPostalCode: data.workPostalCode,
        workEmail: data.workEmail,
        workPhoneNumber: data.workPhoneNumber,
        paymentDate: data.paymentDate,
        otherEmploymentType: data.otherEmploymentType
      }
    });
    
    toast.success("Employment information saved!");
    nextStep();
  };
  
  // Watch for employment status to conditionally show employment details
  const employmentStatus = watch("employmentStatus");
  const employmentType = watch("employmentType");
  const showEmploymentDetails = 
    employmentStatus === "employed" || 
    employmentStatus === "self-employed";
  const showOtherEmploymentType = employmentType === "other";
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <h2 className="heading-md mb-6">Employment Information</h2>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="employmentStatus" className="label">Employment Status</Label>
            <Controller 
              name="employmentStatus"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger className={`form-select ${errors.employmentStatus ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select your employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="self-employed">Self-Employed</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.employmentStatus && (
              <p className="text-sm text-destructive mt-1">{errors.employmentStatus.message}</p>
            )}
          </div>
        
          {showEmploymentDetails && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="employmentType" className="label">Employment Type</Label>
                  <Controller 
                    name="employmentType"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger className={`form-select ${errors.employmentType ? 'border-destructive' : ''}`}>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-Time</SelectItem>
                          <SelectItem value="part-time">Part-Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="temporary">Temporary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.employmentType && (
                    <p className="text-sm text-destructive mt-1">{errors.employmentType.message}</p>
                  )}
                </div>
                
                {showOtherEmploymentType && (
                  <div>
                    <Label htmlFor="otherEmploymentType" className="label">Specify Employment Type</Label>
                    <Controller
                      name="otherEmploymentType"
                      control={control}
                      render={({ field }) => (
                        <Input 
                          id="otherEmploymentType"
                          className={`form-input ${errors.otherEmploymentType ? 'border-destructive' : ''}`}
                          placeholder="Please specify your employment type"
                          {...field}
                        />
                      )}
                    />
                    {errors.otherEmploymentType && (
                      <p className="text-sm text-destructive mt-1">{errors.otherEmploymentType.message}</p>
                    )}
                  </div>
                )}
                
                <div>
                  <Label htmlFor="employmentSector" className="label">Industry/Sector</Label>
                  <Controller
                    name="employmentSector"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="employmentSector"
                        className={`form-input ${errors.employmentSector ? 'border-destructive' : ''}`}
                        placeholder="e.g. Healthcare, Finance, Technology"
                        {...field}
                      />
                    )}
                  />
                  {errors.employmentSector && (
                    <p className="text-sm text-destructive mt-1">{errors.employmentSector.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="employerName" className="label">Employer Name</Label>
                  <Controller
                    name="employerName"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="employerName"
                        className={`form-input ${errors.employerName ? 'border-destructive' : ''}`}
                        placeholder="Name of your employer or business"
                        {...field}
                      />
                    )}
                  />
                  {errors.employerName && (
                    <p className="text-sm text-destructive mt-1">{errors.employerName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="jobTitle" className="label">Job Title/Position</Label>
                  <Controller
                    name="jobTitle"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="jobTitle"
                        className={`form-input ${errors.jobTitle ? 'border-destructive' : ''}`}
                        placeholder="Your job title or position"
                        {...field}
                      />
                    )}
                  />
                  {errors.jobTitle && (
                    <p className="text-sm text-destructive mt-1">{errors.jobTitle.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="yearsEmployed" className="label">Years at Current Employer</Label>
                  <Controller
                    name="yearsEmployed"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="yearsEmployed"
                        type="number"
                        min="0"
                        className={`form-input ${errors.yearsEmployed ? 'border-destructive' : ''}`}
                        placeholder="Number of years at current employer"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    )}
                  />
                  {errors.yearsEmployed && (
                    <p className="text-sm text-destructive mt-1">{errors.yearsEmployed.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="workAddress" className="label">Work Address</Label>
                  <Controller
                    name="workAddress"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="workAddress"
                        className={`form-input ${errors.workAddress ? 'border-destructive' : ''}`}
                        placeholder="Work street address"
                        {...field}
                      />
                    )}
                  />
                  {errors.workAddress && (
                    <p className="text-sm text-destructive mt-1">{errors.workAddress.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="workCity" className="label">City</Label>
                  <Controller
                    name="workCity"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="workCity"
                        className={`form-input ${errors.workCity ? 'border-destructive' : ''}`}
                        placeholder="Work city"
                        {...field}
                      />
                    )}
                  />
                  {errors.workCity && (
                    <p className="text-sm text-destructive mt-1">{errors.workCity.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="workCountry" className="label">Country</Label>
                  <Controller
                    name="workCountry"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="workCountry"
                        className={`form-input ${errors.workCountry ? 'border-destructive' : ''}`}
                        placeholder="Work country"
                        {...field}
                      />
                    )}
                  />
                  {errors.workCountry && (
                    <p className="text-sm text-destructive mt-1">{errors.workCountry.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="workPostalCode" className="label">Postal Code</Label>
                  <Controller
                    name="workPostalCode"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="workPostalCode"
                        className={`form-input ${errors.workPostalCode ? 'border-destructive' : ''}`}
                        placeholder="Work postal code"
                        {...field}
                      />
                    )}
                  />
                  {errors.workPostalCode && (
                    <p className="text-sm text-destructive mt-1">{errors.workPostalCode.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="workEmail" className="label">Work Email</Label>
                  <Controller
                    name="workEmail"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="workEmail"
                        type="email"
                        className={`form-input ${errors.workEmail ? 'border-destructive' : ''}`}
                        placeholder="Work email address"
                        {...field}
                      />
                    )}
                  />
                  {errors.workEmail && (
                    <p className="text-sm text-destructive mt-1">{errors.workEmail.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="workPhoneNumber" className="label">Work Contact Number</Label>
                  <Controller
                    name="workPhoneNumber"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="workPhoneNumber"
                        className={`form-input ${errors.workPhoneNumber ? 'border-destructive' : ''}`}
                        placeholder="Work phone number"
                        {...field}
                      />
                    )}
                  />
                  {errors.workPhoneNumber && (
                    <p className="text-sm text-destructive mt-1">{errors.workPhoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentDate" className="label">Monthly Salary Date</Label>
                  <Controller
                    name="paymentDate"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="paymentDate"
                        className={`form-input ${errors.paymentDate ? 'border-destructive' : ''}`}
                        placeholder="Day of month you receive your salary"
                        {...field}
                      />
                    )}
                  />
                  {errors.paymentDate && (
                    <p className="text-sm text-destructive mt-1">{errors.paymentDate.message}</p>
                  )}
                </div>
              </div>
            </>
          )}
          
          <div>
            <Label htmlFor="monthlyIncome" className="label">Monthly Income (R)</Label>
            <Controller
              name="monthlyIncome"
              control={control}
              render={({ field }) => (
                <Input 
                  id="monthlyIncome"
                  type="number"
                  min="0"
                  className={`form-input ${errors.monthlyIncome ? 'border-destructive' : ''}`}
                  placeholder="Your monthly income"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              )}
            />
            {errors.monthlyIncome && (
              <p className="text-sm text-destructive mt-1">{errors.monthlyIncome.message}</p>
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

export default EmploymentForm;
