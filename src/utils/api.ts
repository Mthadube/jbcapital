import { User, Document, Loan, Application } from './AppDataContext';

// API base URL
const API_BASE_URL = 'http://localhost:5001/api';

// Types for API responses
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Generic API request function with optional headers
const apiRequest = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: any,
  additionalHeaders?: Record<string, string>
): Promise<ApiResponse<T>> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...additionalHeaders
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: responseData.message || 'API request failed' 
      };
    }

    return { 
      success: true, 
      data: responseData 
    };
  } catch (error) {
    console.error('API request error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// User API functions
export const fetchUsers = () => apiRequest<User[]>('/users');
export const fetchUserById = (id: string) => apiRequest<User>(`/users/${id}`);
export const fetchUserByEmail = (email: string) => apiRequest<User>(`/users/email/${email}`);
export const createUser = (user: User) => apiRequest<User>('/users', 'POST', user);
export const updateUser = (id: string, data: Partial<User>) => apiRequest<User>(`/users/${id}`, 'PATCH', data);
export const deleteUser = (id: string) => apiRequest<{message: string}>(`/users/${id}`, 'DELETE');

// Document API functions
export const fetchDocuments = () => apiRequestWithAuth<Document[]>('/documents');
export const fetchDocumentById = (id: string) => apiRequestWithAuth<Document>(`/documents/${id}`);
export const fetchDocumentsByUserId = (userId: string) => apiRequestWithAuth<Document[]>(`/documents/user/${userId}`);
export const createDocument = (document: Document) => apiRequestWithAuth<Document>('/documents', 'POST', document);
export const updateDocument = (id: string, data: Partial<Document>) => apiRequestWithAuth<Document>(`/documents/${id}`, 'PATCH', data);
export const deleteDocument = (id: string) => apiRequestWithAuth<{message: string}>(`/documents/${id}`, 'DELETE');

// Loan API functions
export const fetchLoans = () => apiRequestWithAuth<Loan[]>('/loans');
export const fetchLoanById = (id: string) => apiRequestWithAuth<Loan>(`/loans/${id}`);
export const fetchLoansByUserId = (userId: string) => apiRequestWithAuth<Loan[]>(`/loans/user/${userId}`);
export const createLoan = (loan: Loan) => apiRequestWithAuth<Loan>('/loans', 'POST', loan);
export const updateLoan = (id: string, data: Partial<Loan>) => apiRequestWithAuth<Loan>(`/loans/${id}`, 'PATCH', data);
export const deleteLoan = (id: string) => apiRequestWithAuth<{message: string}>(`/loans/${id}`, 'DELETE');

// Application API functions
export const fetchApplications = () => apiRequestWithAuth<Application[]>('/applications');
export const fetchApplicationById = (id: string) => apiRequestWithAuth<Application>(`/applications/${id}`);
export const fetchApplicationsByUserId = (userId: string) => apiRequestWithAuth<Application[]>(`/applications/user/${userId}`);
export const createApplication = (application: Application) => apiRequestWithAuth<Application>('/applications', 'POST', application);
export const updateApplication = (id: string, data: Partial<Application>) => apiRequestWithAuth<Application>(`/applications/${id}`, 'PATCH', data);
export const deleteApplication = (id: string) => apiRequestWithAuth<{message: string}>(`/applications/${id}`, 'DELETE');

// Data migration function
export const migrateData = (data: { 
  users?: User[], 
  documents?: Document[], 
  loans?: Loan[], 
  applications?: Application[] 
}) => apiRequest<{message: string}>('/migrate-data', 'POST', data);

// Health check function
export const checkHealth = () => apiRequest<{status: string, time: string}>('/health');

// Login endpoint
export const login = async (email: string, password: string) => {
  return apiRequest<{token: string, user: any}>('/auth/login', 'POST', { email, password });
};

// Register endpoint
export const register = async (userData: {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string,
  idNumber: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  monthlyIncome: number
}) => {
  return apiRequest<{token: string, user: any}>('/auth/register', 'POST', userData);
};

// Validate token endpoint
export const validateToken = async (token: string) => {
  // For the hardcoded admin token, automatically return success
  if (token.endsWith('signature')) {
    // Mock successful response for admin token
    return { 
      success: true, 
      data: {
        id: "ADM-001",
        email: "admin@jbcapital.com",
        firstName: "Admin",
        lastName: "User",
        phone: "+27 71 234 5678",
        idNumber: "8506155012089",
        address: "123 Admin Street",
        city: "Johannesburg",
        state: "Gauteng",
        zipCode: "2196",
        monthlyIncome: 0,
        accountStatus: "active",
        registrationDate: "2023-01-01",
        profileCompletionPercentage: 100,
        role: "admin",
        documents: [],
        loans: []
      }
    };
  }
  
  // For real tokens from the server
  return apiRequest<any>('/auth/validate', 'POST', { token }, {
    Authorization: `Bearer ${token}`
  });
};

// Add authorization header to requests if token is available
export const apiRequestWithAuth = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: any
): Promise<ApiResponse<T>> => {
  const authToken = localStorage.getItem('authToken');
  let headers = {};
  
  if (authToken) {
    try {
      const tokenData = JSON.parse(authToken);
      headers = {
        'Authorization': `Bearer ${tokenData.token}`
      };
    } catch (e) {
      console.error('Error parsing auth token:', e);
      // If there's an error with the token, continue without auth
      // This will likely cause a 401 response, which is handled
    }
  } else {
    // For development: When no token exists, try to access the API anyway
    // In production, this would properly fail with 401 Unauthorized
    console.warn('No auth token found - request may fail with 401 Unauthorized');
  }
  
  return apiRequest(endpoint, method, data, headers);
}; 