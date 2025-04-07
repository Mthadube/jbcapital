import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import * as api from './api';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationStatus } from "@/components/admin/ApplicationProcessing";

// Mock data variables for data generation
const firstNames = [
  "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
  "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor",
  "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson"
];

const streets = [
  "Main Street", "Oak Avenue", "Maple Drive", "Cedar Lane", "Pine Road", "Elm Street", "Washington Avenue",
  "Park Place", "Lake View", "River Road", "Highland Avenue", "Valley Drive", "Forest Lane", "Meadow Lane"
];

const cities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego",
  "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "San Francisco", "Charlotte"
];

const states = [
  "NY", "CA", "IL", "TX", "AZ", "PA", "GA", "FL", "NC", "OH", "MI", "TN", "VA", "WA", "MA", "CO"
];

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
  notifications?: Notification[];
  recentActivity?: Activity[];
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
  filePath?: string;
}

export interface ProcessingStep {
  id: string;
  loanId: string;
  status: string;
  date: string;
  notes?: string;
  processedBy?: string;
}

// Define StatusHistoryItem interface
export interface StatusHistoryItem {
  status: string;
  date: string;
  user: string;
  notes?: string;
}

export interface Application {
  id: string;
  userId: string;
  name: string;
  status: ApplicationStatus;
  date: string;
  amount: string;
  completion?: number;
  requiredAction?: string;
  statusHistory?: StatusHistoryItem[];
  loanDetails?: {
    purpose?: string;
    term?: number;
    monthlyPayment?: string;
    interestRate?: number;
  };
}

// Define Notification interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  date: string;
  read: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  amount?: number;
  date: string;
}

// Add Contract interface after the other interfaces
export interface Contract {
  id: string;
  loanId: string;
  userId: string;
  documentId?: string;
  status: 'draft' | 'sent' | 'viewed' | 'signed' | 'completed' | 'expired' | 'declined';
  dateCreated: string;
  dateSent?: string;
  dateViewed?: string;
  dateSigned?: string;
  dateExpires?: string;
  signatureRequestId?: string;
  signatureUrl?: string;
  downloadUrl?: string;
  notes?: string;
}

interface AppDataContextType {
  users: User[];
  loans: Loan[];
  documents: Document[];
  applications: Application[];
  contracts: Contract[];
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
  
  // User management
  addUser: (user: User) => Promise<boolean>;
  updateUser: (id: string, data: Partial<User>) => Promise<boolean>;
  getUserById: (id: string) => User | undefined;
  getUserByEmail: (email: string) => User | undefined;
  
  // Activity & Notification management
  addUserActivity: (userId: string, activityData: Activity) => void;
  
  // Loan management
  addLoan: (loan: Loan) => Promise<boolean>;
  updateLoan: (id: string, data: Partial<Loan>) => Promise<boolean>;
  getLoanById: (id: string) => Loan | undefined;
  getLoansByUserId: (userId: string) => Loan[];
  
  // Document management
  addDocument: (document: Document) => Promise<boolean>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<boolean>;
  getDocumentsByUserId: (userId: string) => Document[];
  viewDocument: (documentId: string) => string | null;
  
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
  
