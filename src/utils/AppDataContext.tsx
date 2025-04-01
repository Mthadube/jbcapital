import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import * as api from './api';
import { jwtDecode } from 'jwt-decode';

// Define interfaces for our data models
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  dependents?: number;
  address: string;
  suburb?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  employmentStatus?: string;
  employmentType?: string;
  employmentSector?: string;
  employerName?: string;
  jobTitle?: string;
  yearsEmployed?: number;
  monthlyIncome: number;
  paymentDate?: string;
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
  bankingPeriod?: number;
  creditScore?: number;
  existingLoans?: boolean;
  existingLoanAmount?: number;
  monthlyDebt?: number;
  rentMortgage?: number;
  carPayment?: number;
  groceries?: number;
  utilities?: number;
  insurance?: number;
  otherExpenses?: number;
  totalMonthlyExpenses?: number;
  accountStatus: string;
  registrationDate: string;
  lastLogin?: string;
  profileCompletionPercentage: number;
  incompleteProfileItems?: string[];
  verificationStatus?: string;
  role?: string;
  documents: Document[];
  loans: Loan[];
  passwordLastChanged?: string;
  recoveryEmail?: string;
  recoveryPhone?: string;
}

export interface Loan {
  id: string;
  userId: string;
  type: string;
  purpose?: string;
  amount: number;
  interestRate: number;
  term: number;
  monthlyPayment: number;
  totalRepayment?: number;
  status: 'active' | 'pending' | 'completed' | 'rejected' | 'approved';
  dateApplied: string;
  dateIssued?: string;
  paidAmount?: number;
  paidMonths?: number;
  remainingPayments?: number;
  nextPaymentDue?: string;
  nextPaymentAmount?: number;
  collateral?: boolean;
  collateralType?: string;
  collateralValue?: number;
  notes?: string;
  processingHistory?: ProcessingStep[];
}

export interface Document {
  id: string;
  userId: string;
  name: string;
  type: string;
  dateUploaded: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  fileSize?: string;
  fileType?: string;
  expiryDate?: string;
  notes?: string;
}

export interface ProcessingStep {
  id: string;
  loanId: string;
  status: string;
  date: string;
  notes?: string;
  processedBy?: string;
}

export interface Application {
  id: string;
  userId: string;
  status: string;
  submittedAt: string;
  email: string;
  phone: string;
  idNumber: string;
  dob: string;
  notes?: string;
  completion: number;
  requiredAction?: string;
  
  // Loan information
  loanInfo?: {
    amount: number;
    term: number;
    purpose?: string;
    interestRate?: number;
    monthlyPayment?: number;
  };
  
  // Personal information
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender?: string;
    maritalStatus?: string;
    dependents?: number;
    address?: string;
    province?: string;
    postalCode?: string;
  };
  
  // Employment information
  employmentInfo?: {
    employmentStatus?: string;
    employmentType?: string;
    employer: string;
    position?: string;
    jobTitle?: string;
    yearsAtCurrentEmployer: number;
    employmentLength?: string;
    monthlyIncome: number;
    paymentDate?: string;
  };
  
  // Financial information
  financialInfo?: {
    bankName?: string;
    accountType?: string;
    accountNumber?: string;
    creditScore: number;
    debtToIncomeRatio: number;
    monthlyExpenses: number;
    bankruptcies?: boolean;
    foreclosures?: boolean;
    existingLoans?: Array<{
      type: string;
      amount: string;
      remaining: string;
    }>;
    monthlyDebt?: string;
  };
}

// Define Notification interface
export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: string;
  date: string;
  read: boolean;
  link?: string;
  data?: Record<string, unknown>;
  importance: 'high' | 'medium' | 'low';
}

// Define a Token interface
interface AuthToken {
  token: string;
  expiresAt: number;
}

// Define a decoded token interface
interface DecodedToken {
  id?: string;
  userId?: string;
  email: string;
  role: string;
  exp: number;
}

interface AppDataContextType {
  users: User[];
  loans: Loan[];
  documents: Document[];
  applications: Application[];
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
  
  // User management
  addUser: (user: User) => Promise<boolean>;
  updateUser: (id: string, data: Partial<User>) => Promise<boolean>;
  getUserById: (id: string) => User | undefined;
  getUserByEmail: (email: string) => User | undefined;
  
