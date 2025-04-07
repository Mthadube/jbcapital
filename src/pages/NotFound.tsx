
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-20">
        <div className="container text-center max-w-md">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-foreground/70 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Home
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound;