  // Contract management
  addContract: (contract: Contract) => Promise<boolean>;
  updateContract: (id: string, data: Partial<Contract>) => Promise<boolean>;
  getContractById: (id: string) => Contract | undefined;
  getContractsByUserId: (userId: string) => Contract[];
  getContractsByLoanId: (loanId: string) => Contract[];
  generateContract: (loanId: string) => Promise<Contract | null>;
  sendContractForSignature: (contractId: string, recipientEmail: string) => Promise<boolean>;
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
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Initialize currentUser from localStorage on component mount
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error restoring user session:', error);
      return null;
    }
  });
  
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
      // Fetch users
      const usersResponse = await api.fetchUsers();
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      } else {
        console.error("Failed to fetch users:", usersResponse.error);
      }
      
      // Fetch loans
      const loansResponse = await api.fetchLoans();
      if (loansResponse.success && loansResponse.data) {
        console.log("Fetched loans data:", loansResponse.data);
        setLoans(loansResponse.data);
      } else {
        console.error("Failed to fetch loans:", loansResponse.error);
      }
      
      // Fetch documents
      const documentsResponse = await api.fetchDocuments();
      if (documentsResponse.success && documentsResponse.data) {
        setDocuments(documentsResponse.data);
      } else {
        console.error("Failed to fetch documents:", documentsResponse.error);
      }
      
      // Fetch applications
      const applicationsResponse = await api.fetchApplications();
      if (applicationsResponse.success && applicationsResponse.data) {
        setApplications(applicationsResponse.data);
      } else {
        console.error("Failed to fetch applications:", applicationsResponse.error);
      }
      
      // Fetch contracts
      const contractsResponse = await api.fetchContracts();
      if (contractsResponse.success && contractsResponse.data) {
        setContracts(contractsResponse.data);
      } else {
        console.error("Failed to fetch contracts:", contractsResponse.error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsError(true);
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
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("Migration failed due to an error");
      return false;
    }
  };
  
  // Refresh all data
  const refreshData = async (): Promise<void> => {
    try {
      console.log("Refreshing all data...");
    await fetchAllData();
      console.log("Data refresh complete.");
      
      // Log the current state after refresh (won't show updated state due to React's async state updates)
      setTimeout(() => {
        console.log("Current state after refresh:", {
          users: users.length,
          loans: loans.length,
          documents: documents.length,
          applications: applications.length,
          contracts: contracts.length
        });
      }, 100);
      
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
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
    } catch (error) {
      console.error("Error adding user:", error);
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
    } catch (error) {
      console.error("Error updating user:", error);
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
    } catch (error) {
      console.error("Error adding loan:", error);
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
    } catch (error) {
      console.error("Error updating loan:", error);
      return false;
    }
  };
  
  const getLoanById = (id: string) => loans.find(loan => loan.id === id);
  
  const getLoansByUserId = (userId: string) => loans.filter(loan => loan.userId === userId);
  
  // Document management functions
  const addDocument = async (document: Document): Promise<boolean> => {
    try {
      // If this document was already uploaded via API and has complete data, just add to state
      if (document.id && document.filePath) {
        setDocuments(prevDocuments => [document, ...prevDocuments]);
        return true;
      }
      
      // Otherwise, create via API
      const response = await api.createDocument(document);
      
      if (response.success && response.data) {
        setDocuments(prevDocuments => [response.data as Document, ...prevDocuments]);
        return true;
      } else {
        toast.error(`Failed to add document: ${response.error}`);
        return false;
      }
    } catch (error) {
      console.error("Error adding document:", error);
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
    } catch (error) {
      console.error("Error updating document:", error);
      return false;
    }
  };
  
  const getDocumentsByUserId = (userId: string) => documents.filter(doc => doc.userId === userId);
  
  const viewDocument = (documentId: string): string | null => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) {
      console.error("Document not found:", documentId);
      return null;
    }
    
    console.log("viewDocument called for:", document.name, "filePath:", document.filePath);
    
    // For uploaded documents with a filePath
    if (document.filePath) {
      // If path already starts with http(s), use as is
      if (document.filePath.startsWith('http')) {
        return document.filePath;
      }
      
      // If filePath already starts with a slash, it's relative to server root
      if (document.filePath.startsWith('/')) {
        return document.filePath;
      }
      
      // Otherwise, add a leading slash
      return `/${document.filePath}`;
    }
    
    // For mock or demo data, provide fallbacks based on document type and name
    const documentType = document.type.toLowerCase();
    const fileName = document.name.toLowerCase();
    
    // Determine file type from extension or type
    if (fileName.endsWith('.pdf') || documentType.includes('pdf') || 
        documentType === 'id' || documentType === 'bank_statement') {
      return '/documents/sample-pdf.pdf';
    } else if (fileName.match(/\.(jpg|jpeg|png|gif)$/i) || 
              documentType.includes('image') || documentType === 'proof_of_residence') {
      return '/documents/sample-image.jpg';
    }
    
    // Final fallback - SVG placeholder
    return '/documents/placeholder.svg';
  };
  
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
    } catch (error) {
      console.error("Error adding application:", error);
      return false;
    }
  };
  
  const updateApplication = async (applicationId: string, updatedData: Partial<Application>) => {
    try {
      const response = await api.updateApplication(applicationId, updatedData);
      
      if (response.success) {
        // Track status change if status is being updated
        if (updatedData.status) {
          const application = applications.find(app => app.id === applicationId);
          if (application && application.status !== updatedData.status) {
            handleApplicationStatusChange(application, updatedData.status);
          }
        }

        const updatedApplications = applications.map(app => 
          app.id === applicationId ? { ...app, ...updatedData } : app
        );
        
        setApplications(updatedApplications);
        
        toast({
          title: "Application updated",
          description: "Application has been successfully updated",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        return true;
      } else {
        throw new Error("Failed to update application");
      }
    } catch (error) {
      console.error("Error updating application:", error);
      toast({
        title: "Error",
        description: "Failed to update application",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  };
  
  const getApplicationById = (id: string) => applications.find(application => application.id === id);
  
  const getApplicationsByUserId = (userId: string) => applications.filter(application => application.userId === userId);
  
  // Authentication functions
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if this is the admin login
      if (email.toLowerCase() === 'admin@jbcapital.com') {
        // For admin, verify with the hardcoded password (in real app, this would be different)
        if (password !== 'admin123') {
          toast.error("Invalid admin password");
          return false;
        }
        
        // Fetch the admin user from database
        const response = await api.fetchUserByEmail(email);
        
        if (response.success && response.data) {
          const user = response.data as User;
          // Update last login time
          const now = new Date().toISOString();
          await updateUser(user.id, { lastLogin: now });
          
          setCurrentUser(user);
          
          // Update local storage 
          localStorage.setItem('currentUser', JSON.stringify(user));
          return true;
        } else {
          // If admin not found in database, the server should have created it
          // Try to refresh the user data
          await refreshData();
          
          // Try fetching admin again
          const retryResponse = await api.fetchUserByEmail(email);
          if (retryResponse.success && retryResponse.data) {
            const user = retryResponse.data as User;
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
          }
          
          toast.error("Admin user not found in database. Please restart the server.");
          return false;
        }
      }
      
      // For regular users
      const response = await api.fetchUserByEmail(email);
      
      if (response.success && response.data) {
        const user = response.data as User;
        // Update last login time
        const now = new Date().toISOString();
        await updateUser(user.id, { lastLogin: now });
      
      setCurrentUser(user);
        
        // Update local storage 
        localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
      } else {
        toast.error("Invalid email or password");
        return false;
    }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
    return false;
    }
  };
  
  const logout = () => {
    // Clear current user
    setCurrentUser(null);
    
    // Clear user data from local storage
    localStorage.removeItem('currentUser');
    
    // Display logout message
    toast.success('Logged out successfully');
  };

  // Load initial data
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Load data from API
        await fetchAllData();
        
        // If we have a currentUser from localStorage, ensure it's in sync with server data
        if (currentUser) {
          const freshUserData = users.find(u => u.id === currentUser.id);
          if (freshUserData) {
            // Update current user with latest data
            setCurrentUser(freshUserData);
            localStorage.setItem('currentUser', JSON.stringify(freshUserData));
          }
        }
      } catch (error) {
        console.error("Error initializing app data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);  // Empty dependency array ensures this runs only once on mount

  // Load notification settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setNotificationSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing notification settings:', error);
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
    });
    
    // If this notification is for a specific user, also update their user record
    if (notification.userId) {
      const user = users.find(u => u.id === notification.userId);
      if (user) {
        // Create updated user with notifications added
        const updatedUser = {
          ...user,
          notifications: [notification, ...(user.notifications || [])]
        };
        
        // Update users array
        setUsers(prev => prev.map(u => u.id === notification.userId ? updatedUser : u));
        
        // Also update currentUser if it's the same user
        if (currentUser && currentUser.id === notification.userId) {
          setCurrentUser({
            ...currentUser,
            notifications: [notification, ...(currentUser.notifications || [])]
          });
        }
      }
    }
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
    sound.play().catch(err => console.error('Error playing notification sound:', err));
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
  
  // Add a recent activity to a user's profile
  const addUserActivity = (userId: string, activityData: Activity) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const recentActivity = user.recentActivity || [];
    const updatedRecentActivity = [activityData, ...recentActivity.slice(0, 9)]; // Keep only last 10 activities

    // Create updated user with activity added
    const updatedUser = {
      ...user,
      recentActivity: updatedRecentActivity
    };
    
    // Update users array
    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    
    // Also update currentUser if it's the same user
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({
        ...currentUser,
        recentActivity: updatedRecentActivity
      });
    }
  };
  
  // Handle all notifications and activities for loan application status change
  const handleApplicationStatusChange = (application: Application, newStatus: string) => {
    // Map status to user-friendly display names
    const statusDisplay: Record<string, string> = {
      submitted: "Application Submitted",
      pending: "Application Pending",
      in_review: "Application Under Review",
      approved: "Application Approved",
      rejected: "Application Rejected",
      funded: "Funds Disbursed"
    };

    const notificationTitle = statusDisplay[newStatus] || `Application Status: ${newStatus}`;
    let notificationMessage = "";

    switch(newStatus) {
      case "approved":
        notificationMessage = "Congratulations! Your loan application has been approved.";
        break;
      case "rejected":
        notificationMessage = "We regret to inform you that your loan application was not approved.";
        break;
      case "in_review":
        notificationMessage = "Your application is now being reviewed by our team.";
        break;
      case "funded":
        notificationMessage = `Funds of $${application.amount?.toString()} have been disbursed to your account.`;
        break;
      default:
        notificationMessage = `Your application status has been updated to ${newStatus}.`;
    }

    // Add notification
    const newNotification = {
      id: uuidv4(),
      userId: application.userId,
      title: notificationTitle,
      message: notificationMessage,
      type: "application_update",
      date: new Date().toISOString(),
      read: false
    };
    
    addNotification(newNotification);

    // Add activity
    addUserActivity(application.userId, {
      id: uuidv4(),
      userId: application.userId,
      title: notificationTitle,
      description: notificationMessage,
      type: "loan_update",
      amount: typeof application.amount === 'number' ? application.amount : 0,
      date: new Date().toISOString()
    });
  };
  
  // Contract management functions
  const addContract = async (contract: Contract): Promise<boolean> => {
    try {
      const response = await api.createContract(contract);
      
      if (response.success && response.data) {
        setContracts(prevContracts => [...prevContracts, response.data as Contract]);
        return true;
      } else {
        toast.error(`Failed to add contract: ${response.error}`);
        return false;
      }
    } catch (error) {
      console.error("Error adding contract:", error);
      return false;
    }
  };
  
  const updateContract = async (id: string, data: Partial<Contract>): Promise<boolean> => {
    try {
      const response = await api.updateContract(id, data);
      
      if (response.success && response.data) {
        setContracts(prevContracts => prevContracts.map(contract => 
          contract.id === id ? { ...contract, ...response.data } as Contract : contract
        ));
        return true;
      } else {
        toast.error(`Failed to update contract: ${response.error}`);
        return false;
      }
    } catch (error) {
      console.error("Error updating contract:", error);
      return false;
    }
  };
  
  const getContractById = (id: string) => contracts.find(contract => contract.id === id);
  
  const getContractsByUserId = (userId: string) => contracts.filter(contract => contract.userId === userId);
  
  const getContractsByLoanId = (loanId: string) => contracts.filter(contract => contract.loanId === loanId);
  
  const generateContract = async (loanId: string): Promise<Contract | null> => {
    try {
      const loan = loans.find(loan => loan.id === loanId);
      if (!loan) {
        toast.error("Loan not found");
        return null;
      }
      
      const user = users.find(user => user.id === loan.userId);
      if (!user) {
        toast.error("User not found");
        return null;
      }
      
      // Call API to generate the contract
      const response = await api.generateLoanContract(loanId);
      
      if (!response.success || !response.data) {
        toast.error(`Failed to generate contract: ${response.error || "Unknown error"}`);
        return null;
      }
      
      // Create a document for the contract
      const contractDocument: Document = {
        id: generateId(),
        userId: loan.userId,
        name: `Loan Agreement - ${loan.id}`,
        type: 'loan_contract',
        dateUploaded: new Date().toISOString(),
        verificationStatus: 'verified',
        fileType: 'application/pdf',
        filePath: response.data.downloadUrl,
        notes: 'Automatically generated loan contract'
      };
      
      const documentAdded = await addDocument(contractDocument);
      
      if (!documentAdded) {
        toast.error("Failed to save contract document");
        return null;
      }
      
      // Create the contract record
      const newContract: Contract = {
        id: response.data.contractId,
        loanId: loanId,
        userId: loan.userId,
        documentId: contractDocument.id,
        status: 'draft',
        dateCreated: new Date().toISOString(),
        downloadUrl: response.data.downloadUrl
      };
      
      const contractAdded = await addContract(newContract);
      
      if (!contractAdded) {
        toast.error("Failed to save contract record");
        return null;
      }
      
      toast.success("Loan contract generated successfully");
      return newContract;
    } catch (error) {
      console.error("Error generating contract:", error);
      toast.error("An error occurred while generating the contract");
      return null;
    }
  };
  
  const sendContractForSignature = async (contractId: string, recipientEmail: string): Promise<boolean> => {
    try {
      const contract = contracts.find(c => c.id === contractId);
      if (!contract) {
        toast.error("Contract not found");
        return false;
      }
      
      // Call API to send the contract for signature
      const response = await api.sendContractForSignature(contractId, recipientEmail);
      
      if (!response.success || !response.data) {
        toast.error(`Failed to send contract: ${response.error || "Unknown error"}`);
        return false;
      }
      
      // Update the contract record
      const updated = await updateContract(contractId, {
        status: 'sent',
        dateSent: new Date().toISOString(),
        signatureRequestId: response.data.signatureRequestId,
        signatureUrl: response.data.signatureUrl
      });
      
      if (updated) {
        toast.success("Contract sent for signature");
        
        // Add a notification for the user
        const user = users.find(u => u.id === contract.userId);
        if (user) {
          addNotification({
            id: generateId(),
            userId: user.id,
            title: 'Loan Contract Ready for Signature',
            message: 'Your loan contract is ready for electronic signature. Please check your email.',
            type: 'document',
            date: new Date().toISOString(),
            read: false
          });
        }
        
        return true;
      } else {
        toast.error("Failed to update contract status");
        return false;
      }
    } catch (error) {
      console.error("Error sending contract for signature:", error);
      toast.error("An error occurred while sending the contract");
      return false;
    }
  };
  
  // Context value
  const value: AppDataContextType = {
    users,
    loans,
    documents,
    applications,
    contracts,
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
    viewDocument,
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
    addContract,
    updateContract,
    getContractById,
    getContractsByUserId,
    getContractsByLoanId,
    generateContract,
    sendContractForSignature,
    addUserActivity
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
  // Generate mock users
  const mockUsers: User[] = Array(15).fill(null).map((_, index) => ({
    id: `user-${index + 1}`,
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    email: `user${index + 1}@example.com`,
    phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    address: `${Math.floor(Math.random() * 9000) + 1000} ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}, ${states[Math.floor(Math.random() * states.length)]} ${Math.floor(Math.random() * 90000) + 10000}`,
    dateOfBirth: `${1950 + Math.floor(Math.random() * 40)}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
    ssn: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`,
    password: 'password123',
    role: index === 0 ? 'admin' : 'user',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
    activities: [],
    notifications: [],
    profileCompletionPercentage: Math.floor(Math.random() * 100),
    documents: []
  }));

  // Generate mock loans
  const mockLoans: Loan[] = [];
  
  // Loan purposes
  const loanPurposes = [
    "Home Improvement", 
    "Debt Consolidation", 
    "Education", 
    "Medical Expenses", 
    "Business", 
    "Vehicle Purchase", 
    "Wedding", 
    "Travel", 
    "Emergency"
  ];
  
  // Loan types
  const loanTypes = [
    "Personal Loan", 
    "Business Loan", 
    "Student Loan", 
    "Short-term Loan", 
    "Line of Credit"
  ];
  
  // Generate 20 loans
  for (let i = 0; i < 20; i++) {
    const userId = mockUsers[Math.floor(Math.random() * mockUsers.length)].id;
    const amount = Math.floor(Math.random() * 100000) + 5000; // Random amount between 5,000 and 105,000
    const interestRate = (Math.random() * 20) + 5; // Random interest rate between 5% and 25%
    const term = [6, 12, 24, 36, 48, 60][Math.floor(Math.random() * 6)]; // Random term in months
    
    // Calculate monthly payment (simplified)
    const monthlyInterestRate = interestRate / 1200; // Convert annual rate to monthly decimal
    const monthlyPayment = amount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, term)) / (Math.pow(1 + monthlyInterestRate, term) - 1);
    
    // Total repayment
    const totalRepayment = monthlyPayment * term;
    
    // Random status
    const statusOptions: ('active' | 'pending' | 'completed' | 'rejected' | 'approved')[] = ['active', 'pending', 'completed', 'rejected', 'approved'];
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    // Random dates
    const dateApplied = new Date();
    dateApplied.setDate(dateApplied.getDate() - Math.floor(Math.random() * 180)); // Random date within last 180 days
    
    const dateIssued = new Date(dateApplied);
    if (status !== 'pending' && status !== 'rejected') {
      dateIssued.setDate(dateIssued.getDate() + Math.floor(Math.random() * 14) + 1); // 1-14 days after application
    }
    
    // For active loans, calculate payments made
    let paidMonths = 0;
    let paidAmount = 0;
    let nextPaymentDue = null;
    
    if (status === 'active') {
      paidMonths = Math.floor(Math.random() * term);
      paidAmount = Math.round(paidMonths * monthlyPayment);
      
      const nextPaymentDate = new Date();
      nextPaymentDate.setDate(nextPaymentDate.getDate() + Math.floor(Math.random() * 30)); // Next payment in 0-30 days
      nextPaymentDue = nextPaymentDate.toISOString().split('T')[0];
    } else if (status === 'completed') {
      paidMonths = term;
      paidAmount = Math.round(totalRepayment);
    }
    
    // Generate loan object
    mockLoans.push({
      id: `loan-${i + 1}`,
      userId,
      type: loanTypes[Math.floor(Math.random() * loanTypes.length)],
      purpose: loanPurposes[Math.floor(Math.random() * loanPurposes.length)],
      amount,
      interestRate: parseFloat(interestRate.toFixed(2)),
      term,
      monthlyPayment: Math.round(monthlyPayment),
      totalRepayment: Math.round(totalRepayment),
      status,
      dateApplied: dateApplied.toISOString().split('T')[0],
      dateIssued: status !== 'pending' && status !== 'rejected' ? dateIssued.toISOString().split('T')[0] : undefined,
      paidAmount: status !== 'pending' && status !== 'rejected' ? paidAmount : undefined,
      paidMonths: status !== 'pending' && status !== 'rejected' ? paidMonths : undefined,
      remainingPayments: status === 'active' ? term - paidMonths : undefined,
      nextPaymentDue: status === 'active' ? nextPaymentDue : undefined,
      nextPaymentAmount: status === 'active' ? Math.round(monthlyPayment) : undefined,
      collateral: Math.random() > 0.7, // 30% chance of having collateral
      collateralType: Math.random() > 0.7 ? ['Vehicle', 'Property', 'Investment', 'Other'][Math.floor(Math.random() * 4)] : undefined,
      collateralValue: Math.random() > 0.7 ? Math.round(amount * (1 + Math.random())) : undefined, // Collateral value slightly higher than loan
      notes: Math.random() > 0.8 ? "Customer has good payment history." : undefined
    });
  }

  // Sample documents
  const sampleDocuments: Document[] = [
    {
      id: "DOC-001",
      userId: "USR-001",
      name: "ID Document.pdf",
      type: "id",
      dateUploaded: "2023-03-10T08:30:00Z",
      verificationStatus: "verified",
      fileSize: "1.2 MB",
      fileType: "application/pdf",
      filePath: "/documents/id_document.pdf",
      notes: "Identity document verified successfully"
    },
    {
      id: "DOC-002",
      userId: "USR-001",
      name: "Proof of Residence.jpg",
      type: "proof_of_residence",
      dateUploaded: "2023-03-12T10:15:00Z",
      verificationStatus: "verified",
      fileSize: "0.8 MB",
      fileType: "image/jpeg",
      filePath: "/documents/placeholder.svg",
      notes: "Utility bill less than 3 months old"
    },
    {
      id: "DOC-003",
      userId: "USR-001",
      name: "Bank Statement.pdf",
      type: "bank_statement",
      dateUploaded: "2023-03-15T14:45:00Z",
      verificationStatus: "pending",
      fileSize: "2.1 MB",
      fileType: "application/pdf",
      filePath: "/documents/bank_statement.pdf"
    },
    {
      id: "DOC-004",
      userId: "USR-001",
      name: "Payslip.pdf",
      type: "payslip",
      dateUploaded: "2023-04-05T09:20:00Z", 
      verificationStatus: "pending",
      fileSize: "0.5 MB",
      fileType: "application/pdf",
      filePath: "/documents/id_document.pdf"
    },
    {
      id: "DOC-005",
      userId: "USR-001",
      name: "Employment Contract.docx",
      type: "other",
      dateUploaded: "2023-04-10T11:30:00Z",
      verificationStatus: "rejected",
      fileSize: "1.5 MB",
      fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      filePath: "/documents/placeholder.svg",
      notes: "Document is expired. Please upload a current version."
    }
  ];

  // Update user documents reference
  mockUsers[0].documents = sampleDocuments.filter(doc => doc.userId === mockUsers[0].id);

  return { 
    users: mockUsers, 
    loans: mockLoans, 
    documents: sampleDocuments, 
    applications: [] 
  };
};

