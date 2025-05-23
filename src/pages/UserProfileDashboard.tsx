import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from "sonner";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  User, 
  CreditCard, 
  FileText, 
  Bell, 
  Home, 
  Wallet, 
  Settings, 
  LogOut, 
  ArrowRight, 
  Download,
  Shield,
  CircleDollarSign,
  CalendarClock,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Building,
  Edit,
  Calendar,
  Phone,
  Mail,
  Save,
  X,
  Plus,
  Eye,
  FileQuestion,
  Clock,
  XCircle,
  Activity,
  BadgeCheck,
  FileX,
  Upload,
  MoreVertical,
  BellOff,
  BellRing,
  Circle,
  CheckCircle2 as CircleCheck,
  FileCheck,
  LogIn,
  Receipt,
  FileIcon as FileIconLucide,
  CalendarDays,
  Filter,
  Link as LinkIcon,
  Menu,
  MessageSquare,
  Search,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import './UserProfileDashboard.css'; // Import custom CSS file for styling
import { scrollToTop } from "@/components/ScrollToTop";
import { useAppData } from '@/utils/AppDataContext';
import { useRequireAuth } from '@/utils/useRequireAuth';
import { UserSettings } from '@/components/ui/user-settings';
import DocumentUploader from '../components/DocumentUploader';
import DocumentList, { DocumentListRef } from '../components/DocumentList';
import DocumentsManager from '../components/DocumentsManager';
import { calculateProfileCompletion, getIncompleteProfileItems, getDocumentTypeDisplayName } from '../utils/profileUtils';
import UserContracts from '../components/UserContracts';
// Import the UserDocumentStatus component
import UserDocumentStatus from '@/components/UserDocumentStatus';

// Interface for form data
interface FormData {
  // Personal Information
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  accountNumber?: string;
  
  // Address Information
  address: string;
  suburb?: string; // Make suburb optional
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  
  // Employment Information
  employmentStatus?: string;
  employmentType?: string;
  employmentSector?: string;
  employerName?: string;
  jobTitle?: string;
  yearsEmployed?: number;
  monthlyIncome: number;
  paymentDate?: string;
  
  // Financial Information
  creditScore?: number;
  existingLoans?: boolean;
  existingLoanAmount?: number;
  monthlyDebt?: number;
  bankName?: string;
  accountType?: string;
  bankingPeriod?: number;
  
  // Monthly Expenses
  rentMortgage?: number;
  carPayment?: number;
  groceries?: number;
  utilities?: number;
  insurance?: number;
  otherExpenses?: number;
  totalMonthlyExpenses?: number;
  
  // Loan Information
  availableCredit?: number;
  nextPaymentAmount?: number;
  nextPaymentDate?: string;
  profileCompletionPercentage?: number;
  incompleteProfileItems?: string[];
  
  loans?: Array<{
    id: string;
    type: string;
    amount: number;
    interestRate: number;
    term: number;
    monthlyPayment: number;
    status: 'active' | 'pending' | 'completed' | 'rejected' | 'approved';
    dateIssued?: string;
    dateApplied?: string;
    paidAmount?: number;
    remainingPayments?: number;
    paidMonths?: number;
    totalRepayment?: number;
  }>;
  
  documents?: Array<{
    name: string;
    type: string;
    dateUploaded: string;
    verificationStatus: 'verified' | 'pending' | 'rejected';
    expiryDate?: string;
  }>;
  
  notifications?: Array<{
    title: string;
    message: string;
    date: string;
    type: string; // Changed from union type to allow any string
    read: boolean;
    action?: string;
  }>;
  
  recentActivity?: Array<{
    title: string;
    description: string;
    date: string;
    amount?: number;
    type: 'payment' | 'application' | 'document' | 'login' | 'other';
  }>;
  
  // Additional properties needed to fix linter errors
  registrationDate?: string;
  verificationStatus?: string;
}