  // Loan management
  addLoan: (loan: Loan) => Promise<boolean>;
  updateLoan: (id: string, data: Partial<Loan>) => Promise<boolean>;
  getLoanById: (id: string) => Loan | undefined;
  getLoansByUserId: (userId: string) => Loan[];
  
  // Document management
  addDocument: (document: Document) => Promise<boolean>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<boolean>;
  getDocumentsByUserId: (userId: string) => Document[];
  
  // Application management
  addApplication: (application: Application) => Promise<boolean>;
  updateApplication: (id: string, data: Partial<Application>) => Promise<boolean>;
  getApplicationById: (id: string) => Application | undefined;
  getApplicationsByUserId: (userId: string) => Application[];
  
  // Current logged in user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Data refresh
  refreshData: () => Promise<void>;
  
  // Utility functions
  generateId: (prefix: string) => string;
  
  // Migration function for initial setup
  migrateInitialData: () => Promise<boolean>;
  
  // Notification management
  notifications: Notification[];
  unreadNotificationsCount: number;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  getNotificationsByUserId: (userId: string) => Notification[];
  
  // Notification settings
  notificationSettings: {
    soundEnabled: boolean;
    browserNotificationsEnabled: boolean;
    emailNotificationsEnabled: boolean;
    soundVolume: number;
  };
  updateNotificationSettings: (settings: Partial<{
    soundEnabled: boolean;
    browserNotificationsEnabled: boolean;
    emailNotificationsEnabled: boolean;
    soundVolume: number;
  }>) => void;
  
  // Auth related
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
}