// Load mock data for development
const loadMockData = () => {
  // Generate some mock users
  const mockUsers = [
    // ... existing mock users
  ];
  
  // Generate some mock documents
  const mockDocuments = [
    // ... existing mock documents
  ];
  
  // Generate some mock loans
  const mockLoans = [
    // ... existing mock loans
  ];
  
  // Generate some mock notifications
  const mockNotifications = [
    // ... existing mock notifications
  ];
  
  // Generate some mock applications
  const mockApplications: Application[] = [
    {
      id: "app123456",
      userId: "USR-pcvowfdd7",
      status: "pending",
      date: "2023-04-01",
      amount: "R15,000",
      completion: 60,
      loanDetails: {
        purpose: "Personal Loan",
        term: 24,
        monthlyPayment: "R750",
        interestRate: 15.5
      },
      requiredAction: "Please upload your latest bank statement to continue processing."
    },
    {
      id: "app789012",
      userId: "USR-pcvowfdd7",
      status: "in_review",
      date: "2023-04-15",
      amount: "R25,000",
      completion: 85,
      loanDetails: {
        purpose: "Home Improvement",
        term: 36,
        monthlyPayment: "R950",
        interestRate: 12.5
      }
    }
  ];
  
  // Set the mock data in state
  setAppData(prev => ({
    ...prev,
    users: mockUsers,
    documents: mockDocuments,
    loans: mockLoans,
    notifications: mockNotifications,
    applications: mockApplications,
    currentUser: mockUsers[0]  // Auto-login the first user for development
  }));
}; 