const UserProfileDashboard: React.FC = () => {
  // Call the hook to protect this route
  const isAuthenticated = useRequireAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  // Get all required functions and data from AppDataContext
  const { 
    currentUser, 
    getDocumentsByUserId, 
    getApplicationsByUserId, 
    updateUser 
  } = useAppData();
  
  // Function to handle tab changes and scroll to top
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    scrollToTop(true); // Use smooth scrolling for tab changes
  };

  useEffect(() => {
    // Scroll to top when component mounts
    scrollToTop();
  }, []);

  // Fix the userData state initialization by removing accountStatus and adding proper types
  const [userData, setUserData] = useState<FormData>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    employmentStatus: '',
    employmentType: '',
    employmentSector: '',
    employerName: '',
    jobTitle: '',
    yearsEmployed: 0,
    monthlyIncome: 0,
    bankName: '',
    accountType: '',
    accountNumber: '',
    creditScore: 0,
    registrationDate: '',
    profileCompletionPercentage: 0,
    verificationStatus: ''
  });

  // Fix formData initialization by adding required fields
  const [formData, setFormData] = useState<FormData>({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    address: userData.address,
    suburb: userData.suburb,
    city: userData.city,
    state: userData.state,
    zipCode: userData.zipCode,
    idNumber: '', // Add required field
    monthlyIncome: 0 // Add required field
  });

  useEffect(() => {
    // If currentUser exists, populate userData state
    if (currentUser) {
      const userDocuments = getDocumentsByUserId(currentUser.id);
      const profileCompletionPercentage = calculateProfileCompletion(currentUser);
      const incompleteProfileItems = getIncompleteProfileItems(currentUser);
      
      // Use type assertion to handle the notifications type incompatibility
      setUserData({
        ...currentUser,
        documents: userDocuments,
        profileCompletionPercentage: profileCompletionPercentage,
        incompleteProfileItems: incompleteProfileItems,
      } as FormData);
      
      setFormData({
        ...currentUser,
      } as FormData);
    }
  }, [currentUser, getDocumentsByUserId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save this data to a backend
    // For now, we'll just toggle editing mode off
    setIsEditing(false);
    // You could also update the userData here to reflect the changes
    toast.success("Personal information updated successfully!");
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      suburb: userData.suburb,
      city: userData.city,
      state: userData.state,
      zipCode: userData.zipCode,
      idNumber: userData.idNumber, // Add required field
      monthlyIncome: userData.monthlyIncome // Add required field
    });
    setIsEditing(false);
  };

  // Function to format notification icon and color based on type
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'info':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'promo':
        return <CircleDollarSign className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  // Format currency
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('ZAR', 'R');
  };
  
  // If not authenticated, the useRequireAuth hook will redirect to login
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      
      <div className="container-custom mt-10 flex justify-end">
        <ThemeToggle variant="outline" />
      </div>
      
      <main className="flex-grow pt-24">
        <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Fixed width */}
          <aside className="lg:col-span-1">
              <div className="glass-card p-6 sidebar-container">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                </div>
                <h2 className="text-xl font-semibold">{userData.firstName} {userData.lastName}</h2>
                  <p className="text-sm text-foreground/70">Account #{userData.id}</p>
              </div>
              
              <Separator className="my-4" />
              
              <nav>
                <ul className="space-y-2">
                  <li>
                    <button
                        onClick={() => handleTabChange('overview')}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        activeTab === 'overview' ? 'bg-primary text-white' : 'hover:bg-secondary'
                      }`}
                    >
                      <Home className={`h-5 w-5 mr-3 ${activeTab === 'overview' ? 'text-white' : 'text-primary'}`} />
                        <span className="flex-grow text-left">Overview</span>
                    </button>
                  </li>
                  <li>
                    <button
                        onClick={() => handleTabChange('personal')}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                          activeTab === 'personal' ? 'bg-primary text-white' : 'hover:bg-secondary'
                        }`}
                      >
                        <User className={`h-5 w-5 mr-3 ${activeTab === 'personal' ? 'text-white' : 'text-primary'}`} />
                        <span className="flex-grow text-left">Personal Info</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleTabChange('employment')}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                          activeTab === 'employment' ? 'bg-primary text-white' : 'hover:bg-secondary'
                        }`}
                      >
                        <Briefcase className={`h-5 w-5 mr-3 ${activeTab === 'employment' ? 'text-white' : 'text-primary'}`} />
                        <span className="flex-grow text-left">Employment</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleTabChange('financial')}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                          activeTab === 'financial' ? 'bg-primary text-white' : 'hover:bg-secondary'
                        }`}
                      >
                        <Wallet className={`h-5 w-5 mr-3 ${activeTab === 'financial' ? 'text-white' : 'text-primary'}`} />
                        <span className="flex-grow text-left">Financial Info</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleTabChange('loans')}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        activeTab === 'loans' ? 'bg-primary text-white' : 'hover:bg-secondary'
                      }`}
                    >
                      <CreditCard className={`h-5 w-5 mr-3 ${activeTab === 'loans' ? 'text-white' : 'text-primary'}`} />
                        <span className="flex-grow text-left">My Loans</span>
                    </button>
                  </li>
                  <li>
                    <button
                        onClick={() => handleTabChange('contracts')}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        activeTab === 'contracts' ? 'bg-primary text-white' : 'hover:bg-secondary'
                      }`}
                    >
                      <FileCheck className={`h-5 w-5 mr-3 ${activeTab === 'contracts' ? 'text-white' : 'text-primary'}`} />
                      <span className="flex-grow text-left">Contracts</span>
                    </button>
                  </li>
                  <li>
                    <button
                        onClick={() => handleTabChange('documents')}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        activeTab === 'documents' ? 'bg-primary text-white' : 'hover:bg-secondary'
                      }`}
                    >
                      <FileText className={`h-5 w-5 mr-3 ${activeTab === 'documents' ? 'text-white' : 'text-primary'}`} />
                        <span className="flex-grow text-left">Documents</span>
                    </button>
                  </li>
                  <li>
                    <button
                        onClick={() => handleTabChange('notifications')}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        activeTab === 'notifications' ? 'bg-primary text-white' : 'hover:bg-secondary'
                      }`}
                    >
                      <Bell className={`h-5 w-5 mr-3 ${activeTab === 'notifications' ? 'text-white' : 'text-primary'}`} />
                        <span className="flex-grow text-left">Notifications</span>
                      <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                          {(userData.notifications || []).filter(n => !n.read).length}
                      </span>
                    </button>
                  </li>
                  <li>
                    <button
                        onClick={() => handleTabChange('settings')}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        activeTab === 'settings' ? 'bg-primary text-white' : 'hover:bg-secondary'
                      }`}
                    >
                      <Settings className={`h-5 w-5 mr-3 ${activeTab === 'settings' ? 'text-white' : 'text-primary'}`} />
                        <span className="flex-grow text-left">Settings</span>
                    </button>
                  </li>
                </ul>
              </nav>
              
              <Separator className="my-4" />
              
              <button className="w-full flex items-center p-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                <LogOut className="h-5 w-5 mr-3" />
                  <span className="flex-grow text-left">Logout</span>
              </button>
            </div>
          </aside>
          
            {/* Main Content - Keep consistent width */}
            <div className="main-content lg:col-span-3 w-full">
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in tab-content">
                  {/* Welcome Card */}
                <div className="glass-card p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Welcome back, {userData.firstName}!</h2>
                        <p className="text-foreground/70">
                          Here's an overview of your account with JB Capital.
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CircleCheck className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log("Current User:", currentUser);
                            toast.success("User data logged to console");
                          }}
                        >
                          Debug User Data
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground/70">Active Loans</h3>
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold">
                            {(userData.loans || []).filter(loan => loan.status === 'active').length || 0}
                          </p>
                          <p className="text-sm text-foreground/70">Total value: {
                            formatAmount(
                              (userData.loans || []).filter(loan => loan.status === 'active')
                                .reduce((sum, loan) => sum + loan.amount, 0) || 0
                            )
                          }</p>
                        </div>
                        {(userData.loans || []).filter(loan => loan.status === 'active').length > 0 && (
                          <Button variant="link" className="text-xs p-0 h-auto">View Details</Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground/70">Next Payment</h3>
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-end justify-between">
                        {(userData.loans || []).filter(loan => loan.status === 'active').length > 0 ? (
                          <div>
                            <p className="text-3xl font-bold">{formatAmount(userData.nextPaymentAmount || 0)}</p>
                            <p className="text-sm text-foreground/70">Due on {userData.nextPaymentDate || 'N/A'}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-3xl font-bold">-</p>
                            <p className="text-sm text-foreground/70">No active loans</p>
                          </div>
                        )}
                        {userData.nextPaymentAmount && (
                          <Button variant="outline" size="sm">Pay Now</Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground/70">Credit Score</h3>
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold mb-1">{userData.creditScore || 'N/A'}</p>
                        <div className="flex items-center">
                          <div className="h-2 flex-1 bg-secondary/50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                userData.creditScore > 700 ? 'bg-green-500' : 
                                userData.creditScore > 650 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(userData.creditScore / 850) * 100}%` }}
                            />
                          </div>
                          <span className="ml-2 text-xs">
                            {userData.creditScore > 700 ? 'Excellent' : 
                             userData.creditScore > 650 ? 'Good' : 'Fair'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground/70">Available Credit</h3>
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold">{formatAmount(userData.availableCredit || 0)}</p>
                          <p className="text-sm text-foreground/70">{userData.availableCredit > 0 ? 'Pre-approved' : 'Apply now'}</p>
                        </div>
                        {userData.availableCredit > 0 && (
                          <Button size="sm">Apply</Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Activity & Notifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Recent Activity */}
                    <Card>
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                      </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to="#" onClick={() => handleTabChange('overview')} title="View all activities">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </CardHeader>
                      <CardContent>
                  <div className="space-y-4">
                          {currentUser?.recentActivity && currentUser.recentActivity.length > 0 ? (
                            <div className="space-y-4">
                              {(currentUser.recentActivity || []).slice(0, 5).map((activity, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className={`rounded-full p-2 ${
                                    activity.type === 'payment' ? 'bg-green-100 text-green-700' :
                                    activity.type === 'application' ? 'bg-blue-100 text-blue-700' :
                                    activity.type === 'document' ? 'bg-amber-100 text-amber-700' :
                                    activity.type === 'login' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {activity.type === 'payment' && <Wallet className="h-4 w-4" />}
                                    {activity.type === 'application' && <FileText className="h-4 w-4" />}
                                    {activity.type === 'document' && <FileCheck className="h-4 w-4" />}
                                    {activity.type === 'login' && <LogIn className="h-4 w-4" />}
                                    {activity.type === 'other' && <Activity className="h-4 w-4" />}
                      </div>
                              <div className="flex-1">
                                    <p className="font-medium text-sm">{activity.title}</p>
                                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(activity.date).toLocaleDateString()} • {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                  </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                            <div className="py-8 text-center">
                              <Activity className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-2" />
                          <p className="text-foreground/70">No recent activity</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Your recent actions will appear here
                              </p>
                        </div>
                      )}
                </div>
                      </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card>
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-medium">Notifications</CardTitle>
                            </div>
                        <Button variant="ghost" size="icon" onClick={() => handleTabChange('notifications')} title="View all notifications">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {currentUser?.notifications && currentUser.notifications.length > 0 ? (
                            <div className="space-y-4">
                              {(currentUser.notifications || []).slice(0, 5).map((notification, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className={`rounded-full p-2 ${
                                    notification.type === 'success' ? 'bg-green-100 text-green-700' :
                                    notification.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                                    notification.type === 'danger' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
                                    {notification.type === 'warning' && <AlertCircle className="h-4 w-4" />}
                                    {notification.type === 'danger' && <XCircle className="h-4 w-4" />}
                                    {notification.type !== 'success' && notification.type !== 'warning' && notification.type !== 'danger' && <Bell className="h-4 w-4" />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{notification.title}</p>
                                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(notification.date).toLocaleDateString()} • {new Date(notification.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                            <div className="py-8 text-center">
                              <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-2" />
                          <p className="text-foreground/70">No new notifications</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                You'll be notified about important updates
                              </p>
                        </div>
                      )}
                    </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Documents & Account Completion */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 md:col-span-2">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium">Required Documents</h3>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleTabChange('documents')}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg border ${
                          userData.documents?.some(d => d.type === 'id' && d.verificationStatus === 'verified')
                            ? 'border-green-500 bg-green-50/10'
                            : userData.documents?.some(d => d.type === 'id' && d.verificationStatus === 'pending')
                              ? 'border-amber-500 bg-amber-50/10'
                            : 'border-dashed border-foreground/20'
                        }`}>
                          <div className="flex items-center">
                            <div className="mr-3">
                              {userData.documents?.some(d => d.type === 'id' && d.verificationStatus === 'verified')
                                ? <CheckCircle className="h-5 w-5 text-green-500" />
                                : userData.documents?.some(d => d.type === 'id' && d.verificationStatus === 'pending')
                                  ? <Clock className="h-5 w-5 text-amber-500" />
                                : <Circle className="h-5 w-5 text-foreground/30" />
                              }
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">ID Document</p>
                              <p className="text-xs text-foreground/70 mt-1">
                                {userData.documents?.some(d => d.type === 'id' && d.verificationStatus === 'verified')
                                  ? 'Verified'
                                  : userData.documents?.some(d => d.type === 'id' && d.verificationStatus === 'pending')
                                    ? 'Pending verification'
                                    : 'Required for verification'
                                }
                              </p>
                            </div>
                            {userData.documents?.some(d => d.type === 'id') && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 ml-2"
                                onClick={() => handleTabChange('documents')}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className={`p-4 rounded-lg border ${
                          userData.documents?.some(d => d.type === 'proof_of_residence' && d.verificationStatus === 'verified')
                            ? 'border-green-500 bg-green-50/10'
                            : userData.documents?.some(d => d.type === 'proof_of_residence' && d.verificationStatus === 'pending')
                              ? 'border-amber-500 bg-amber-50/10'
                            : 'border-dashed border-foreground/20'
                        }`}>
                          <div className="flex items-center">
                            <div className="mr-3">
                              {userData.documents?.some(d => d.type === 'proof_of_residence' && d.verificationStatus === 'verified')
                                ? <CheckCircle className="h-5 w-5 text-green-500" />
                                : userData.documents?.some(d => d.type === 'proof_of_residence' && d.verificationStatus === 'pending')
                                  ? <Clock className="h-5 w-5 text-amber-500" />
                                : <Circle className="h-5 w-5 text-foreground/30" />
                              }
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Proof of Residence</p>
                              <p className="text-xs text-foreground/70 mt-1">
                                {userData.documents?.some(d => d.type === 'proof_of_residence' && d.verificationStatus === 'verified')
                                  ? 'Verified'
                                  : userData.documents?.some(d => d.type === 'proof_of_residence' && d.verificationStatus === 'pending')
                                    ? 'Pending verification'
                                    : 'Required for verification'
                                }
                              </p>
                            </div>
                            {userData.documents?.some(d => d.type === 'proof_of_residence') && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 ml-2"
                                onClick={() => handleTabChange('documents')}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className={`p-4 rounded-lg border ${
                          userData.documents?.some(d => d.type === 'bank_statement' && d.verificationStatus === 'verified')
                            ? 'border-green-500 bg-green-50/10'
                            : userData.documents?.some(d => d.type === 'bank_statement' && d.verificationStatus === 'pending')
                              ? 'border-amber-500 bg-amber-50/10'
                            : 'border-dashed border-foreground/20'
                        }`}>
                          <div className="flex items-center">
                            <div className="mr-3">
                              {userData.documents?.some(d => d.type === 'bank_statement' && d.verificationStatus === 'verified')
                                ? <CheckCircle className="h-5 w-5 text-green-500" />
                                : userData.documents?.some(d => d.type === 'bank_statement' && d.verificationStatus === 'pending')
                                  ? <Clock className="h-5 w-5 text-amber-500" />
                                : <Circle className="h-5 w-5 text-foreground/30" />
                              }
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Bank Statements</p>
                              <p className="text-xs text-foreground/70 mt-1">
                                {userData.documents?.some(d => d.type === 'bank_statement' && d.verificationStatus === 'verified')
                                  ? 'Verified'
                                  : userData.documents?.some(d => d.type === 'bank_statement' && d.verificationStatus === 'pending')
                                    ? 'Pending verification'
                                    : 'Last 3 months required'
                                }
                              </p>
                            </div>
                            {userData.documents?.some(d => d.type === 'bank_statement') && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 ml-2"
                                onClick={() => handleTabChange('documents')}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className={`p-4 rounded-lg border ${
                          userData.documents?.some(d => d.type === 'payslip' && d.verificationStatus === 'verified')
                            ? 'border-green-500 bg-green-50/10'
                            : userData.documents?.some(d => d.type === 'payslip' && d.verificationStatus === 'pending')
                              ? 'border-amber-500 bg-amber-50/10'
                            : 'border-dashed border-foreground/20'
                        }`}>
                          <div className="flex items-center">
                            <div className="mr-3">
                              {userData.documents?.some(d => d.type === 'payslip' && d.verificationStatus === 'verified')
                                ? <CheckCircle className="h-5 w-5 text-green-500" />
                                : userData.documents?.some(d => d.type === 'payslip' && d.verificationStatus === 'pending')
                                  ? <Clock className="h-5 w-5 text-amber-500" />
                                : <Circle className="h-5 w-5 text-foreground/30" />
                              }
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Latest Payslip</p>
                              <p className="text-xs text-foreground/70 mt-1">
                                {userData.documents?.some(d => d.type === 'payslip' && d.verificationStatus === 'verified')
                                  ? 'Verified'
                                  : userData.documents?.some(d => d.type === 'payslip' && d.verificationStatus === 'pending')
                                    ? 'Pending verification'
                                    : 'Required for income verification'
                                }
                              </p>
                            </div>
                            {userData.documents?.some(d => d.type === 'payslip') && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 ml-2"
                                onClick={() => handleTabChange('documents')}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleTabChange('documents')}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Documents
                        </Button>
                      </div>
                </div>

                <div className="glass-card p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium">Profile Completion</h3>
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Complete your profile</span>
                          <span className="text-sm font-medium">{userData.profileCompletionPercentage}%</span>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${userData.profileCompletionPercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {userData.incompleteProfileItems?.length > 0 ? (
                          userData.incompleteProfileItems.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <Circle className="h-4 w-4 text-foreground/30 mr-3" />
                            <span className="text-sm">{item}</span>
                          </div>
                          ))
                        ) : (
                          <div className="text-center py-2">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <p className="font-medium">Profile Complete!</p>
                            <p className="text-sm text-foreground/70">
                              All information has been provided
                            </p>
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              </div>
            )}
            
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-8 animate-fade-in tab-content">
                <div className="glass-card p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Personal Information</h2>
                      {!isEditing && (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="btn-secondary flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                      )}
                  </div>
                  
                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                            <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className="w-full"
                            />
                      </div>
                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className="w-full"
                            />
                      </div>
                          <div>
                            <label htmlFor="idNumber" className="block text-sm font-medium mb-1">ID Number</label>
                            <Input
                              id="idNumber"
                              name="idNumber"
                              value={userData.idNumber}
                              disabled
                              className="w-full bg-secondary/30"
                            />
                            <p className="text-xs text-foreground/70 mt-1">ID number cannot be changed</p>
                    </div>
                      <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full"
                            />
                      </div>
                      <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full"
                            />
                          </div>
                      </div>
                      
                      <div>
                          <h3 className="text-lg font-medium mb-3">Residential Address</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <label htmlFor="address" className="block text-sm font-medium mb-1">Street Address</label>
                              <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full"
                              />
                      </div>
                      <div>
                              <label htmlFor="suburb" className="block text-sm font-medium mb-1">Suburb</label>
                              <Input
                                id="suburb"
                                name="suburb"
                                value={formData.suburb}
                                onChange={handleInputChange}
                                className="w-full"
                              />
                      </div>
                            <div>
                              <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
                              <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full"
                              />
                    </div>
                            <div>
                              <label htmlFor="state" className="block text-sm font-medium mb-1">Province</label>
                              <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="w-full"
                              />
                      </div>
                            <div>
                              <label htmlFor="zipCode" className="block text-sm font-medium mb-1">Postal Code</label>
                              <Input
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                className="w-full"
                              />
                            </div>
                          </div>
                    </div>
                    
                        <div className="flex space-x-4 pt-4">
                          <button type="submit" className="btn-primary flex items-center">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                      </button>
                          <button 
                            type="button" 
                            onClick={handleCancel}
                            className="btn-secondary flex items-center"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                      </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="glass-card-inner p-4">
                            <div className="flex items-center mb-3">
                              <User className="h-5 w-5 text-primary mr-3" />
                              <h3 className="text-lg font-medium">Basic Information</h3>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-foreground/70">Full Name</p>
                                <p className="font-medium">{userData.firstName} {userData.lastName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-foreground/70">ID Number</p>
                                <p className="font-medium">{userData.idNumber}</p>
                              </div>
                              {userData.gender && (
                                <div>
                                  <p className="text-sm text-foreground/70">Gender</p>
                                  <p className="font-medium">{userData.gender === 'male' ? 'Male' : 'Female'}</p>
                                </div>
                              )}
                              {userData.dateOfBirth && (
                                <div>
                                  <p className="text-sm text-foreground/70">Age</p>
                                  <p className="font-medium">{calculateAge(userData.dateOfBirth)} years</p>
                                </div>
                              )}
                              {userData.dateOfBirth && (
                                <div>
                                  <p className="text-sm text-foreground/70">Date of Birth</p>
                                  <p className="font-medium">{userData.dateOfBirth}</p>
                                </div>
                              )}
                    </div>
                  </div>
                  
                          <div className="glass-card-inner p-4">
                            <div className="flex items-center mb-3">
                              <Mail className="h-5 w-5 text-primary mr-3" />
                              <h3 className="text-lg font-medium">Contact Information</h3>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-foreground/70">Email Address</p>
                                <p className="font-medium">{userData.email}</p>
                              </div>
                              <div>
                                <p className="text-sm text-foreground/70">Phone Number</p>
                                <p className="font-medium">{userData.phone}</p>
                              </div>
                            </div>
                          </div>
                    </div>
                    
                        <div className="glass-card-inner p-4">
                          <div className="flex items-center mb-3">
                            <Home className="h-5 w-5 text-primary mr-3" />
                            <h3 className="text-lg font-medium">Residential Address</h3>
                  </div>
                          <div className="space-y-1">
                            <p className="font-medium">{userData.address}</p>
                            <p className="font-medium">{userData.suburb}</p>
                            <p className="font-medium">{userData.city}, {userData.state}</p>
                            <p className="font-medium">{userData.zipCode}</p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
            
              {/* Employment Information Tab */}
              {activeTab === 'employment' && (
                <div className="space-y-8 animate-fade-in tab-content">
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold mb-6">Employment Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass-card-inner p-4">
                        <div className="flex items-center mb-3">
                          <Briefcase className="h-5 w-5 text-primary mr-3" />
                          <h3 className="text-lg font-medium">Employment Details</h3>
                        </div>
                  <div className="space-y-4">
                                <div>
                            <p className="text-sm text-foreground/70">Employment Status</p>
                            <p className="font-medium capitalize">{userData.employmentStatus}</p>
                                </div>
                          <div>
                            <p className="text-sm text-foreground/70">Employment Type</p>
                            <p className="font-medium capitalize">{userData.employmentType?.replace(/-/g, ' ')}</p>
                              </div>
                          <div>
                            <p className="text-sm text-foreground/70">Industry / Sector</p>
                            <p className="font-medium">{userData.employmentSector}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70">Years Employed</p>
                            <p className="font-medium">{userData.yearsEmployed} {userData.yearsEmployed === 1 ? 'year' : 'years'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="glass-card-inner p-4">
                        <div className="flex items-center mb-3">
                          <Building className="h-5 w-5 text-primary mr-3" />
                          <h3 className="text-lg font-medium">Employer Information</h3>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-foreground/70">Employer Name</p>
                            <p className="font-medium">{userData.employerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70">Job Title</p>
                            <p className="font-medium">{userData.jobTitle}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70">Monthly Income</p>
                            <p className="font-medium">{formatAmount(userData.monthlyIncome)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70">Payment Date</p>
                            <p className="font-medium">{userData.paymentDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button className="btn-secondary flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Update Employment Information
                              </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Financial Information Tab */}
              {activeTab === 'financial' && (
                <div className="space-y-8 animate-fade-in tab-content">
                  <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold mb-6">Financial Information</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="glass-card-inner p-4 col-span-1">
                        <div className="flex items-center mb-3">
                          <CircleDollarSign className="h-5 w-5 text-primary mr-3" />
                          <h3 className="text-lg font-medium">Credit Information</h3>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-foreground/70">Credit Score</p>
                            <div className="flex items-center mt-1">
                              <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    userData.creditScore > 700 ? 'bg-green-500' : 
                                    userData.creditScore > 650 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${(userData.creditScore / 850) * 100}%` }}
                                />
                              </div>
                              <span className="ml-3 font-medium">{userData.creditScore}</span>
                            </div>
                            <p className="text-xs text-foreground/70 mt-1">
                              {userData.creditScore > 700 ? 'Excellent' : 
                              userData.creditScore > 650 ? 'Good' : 'Fair'} credit score
                            </p>
                    </div>
                          <div>
                            <p className="text-sm text-foreground/70">Existing Loans</p>
                            <p className="font-medium">{userData.existingLoans ? 'Yes' : 'No'}</p>
                            {userData.existingLoans && (
                              <p className="text-sm">{formatAmount(userData.existingLoanAmount)}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70">Monthly Debt</p>
                            <p className="font-medium">{formatAmount(userData.monthlyDebt)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="glass-card-inner p-4 col-span-1 lg:col-span-2">
                        <div className="flex items-center mb-3">
                          <Wallet className="h-5 w-5 text-primary mr-3" />
                          <h3 className="text-lg font-medium">Monthly Expenses</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-foreground/70">Rent/Mortgage</p>
                            <p className="font-medium">{formatAmount(userData.rentMortgage || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70">Car Payment</p>
                            <p className="font-medium">{formatAmount(userData.carPayment || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70">Groceries</p>
                            <p className="font-medium">{formatAmount(userData.groceries || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70">Utilities</p>
                            <p className="font-medium">{formatAmount(userData.utilities || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70">Insurance</p>
                            <p className="font-medium">{formatAmount(userData.insurance || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70">Other Expenses</p>
                            <p className="font-medium">{formatAmount(userData.otherExpenses || 0)}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex justify-between">
                            <p className="font-medium">Total Monthly Expenses</p>
                            <p className="font-medium">{formatAmount(userData.totalMonthlyExpenses || 0)}</p>
                          </div>
                          <div className="flex justify-between mt-2">
                            <p className="font-medium">Monthly Income</p>
                            <p className="font-medium">{formatAmount(userData.monthlyIncome)}</p>
                          </div>
                          <div className="flex justify-between mt-2 text-primary">
                            <p className="font-medium">Disposable Income</p>
                            <p className="font-medium">{formatAmount(userData.monthlyIncome - (userData.totalMonthlyExpenses || 0))}</p>
                          </div>
                        </div>
                      </div>

                      <div className="glass-card-inner p-4 col-span-1 lg:col-span-3">
                        <div className="flex items-center mb-3">
                          <Building className="h-5 w-5 text-primary mr-3" />
                          <h3 className="text-lg font-medium">Banking Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-foreground/70">Bank Name</p>
                            <p className="font-medium">{userData.bankName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70">Account Type</p>
                            <p className="font-medium capitalize">{userData.accountType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70">Banking Period</p>
                            <p className="font-medium">{userData.bankingPeriod} {userData.bankingPeriod === 1 ? 'year' : 'years'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button className="btn-secondary flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Update Financial Information
                      </button>
                  </div>
                </div>
              </div>
            )}
            
              {/* My Loans Tab */}
              {activeTab === 'loans' && (
                <div className="space-y-8 animate-fade-in tab-content">
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold mb-6">My Loans & Applications</h2>
                    
                    {/* Get applications from context */}
                    {(() => {
                      // Use the function defined above instead of relying on context
                      const userApplications = getApplicationsByUserId(currentUser?.id || '');
                      const hasLoans = userData.loans && userData.loans.length > 0;
                      const hasApplications = userApplications && userApplications.length > 0;
                      
                      if (!hasLoans && !hasApplications) {
                        return (
                          <div className="glass-card-inner p-8 text-center">
                            <div className="flex flex-col items-center">
                              <FileQuestion className="h-16 w-16 text-foreground/30 mb-4" />
                              <h3 className="text-xl font-medium mb-2">No Loans or Applications Found</h3>
                              <p className="text-foreground/70 mb-6 max-w-md mx-auto">
                                You don't have any loans or pending applications with us yet. Start your application today and get funds in your account within 24 hours!
                              </p>
                              <Button asChild>
                                <Link to="/application">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Apply for a Loan
                                </Link>
                              </Button>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <>
                          {/* Pending Applications Section */}
                          {hasApplications && (
                            <>
                              <h3 className="text-lg font-medium mb-4">Pending Applications</h3>
                              <div className="grid grid-cols-1 gap-6 mb-8">
                                {userApplications.map((application, index) => {
                                  // Calculate border color based on status
                                  const statusColors = {
                                    pending: "border-yellow-500",
                                    document_verification: "border-blue-500", // changed from in_review
                                    approved: "border-green-500",
                                    rejected: "border-red-500"
                                  };
                                  
                                  // Calculate background color for the card
                                  const statusBgColors = {
                                    pending: "bg-yellow-50/10",
                                    document_verification: "bg-blue-50/10", // changed from in_review
                                    approved: "bg-green-50/10",
                                    rejected: "bg-red-50/10"
                                  };
                                  
                                  // Calculate the icon based on status
                                  const StatusIcon = () => {
                                    switch(application.status) {
                                      case "pending":
                                        return <Clock className="h-10 w-10 text-yellow-500" />;
                                      case "document_verification": // changed from in_review
                                        return <FileText className="h-10 w-10 text-blue-500" />;
                                      case "approved":
                                        return <CheckCircle className="h-10 w-10 text-green-500" />;
                                      case "rejected":
                                        return <XCircle className="h-10 w-10 text-red-500" />;
                                      default:
                                        return <Clock className="h-10 w-10 text-yellow-500" />;
                                    }
                                  };
                                  
                                  // Calculate progress based on status
                                  const getProgressPercentage = () => {
                                    switch(application.status) {
                                      case "pending": return application.completion || 25;
                                      case "document_verification": return application.completion || 50; // changed from in_review
                                      case "approved": return 100;
                                      case "rejected": return 100;
                                      default: return application.completion || 25;
                                    }
                                  };
                                  
                                  // Get progress color
                                  const getProgressColor = () => {
                                    switch(application.status) {
                                      case "pending": return "bg-yellow-500";
                                      case "document_verification": return "bg-blue-500"; // changed from in_review
                                      case "approved": return "bg-green-500";
                                      case "rejected": return "bg-red-500";
                                      default: return "bg-yellow-500";
                                    }
                                  };
                                  
                                  // Format application status for display
                                  const formatStatus = (status) => {
                                    switch(status) {
                                      case "pending": return "Pending Review";
                                      case "document_verification": return "Document Verification"; // changed from in_review
                                      case "approved": return "Approved";
                                      case "rejected": return "Rejected";
                                      default: return status.replace("_", " ");
                                    }
                                  };
                                  
                                  return (
                                    <div key={`app-${index}`} className={`glass-card-inner p-4 border-l-4 ${statusColors[application.status] || 'border-yellow-500'} ${statusBgColors[application.status] || ''}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                      <div className="md:col-span-1">
                                        <div className="flex items-center h-full">
                                          <div className="mr-4">
                                              <StatusIcon />
                                          </div>
                                          <div>
                                            <h3 className="text-lg font-medium">App #{application.id.substring(application.id.length - 6)}</h3>
                                            <p className="text-sm text-foreground/70">
                                              {application.loanDetails?.purpose || 'Loan Application'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="md:col-span-2">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-sm text-foreground/70">Amount</p>
                                            <p className="font-medium">{application.amount}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-foreground/70">Application Date</p>
                                            <p className="font-medium">{application.date}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-foreground/70">Term</p>
                                            <p className="font-medium">{application.loanDetails?.term || '--'} months</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-foreground/70">Monthly Payment</p>
                                            <p className="font-medium">{application.loanDetails?.monthlyPayment || '--'}</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="md:col-span-1">
                                        <div className="h-full flex flex-col justify-between">
                                          <div>
                                            <p className="text-sm text-foreground/70">Status</p>
                                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                  application.status === 'document_verification' ? 'bg-blue-100 text-blue-800' : // changed from in_review
                                                  application.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                                  application.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                                  'bg-gray-100 text-gray-800'}`}
                                              >
                                                {formatStatus(application.status)}
                                            </span>
                                          </div>
                                          
                                            <div className="mt-2">
                                              <div className="flex items-center justify-between text-xs mb-1">
                                                <span>Processing</span>
                                                <span>{getProgressPercentage()}%</span>
                                              </div>
                                              <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                                                <div 
                                                  className={`h-full ${getProgressColor()}`}
                                                  style={{ width: `${getProgressPercentage()}%` }}
                                                />
                                              </div>
                                            </div>
                                          
                                          <div className="mt-4 flex flex-col gap-2">
                                            <Button 
                                              variant="outline" 
                                              className="w-full text-xs"
                                              onClick={() => alert(`View application details for ${application.id}`)}
                                            >
                                              <Eye className="h-3 w-3 mr-1" />
                                              Track Application
                                            </Button>
                                            <Button 
                                              variant="secondary" 
                                              className="w-full text-xs"
                                              onClick={() => alert(`Chat about application ${application.id}`)}
                                            >
                                              Contact Support
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {application.requiredAction && (
                                        <div className={`mt-4 pt-4 border-t border-border p-3 rounded-md 
                                          ${application.status === 'pending' ? 'bg-yellow-50/10' :
                                            application.status === 'document_verification' ? 'bg-blue-50/10' : // changed from in_review
                                            application.status === 'approved' ? 'bg-green-50/10' :
                                            application.status === 'rejected' ? 'bg-red-50/10' :
                                            'bg-yellow-50/10'}`}>
                                          <p className={`text-sm font-semibold flex items-center
                                            ${application.status === 'pending' ? 'text-yellow-700' :
                                              application.status === 'document_verification' ? 'text-blue-700' : // changed from in_review
                                              application.status === 'approved' ? 'text-green-700' :
                                              application.status === 'rejected' ? 'text-red-700' :
                                              'text-yellow-700'}`}>
                                          <AlertCircle className="h-4 w-4 mr-2" />
                                          Required Action:
                                        </p>
                                        <p className="text-sm text-foreground/70">{application.requiredAction}</p>
                                      </div>
                                    )}
                                    
                                    {/* Detailed Application Info - Collapsible */}
                                    <div className="mt-4 pt-4 border-t border-border">
                                      <details className="group">
                                        <summary className="flex items-center cursor-pointer list-none">
                                          <div className="font-medium text-sm flex items-center">
                                            <ArrowRight className="h-4 w-4 mr-2 transition-transform group-open:rotate-90" />
                                            Application Details
                                          </div>
                                        </summary>
                                        <div className="mt-3 pl-6">
                                          <div className="space-y-4">
                                            {/* Application Progress Timeline */}
                                            <div>
                                              <h4 className="text-sm font-medium mb-2">Application Progress</h4>
                                              <div className="relative pl-6 border-l border-dashed border-primary/40">
                                                <div className="space-y-6">
                                                    {/* Application Submitted - Always completed */}
                                                  <div className="relative">
                                                    <div className="absolute -left-[27px] h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                      <div className="h-2 w-2 rounded-full bg-white"></div>
                                                    </div>
                                                    <div>
                                                      <p className="text-sm font-medium">Application Submitted</p>
                                                      <p className="text-xs text-foreground/70">{application.date}</p>
                                                    </div>
                                                  </div>
                                                  
                                                    {/* Document Verification */}
                                                  <div className="relative">
                                                      <div className={`absolute -left-[27px] h-5 w-5 rounded-full
                                                        ${application.status === 'pending' ? 'bg-yellow-500' : 
                                                          (application.status === 'document_verification' || application.status === 'approved' || application.status === 'rejected') ? 'bg-green-500' : 
                                                          'bg-primary/20'} 
                                                        flex items-center justify-center`}>
                                                        <div className="h-2 w-2 rounded-full bg-white"></div>
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-medium 
                                                          ${application.status === 'pending' ? 'text-yellow-500' : 
                                                            (application.status === 'document_verification' || application.status === 'approved' || application.status === 'rejected') ? '' : 
                                                            'text-foreground/70'}`}>
                                                          Document Verification
                                                        </p>
                                                        <p className="text-xs text-foreground/70">
                                                          {application.status === 'pending' ? 'In Progress' : 
                                                            (application.status === 'document_verification' || application.status === 'approved' || application.status === 'rejected') ? 'Completed' : 
                                                            'Pending'}
                                                        </p>
                                                    </div>
                                                  </div>
                                                  
                                                    {/* Credit Assessment */}
                                                  <div className="relative">
                                                      <div className={`absolute -left-[27px] h-5 w-5 rounded-full
                                                        ${application.status === 'document_verification' ? 'bg-blue-500' : 
                                                          (application.status === 'approved' || application.status === 'rejected') ? 'bg-green-500' : 
                                                          'bg-primary/10'} 
                                                        flex items-center justify-center`}>
                                                        <div className="h-2 w-2 rounded-full bg-white"></div>
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-medium 
                                                          ${application.status === 'document_verification' ? 'text-blue-500' : 
                                                            (application.status === 'approved' || application.status === 'rejected') ? '' : 
                                                            'text-foreground/40'}`}>
                                                          Credit Assessment
                                                        </p>
                                                        <p className="text-xs text-foreground/70">
                                                          {application.status === 'document_verification' ? 'In Progress' : 
                                                            (application.status === 'approved' || application.status === 'rejected') ? 'Completed' : 
                                                            'Pending'}
                                                        </p>
                                                    </div>
                                                  </div>
                                                  
                                                    {/* Final Decision */}
                                                  <div className="relative">
                                                      <div className={`absolute -left-[27px] h-5 w-5 rounded-full
                                                        ${application.status === 'approved' ? 'bg-green-500' : 
                                                          application.status === 'rejected' ? 'bg-red-500' : 
                                                          'bg-primary/10'} 
                                                        flex items-center justify-center`}>
                                                        <div className="h-2 w-2 rounded-full bg-white"></div>
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-medium 
                                                          ${application.status === 'approved' ? 'text-green-500' : 
                                                            application.status === 'rejected' ? 'text-red-500' : 
                                                            'text-foreground/40'}`}>
                                                          Final Decision
                                                        </p>
                                                        <p className="text-xs text-foreground/70">
                                                          {application.status === 'approved' ? 'Approved' : 
                                                            application.status === 'rejected' ? 'Rejected' : 
                                                            'Pending'}
                                                        </p>
                                                    </div>
                                                  </div>
                                                  
                                                    {/* Fund Disbursement - Only for approved loans */}
                                                  <div className="relative">
                                                      <div className={`absolute -left-[27px] h-5 w-5 rounded-full
                                                        ${application.status === 'approved' && application.completion === 100 ? 'bg-green-500' : 
                                                          'bg-primary/10'} 
                                                        flex items-center justify-center`}>
                                                        <div className="h-2 w-2 rounded-full bg-white"></div>
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-medium 
                                                          ${application.status === 'approved' && application.completion === 100 ? 'text-green-500' : 
                                                            'text-foreground/40'}`}>
                                                          Fund Disbursement
                                                        </p>
                                                        <p className="text-xs text-foreground/70">
                                                          {application.status === 'approved' && application.completion === 100 ? 'Completed' : 
                                                            application.status === 'approved' ? 'Processing' : 
                                                            'Pending'}
                                                        </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </details>
                                    </div>
                                  </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        
                          {/* Active Loans Section */}
                          {hasLoans && (userData.loans || []).filter(loan => loan.status === 'active').length > 0 && (
                            <>
                              <h3 className="text-lg font-medium mb-4">Active Loans</h3>
                              <div className="grid grid-cols-1 gap-6 mb-8">
                                {(userData.loans || []).filter(loan => loan.status === 'active').map((loan, index) => (
                                  <div key={`active-${index}`} className="glass-card-inner p-4 border-l-4 border-blue-500">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                      <div className="md:col-span-1">
                                        <div className="flex items-center h-full">
                                          <div className="mr-4">
                                            <Activity className="h-10 w-10 text-blue-500" />
                                          </div>
                                          <div>
                                            <h3 className="text-lg font-medium">Loan #{loan.id.substring(loan.id.length - 6)}</h3>
                                            <p className="text-sm capitalize text-foreground/70">{loan.type} Loan</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="md:col-span-2">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-sm text-foreground/70">Loan Amount</p>
                                            <p className="font-medium">{formatAmount(loan.amount)}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-foreground/70">Interest Rate</p>
                                            <p className="font-medium">{loan.interestRate}%</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-foreground/70">Term</p>
                                            <p className="font-medium">{loan.term} {loan.term === 1 ? 'month' : 'months'}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-foreground/70">Monthly Payment</p>
                                            <p className="font-medium">{formatAmount(loan.monthlyPayment)}</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="md:col-span-1">
                                        <div className="h-full flex flex-col justify-between">
                                          <div>
                                            <p className="text-sm text-foreground/70">Status</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                              Active
                                            </span>
                                          </div>
                                          
                                          <div className="mt-4">
                                            <Button 
                                              variant="outline" 
                                              className="w-full"
                                              onClick={() => alert(`View details for loan ${loan.id}`)}
                                            >
                                              <Eye className="h-4 w-4 mr-2" />
                                              View Details
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-border">
                                      <div className="flex items-center">
                                        <div className="flex-1">
                                          <p className="text-sm text-foreground/70 mb-1">Repayment Progress</p>
                                          <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-primary"
                                              style={{ width: `${(loan.paidAmount / loan.amount) * 100}%` }}
                                            />
                                          </div>
                                        </div>
                                        <div className="ml-4">
                                          <p className="font-medium">{Math.round((loan.paidAmount / loan.amount) * 100)}% Complete</p>
                                          <p className="text-sm text-foreground/70">{formatAmount(loan.paidAmount)} of {formatAmount(loan.amount)}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-4 flex justify-end space-x-3">
                                        <Button variant="outline" size="sm">
                                          <FileText className="h-4 w-4 mr-2" />
                                          Statement
                                        </Button>
                                        <Button size="sm">
                                          <CreditCard className="h-4 w-4 mr-2" />
                                          Make Payment
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Detailed Loan Info - Collapsible */}
                                    <div className="mt-4 pt-4 border-t border-border">
                                      <details className="group">
                                        <summary className="flex items-center cursor-pointer list-none">
                                          <div className="font-medium text-sm flex items-center">
                                            <ArrowRight className="h-4 w-4 mr-2 transition-transform group-open:rotate-90" />
                                            Loan Details & Payment Schedule
                                          </div>
                                        </summary>
                                        <div className="mt-3 pl-6">
                                          <div className="space-y-4">
                                            {/* Loan Fee Breakdown */}
                                            <div>
                                              <h4 className="text-sm font-medium mb-2">Loan Fee Breakdown</h4>
                                              <div className="text-sm space-y-2">
                                                <div className="flex justify-between">
                                                  <span className="text-foreground/70">Principal Amount:</span>
                                                  <span className="font-medium">{formatAmount(loan.amount)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-foreground/70">Total Interest:</span>
                                                  <span className="font-medium">{formatAmount(loan.monthlyPayment * loan.term - loan.amount)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-foreground/70">Initiation Fee:</span>
                                                  <span className="font-medium">{formatAmount(loan.amount * 0.015)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-foreground/70">Monthly Service Fee:</span>
                                                  <span className="font-medium">R69 per month</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-foreground/70">Credit Life Insurance:</span>
                                                  <span className="font-medium">{formatAmount(loan.amount * 0.002)} per month</span>
                                                </div>
                                                <div className="pt-2 flex justify-between font-medium text-primary">
                                                  <span>Total Cost of Credit:</span>
                                                  <span>{formatAmount(loan.monthlyPayment * loan.term)}</span>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* Interest Calculation Method */}
                                            <div>
                                              <h4 className="text-sm font-medium mb-2">Interest Calculation</h4>
                                              <p className="text-xs text-foreground/70 mb-2">
                                                This loan uses a reducing balance method with an annual interest rate of {loan.interestRate}%.
                                              </p>
                                              <div className="bg-secondary/20 p-3 rounded-md">
                                                <div className="text-xs space-y-1">
                                                  <div className="flex justify-between">
                                                    <span>Annual Interest Rate:</span>
                                                    <span>{loan.interestRate}%</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span>Monthly Interest Rate:</span>
                                                    <span>{(loan.interestRate / 12).toFixed(2)}%</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span>Payment Formula:</span>
                                                    <span>P × r × (1+r)ⁿ/((1+r)ⁿ-1)</span>
                                                  </div>
                                                  <div className="flex justify-between font-medium">
                                                    <span>Monthly Payment:</span>
                                                    <span>{formatAmount(loan.monthlyPayment)}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* Payment Schedule Table */}
                                            <div>
                                              <h4 className="text-sm font-medium mb-2">Payment Schedule</h4>
                                              <div className="overflow-x-auto">
                                                <table className="w-full text-xs">
                                                  <thead className="bg-secondary/30">
                                                    <tr>
                                                      <th className="py-2 px-3 text-left">Payment</th>
                                                      <th className="py-2 px-3 text-left">Date</th>
                                                      <th className="py-2 px-3 text-right">Payment Amount</th>
                                                      <th className="py-2 px-3 text-right">Principal</th>
                                                      <th className="py-2 px-3 text-right">Interest</th>
                                                      <th className="py-2 px-3 text-right">Balance</th>
                                                      <th className="py-2 px-3 text-center">Status</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {Array.from({ length: Math.min(loan.term, 12) }).map((_, i) => {
                                                      // Calculate principal and interest based on reducing balance
                                                      // For demonstration purposes using simplified calculation
                                                      const rate = loan.interestRate / 100 / 12;
                                                      const paidMonths = loan.paidMonths || Math.floor((loan.paidAmount || 0) / loan.monthlyPayment);
                                                      const monthlyInterest = i < paidMonths
                                                        ? 0 // For paid months, just show 0
                                                        : (loan.amount - (loan.paidAmount || 0)) * rate;
                                                      const principal = loan.monthlyPayment - monthlyInterest;
                                                      const remainingBalance = loan.amount - (loan.paidAmount || 0) - (i >= paidMonths ? principal : 0);
                                                      
                                                      const paymentDate = new Date();
                                                      paymentDate.setMonth(paymentDate.getMonth() - paidMonths + i);
                                                      const dateString = paymentDate.toLocaleDateString('en-ZA', { 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                      });
                                                      
                                                      return (
                                                        <tr key={i} className={`border-b border-border/40 ${i < paidMonths ? 'bg-green-50/10' : ''}`}>
                                                          <td className="py-2 px-3">{i + 1}</td>
                                                          <td className="py-2 px-3">{dateString}</td>
                                                          <td className="py-2 px-3 text-right">{formatAmount(loan.monthlyPayment)}</td>
                                                          <td className="py-2 px-3 text-right">{formatAmount(principal)}</td>
                                                          <td className="py-2 px-3 text-right">{formatAmount(monthlyInterest)}</td>
                                                          <td className="py-2 px-3 text-right">{formatAmount(Math.max(0, remainingBalance))}</td>
                                                          <td className="py-2 px-3 text-center">
                                                            {i < paidMonths ? (
                                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>
                                                            ) : i === paidMonths ? (
                                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Due</span>
                                                            ) : (
                                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Upcoming</span>
                                                            )}
                                                          </td>
                                                        </tr>
                                                      );
                                                    })}
                                                    {loan.term > 12 && (
                                                      <tr>
                                                        <td colSpan={7} className="py-2 px-3 text-center text-foreground/60">
                                                          <Button variant="link" size="sm" className="h-auto text-xs">
                                                            View Complete Schedule ({loan.term} months)
                                                          </Button>
                                                        </td>
                                                      </tr>
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                            
                                            {/* Early Settlement */}
                                            <div className="bg-secondary/20 p-3 rounded-md">
                                              <h4 className="text-sm font-medium mb-2">Early Settlement Option</h4>
                                              <div className="flex justify-between items-center">
                                                <div>
                                                  <p className="text-sm">Settlement Amount:</p>
                                                  <p className="text-lg font-bold">{formatAmount(loan.amount - loan.paidAmount + ((loan.amount - loan.paidAmount) * 0.05))}</p>
                                                  <p className="text-xs text-foreground/60 mt-1">Includes 5% early settlement fee</p>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                  Settle Loan
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </details>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          
                          {/* Completed/Other Loans Section */}
                          {hasLoans && (userData.loans || []).filter(loan => loan.status !== 'active').length > 0 && (
                            <>
                              <h3 className="text-lg font-medium mb-4">Past Loans</h3>
                              <div className="grid grid-cols-1 gap-6">
                                {(userData.loans || []).filter(loan => loan.status !== 'active').map((loan, index) => (
                                  <div key={`other-${index}`} className={`glass-card-inner p-4 border-l-4 ${
                                    loan.status === 'completed' ? 'border-green-500' : 
                                    loan.status === 'rejected' ? 'border-red-500' : 'border-gray-500'
                                  }`}>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                      <div className="md:col-span-1">
                                        <div className="flex items-center h-full">
                                          <div className="mr-4">
                                            {loan.status === 'completed' && <BadgeCheck className="h-10 w-10 text-green-500" />}
                                            {loan.status === 'rejected' && <XCircle className="h-10 w-10 text-red-500" />}
                                            {loan.status === 'pending' && <Clock className="h-10 w-10 text-yellow-500" />}
                                            {loan.status === 'approved' && <CheckCircle className="h-10 w-10 text-green-500" />}
                                          </div>
                                          <div>
                                            <h3 className="text-lg font-medium">Loan #{loan.id.substring(loan.id.length - 6)}</h3>
                                            <p className="text-sm capitalize text-foreground/70">{loan.type} Loan</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="md:col-span-2">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-sm text-foreground/70">Loan Amount</p>
                                            <p className="font-medium">{formatAmount(loan.amount)}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-foreground/70">Date {loan.status === 'completed' ? 'Completed' : 'Applied'}</p>
                                            <p className="font-medium">{loan.status === 'completed' ? loan.dateIssued : loan.dateApplied}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-foreground/70">Term</p>
                                            <p className="font-medium">{loan.term} {loan.term === 1 ? 'month' : 'months'}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-foreground/70">
                                              {loan.status === 'completed' ? 'Total Paid' : 'Monthly Payment'}
                                            </p>
                                            <p className="font-medium">
                                              {loan.status === 'completed' 
                                                ? formatAmount(loan.totalRepayment || loan.amount)
                                                : formatAmount(loan.monthlyPayment)
                                              }
                                            </p>
                              </div>
                            </div>
                                      </div>
                                      
                                      <div className="md:col-span-1">
                                        <div className="h-full flex flex-col justify-between">
                                          <div>
                                            <p className="text-sm text-foreground/70">Status</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                              loan.status === 'completed' ? 'bg-green-100 text-green-800' :
                                              loan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                              loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                              loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {loan.status === 'completed' && 'Completed'}
                                              {loan.status === 'rejected' && 'Rejected'}
                                              {loan.status === 'pending' && 'Pending'}
                                              {loan.status === 'approved' && 'Approved'}
                                              {!['completed', 'rejected', 'pending', 'approved'].includes(loan.status) && loan.status}
                                            </span>
                                          </div>
                                          
                                          <div className="mt-4">
                                            <Button 
                                              variant="outline" 
                                              className="w-full"
                                              onClick={() => alert(`View details for loan ${loan.id}`)}
                                            >
                                              <Eye className="h-4 w-4 mr-2" />
                                              View Details
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          
                          <div className="mt-8">
                            <Button asChild className="w-full md:w-auto">
                              <Link to="/application">
                                <Plus className="h-4 w-4 mr-2" />
                                Apply for New Loan
                              </Link>
                            </Button>
                            </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {/* Add Contracts section */}
              {activeTab === 'contracts' && (
                <div className="animate-in fade-in duration-500">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold">My Contracts</h2>
                    <p className="text-gray-500 mt-1">View and manage your loan contracts</p>
                            </div>
                            
                  {currentUser && (
                    <UserContracts userId={currentUser.id} />
                  )}
                                  </div>
                              )}
              
              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-8 animate-fade-in tab-content">
                  <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold mb-6">Document Management</h2>
                    
                    {/* Document Status Section */}
                    <div className="mb-8">
                      <UserDocumentStatus />
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-xl font-semibold mb-4">All Documents</h3>
                      <DocumentsManager 
                        userId={currentUser?.id}
                        showUploader={true}
                        title=""
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-8 animate-fade-in tab-content">
                  <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold mb-6">Notifications</h2>
                    
                    {userData.notifications && userData.notifications.length > 0 ? (
                      <div className="space-y-4">
                        {(userData.notifications || []).map((notification, index) => (
                          <div key={index} className={`p-4 rounded-lg ${!notification.read ? 'bg-primary/5 border-l-2 border-primary' : 'border border-border'}`}>
                            <div className="flex items-start">
                              <div className="mr-4 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{notification.title}</h3>
                                <p className="text-sm text-foreground/70 mt-1">{notification.message}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs text-foreground/50">{notification.date}</span>
                                  {notification.action && (
                                    <Button variant="link" size="sm" className="h-auto p-0">
                                      {notification.action}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="glass-card-inner p-8 text-center">
                        <div className="flex flex-col items-center">
                          <BellOff className="h-16 w-16 text-foreground/30 mb-4" />
                          <h3 className="text-xl font-medium mb-2">No Notifications</h3>
                          <p className="text-foreground/70 mb-6 max-w-md mx-auto">
                            You're all caught up! We'll notify you here when there are updates about your account or loans.
                          </p>
                </div>
              </div>
            )}
                  </div>
            
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
                    
                        <div className="space-y-4">
                      <div className="flex items-center justify-between">
                            <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className="text-sm text-foreground/70">Receive notifications via email</p>
                            </div>
                        <Switch checked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                            <div>
                          <h3 className="font-medium">SMS Notifications</h3>
                          <p className="text-sm text-foreground/70">Receive notifications via SMS</p>
                            </div>
                        <Switch checked={true} />
                          </div>
                          
                      <div className="flex items-center justify-between">
                          <div>
                          <h3 className="font-medium">Payment Reminders</h3>
                          <p className="text-sm text-foreground/70">Get reminders before payment due dates</p>
                        </div>
                        <Switch checked={true} />
                          </div>
                          
                      <div className="flex items-center justify-between">
                          <div>
                          <h3 className="font-medium">Promotional Messages</h3>
                          <p className="text-sm text-foreground/70">Receive offers and promotions</p>
                        </div>
                        <Switch checked={false} />
                      </div>
                          </div>
                          
                    <div className="mt-6 flex justify-end">
                      <Button>Save Preferences</Button>
                          </div>
                        </div>
                </div>
              )}
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-8 animate-fade-in tab-content">
                  <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                    
                    <UserSettings />
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfileDashboard;