// Create the context
const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// Provider component
export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  // State for data
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<AuthToken | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    soundEnabled: true,
    browserNotificationsEnabled: true,
    emailNotificationsEnabled: true,
    soundVolume: 0.5,
  });
  
  // Calculate unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  
  // Generate unique ID
  const generateId = (prefix: string) => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Fetch all data from API
  const fetchAllData = async () => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      // Check API health
      const healthCheck = await api.checkHealth();
      if (!healthCheck.success) {
        console.error("API health check failed. Using mock data.");
        setUsers(generateMockData().users);
        setLoans(generateMockData().loans);
        setDocuments(generateMockData().documents);
        setApplications(generateMockData().applications);
        setIsLoading(false);
        return;
      }
      
      // Fetch users
      const usersResponse = await api.fetchUsers();
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }
      
      // Fetch loans
      const loansResponse = await api.fetchLoans();
      if (loansResponse.success && loansResponse.data) {
        setLoans(loansResponse.data);
      }
      
      // Fetch documents
      const documentsResponse = await api.fetchDocuments();
      if (documentsResponse.success && documentsResponse.data) {
        setDocuments(documentsResponse.data);
      }
      
      // Fetch applications
      const applicationsResponse = await api.fetchApplications();
      if (applicationsResponse.success && applicationsResponse.data) {
        setApplications(applicationsResponse.data);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error fetching data:", errorMessage);
      setIsError(true);
      
      // Fallback to mock data if API fails
      const mockData = generateMockData();
      setUsers(mockData.users);
      setLoans(mockData.loans);
      setDocuments(mockData.documents);
      setApplications(mockData.applications);
    } finally {
      setIsLoading(false);
    }
  };

  // Migrate initial data to MongoDB
  const migrateInitialData = async (): Promise<boolean> => {
    try {
      const mockData = generateMockData();
      const response = await api.migrateData(mockData);
      
      if (response.success) {
        toast.success("Initial data migrated to MongoDB successfully");
        await fetchAllData();
        return true;
      } else {
        toast.error(`Migration failed: ${response.error}`);
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Migration error:", errorMessage);
      toast.error("Migration failed due to an error");
      return false;
    }
  };
  
  // Refresh all data
  const refreshData = async () => {
    await fetchAllData();
  };
  
  // User management functions
  const addUser = async (user: User): Promise<boolean> => {
    try {
      const response = await api.createUser(user);
      
      if (response.success && response.data) {
        setUsers(prevUsers => [...prevUsers, response.data as User]);
        return true;
      } else {
        toast.error(`Failed to add user: ${response.error}`);
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error adding user:", errorMessage);
      return false;
    }
  };
  
  const updateUser = async (id: string, data: Partial<User>): Promise<boolean> => {
    try {
      const response = await api.updateUser(id, data);
      
      if (response.success && response.data) {
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === id ? { ...user, ...response.data } as User : user
        ));
        
        // Update current user if it's the same
        if (currentUser && currentUser.id === id) {
          setCurrentUser({ ...currentUser, ...response.data } as User);
        }
        
        return true;
      } else {
        toast.error(`Failed to update user: ${response.error}`);
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error updating user:", errorMessage);
      return false;
    }
  };
  
  const getUserById = (id: string) => users.find(user => user.id === id);
  
  const getUserByEmail = (email: string) => users.find(user => user.email.toLowerCase() === email.toLowerCase());
  
  // Loan management functions
  const addLoan = async (loan: Loan): Promise<boolean> => {
    try {
      const response = await api.createLoan(loan);
      
      if (response.success && response.data) {
        setLoans(prevLoans => [...prevLoans, response.data as Loan]);
        return true;
      } else {
        toast.error(`Failed to add loan: ${response.error}`);
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error adding loan:", errorMessage);
      return false;
    }
  };
  
  const updateLoan = async (id: string, data: Partial<Loan>): Promise<boolean> => {
    try {
      const response = await api.updateLoan(id, data);
      
      if (response.success && response.data) {
        setLoans(prevLoans => prevLoans.map(loan => 
          loan.id === id ? { ...loan, ...response.data } as Loan : loan
        ));
        return true;
      } else {
        toast.error(`Failed to update loan: ${response.error}`);
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error updating loan:", errorMessage);
      return false;
    }
  };
  
  const getLoanById = (id: string) => loans.find(loan => loan.id === id);
  
  const getLoansByUserId = (userId: string) => loans.filter(loan => loan.userId === userId);
  
  // Document management functions
  const addDocument = async (document: Document): Promise<boolean> => {
    try {
      const response = await api.createDocument(document);
      
      if (response.success && response.data) {
        setDocuments(prevDocuments => [...prevDocuments, response.data as Document]);
        return true;
      } else {
        toast.error(`Failed to add document: ${response.error}`);
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error adding document:", errorMessage);
      return false;
    }
  };
  
  const updateDocument = async (id: string, data: Partial<Document>): Promise<boolean> => {
    try {
      const response = await api.updateDocument(id, data);
      
      if (response.success && response.data) {
        setDocuments(prevDocuments => prevDocuments.map(document => 
          document.id === id ? { ...document, ...response.data } as Document : document
        ));
        return true;
      } else {
        toast.error(`Failed to update document: ${response.error}`);
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error updating document:", errorMessage);
      return false;
    }
  };
  
  const getDocumentsByUserId = (userId: string) => documents.filter(document => document.userId === userId);
  
  // Application management functions
  const addApplication = async (application: Application): Promise<boolean> => {
    try {
      const response = await api.createApplication(application);
      
      if (response.success && response.data) {
        setApplications(prevApplications => [...prevApplications, response.data as Application]);
        return true;
      } else {
        toast.error(`Failed to add application: ${response.error}`);
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error adding application:", errorMessage);
      return false;
    }
  };
  
  const updateApplication = async (id: string, data: Partial<Application>): Promise<boolean> => {
    try {
      const response = await api.updateApplication(id, data);
      
      if (response.success && response.data) {
        setApplications(prevApplications => prevApplications.map(application => 
          application.id === id ? { ...application, ...response.data } as Application : application
        ));
        return true;
      } else {
        toast.error(`Failed to update application: ${response.error}`);
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error updating application:", errorMessage);
      return false;
    }
  };
  
  const getApplicationById = (id: string) => applications.find(application => application.id === id);
  
  const getApplicationsByUserId = (userId: string) => applications.filter(application => application.userId === userId);
  
  // Check if token is valid
  const isTokenValid = (token: AuthToken | null): boolean => {
    if (!token) return false;
    return Date.now() < token.expiresAt;
  };

  // Get token from storage and validate
  const getStoredToken = (): AuthToken | null => {
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) return null;
    
    try {
      const parsedToken = JSON.parse(storedToken) as AuthToken;
      return isTokenValid(parsedToken) ? parsedToken : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error parsing stored token:', errorMessage);
      localStorage.removeItem('authToken');
      return null;
    }
  };

  // Set token with expiry
  const setTokenWithExpiry = (token: string) => {
    try {
      // For our mock token, manually decode it
      if (token.endsWith('mock_signature')) {
        // Parse the middle part (payload) of the token
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        const payload = parts[1];
        let decoded;
        
        try {
          // First try using jwt-decode library
          decoded = jwtDecode<DecodedToken>(token);
        } catch (e) {
          // Fall back to manual decoding
          decoded = JSON.parse(atob(payload)) as DecodedToken;
        }
        
        const expiresAt = decoded.exp * 1000; // Convert to milliseconds
        
        const tokenData: AuthToken = {
          token,
          expiresAt
        };
        
        localStorage.setItem('authToken', JSON.stringify(tokenData));
        setAuthToken(tokenData);
        return decoded;
      } else {
        // For real tokens from the server, use the jwt-decode library
        const decoded = jwtDecode<DecodedToken>(token);
        const expiresAt = decoded.exp * 1000; // Convert to milliseconds
        
        const tokenData: AuthToken = {
          token,
          expiresAt
        };
        
        localStorage.setItem('authToken', JSON.stringify(tokenData));
        setAuthToken(tokenData);
        return decoded;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Invalid token:', errorMessage);
      return null;
    }
  };

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    const token = getStoredToken();
    
    if (!token) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      return false;
    }
    
    try {
      // Validate token with server
      const response = await api.validateToken(token.token);
      
      if (response.success && response.data) {
        // If token is valid, set the user data from the response 
        const userData = response.data;
        setCurrentUser(userData);
        setIsAuthenticated(true);
        return true;
      } else {
        // If token is invalid, clear authentication
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Auth check error:', errorMessage);
      // If token validation fails, clear authentication data
      localStorage.removeItem('authToken');
      setAuthToken(null);
      setIsAuthenticated(false);
      setCurrentUser(null);
      return false;
    }
  };

  // Login function with token handling
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if admin login
      if (email === 'admin@jbcapital.com' && password === 'admin123') {
        const adminUser = users.find(user => user.email === 'admin@jbcapital.com');
        
        if (adminUser) {
          // Hard-coded token with very long expiry
          const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkFETS0wMDEiLCJlbWFpbCI6ImFkbWluQGpiY2FwaXRhbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJleHAiOjMxNTM2MDAwMDB9.signature";
          
          // Store token with its expiry
          localStorage.setItem('authToken', JSON.stringify({
            token: mockToken,
            expiresAt: 3153600000000 // Far future
          }));
          
          setAuthToken({
            token: mockToken,
            expiresAt: 3153600000000
          });
          
          // Update last login time
          const now = new Date().toISOString();
          await updateUser(adminUser.id, { lastLogin: now });
          
          setCurrentUser(adminUser);
          setIsAuthenticated(true);
          toast.success("Logged in as admin");
          setIsLoading(false);
          return true;
        }
      }
      
      // For regular users
      const response = await api.login(email, password);
      
      if (response.success && response.data) {
        // Store the token
        const { token, user } = response.data;
        const decoded = setTokenWithExpiry(token);
        
        if (!decoded) {
          toast.error("Invalid authentication token");
          setIsLoading(false);
          return false;
        }
        
        // Update last login time
        const now = new Date().toISOString();
        await updateUser(user.id, { lastLogin: now });
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        toast.success("Login successful");
        setIsLoading(false);
        return true;
      } else {
        toast.error(response.error || "Invalid email or password");
        setIsLoading(false);
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Login error:", errorMessage);
      toast.error("Login failed");
      setIsLoading(false);
      return false;
    }
  };
  
  // Log out function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setAuthToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.info("Logged out successfully");
  };

  // Initial authentication check on load
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await checkAuth();
      setIsLoading(false);
    };
    
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // We intentionally want this to run only once on mount
  }, []);

  // Load notification settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setNotificationSettings(JSON.parse(savedSettings));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error parsing notification settings:', errorMessage);
      }
    }
  }, []);
  
  // Save notification settings to localStorage
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);
  
  // Notification management functions
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Play notification sound if enabled
    if (notificationSettings.soundEnabled) {
      playNotificationSound(notification.type);
    }
    
    // Show browser notification if enabled
    if (notificationSettings.browserNotificationsEnabled) {
      showBrowserNotification(notification);
    }
    
    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      action: notification.link ? {
        label: "View",
        onClick: () => window.location.href = notification.link || '#',
      } : undefined,
    });
  };
  
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  const getNotificationsByUserId = (userId: string) => {
    return notifications.filter(
      notification => !notification.userId || notification.userId === userId
    );
  };
  
  const updateNotificationSettings = (settings: Partial<{
    soundEnabled: boolean;
    browserNotificationsEnabled: boolean;
    emailNotificationsEnabled: boolean;
    soundVolume: number;
  }>) => {
    setNotificationSettings(prev => ({ ...prev, ...settings }));
  };
  
  // Function to play notification sound
  const playNotificationSound = (type: string) => {
    // Create different sounds based on notification type
    let sound: HTMLAudioElement;
    
    switch (type) {
      case 'application':
        sound = new Audio('/sounds/application.mp3');
        break;
      case 'document':
        sound = new Audio('/sounds/document.mp3');
        break;
      case 'payment':
        sound = new Audio('/sounds/payment.mp3');
        break;
      case 'warning':
        sound = new Audio('/sounds/warning.mp3');
        break;
      default:
        sound = new Audio('/sounds/notification.mp3');
    }
    
    sound.volume = notificationSettings.soundVolume;
    sound.play().catch((err: Error) => console.error('Error playing notification sound:', err.message));
  };
  
  // Function to show browser notification
  const showBrowserNotification = (notification: Notification) => {
    if (!('Notification' in window)) {
      return;
    }
    
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png'
          });
        }
      });
    }
  };
  
  // Context value
  const value: AppDataContextType = {
    users,
    loans,
    documents,
    applications,
    isLoading,
    isError,
    addUser,
    updateUser,
    getUserById,
    getUserByEmail,
    addLoan,
    updateLoan,
    getLoanById,
    getLoansByUserId,
    addDocument,
    updateDocument,
    getDocumentsByUserId,
    addApplication,
    updateApplication,
    getApplicationById,
    getApplicationsByUserId,
    currentUser,
    setCurrentUser,
    login,
    logout,
    refreshData,
    generateId,
    migrateInitialData,
    notifications,
    unreadNotificationsCount,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    getNotificationsByUserId,
    notificationSettings,
    updateNotificationSettings,
    isAuthenticated,
    checkAuth
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

// Hook for accessing context
export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
};

