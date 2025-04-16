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
import { Eye, EyeOff, Mail, Lock, Info, ShieldAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@jbcapital.com');
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
          if (userData && userData.id && userData.role === 'admin') {
            const user = getUserByEmail(userData.email);
            if (user && user.role === 'admin') {
              setCurrentUser(user);
              navigate('/admin', { replace: true });
            }
          }
        } catch (error) {
          console.error('Error restoring session:', error);
          localStorage.removeItem('currentUser');
        }
      }
    };
    
    checkExistingSession();
    
    // Set focus on password field
    setTimeout(() => {
      const passwordField = document.getElementById('password');
      if (passwordField) passwordField.focus();
    }, 100);
  }, [currentUser, setCurrentUser, getUserByEmail, navigate]);
  
  // Handle the submit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate that this is the admin email
      if (email.toLowerCase() !== 'admin@jbcapital.com') {
        toast.error('Invalid admin email');
        setIsLoading(false);
        return;
      }
      
      // Use the login function from AppDataContext
      const success = await login(email, password);
      
      if (success) {
        // Verify that the logged-in user is actually an admin
        const user = getUserByEmail(email);
        if (user && user.role === 'admin') {
          toast.success('Admin login successful!');
          setTimeout(() => {
            navigate('/admin', { replace: true });
          }, 500);
        } else {
          toast.error('Admin access denied');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 500);
        }
      } else {
        toast.error('Admin login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Login failed', { 
        description: 'Please try again or contact the system administrator.' 
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
          <Card className="glass-card border-2 border-amber-200">
            <CardHeader className="space-y-1">
              <div className="bg-amber-100 dark:bg-amber-950 p-3 rounded-md mb-2 text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  <p className="font-medium">Admin Access Only</p>
                </div>
                <p className="text-xs mt-1">This login page is restricted to system administrators</p>
              </div>
              
              <CardTitle className="text-2xl font-bold text-center">
                Admin Login
              </CardTitle>
              <CardDescription className="text-center">
                Enter admin credentials to access the dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="admin@jbcapital.com" 
                      className="pl-10 bg-amber-50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Admin Password</Label>
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
                  variant="default"
                >
                  {isLoading ? 'Signing in...' : 'Sign in as Admin'}
                </Button>
              </form>
              
              <div className="mt-6 space-y-4">
                <Separator />
                
                <div className="text-center text-sm">
                  <p className="text-muted-foreground">
                    Not an admin?{' '}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => navigate('/login')}
                    >
                      Regular User Login
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

export default AdminLogin; 