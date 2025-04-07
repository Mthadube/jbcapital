import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X, User, LogOut, UserCircle2, LogIn } from 'lucide-react';
import { useAppData } from '@/utils/AppDataContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAppData();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 gradient-nav border-b border-primary/10' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center text-2xl font-bold text-primary transition-colors hover:text-primary/90"
        >
          <img src="/logo.png" alt="JB Capital Logo" className="h-14" />
        </Link>
        
        {isMobile ? (
          <>
            <button 
              onClick={toggleMenu} 
              className="p-2 text-foreground"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {isMenuOpen && (
              <nav className="absolute top-full left-0 right-0 gradient-nav border-y border-primary/10 shadow-lg animate-fade-in py-4">
                <ul className="flex flex-col space-y-4 px-6">
                  <li><Link to="/" className="block py-2 text-foreground/80 hover:text-primary transition-colors">Home</Link></li>
                  <li><Link to="/application" className="block py-2 text-foreground/80 hover:text-primary transition-colors">Apply Now</Link></li>
                  <li><Link to="/eligibility" className="block py-2 text-foreground/80 hover:text-primary transition-colors">Eligibility</Link></li>
                  <li><Link to="/documents" className="block py-2 text-foreground/80 hover:text-primary transition-colors">Documents</Link></li>
                  <li><Link to="/contact" className="block py-2 text-foreground/80 hover:text-primary transition-colors">Contact</Link></li>
                  <li className="flex items-center justify-between py-2">
                    <span className="text-foreground/80">Theme</span>
                    <ThemeToggle variant="icon" size="sm" showTooltip={false} />
                  </li>
                  {currentUser ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <UserCircle2 className="h-5 w-5" />
                          {currentUser.firstName} {currentUser.lastName}
                          {currentUser.role === 'admin' && (
                            <Badge variant="secondary" className="ml-1">Admin</Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {currentUser.role === 'admin' && (
                          <DropdownMenuItem asChild>
                            <Link to="/admin">Admin Dashboard</Link>
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem asChild>
                          <Link to="/profile">Profile</Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                          <Link to="/profile/applications">My Applications</Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                          <Link to="/profile/documents">Documents</Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => {
                            logout();
                            toast.success('Logged out successfully');
                            navigate('/');
                          }}
                          className="text-red-500 focus:text-red-500"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <li>
                      <Button variant="default" size="sm" asChild>
                        <Link to="/login" className="flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Log in
                        </Link>
                      </Button>
                    </li>
                  )}
                  <li>
                    <Link 
                      to="/application" 
                      className="block w-full text-center btn-primary mt-2"
                    >
                      Apply Now
                    </Link>
                  </li>
                </ul>
              </nav>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-8">
            <nav>
              <ul className="flex space-x-8">
                <li><Link to="/" className="text-foreground/80 hover:text-primary transition-colors font-medium">Home</Link></li>
                <li><Link to="/application" className="text-foreground/80 hover:text-primary transition-colors font-medium">Apply Now</Link></li>
                <li><Link to="/eligibility" className="text-foreground/80 hover:text-primary transition-colors font-medium">Eligibility</Link></li>
                <li><Link to="/documents" className="text-foreground/80 hover:text-primary transition-colors font-medium">Documents</Link></li>
                <li><Link to="/contact" className="text-foreground/80 hover:text-primary transition-colors font-medium">Contact</Link></li>
              </ul>
            </nav>
            <div className="flex items-center gap-4">
              <ThemeToggle variant="icon" size="sm" />
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <UserCircle2 className="h-5 w-5" />
                      {currentUser.firstName} {currentUser.lastName}
                      {currentUser.role === 'admin' && (
                        <Badge variant="secondary" className="ml-1">Admin</Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {currentUser.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile</Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/profile/applications">My Applications</Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/profile/documents">Documents</Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => {
                        logout();
                        toast.success('Logged out successfully');
                        navigate('/');
                      }}
                      className="text-red-500 focus:text-red-500"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="default" size="sm" asChild>
                  <Link to="/login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Log in
                  </Link>
                </Button>
              )}
              <Link 
                to="/application" 
                className="btn-primary"
              >
                Apply Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
