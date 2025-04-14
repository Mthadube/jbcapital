import React, { useState } from 'react';
import { useFormContext } from '@/utils/formContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, Info, Phone } from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppData } from '@/utils/AppDataContext';
import PhoneVerificationModal from './PhoneVerificationModal';

const ReviewSubmitForm: React.FC = () => {
  const { formData, prevStep } = useFormContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addUser, addApplication, addDocument, users, currentUser, setCurrentUser, generateId } = useAppData();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  
  // Helper function to create a default user with all required fields
  const createDefaultUser = (formData: any) => {
    const userId = generateId('USR');
    
    // Create properly typed notifications
    const welcomeNotification = {
      id: generateId('NOTIF'),
      userId: userId,
      title: 'Welcome to JB Capital',
      message: "Thank you for joining JB Capital. We're excited to help you achieve your financial goals.",
      date: new Date().toISOString().split('T')[0],
      type: 'info',
      read: false,
      action: 'View Profile'
    };
    
    const profileNotification = {
      id: generateId('NOTIF'),
      userId: userId,
      title: 'Complete Your Profile',
      message: 'Complete your profile to improve your loan eligibility and accelerate the application process.',
      date: new Date().toISOString().split('T')[0],
      type: 'info',
      read: false,
      action: 'Update Profile'
    };
    
    return {
      id: userId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      idNumber: formData.idNumber || '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      dependents: 0,
      address: formData.address,
      suburb: formData.suburb || '',
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: 'South Africa',
      employmentStatus: formData.employmentStatus,
      employmentType: formData.employmentType || 'full-time',
      employmentSector: formData.employmentSector || '',
      employerName: formData.employerName,
      jobTitle: formData.jobTitle,
      yearsEmployed: formData.yearsEmployed,
      monthlyIncome: formData.monthlyIncome,
      paymentDate: formData.paymentDate,
      bankName: formData.bankName,
      accountType: formData.accountType,
      accountNumber: '',
      bankingPeriod: formData.bankingPeriod,
      existingLoans: formData.existingLoans,
      existingLoanAmount: formData.existingLoanAmount || 0,
      monthlyDebt: formData.monthlyDebt || 0,
      rentMortgage: formData.rentMortgage || 0,
      carPayment: formData.carPayment || 0,
      groceries: formData.groceries || 0,
      utilities: formData.utilities || 0,
      insurance: formData.insurance || 0,
      otherExpenses: formData.otherExpenses || 0,
      totalMonthlyExpenses: (formData.rentMortgage || 0) + 
        (formData.carPayment || 0) + 
        (formData.groceries || 0) + 
        (formData.utilities || 0) + 
        (formData.insurance || 0) + 
        (formData.otherExpenses || 0),
      accountStatus: 'active',
      registrationDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
      profileCompletionPercentage: 80,
      incompleteProfileItems: ['Upload additional identification', 'Verify phone number'],
      verificationStatus: 'pending',
      role: 'user',
      documents: [],
      loans: [],
      notifications: [welcomeNotification, profileNotification]
    };
  };

  const handleVerifyPhone = () => {
    setShowVerificationModal(true);
  };
  
  const handlePhoneVerificationSuccess = () => {
    setIsPhoneVerified(true);
    setShowVerificationModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if phone is verified before submitting
    if (!isPhoneVerified) {
      toast.error("Please verify your phone number before submitting");
      handleVerifyPhone();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a new user or use current user
      let user = currentUser;
      
      if (!currentUser) {
        // Check if user already exists with this email
        const existingUser = users.find(u => u.email === formData.email);
        
        if (existingUser) {
          user = existingUser;
          // Ensure user is logged in
          setCurrentUser(existingUser);
        } else {
          // Create a complete user with all required fields
          const newUserData = createDefaultUser(formData);
          
          // Set role to "user" explicitly
          newUserData.role = "user";
          
          // Update the verification status since phone is now verified
          newUserData.incompleteProfileItems = ['Upload additional identification'];
          newUserData.verificationStatus = 'partial';
          newUserData.profileCompletionPercentage = 90;
          
          // Add user and ensure it has an ID
          addUser(newUserData);
          
          // Set the current user for login
          setCurrentUser(newUserData);
          user = newUserData;
        }
      }
      
      // Calculate monthly payment function
      const calculateMonthlyPayment = () => {
        const loanAmount = formData.loanAmount || 0;
        const loanTerm = formData.loanTerm || 3;
        const interestRate = 28.75; // Fixed interest rate
        
        // Calculate total interest
        const interestFactor = (interestRate / 100) * (loanTerm / 12);
        const interest = loanAmount * interestFactor;
        
        // Calculate monthly payment
        const monthlyPayment = (loanAmount + interest) / loanTerm;
        
        return monthlyPayment;
      };
      
      // Get monthly payment from calculation
      const monthlyPayment = formData.loanCalculation?.monthlyPayment || calculateMonthlyPayment();
      
      // Create application
      const applicationId = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Upload documents if any
      const uploadedDocuments = [];
      if (formData.uploadedDocuments) {
        const docArray = Object.values(formData.uploadedDocuments);
        for (const docGroup of docArray) {
          if (Array.isArray(docGroup)) {
            for (const doc of docGroup) {
              const document = addDocument({
                id: '',
                userId: user.id,
                name: doc.name,
                type: doc.name.toLowerCase().replace(/\s+/g, '_'),
                dateUploaded: new Date().toISOString().split('T')[0],
                verificationStatus: 'pending',
                fileSize: doc.size ? `${(doc.size / (1024 * 1024)).toFixed(2)} MB` : '1.5 MB',
                fileType: doc.type || 'application/pdf'
              });
              uploadedDocuments.push(document);
            }
          }
        }
      }
      
      // Ensure term is a number for the application
      const loanTerm = parseInt(formData.loanTerm.toString());
      
      // Create application with proper typing
      addApplication({
        id: applicationId,
        userId: user.id,
        name: `${formData.firstName} ${formData.lastName}`,
        amount: `R${formData.loanAmount.toLocaleString()}`,
        status: 'pending', // Use a valid ApplicationStatus from the defined type
        date: new Date().toISOString().split('T')[0],
        completion: 35,
        requiredAction: 'Application review and document verification',
        loanDetails: {
          purpose: formData.loanPurpose.replace(/_/g, ' '),
          term: loanTerm,
          monthlyPayment: `R${monthlyPayment.toLocaleString()}`,
          interestRate: 15.5
        }
      });
      
      // Show success message and redirect
      toast.success("Application submitted successfully!");
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/application-success', { 
          state: { 
            applicationId: applicationId,
            applicationData: {
              name: `${formData.firstName} ${formData.lastName}`,
              loanAmount: formData.loanAmount,
              loanPurpose: formData.loanPurpose,
              applicationDate: new Date().toISOString().split('T')[0]
            }
          } 
        });
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Error submitting application. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      <div className="glass-card p-6">
        <h2 className="heading-md mb-6">Review Your Application</h2>
        <p className="text-foreground/70 mb-6">
          Please review all the information you've provided before submitting your application. 
          You can go back to edit any section if needed.
        </p>
        
        {/* Verification notification */}
        <div className={`mb-6 p-4 border rounded-md ${isPhoneVerified ? 'bg-success/10 border-success' : 'bg-warning/10 border-warning'}`}>
          <div className="flex items-start gap-3">
            <Phone className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isPhoneVerified ? 'text-success' : 'text-warning'}`} />
            <div>
              <p className="font-medium">
                {isPhoneVerified ? 'Phone Number Verified' : 'Phone Verification Required'}
              </p>
              <p className="text-sm text-foreground/70 mt-1">
                {isPhoneVerified 
                  ? 'Your phone number has been successfully verified. You can now submit your application.'
                  : 'For security reasons, we need to verify your phone number before submitting your application.'}
              </p>
              {!isPhoneVerified && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="mt-2 bg-primary text-white hover:bg-primary/90" 
                  onClick={handleVerifyPhone}
                  type="button"
                >
                  Verify Phone Number
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <Accordion type="single" collapsible className="w-full" defaultValue="personal">
            <AccordionItem value="personal">
              <AccordionTrigger className="text-lg font-semibold">Personal Information</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                <div>
                  <p className="text-sm text-foreground/60">Full Name</p>
                  <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">ID Number</p>
                    <p className="font-medium">{formData.idNumber || "-"}</p>
                </div>
                <div>
                    <p className="text-sm text-foreground/60">Email Address</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
                <div>
                    <p className="text-sm text-foreground/60">Phone Number</p>
                  <p className="font-medium">{formData.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-foreground/60">Address</p>
                  <p className="font-medium">
                      {formData.address}, {formData.suburb}, {formData.city}, {formData.state}, {formData.zipCode}
                  </p>
                </div>
              </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="employment">
              <AccordionTrigger className="text-lg font-semibold">Employment Information</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                <div>
                  <p className="text-sm text-foreground/60">Employment Status</p>
                    <p className="font-medium capitalize">{formData.employmentStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Employment Type</p>
                    <p className="font-medium capitalize">{formData.employmentType}</p>
                </div>
                <div>
                    <p className="text-sm text-foreground/60">Employer Name</p>
                    <p className="font-medium">{formData.employerName}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Job Title</p>
                    <p className="font-medium">{formData.jobTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Monthly Net Income</p>
                    <p className="font-medium">R {formData.monthlyIncome?.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-foreground/60">Employment Duration</p>
                  <p className="font-medium">{formData.yearsEmployed} years</p>
                </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="financial">
              <AccordionTrigger className="text-lg font-semibold">Financial Information</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                  <div>
                    <p className="text-sm text-foreground/60">Bank Name</p>
                    <p className="font-medium">{formData.bankName}</p>
              </div>
                  <div>
                    <p className="text-sm text-foreground/60">Account Type</p>
                    <p className="font-medium capitalize">{formData.accountType}</p>
          </div>
          <div>
                    <p className="text-sm text-foreground/60">Banking Period</p>
                    <p className="font-medium">{formData.bankingPeriod} years</p>
                </div>
                <div>
                    <p className="text-sm text-foreground/60">Monthly Rent/Mortgage</p>
                    <p className="font-medium">R {formData.rentMortgage?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Monthly Expenses</p>
                    <p className="font-medium">R {(
                      (formData.rentMortgage || 0) + 
                      (formData.utilities || 0) + 
                      (formData.groceries || 0) + 
                      (formData.carPayment || 0) + 
                      (formData.insurance || 0) + 
                      (formData.otherExpenses || 0)
                    ).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Existing Loans</p>
                    <p className="font-medium">{formData.existingLoans ? 'Yes' : 'No'}</p>
                </div>
                {formData.existingLoans && (
                  <div>
                    <p className="text-sm text-foreground/60">Existing Loan Amount</p>
                      <p className="font-medium">R {formData.existingLoanAmount?.toLocaleString()}</p>
                  </div>
                )}
              </div>
              </AccordionContent>
            </AccordionItem>
          
            <AccordionItem value="loan">
              <AccordionTrigger className="text-lg font-semibold">Loan Details</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div>
                    <h3 className="text-base font-medium mb-1">Loan Amount</h3>
                    <p>R{formData.loanAmount.toLocaleString()}</p>
                </div>
                <div>
                    <h3 className="text-base font-medium mb-1">Purpose</h3>
                    <p className="capitalize">{formData.loanPurpose.replace(/_/g, ' ')}</p>
                </div>
                <div>
                    <h3 className="text-base font-medium mb-1">Monthly Payment</h3>
                    <p>R{(formData.loanCalculation?.monthlyPayment || 0).toLocaleString()}</p>
                </div>
                <div>
                    <h3 className="text-base font-medium mb-1">Term</h3>
                    <p>{formData.loanTerm} months</p>
                </div>
                <div>
                    <h3 className="text-base font-medium mb-1">Interest Rate</h3>
                    <p>15.5%</p>
                </div>
                <div>
                    <h3 className="text-base font-medium mb-1">Total Repayment</h3>
                    <p>R{(formData.loanCalculation?.totalRepayment || 0).toLocaleString()}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="documents">
              <AccordionTrigger className="text-lg font-semibold">Document Upload</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  {formData.uploadedDocuments && typeof formData.uploadedDocuments === 'object' ? (
                    <>
                      {/* Object structure with categories */}
                      {Object.entries(formData.uploadedDocuments).flatMap(([category, docs]) => {
                        if (Array.isArray(docs) && docs.length > 0) {
                          return docs.map((doc, index) => (
                            <div key={`${category}-${index}`} className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-success" />
                              <span>{doc.name || `${category} document ${index + 1}`}</span>
                              <Badge variant="outline">Uploaded</Badge>
                            </div>
                          ));
                        }
                        return [];
                      })}
                    </>
                  ) : (
                    <p className="text-foreground/70">No documents uploaded.</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          </div>
          
        <div className="mt-8 border border-border p-4 rounded-md bg-primary/5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
          <div>
              <p className="font-medium">Your Data in the Admin Dashboard</p>
              <p className="text-sm text-foreground/70 mt-1">
                All the information you've provided will be securely stored and made accessible to loan officers through the admin dashboard. 
                They will be able to view your complete profile, process your application, and contact you if additional information is needed.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={prevStep}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button 
            type="submit"
            className="flex items-center gap-2"
            disabled={isSubmitting || !isPhoneVerified}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
            {!isSubmitting && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="heading-md mb-4">Profile Preview</h2>
        <p className="text-foreground/70 mb-6">
          Below is a preview of how your profile will appear to our loan officers in the admin dashboard.
        </p>
        
        <Separator className="my-4" />
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              {formData.firstName} {formData.lastName}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="default">
                {formData.employmentStatus === 'employed' ? 'Employed' : 'Self-Employed'}
              </Badge>
              <Badge variant="outline">
                {formData.loanAmount ? `R${formData.loanAmount?.toLocaleString()} Loan` : 'Applicant'}
              </Badge>
            </div>
          </div>
          
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="personal-info">
              <AccordionTrigger className="text-base font-semibold">Personal Information</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID Number</p>
                    <p className="font-medium">{formData.idNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">-</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">-</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="contact-info">
              <AccordionTrigger className="text-base font-semibold">Contact Information</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{formData.phone}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {formData.address}, {formData.suburb}, {formData.city}, {formData.state}, {formData.zipCode}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="employment-info">
              <AccordionTrigger className="text-base font-semibold">Employment Information</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{formData.employmentStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{formData.employmentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employer</p>
                    <p className="font-medium">{formData.employerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Title</p>
                    <p className="font-medium">{formData.jobTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                    <p className="font-medium">R {formData.monthlyIncome?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Years Employed</p>
                    <p className="font-medium">{formData.yearsEmployed} years</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="financial-info">
              <AccordionTrigger className="text-base font-semibold">Financial Information</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank</p>
                    <p className="font-medium">{formData.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Type</p>
                    <p className="font-medium capitalize">{formData.accountType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Banking Period</p>
                    <p className="font-medium">{formData.bankingPeriod} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                    <p className="font-medium">R {(
                      (formData.rentMortgage || 0) + 
                      (formData.utilities || 0) + 
                      (formData.groceries || 0) + 
                      (formData.carPayment || 0) + 
                      (formData.insurance || 0) + 
                      (formData.otherExpenses || 0)
                    ).toLocaleString()}</p>
        </div>
      </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="loan-info">
              <AccordionTrigger className="text-base font-semibold">Loan Information</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Amount</p>
                    <p className="font-medium">R {formData.loanAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Term</p>
                    <p className="font-medium">{formData.loanTerm} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purpose</p>
                    <p className="font-medium capitalize">{formData.loanPurpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Payment</p>
                    <p className="font-medium">R {(formData.loanCalculation?.monthlyPayment || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge>Pending Submission</Badge>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="document-info">
              <AccordionTrigger className="text-base font-semibold">Documents</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {formData.uploadedDocuments && typeof formData.uploadedDocuments === 'object' ? (
                    Object.entries(formData.uploadedDocuments).flatMap(([category, docs]) => {
                      if (Array.isArray(docs)) {
                        return docs.map((doc, docIndex) => (
                          <div key={`${category}-${docIndex}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{doc.name}</p>
                            </div>
                            <Badge variant="default">Verified</Badge>
                          </div>
                        ));
                      }
                      return [];
                    })
                  ) : (
                    <p className="text-foreground/70">No documents uploaded.</p>
                  )}
      </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
    </div>
      
      {/* Phone verification modal */}
      <PhoneVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        phoneNumber={formData.phone || ''}
        onVerifySuccess={handlePhoneVerificationSuccess}
      />
    </form>
  );
};

export default ReviewSubmitForm;
