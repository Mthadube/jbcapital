import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check, User, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { scrollToTop } from '@/components/ScrollToTop';
import { toast } from 'sonner';
import { useAppData } from '@/utils/AppDataContext';
import { sendLoanApplicationConfirmation } from '@/utils/twilioService';

const ApplicationSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAppData();
  
  // Get application data from location state or generate a fallback
  const applicationData = location.state?.applicationData || {};
  const applicationId = location.state?.applicationId || `APP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  useEffect(() => {
    scrollToTop(false); // Use instant scrolling on page load
    
    // Show a success toast
    toast.success("Application submitted successfully!");
    
    // Send SMS confirmation if we have the user's phone number
    if (applicationData.phone && applicationData.name) {
      const firstName = applicationData.name.split(' ')[0];
      sendSMSConfirmation(applicationData.phone, firstName, applicationId);
    } else if (currentUser?.phone && currentUser?.firstName) {
      sendSMSConfirmation(currentUser.phone, currentUser.firstName, applicationId);
    }
  }, [applicationData, applicationId, currentUser]);
  
  // Function to send SMS confirmation
  const sendSMSConfirmation = async (phone: string, firstName: string, appId: string) => {
    try {
      console.log(`Attempting to send application confirmation SMS to ${phone} for ${firstName}`);
      
      // Format the phone number properly
      const formattedPhone = phone.replace(/\D/g, '');
      console.log(`Formatted phone number: ${formattedPhone}`);
      
      const result = await sendLoanApplicationConfirmation(formattedPhone, firstName, appId);
      
      if (result.success) {
        console.log('SMS confirmation sent successfully:', result.data);
        toast.success("Application confirmation SMS sent", { 
          id: "sms-sent",
          duration: 3000 
        });
      } else {
        console.error('Failed to send SMS confirmation:', result.error);
        // Log more detailed error information
        if (result.error?.response) {
          console.error('SMS API response error:', result.error.response.data);
        }
      }
    } catch (error) {
      console.error('Exception during SMS confirmation sending:', error);
      // Don't rethrow to avoid breaking the application flow
    }
  };
  
  const handleProfileClick = () => {
    if (currentUser) {
      navigate('/profile');
    } else {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="flex-grow pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card p-8 text-center">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-success" />
              </div>
              <h1 className="heading-lg mb-4">Application Submitted!</h1>
              <p className="text-lg text-foreground/70 mb-8 max-w-lg mx-auto">
                Your loan application has been successfully submitted for review. 
                We'll be in touch with you shortly via email or SMS.
              </p>
              
              <div className="glass-card-inner p-4 mb-8">
                <p className="text-sm font-medium">Application Reference:</p>
                <p className="text-xl font-mono">{applicationId}</p>
                
                {applicationData && applicationData.loanAmount && (
                  <div className="mt-4 pt-4 border-t border-border text-left">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-foreground/70">Applicant:</p>
                        <p className="font-medium">{applicationData.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-foreground/70">Loan Amount:</p>
                        <p className="font-medium">R{applicationData.loanAmount?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-foreground/70">Purpose:</p>
                        <p className="font-medium capitalize">{applicationData.loanPurpose?.replace(/_/g, ' ') || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-foreground/70">Date:</p>
                        <p className="font-medium">{applicationData.applicationDate || new Date().toISOString().split('T')[0]}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
                <Button className="gap-2" onClick={handleProfileClick}>
                  <User className="h-4 w-4" />
                  Go to My Profile
                </Button>
              </div>
            </div>
            
            <div className="glass-card p-6 mt-8">
              <h2 className="heading-md mb-6">What Happens Next?</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Application Review</h3>
                    <p className="text-foreground/70">
                      Our team will review your application within 24-48 hours.
                      We may contact you if additional information is needed.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Decision Notification</h3>
                    <p className="text-foreground/70">
                      You will receive an email and SMS notification with the status of your application.
                      You can also check your application status in your profile dashboard.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Funding</h3>
                    <p className="text-foreground/70">
                      If approved, funds will be disbursed to your bank account within 3-5 business days.
                      You'll receive confirmation once the transfer is complete.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/faqs">
                    <FileText className="h-4 w-4" />
                    Frequently Asked Questions
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ApplicationSuccess; 