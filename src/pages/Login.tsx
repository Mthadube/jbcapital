import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, users, getUserByEmail, setCurrentUser, currentUser } = useAppData();
  
  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = async () => {
      const storedUser = localStorage.getItem('currentUser');
      
      if (storedUser && !currentUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData && userData.id) {
            const user = getUserByEmail(userData.email);
            if (user) {
              setCurrentUser(user);
              
              // Redirect to appropriate page
              if (user.role === 'admin') {
                navigate('/admin', { replace: true });
              } else {
                navigate('/profile', { replace: true });
              }
            }
          }
        } catch (error) {
          console.error('Error restoring session:', error);
          localStorage.removeItem('currentUser');
        }
      }
    };
    
    checkExistingSession();
  }, [currentUser, setCurrentUser, getUserByEmail, navigate]);
  
  // Get the redirect URL from location state or default to profile page
  const from = location.state?.from?.pathname || '/profile';
  
  // Handle the submit function for better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Use the improved login function from AppDataContext
      const success = await login(email, password);
      
      if (success) {
        toast.success('Login successful!');
        
        // Navigate to the appropriate page based on user role
        setTimeout(() => {
          if (email.toLowerCase() === 'admin@jbcapital.com') {
            navigate('/admin', { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed', { 
        description: 'Please try again or contact support if the issue persists.' 
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
              <CardTitle className="text-2xl font-bold text-center">
                Log in to JB Capital
              </CardTitle>
              <CardDescription className="text-center">
                Enter your email to access your account
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
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
              
              <div className="mt-6 space-y-4">
                <Separator />
                
                <div className="text-center text-sm">
                  <p className="text-muted-foreground">
                    Don't have an account?{' '}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => navigate('/application')}
                    >
                      Apply for a Loan
                    </Button>
                  </p>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="link" 
                    className="text-xs text-muted-foreground"
                    onClick={() => navigate('/admin/login')}
                  >
                    Admin Login
                  </Button>
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