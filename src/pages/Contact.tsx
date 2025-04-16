import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { scrollToTop } from '@/components/ScrollToTop';
import { submitContactForm, sendSmsNotification, ContactFormData } from '@/utils/api';
import {
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Loader2,
  ArrowRight,
  MessageSquare,
  Users
} from 'lucide-react';

type FormValues = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    scrollToTop(false);
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    // Prepare contact form data
    const contactFormData: ContactFormData = {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      subject: data.subject,
      message: data.message
    };

    try {
      // Submit the form to the API
      const response = await submitContactForm(contactFormData);
      
      if (response.success) {
        // Send SMS notification to admin
        const adminPhoneNumber = '0613983580';
        const smsMessage = `New contact form submission from ${data.name}. Subject: ${data.subject}`;
        await sendSmsNotification(adminPhoneNumber, smsMessage);
        
        // Show success notification
        toast.success('Your message has been sent successfully!', {
          description: 'We will get back to you within 24-48 hours.',
          icon: <CheckCircle className="h-5 w-5" />
        });
        
        // Reset form
        reset();
      } else {
        // Show error notification
        toast.error('Failed to submit your message', {
          description: response.error || 'Please try again later.',
        });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error('An error occurred while submitting your message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section - Reduced vertical padding */}
      <section className="pt-28 pb-14 gradient-hero relative overflow-hidden">
        {/* Decorative SVG elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" width="100%" height="100%">
            <pattern id="grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <line x1="50" y1="0" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <line x1="0" y1="50" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Hexagon Pattern */}
          <svg className="absolute right-0 top-0 w-[900px] h-[900px] opacity-[0.07] -translate-y-1/3 translate-x-1/3" viewBox="0 0 100 100">
            <defs>
              <pattern id="hexagons" width="10" height="17.32" patternUnits="userSpaceOnUse">
                <path d="M5 0L9.33 2.5V7.5L5 10L0.67 7.5V2.5L5 0ZM5 17.32L9.33 14.82V9.82L5 7.32L0.67 9.82V14.82L5 17.32Z" 
                      fill="none" stroke="currentColor" strokeWidth="0.2" className="text-primary" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-8 animate-fade-in">
            <div className="chip mx-auto">Get In Touch With Us</div>
            <h1 className="heading-xl mt-4">
              Let's <span className="text-primary">Connect</span>
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto mt-4">
              Have questions about our services or need assistance with your application? 
              We're here to help you every step of the way.
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Section - Reduced vertical padding */}
      <section className="py-10 bg-secondary/30 relative">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-card p-6 rounded-xl animate-fade-in">
                <h2 className="text-2xl font-bold mb-4 text-primary">Contact Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-full mr-4">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Phone Number</h3>
                      <p className="text-foreground/70 mt-1">
                        +27 72 243 1795 (Calls Only)<br />
                        +27 64 043 8141 (WhatsApp Chat Only)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-full mr-4">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email Address</h3>
                      <p className="text-foreground/70 mt-1">
                        info@jbcapitalco.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-full mr-4">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Office Hours</h3>
                      <p className="text-foreground/70 mt-1">
                        Available 24/7
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-6 rounded-xl animate-fade-in-delayed">
                <h2 className="text-2xl font-bold mb-4 text-primary">Connect With Us</h2>
                <p className="text-foreground/70 mb-4">
                  Follow us on social media for the latest updates, financial tips, and more.
                </p>
                
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/people/JB-Capital/100086487337189" className="p-3 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-all" aria-label="Facebook">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/jbcapitalco/" className="p-3 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-all" aria-label="Instagram">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                  <a href="https://www.tiktok.com/@jbcapitalcompany" className="p-3 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-all" aria-label="TikTok">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="glass-card p-6 rounded-xl animate-fade-in">
                <h2 className="text-2xl font-bold mb-2 text-primary">Send Us a Message</h2>
                <p className="text-foreground/70 mb-4">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        {...register('name', { required: 'Name is required' })}
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+27 XX XXX XXXX"
                        {...register('phone')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
                      <Select
                        onValueChange={(value) => {
                          setValue('subject', value);
                        }}
                        defaultValue=""
                      >
                        <SelectTrigger
                          id="subject"
                          className={errors.subject ? 'border-red-500' : ''}
                        >
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="application">Loan Application</SelectItem>
                          <SelectItem value="support">Customer Support</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <input 
                        type="hidden" 
                        {...register('subject', { required: 'Please select a subject' })}
                      />
                      {errors.subject && (
                        <p className="text-red-500 text-sm">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="message"
                      placeholder="How can we help you?"
                      rows={5}
                      {...register('message', { required: 'Message is required' })}
                      className={errors.message ? 'border-red-500' : ''}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm">{errors.message.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Cards Section - Reduced vertical padding */}
      <section className="py-10 bg-white">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="heading-lg">How Can We Help You?</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto mt-3">
              Our team is ready to assist you with any questions or concerns you might have.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-xl text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <MessageSquare className="h-6 w-6 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Loan Inquiries</h3>
              <p className="text-foreground/70 mb-4">
                Questions about our loan products, application process, or eligibility criteria?
              </p>
              <a 
                href="https://wa.me/+27640438141"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  Contact Loan Team <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
            
            <div className="glass-card p-6 rounded-xl text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Users className="h-6 w-6 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Customer Support</h3>
              <p className="text-foreground/70 mb-4">
                Need assistance with your existing loan or account? Our support team is here to help.
              </p>
              <a 
                href="https://wa.me/+27640438141"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  Get Support <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
            
            <div className="glass-card p-6 rounded-xl text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Phone className="h-6 w-6 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Call Us Directly</h3>
              <p className="text-foreground/70 mb-4">
                Prefer to speak with someone directly? Call our customer service line during business hours.
              </p>
              <a href="tel:+27722431795">
                <Button variant="outline" className="group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  +27 72 243 1795 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section - Reduced vertical padding */}
      <section className="py-12 gradient-cta text-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-lg">Ready to Apply for a Loan?</h2>
            <p className="text-xl text-white/80 mt-2 mb-4">
              Skip the wait and start your application process today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/application" 
                className="px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:opacity-90 flex items-center justify-center"
              >
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a 
                href="/eligibility" 
                className="px-6 py-3 bg-transparent border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
              >
                Check Eligibility
              </a>
            </div>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/20 blur-3xl"></div>
        </div>
      </section>
      
      {/* Add a new section for regulatory information */}
      <div className="glass-card p-6 rounded-xl animate-fade-in-delayed mt-6">
        <h2 className="text-2xl font-bold mb-4 text-primary">Regulatory Information</h2>
        <p className="text-foreground/70 mb-4">
          JB Capital Co. is registered with the National Credit Regulator (NCR) under registration number NCR CP20712.
        </p>
        
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 items-center mt-6">
          <div className="text-center">
            <img src="/logos/ncr.png" alt="National Credit Regulator" className="h-24 mx-auto" />
          </div>
          
          <div className="text-center">
            <img src="/logos/DebiCheck.png" alt="DebiCheck" className="h-24 mx-auto" />
          </div>
        </div>
      </div>
      
      {/* Reference Site Section */}
      <div className="glass-card p-6 rounded-xl animate-fade-in-delayed mt-6">
        <h2 className="text-2xl font-bold mb-4 text-primary">Simplicity We Aim For</h2>
        <p className="text-foreground/70 mb-4">
          The Wonga site is the simplicity we aim for. It does not have to be similar but we like the compact site and easy interaction.
        </p>
        
        <div className="mt-4">
          <a 
            href="https://www.wonga.co.za/loans?utm_source=google&utm_medium=cpc-brand&gclerc=aw.ds&gad_source=1&gbraid=0AAAADpIg76VzHNResAo1hs8wmsarApB&gclid=Cj0KCQjw2N2_BhCAAARIsAK4pEkUM2-6ftQxt1cOYEPlpX_Evm2I0D2F2OFcEPHWAgEQjDY_SiSPLUaAuvFEALw_wcB" 
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Wonga.co.za
          </a>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact; 