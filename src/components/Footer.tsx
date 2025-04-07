import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img src="/logo.png" alt="JB Capital Logo" className="h-10" />
            </Link>
            <p className="text-white/70 mt-4">
              We're committed to making the loan application process simple, transparent, and tailored to your needs.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-white/70 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/application" className="text-white/70 hover:text-white transition-colors">Apply Now</Link></li>
              <li><Link to="/eligibility" className="text-white/70 hover:text-white transition-colors">Eligibility</Link></li>
              <li><Link to="/documents" className="text-white/70 hover:text-white transition-colors">Documents</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="text-white/70 hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link to="/" className="text-white/70 hover:text-white transition-colors">GDPR</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="text-white/70">Email: contact@jbcapital.co.za</li>
              <li className="text-white/70">Phone: (011) 123-4567</li>
              <li className="text-white/70">Hours: Mon-Fri, 9AM-5PM SAST</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm">
            &copy; {currentYear} <span className="text-primary font-bold">JB</span> Capital. All rights reserved.
          </p>
          
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-white/70 hover:text-white transition-colors" aria-label="Twitter">
              Twitter
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors" aria-label="Facebook">
              Facebook
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors" aria-label="Instagram">
              Instagram
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors" aria-label="LinkedIn">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
