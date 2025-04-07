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
      employmentSector: formData.employmentSector || "",
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
    });
    
    toast.success("Employment information saved!");
    nextStep();
  };
  
  // Watch for employment status to conditionally show employment details
  const employmentStatus = watch("employmentStatus");
  const showEmploymentDetails = 
    employmentStatus === "employed" || 
    employmentStatus === "self-employed";
  
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