// Mock data generator
const generateMockData = () => {
  // Sample users
  const sampleUsers: User[] = [
    {
      id: "USR-001",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "+27 71 234 5678",
      idNumber: "8506155012089",
      dateOfBirth: "1985-06-15",
      gender: "Male",
      maritalStatus: "Married",
      dependents: 2,
      address: "123 Main Street",
      suburb: "Sandton",
      city: "Johannesburg",
      state: "Gauteng",
      zipCode: "2196",
      country: "South Africa",
      employmentStatus: "employed",
      employmentType: "full-time",
      employmentSector: "Finance",
      employerName: "Standard Bank",
      jobTitle: "Senior Manager",
      yearsEmployed: 5,
      monthlyIncome: 45000,
      paymentDate: "25th of each month",
      bankName: "Standard Bank",
      accountType: "cheque",
      accountNumber: "XXXX-XXXX-XXXX-5678",
      bankingPeriod: 8,
      creditScore: 720,
      existingLoans: true,
      existingLoanAmount: 150000,
      monthlyDebt: 12000,
      rentMortgage: 8000,
      carPayment: 4500,
      groceries: 3500,
      utilities: 2000,
      insurance: 1500,
      otherExpenses: 2000,
      totalMonthlyExpenses: 21500,
      accountStatus: "active",
      registrationDate: "2023-01-15",
      lastLogin: "2023-04-20",
      profileCompletionPercentage: 100,
      verificationStatus: "verified",
      role: "user",
      documents: [],
      loans: [],
      passwordLastChanged: "2023-04-20",
      recoveryEmail: "john.smith@example.com",
      recoveryPhone: "+27 71 234 5678"
    },
    // Add more sample users as needed...
  ];

  // ... rest of the mock data generation function
  // This is just to keep the existing mock data for fallback

  return { users: sampleUsers, loans: [], documents: [], applications: [] };
}; 