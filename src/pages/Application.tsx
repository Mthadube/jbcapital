import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProgressBar from '@/components/ProgressBar';
import PersonalInfoForm from '@/components/LoanForm/PersonalInfoForm';
import EmploymentForm from '@/components/LoanForm/EmploymentForm';
import FinancialForm from '@/components/LoanForm/FinancialForm';
import LoanDetailsForm from '@/components/LoanForm/LoanDetailsForm';
import DocumentUploadForm from '@/components/LoanForm/DocumentUploadForm';
import ReviewSubmitForm from '@/components/LoanForm/ReviewSubmitForm';
import { FormProvider, useFormContext } from '@/utils/formContext';
import { useAppData } from '@/utils/AppDataContext';
import { 
  User, 
  Briefcase, 
  CreditCard, 
  Files, 
  CheckCircle,
  ChevronsRight,
  ClipboardList
} from 'lucide-react';
import { scrollToTop } from "@/components/ScrollToTop";

const ApplicationContent: React.FC = () => {
  const { currentStep, setInitialFormData, goToStep } = useFormContext();
  const { currentUser } = useAppData();
  const [initialized, setInitialized] = useState(false);
  
  // Skip personal info step and pre-fill data for logged in users
  useEffect(() => {
    if (currentUser && !initialized) {
      // Pre-fill form data from user profile
      setInitialFormData({
        // Personal information
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        idNumber: currentUser.idNumber || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
        suburb: currentUser.suburb || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        zipCode: currentUser.zipCode || '',
        
        // Employment information
        employmentStatus: currentUser.employmentStatus as any || "employed",
        employerName: currentUser.employerName || '',
        jobTitle: currentUser.jobTitle || '',
        yearsEmployed: currentUser.yearsEmployed || 0,
        monthlyIncome: currentUser.monthlyIncome || 0,
        employmentType: currentUser.employmentType as any || "full-time",
        
        // Financial information
        creditScore: currentUser.creditScore || 0,
        existingLoans: currentUser.existingLoans || false,
        existingLoanAmount: currentUser.existingLoanAmount || 0,
        monthlyDebt: currentUser.monthlyDebt || 0,
        rentMortgage: currentUser.rentMortgage || 0,
        carPayment: currentUser.carPayment || 0,
        utilities: currentUser.utilities || 0,
        insurance: currentUser.insurance || 0,
        otherExpenses: currentUser.otherExpenses || 0,
        bankName: currentUser.bankName || '',
        accountType: currentUser.accountType || '',
      });
      
      // Skip to Employment form if user is already logged in
      if (currentStep === 1) {
        goToStep(2);
      }
      
      setInitialized(true);
    }
  }, [currentUser, initialized, setInitialFormData, goToStep, currentStep]);
  
  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoForm />;
      case 2:
        return <EmploymentForm />;
      case 3:
        return <FinancialForm />;
      case 4:
        return <LoanDetailsForm />;
      case 5:
        return <DocumentUploadForm />;
      case 6:
        return <ReviewSubmitForm />;
      default:
        return <PersonalInfoForm />;
    }
  };
  
  // Function to get the title and description for each step
  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Personal Information",
          description: "Please provide your personal details and contact information.",
          icon: <User className="h-6 w-6 text-primary" />
        };
      case 2:
        return {
          title: "Employment Details",
          description: "Tell us about your current employment status and income.",
          icon: <Briefcase className="h-6 w-6 text-primary" />
        };
      case 3:
        return {
          title: "Financial Information",
          description: "Provide details about your financial situation and monthly expenses.",
          icon: <CreditCard className="h-6 w-6 text-primary" />
        };
      case 4:
        return {
          title: "Loan Details",
          description: "Specify the loan amount, purpose, and preferred terms.",
          icon: <ClipboardList className="h-6 w-6 text-primary" />
        };
      case 5:
        return {
          title: "Document Upload",
          description: "Upload the required documents to support your loan application.",
          icon: <Files className="h-6 w-6 text-primary" />
        };
      case 6:
        return {
          title: "Review & Submit",
          description: "Review your application details before final submission.",
          icon: <CheckCircle className="h-6 w-6 text-primary" />
        };
      default:
        return {
          title: "Loan Application",
          description: "Complete the form to apply for your loan.",
          icon: <ChevronsRight className="h-6 w-6 text-primary" />
        };
    }
  };
  
  const stepInfo = getStepInfo();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="flex-grow pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="chip mx-auto">Step {currentStep} of 6</div>
              <div className="flex items-center justify-center mt-4">
                <div className="bg-primary/10 rounded-full p-3 mr-3">
                  {stepInfo.icon}
                </div>
                <h1 className="heading-lg">
                  {stepInfo.title}
                </h1>
              </div>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto mt-4">
                {stepInfo.description}
              </p>
            </div>
            
            <ProgressBar />
            
            {renderForm()}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

const Application: React.FC = () => {
  useEffect(() => {
    scrollToTop(false); // Use instant scrolling on page load
  }, []);

  return (
    <FormProvider>
      <ApplicationContent />
    </FormProvider>
  );
};

export default Application;
