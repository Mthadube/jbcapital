import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, AlertCircle, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';
import { sendOTP } from '@/utils/twilioService';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerifySuccess: () => void;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  onVerifySuccess
}) => {
  const [step, setStep] = useState<'send' | 'verify' | 'success' | 'error'>('send');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Format phone number for display
  const formatPhoneForDisplay = (phone: string) => {
    if (!phone) return '';
    
    // Remove non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format South African number with +27 country code
    if (digits.startsWith('27') && (digits.length === 11 || digits.length === 12)) {
      // If starts with 27, format as +27 XX XXX XXXX
      return `+27 ${digits.substring(2, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
    } 
    else if (digits.startsWith('0') && (digits.length === 10 || digits.length === 11)) {
      // If starts with 0, format as +27 XX XXX XXXX
      return `+27 ${digits.substring(1, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
    }
    else if (!digits.startsWith('0') && !digits.startsWith('27') && !digits.startsWith('+') && 
             (digits.length === 9 || digits.length === 10)) {
      // If just 9-10 digits without country code
      return `+27 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
    }
    else if (digits.startsWith('+27') || (digits.startsWith('+') && digits.substring(1, 3) === '27')) {
      // If already has +27
      const withoutPlus = digits.startsWith('+') ? digits.substring(1) : digits;
      return `+27 ${withoutPlus.substring(2, 4)} ${withoutPlus.substring(4, 7)} ${withoutPlus.substring(7)}`;
    }
    
    // Any other format, add spaces for readability
    if (digits.length >= 10) {
      // Split into chunks of 3-3-4 or similar pattern
      const countryCode = digits.substring(0, 2);
      return `+${countryCode} ${digits.substring(2, 5)} ${digits.substring(5, 8)} ${digits.substring(8)}`;
    }
    
    return phone;
  };
  
  // Reset the timer when moving back to send step
  useEffect(() => {
    if (step === 'send') {
      setTimer(0);
    }
  }, [step]);
  
  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer > 0 && step === 'verify') {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && step === 'verify') {
      // OTP expired
      toast.error('Verification code has expired. Please request a new one.');
      setStep('send');
    }
    
    return () => clearInterval(interval);
  }, [timer, step]);
  
  // Handle OTP input
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(parseInt(element.value)) && element.value !== '') {
      return;
    }
    
    const newOtp = [...otp];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtp(newOtp);
    
    // Move to next input if current field is filled
    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle keypresses for backspace and movement
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Generate and send OTP
  const handleSendOTP = async () => {
    setIsSubmitting(true);
    
    try {
      // Generate a 6-digit OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      
      // Send OTP via SMS
      const result = await sendOTP(phoneNumber, newOtp);
      
      if (result.success) {
        toast.success('Verification code sent to your phone');
        setStep('verify');
        setTimer(600); // 10 minutes (600 seconds)
        setOtp(['', '', '', '', '', '']);
      } else {
        console.error('Failed to send OTP:', result.error);
        toast.error('Failed to send verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Verify OTP
  const handleVerifyOTP = () => {
    setIsSubmitting(true);
    
    try {
      const enteredOtp = otp.join('');
      
      // In a production app, this verification would happen server-side
      if (enteredOtp === generatedOtp) {
        toast.success('Phone number verified successfully');
        setStep('success');
        
        // Call the success callback after a short delay for animation
        setTimeout(() => {
          onVerifySuccess();
        }, 1500);
      } else {
        setVerificationAttempts(prev => prev + 1);
        
        // After 3 failed attempts, force user to request a new OTP
        if (verificationAttempts >= 2) {
          toast.error('Too many failed attempts. Please request a new code.');
          setStep('send');
          setVerificationAttempts(0);
        } else {
          toast.error(`Incorrect verification code. ${3 - verificationAttempts - 1} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format timer for display as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'send' && 'Phone Verification'}
            {step === 'verify' && 'Enter Verification Code'}
            {step === 'success' && 'Verification Successful'}
            {step === 'error' && 'Verification Failed'}
          </DialogTitle>
          <DialogDescription>
            {step === 'send' && 'We need to verify your phone number before submitting your loan application.'}
            {step === 'verify' && `We've sent a verification code to ${formatPhoneForDisplay(phoneNumber)}. It will expire in ${formatTime(timer)}.`}
            {step === 'success' && 'Your phone number has been verified successfully. Your loan application will now be submitted.'}
            {step === 'error' && 'We were unable to verify your phone number. Please try again.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center p-4">
          {step === 'send' && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="bg-blue-100 rounded-full p-3 dark:bg-blue-900">
                <LockKeyhole className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-center text-sm">
                We'll send a 6-digit verification code to:
              </p>
              <p className="font-medium text-lg">
                {formatPhoneForDisplay(phoneNumber)}
              </p>
              <Button 
                onClick={handleSendOTP} 
                className="w-full mt-4" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : "Send Verification Code"}
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="flex justify-center space-x-2 w-full my-4">
                {otp.map((data, index) => (
                  <Input
                    key={index}
                    ref={(input) => (inputRefs.current[index] = input)}
                    type="text"
                    inputMode="numeric"
                    className="w-10 h-12 text-center text-xl font-semibold border-2"
                    maxLength={1}
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              
              <p className="text-sm text-center text-muted-foreground">
                The code will expire in {formatTime(timer)}
              </p>
              
              <div className="flex flex-col space-y-2 w-full mt-4">
                <Button 
                  onClick={handleVerifyOTP} 
                  className="w-full" 
                  disabled={otp.join('').length !== 6 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : "Verify"}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setStep('send')}
                  disabled={isSubmitting}
                >
                  Resend Code
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center space-y-4 py-6">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-center">
                Your phone number has been verified successfully.
              </p>
            </div>
          )}

          {step === 'error' && (
            <div className="flex flex-col items-center space-y-4 py-6">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-center">
                We couldn't verify your phone number. Please try again.
              </p>
              <Button 
                onClick={() => setStep('send')} 
                variant="outline" 
                className="w-full mt-2"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col space-y-2 sm:space-y-0">
          {step !== 'success' && step !== 'error' && (
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneVerificationModal; 