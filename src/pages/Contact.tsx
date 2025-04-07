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
import {
  MapPin,
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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    scrollToTop(false);
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      console.log('Form data:', data);
      toast.success('Your message has been sent successfully!', {
        description: 'We will get back to you within 24-48 hours.',
        icon: <CheckCircle className="h-5 w-5" />
      });
      reset();
      setIsSubmitting(false);
    }, 1500);
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
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Our Location</h3>
                      <p className="text-foreground/70 mt-1">
                        123 Financial District<br />
                        Sandton, Johannesburg<br />
                        South Africa, 2196
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-full mr-4">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Phone Number</h3>
                      <p className="text-foreground/70 mt-1">
                        +27 11 234 5678<br />
                        +27 71 234 5678 (Mobile)
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
                        info@jbcapital.co.za<br />
                        support@jbcapital.co.za
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
                        Monday - Friday: 8:00 AM - 5:00 PM<br />
                        Saturday: 9:00 AM - 1:00 PM<br />
                        Sunday: Closed
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
                  <a href="#" className="p-3 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-all">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="p-3 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-all">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="p-3 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-all">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="p-3 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-all">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
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
                          const event = {
                            target: { value, name: 'subject' }
                          } as React.ChangeEvent<HTMLInputElement>;
                          register('subject').onChange(event);
                        }}
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
              <Button variant="outline" className="group-hover:bg-primary group-hover:text-white transition-all duration-300">
                Contact Loan Team <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="glass-card p-6 rounded-xl text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Users className="h-6 w-6 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Customer Support</h3>
              <p className="text-foreground/70 mb-4">
                Need assistance with your existing loan or account? Our support team is here to help.
              </p>
              <Button variant="outline" className="group-hover:bg-primary group-hover:text-white transition-all duration-300">
                Get Support <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="glass-card p-6 rounded-xl text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Phone className="h-6 w-6 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Call Us Directly</h3>
              <p className="text-foreground/70 mb-4">
                Prefer to speak with someone directly? Call our customer service line during business hours.
              </p>
              <Button variant="outline" className="group-hover:bg-primary group-hover:text-white transition-all duration-300">
                +27 11 234 5678 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
      
      <Footer />
    </div>
  );
};

export default Contact; 