import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoanCalculator from '@/components/LoanCalculator';
import Preloader from '@/components/Preloader';
import { 
  ArrowRight, CheckCircle, ShieldCheck, Clock, FileText, Search, 
  CreditCard, User, Building2, Home, Landmark, GraduationCap, 
  Plane, Heart, Banknote, Stethoscope 
} from 'lucide-react';
import { scrollToTop } from "@/components/ScrollToTop";

const Index: React.FC = () => {
  // Start with loading true by default to show the preloader immediately
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Ensure preloader is visible immediately
    document.body.style.overflow = 'hidden';
    
    scrollToTop(false); // Use instant scrolling on page load
    
    // Clean up function to restore overflow when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  const handleLoadingComplete = () => {
    // Restore scrolling after preloader finishes
    document.body.style.overflow = '';
    setLoading(false);
  };

  return (
    <>
      {/* Preloader is always shown initially */}
      {loading && <Preloader onLoadingComplete={handleLoadingComplete} />}
      
      <div className={`min-h-screen flex flex-col transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}>
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
                <p className="text-xl font-medium text-primary/90 max-w-xl">
                  At JB Capital, we empower financial growth with tailored loan solutions, exceptional service, and trusted partnerships for success.
                </p>
                {/* <p className="text-xl text-foreground/70 max-w-lg">
                  Apply for a loan with our streamlined, user-friendly process. Get the funds you need without the unnecessary complexity.
                </p> */}
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
              <h2 className="heading-lg">A Simple Process from Start to Finish</h2>
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
        <section className="py-14 bg-gradient-to-br from-white via-primary/5 to-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-b from-primary/5 to-transparent rounded-bl-[200px] -z-10"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-gradient-to-t from-primary/5 to-transparent rounded-tr-[150px] -z-10"></div>
          
          <div className="container-custom relative z-10">
            <div className="text-center mb-16">
              <h2 className="heading-lg">Our Simple Process</h2>
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
          </div>
        </section>
        
        {/* Loan Types Section */}
        <section className="py-24 bg-loans-pattern relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container-custom relative z-10">
            <div className="text-center mb-16">
              <h2 className="heading-lg">We Offer a Wide Variety of Loans</h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto mt-4">
                Find the perfect financial solution tailored to your specific needs with our diverse
                loan offerings
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personal Loan Card */}
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-4">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personal Loan</h3>
                <p className="text-foreground/70 mb-4">
                  Achieve your goals with flexible personal loans designed to meet your unique financial requirements.
                </p>
                <Link to="/application" className="text-blue-500 font-medium inline-flex items-center mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              {/* Education Loan Card */}
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-4">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Education Loan</h3>
                <p className="text-foreground/70 mb-4">
                  Invest in your future with education loans that support tuition, textbooks, and other academic expenses.
                </p>
                <Link to="/application" className="text-blue-500 font-medium inline-flex items-center mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              {/* Travel Loan Card */}
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-4">
                  <Plane className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Travel Loan</h3>
                <p className="text-foreground/70 mb-4">
                  Turn your dream getaway into reality with affordable travel loans for flights, accommodations, and experiences.
                </p>
                <Link to="/application" className="text-blue-500 font-medium inline-flex items-center mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              {/* Wedding Loan Card */}
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Wedding Loan</h3>
                <p className="text-foreground/70 mb-4">
                  Celebrate your dream wedding without financial stress, with tailored loans designed to cover all your special day expenses.
                </p>
                <Link to="/application" className="text-blue-500 font-medium inline-flex items-center mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              {/* Payday Loan Card */}
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-4">
                  <Banknote className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Payday Loan</h3>
                <p className="text-foreground/70 mb-4">
                  Bridge the gap until your next paycheck with quick and convenient payday loans for urgent financial needs.
                </p>
                <Link to="/application" className="text-blue-500 font-medium inline-flex items-center mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              {/* Medical Emergency Loan */}
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-4">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Medical Emergency Loan</h3>
                <p className="text-foreground/70 mb-4">
                  Access funds quickly to cover unexpected medical expenses, ensuring peace of mind during emergencies.
                </p>
                <Link to="/application" className="text-blue-500 font-medium inline-flex items-center mt-auto">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/application" className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 inline-flex items-center">
                Find Your Perfect Loan <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 bg-happy-people opacity-60" style={{ filter: 'brightness(0.4)' }}></div>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-blue-900/80 mix-blend-multiply"></div>
          
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_40%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_40%)]"></div>
          
          <div className="container-custom relative z-10">
            <div className="flex flex-col items-center gap-12">
              <div className="space-y-6 text-white animate-fade-in text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Start Your Journey to <span className="relative">
                    Financial Freedom
                    <span className="absolute bottom-1 left-0 w-full h-1 bg-white/30 rounded-full"></span>
                  </span>
                </h2>
                <p className="text-xl text-white/90">
                  Join thousands of satisfied customers who have achieved their financial goals with JB Capital. 
                  Our tailored loan solutions can help you take the next step in your financial journey.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4 justify-center">
                  <Link to="/application" className="px-8 py-4 bg-white text-primary rounded-lg font-semibold shadow-lg hover:shadow-white/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center">
                    <span>Apply Now</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link to="/eligibility" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center">
                    Check Eligibility
                  </Link>
                </div>
                
                <div className="pt-8 flex items-center justify-center">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                        <div className={`w-full h-full bg-gradient-to-br ${
                          i === 1 ? 'from-pink-500 to-purple-500' :
                          i === 2 ? 'from-blue-500 to-teal-500' :
                          i === 3 ? 'from-yellow-500 to-orange-500' :
                          'from-green-500 to-emerald-500'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                  <div className="ml-4">
                    <div className="font-bold text-xl">500+</div>
                    <div className="text-white/80 text-sm">Happy Customers</div>
                  </div>
                  <div className="w-px h-12 bg-white/20 mx-6"></div>
                  <div>
                    <div className="font-bold text-xl">4.9/5</div>
                    <div className="text-white/80 text-sm">Customer Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    </>
  );
};

export default Index;
