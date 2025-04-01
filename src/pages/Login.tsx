import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppData } from '@/utils/AppDataContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('admin123'); // Default to admin123 for demo
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, users, isAuthenticated } = useAppData();
  
  // Check if admin login was required (redirected from admin page)
  const adminRequired = location.state?.adminRequired;
  
  // Initialize admin email if redirected from admin page
  useEffect(() => {
    if (adminRequired) {
      setEmail('admin@jbcapital.com');
      // Set focus on password field if possible
      setTimeout(() => {
        const passwordField = document.getElementById('password');
        if (passwordField) passwordField.focus();
      }, 100);
    }
  }, [adminRequired]);
  
  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = isAdminEmail() ? '/admin' : '/profile';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  // Get the redirect URL from location state or default to profile page
  const from = location.state?.from?.pathname || '/profile';
  
  // Check if input email is admin
  const isAdminEmail = () => {
    return email.toLowerCase() === 'admin@jbcapital.com';
  };
  
  // Handle the submit function for better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For demo purposes, show available user emails
    if (email.toLowerCase() === 'help') {
      const userEmails = users
        .filter(user => user.role !== 'admin')
        .map(user => user.email)
        .join(', ');
      
      toast.info(`Regular users: ${userEmails}`, {
        duration: 10000,
      });
      
      toast.info("Admin account: admin@jbcapital.com (requires password: 'admin123')", {
        duration: 10000,
      });
      
      setIsLoading(false);
      return;
    }
    
    try {
      // Regular users and admin both need a password in the new system
      if (!password) {
        toast.error('Password is required');
        setIsLoading(false);
        return;
      }
      
      // Use the token-based login function from AppDataContext
      const success = await login(email, password);
      
      if (success) {
        // The navigation will be handled in the useEffect that watches isAuthenticated
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed', { 
        description: 'Please try again or check if the server is running' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          <Card className="glass-card">
            <CardHeader className="space-y-1">
              {adminRequired && (
                <div className="bg-amber-100 dark:bg-amber-950 p-3 rounded-md mb-4 text-amber-800 dark:text-amber-300 text-sm">
                  <p className="font-medium">Admin login required</p>
                  <p className="text-xs mt-1">Please use admin credentials to access the dashboard</p>
                </div>
              )}
              <CardTitle className="text-2xl font-bold text-center">
                {isAdminEmail() ? "Admin Login" : "Log in to JB Capital"}
              </CardTitle>
              <CardDescription className="text-center">
                {isAdminEmail() ? 
                  "Enter admin credentials to access the dashboard" : 
                  "Enter your email to access your account"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="email@example.com" 
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                {/* Always show password field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs"
                      onClick={() => {
                        setPassword('admin123');
                        toast.info("Password set to 'admin123' for demo");
                      }}
                      type="button"
                    >
                      Use demo password
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={isAdminEmail()}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  variant={isAdminEmail() ? "default" : "secondary"}
                >
                  {isLoading ? 'Signing in...' : isAdminEmail() ? 'Sign in as Admin' : 'Sign in as User'}
                </Button>
              </form>
              
              <div className="mt-6 space-y-4">
                <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 flex-shrink-0 text-amber-700 dark:text-amber-500" />
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-500">Demo Login Information</p>
                  </div>
                  <ul className="mt-2 text-xs text-amber-700 dark:text-amber-500 list-disc pl-5 space-y-1">
                    <li><strong>Admin login:</strong> admin@jbcapital.com / password: admin123</li>
                    <li><strong>Regular users:</strong> No password required, just enter email</li>
                    <li>Type "help" in the email field to see all available accounts</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="text-center text-sm">
                  <p className="text-muted-foreground">
                    Don't have an account?{' '}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => navigate('/sign-up')}
                    >
                      Register
                    </Button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login; 