import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoanCalculator from '@/components/LoanCalculator';
import { 
  ArrowRight, CheckCircle, ShieldCheck, Clock, FileText, Search, 
  CreditCard, User, Building2, Home, Landmark, GraduationCap, 
  Plane, Heart, Banknote, Stethoscope 
} from 'lucide-react';
import { scrollToTop } from "@/components/ScrollToTop";

const Index: React.FC = () => {
  useEffect(() => {
    scrollToTop(false); // Use instant scrolling on page load
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 gradient-hero relative overflow-hidden">
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

          {/* Abstract Lines */}
          <svg className="absolute left-0 bottom-0 w-[600px] h-[600px] opacity-[0.15] -translate-x-1/3" viewBox="0 0 100 100">
            <path d="M0,50 C20,20 40,80 60,20 S80,80 100,50" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-primary" />
            <path d="M0,30 C20,60 40,0 60,60 S80,0 100,30" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-primary" />
            <path d="M0,70 C20,40 40,100 60,40 S80,100 100,70" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-primary" />
          </svg>

          {/* Dots Matrix */}
          <svg className="absolute left-1/2 top-1/2 w-[800px] h-[800px] opacity-[0.1] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 100 100">
            <pattern id="dots-matrix" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary" />
              <circle cx="18" cy="18" r="1" fill="currentColor" className="text-primary" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#dots-matrix)" />
          </svg>

          {/* Corner Accent */}
          <svg className="absolute right-0 bottom-0 w-[300px] h-[300px] opacity-[0.2]" viewBox="0 0 100 100">
            <path d="M100,0 L100,100 L0,100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" strokeDasharray="1,3" />
            <path d="M100,20 L100,100 L20,100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" strokeDasharray="1,3" />
            <path d="M100,40 L100,100 L40,100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" strokeDasharray="1,3" />
          </svg>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="chip">Simple & Transparent Application Process</div>
              <h1 className="heading-xl">
                Get Your Loan <br />
                <span className="text-primary">Effortlessly</span>
              </h1>
              <p className="text-xl text-foreground/70 max-w-lg">
                Apply for a loan with our streamlined, user-friendly process. Get the funds you need without the unnecessary complexity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/application" className="btn-primary">
                  <span className="flex items-center">
                    Start Your Application <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
                <Link to="/eligibility" className="px-6 py-3 bg-white/90 text-primary border-2 border-primary rounded-lg font-medium hover:bg-primary/10 transition-all duration-300 flex items-center justify-center shadow-sm">
                  Check Eligibility
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl blur-xl opacity-70"></div>
              <LoanCalculator className="animate-float relative" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="chip mx-auto">Why Choose JB Capital</div>
            <h2 className="heading-lg mt-4">A Simple Process from Start to Finish</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto mt-4">
              Our loan application process is designed to be intuitive, transparent, and efficient, getting you the funds you need without unnecessary complexity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="gradient-card p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simple Application</h3>
              <p className="text-foreground/70">
                Our streamlined application process takes just minutes to complete, with clear instructions every step of the way.
              </p>
            </div>
            
            <div className="gradient-card p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Approval</h3>
              <p className="text-foreground/70">
                Get a decision on your loan application quickly, with transparent communication throughout the process.
              </p>
            </div>
            
            <div className="gradient-card p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Process</h3>
              <p className="text-foreground/70">
                Your information is protected with industry-leading security measures, ensuring your data remains private and secure.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section - Improved */}
      <section className="py-24 bg-gradient-to-br from-white via-primary/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-b from-primary/5 to-transparent rounded-bl-[200px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-gradient-to-t from-primary/5 to-transparent rounded-tr-[150px] -z-10"></div>
        
        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <div className="chip mx-auto">Application Process</div>
            <h2 className="heading-lg mt-4">How It Works</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto mt-4">
              Our loan application process is designed to be straightforward and efficient, with just a few simple steps.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 relative mb-16">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-[45%] left-[16%] right-[16%] h-1 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10"></div>
            
            {/* Step 1 */}
            <div className="flex-1 flex flex-col items-center text-center relative group">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-500 text-white text-2xl font-bold mb-8 z-10 shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 transform group-hover:scale-110">
                <FileText className="w-8 h-8" />
              </div>
              <div className="bg-white p-8 rounded-2xl h-full transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl border border-blue-100">
                <h3 className="text-xl font-semibold mb-4 text-blue-700">Complete Application</h3>
                <p className="text-blue-900/70">
                  Fill out our simple online application with your personal and financial information. The process takes just minutes to complete.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex-1 flex flex-col items-center text-center relative group">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-purple-500 text-white text-2xl font-bold mb-8 z-10 shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300 transform group-hover:scale-110">
                <Search className="w-8 h-8" />
              </div>
              <div className="bg-white p-8 rounded-2xl h-full transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl border border-purple-100">
                <h3 className="text-xl font-semibold mb-4 text-purple-700">Review & Approval</h3>
                <p className="text-purple-900/70">
                  We'll review your application and provide a quick decision on your loan request. Transparent communication throughout the process.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex-1 flex flex-col items-center text-center relative group">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-emerald-500 text-white text-2xl font-bold mb-8 z-10 shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300 transform group-hover:scale-110">
                <CreditCard className="w-8 h-8" />
              </div>
              <div className="bg-white p-8 rounded-2xl h-full transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl border border-emerald-100">
                <h3 className="text-xl font-semibold mb-4 text-emerald-700">Receive Funds</h3>
                <p className="text-emerald-900/70">
                  Once approved, your funds will be disbursed to your account, often within one business day. Start using your loan right away.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Link 
              to="/application" 
              className="btn-primary group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Start Your Application 
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Loan Types Section - NEW */}
      <section className="py-24 relative bg-gradient-to-br from-blue-50 via-primary/5 to-blue-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-b from-primary/5 to-transparent rounded-bl-[200px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-gradient-to-t from-primary/5 to-transparent rounded-tr-[150px] -z-10"></div>
        
        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <div className="chip mx-auto">LOAN TYPES</div>
            <h2 className="heading-lg mt-4">We Offer a Wide Variety of Loans</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto mt-4">
              Find the perfect financial solution tailored to your specific needs with our diverse loan offerings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Personal Loan */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 group-hover:translate-y-[-8px] h-full flex flex-col">
                <div className="mb-4 p-3 bg-primary/10 text-primary rounded-full w-14 h-14 flex items-center justify-center">
                  <User size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Personal Loan</h3>
                <p className="text-foreground/70 text-sm mb-4 flex-grow">
                  Achieve your goals with flexible personal loans designed to meet your unique financial requirements.
                </p>
                <Link to="/application" className="text-primary flex items-center text-sm font-medium mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Business Loan */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 group-hover:translate-y-[-8px] h-full flex flex-col">
                <div className="mb-4 p-3 bg-primary/10 text-primary rounded-full w-14 h-14 flex items-center justify-center">
                  <Building2 size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Business Loan</h3>
                <p className="text-foreground/70 text-sm mb-4 flex-grow">
                  Empower your business growth with customized loan solutions for working capital, equipment, or expansion needs.
                </p>
                <Link to="/application" className="text-primary flex items-center text-sm font-medium mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Home Loan */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 group-hover:translate-y-[-8px] h-full flex flex-col">
                <div className="mb-4 p-3 bg-primary/10 text-primary rounded-full w-14 h-14 flex items-center justify-center">
                  <Home size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Home Loan</h3>
                <p className="text-foreground/70 text-sm mb-4 flex-grow">
                  Secure your dream home with competitive mortgage rates and flexible repayment terms tailored to your financial situation.
                </p>
                <Link to="/application" className="text-primary flex items-center text-sm font-medium mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Education Loan */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 group-hover:translate-y-[-8px] h-full flex flex-col">
                <div className="mb-4 p-3 bg-primary/10 text-primary rounded-full w-14 h-14 flex items-center justify-center">
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Education Loan</h3>
                <p className="text-foreground/70 text-sm mb-4 flex-grow">
                  Invest in your future with education loans that support tuition, textbooks, and other academic expenses.
                </p>
                <Link to="/application" className="text-primary flex items-center text-sm font-medium mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Travel Loan */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 group-hover:translate-y-[-8px] h-full flex flex-col">
                <div className="mb-4 p-3 bg-primary/10 text-primary rounded-full w-14 h-14 flex items-center justify-center">
                  <Plane size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Travel Loan</h3>
                <p className="text-foreground/70 text-sm mb-4 flex-grow">
                  Turn your dream getaway into reality with affordable travel loans for flights, accommodations, and experiences.
                </p>
                <Link to="/application" className="text-primary flex items-center text-sm font-medium mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Wedding Loan */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 group-hover:translate-y-[-8px] h-full flex flex-col">
                <div className="mb-4 p-3 bg-primary/10 text-primary rounded-full w-14 h-14 flex items-center justify-center">
                  <Heart size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Wedding Loan</h3>
                <p className="text-foreground/70 text-sm mb-4 flex-grow">
                  Celebrate your dream wedding without financial stress, with tailored loans designed to cover all your special day expenses.
                </p>
                <Link to="/application" className="text-primary flex items-center text-sm font-medium mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Payday Loan */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 group-hover:translate-y-[-8px] h-full flex flex-col">
                <div className="mb-4 p-3 bg-primary/10 text-primary rounded-full w-14 h-14 flex items-center justify-center">
                  <Banknote size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Payday Loan</h3>
                <p className="text-foreground/70 text-sm mb-4 flex-grow">
                  Bridge the gap until your next paycheck with quick and convenient payday loans for urgent financial needs.
                </p>
                <Link to="/application" className="text-primary flex items-center text-sm font-medium mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Medical Emergency Loan */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 group-hover:translate-y-[-8px] h-full flex flex-col">
                <div className="mb-4 p-3 bg-primary/10 text-primary rounded-full w-14 h-14 flex items-center justify-center">
                  <Stethoscope size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Medical Emergency Loan</h3>
                <p className="text-foreground/70 text-sm mb-4 flex-grow">
                  Access funds quickly to cover unexpected medical expenses, ensuring peace of mind during emergencies.
                </p>
                <Link to="/application" className="text-primary flex items-center text-sm font-medium mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <Link 
              to="/application" 
              className="btn-primary group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Find Your Perfect Loan 
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 gradient-cta text-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-lg">Ready to Get Started?</h2>
            <p className="text-xl text-white/80 mt-4 mb-8">
              Begin your loan application today and take the first step toward achieving your financial goals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/application" 
                className="px-8 py-3 bg-white text-primary rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white/90"
              >
                Apply Now
              </Link>
              <Link 
                to="/eligibility" 
                className="px-8 py-3 bg-transparent border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-all duration-300"
              >
                Check Eligibility
              </Link>
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

export default Index;
