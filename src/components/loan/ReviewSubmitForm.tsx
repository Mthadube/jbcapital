import React from 'react';
import { FormSection } from './FormSection';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { Check, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppData } from '@/utils/AppDataContext';

export const ReviewSubmitForm = ({ loanType }) => {
  const { getValues, formState: { isSubmitting } } = useFormContext();
  const navigate = useNavigate();
  const { addApplication } = useAppData();
  
  const handleSubmit = async () => {
    console.log("Submitting application...");
    
    try {
      // Get all form values
      const formData = getValues();
      console.log("Form data:", formData);
      
      // Format the application data
      const applicationData = {
        id: `APP-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: `${formData.firstName} ${formData.lastName}`,
        userId: formData.userId || '',
        amount: formData.loanAmount ? `R${parseFloat(formData.loanAmount).toLocaleString()}` : 'R0',
        status: 'Pending Review',
        date: new Date().toISOString().slice(0, 10),
        documents: [],
        completion: 85,
        requiredAction: 'Pending initial review',
        notes: `${loanType} loan application.`,
        email: formData.email,
        phone: formData.phone,
        idNumber: formData.idNumber,
        dob: formData.dateOfBirth,
        loanDetails: {
          purpose: loanType || 'Personal',
          requestedAmount: formData.loanAmount ? `R${parseFloat(formData.loanAmount).toLocaleString()}` : 'R0',
          interestRate: formData.interestRate ? `${formData.interestRate}%` : '15.5%',
          term: formData.loanTerm || '36',
          monthlyPayment: formData.monthlyPayment ? `R${parseFloat(formData.monthlyPayment).toLocaleString()}` : 'R0',
        },
        personalInfo: {
          gender: formData.gender,
          maritalStatus: formData.maritalStatus,
          dependents: formData.dependents,
          address: formData.address,
          province: formData.province,
          postalCode: formData.postalCode,
        },
        employmentInfo: {
          employmentStatus: formData.employmentStatus,
          employmentType: formData.employmentType,
          employer: formData.employerName,
          jobTitle: formData.jobTitle,
          employmentLength: formData.yearsEmployed ? `${formData.yearsEmployed} years` : '',
          monthlyIncome: formData.monthlyIncome ? `R${parseFloat(formData.monthlyIncome).toLocaleString()}` : 'R0',
          paymentDate: formData.paymentDate,
        },
        financialInfo: {
          bankName: formData.bankName,
          accountType: formData.accountType,
          accountNumber: formData.accountNumber,
          creditScore: formData.creditScore || 650,
          existingLoans: formData.existingLoans ? [
            {
              type: formData.existingLoanType || 'Personal',
              amount: formData.existingLoanAmount ? `R${parseFloat(formData.existingLoanAmount).toLocaleString()}` : 'R0',
              remaining: formData.existingLoanRemaining ? `R${parseFloat(formData.existingLoanRemaining).toLocaleString()}` : 'R0',
            }
          ] : [],
          monthlyDebt: formData.monthlyDebt ? `R${parseFloat(formData.monthlyDebt).toLocaleString()}` : 'R0',
        },
      };
      
      console.log("Formatted application data:", applicationData);
      
      // Add the application
      const newApplication = addApplication(applicationData);
      console.log("Application added successfully:", newApplication);
      
      // Show success toast
      toast.success('Application submitted successfully!', {
        description: 'Your loan application has been received and is under review.',
      });
      
      // Navigate to success page
      navigate('/application-success', { 
        state: { 
          applicationId: newApplication.id,
          applicantName: applicationData.name
        } 
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error('There was a problem submitting your application', {
        description: error.message || 'Please try again later.',
      });
    }
  };
  
  return (
    <FormSection
      title="Review & Submit"
      subtitle="Please review your application details before submitting"
    >
      <div className="space-y-6">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-4 border-b">
            <h3 className="font-medium">Application Summary</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Loan Type</p>
                <p className="font-medium">{loanType} Loan</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="font-medium">R{parseFloat(getValues().loanAmount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loan Term</p>
                <p className="font-medium">{getValues().loanTerm || 36} months</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="font-medium">{getValues().interestRate || 15.5}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <p className="font-medium">R{parseFloat(getValues().monthlyPayment || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Repayment</p>
                <p className="font-medium">R{parseFloat((getValues().monthlyPayment || 0) * (getValues().loanTerm || 36)).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="text-sm space-y-1 border-t pt-4 mt-2">
              <p className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                <span>Your personal information has been verified</span>
              </p>
              <p className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                <span>Your employment details have been recorded</span>
              </p>
              <p className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                <span>Your financial information has been received</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 p-4 rounded-lg text-sm space-y-2">
          <p>By clicking "Submit Application", you agree to our <Link to="/terms" className="text-primary underline inline-flex items-center gap-1">Terms & Conditions <ExternalLink size={12} /></Link> and <Link to="/privacy" className="text-primary underline inline-flex items-center gap-1">Privacy Policy <ExternalLink size={12} /></Link>.</p>
          <p>Your application will be reviewed by our team, and you will be notified of the decision within 2-3 business days.</p>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            type="button"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </FormSection>
  );
}; 