
import React from "react";
import { Bell, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import CreditCard from "./CreditCard";

const DashboardHeader = () => {
  return (
    <header className="gradient-nav sticky top-0 z-10 border-b py-3">
      <div className="container-custom flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1">
              <CreditCard size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold">JB Capital</span>
          </Link>
          
          <nav className="hidden md:block">
            <ul className="flex items-center gap-6">
              <li>
                <Link to="/admin" className="font-medium text-primary">Dashboard</Link>
              </li>
              <li>
                <Link to="/" className="text-foreground/80 transition-colors hover:text-foreground">Home</Link>
              </li>
              <li>
                <Link to="/application" className="text-foreground/80 transition-colors hover:text-foreground">Applications</Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="rounded-full p-2 hover:bg-secondary">
            <Bell size={20} />
          </button>
          <button className="rounded-full p-2 hover:bg-secondary">
            <Settings size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@jbcapital.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
