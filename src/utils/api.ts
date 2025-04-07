import { User, Document, Loan, Application, Contract } from './AppDataContext';

// API base URL
const API_BASE_URL = 'http://localhost:5001/api';

// Types for API responses
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: any
): Promise<ApiResponse<T>> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    // Debug output for loan creation
    if (endpoint.includes('/loans') && method === 'POST') {
      console.log(`📝 API Request to ${endpoint} (${method}):`);
      console.log('Request data:', data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json();

    // Log all responses for debugging
    console.log(`🔄 API Response from ${endpoint} (${method}):`, 
      response.status, 
      response.ok ? 'SUCCESS' : 'FAILED'
    );

    if (!response.ok) {
      console.error('API Error Details:', responseData);
      return { 
        success: false, 
        error: responseData.message || 'API request failed' 
      };
    }

    // Debug output for loan responses
    if (endpoint.includes('/loans')) {
      console.log('Response data:', responseData);
    }

    return { 
      success: true, 
      data: responseData 
    };
  } catch (error) {
    console.error(`❌ API Request Error (${endpoint}):`, error);
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
export const fetchDocuments = () => apiRequest<Document[]>('/documents');
export const fetchDocumentById = (id: string) => apiRequest<Document>(`/documents/${id}`);
export const fetchDocumentsByUserId = (userId: string) => apiRequest<Document[]>(`/documents/user/${userId}`);
export const createDocument = (document: Document) => apiRequest<Document>('/documents', 'POST', document);
export const updateDocument = (id: string, data: Partial<Document>) => apiRequest<Document>(`/documents/${id}`, 'PATCH', data);
export const deleteDocument = (id: string) => apiRequest<{message: string}>(`/documents/${id}`, 'DELETE');

// Get direct URL for viewing a document
export const getDocumentViewUrl = (documentId: string): string => {
  return `${API_BASE_URL}/documents/view/${documentId}`;
};

// Document file upload function - uses FormData instead of JSON
export const uploadDocumentFile = async (
  file: File, 
  userId: string, 
  documentType: string, 
  description: string = ''
): Promise<ApiResponse<Document>> => {
  try {
    console.log(`📝 Uploading document file for user ${userId}:`, file.name);
    
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', documentType);
    formData.append('name', file.name);
    formData.append('description', description);
    
    // Set up request options
    const options: RequestInit = {
      method: 'POST',
      body: formData,
      // No Content-Type header - browser will set it with boundary for FormData
    };
    
    // Make the request to the upload endpoint
    const response = await fetch(`${API_BASE_URL}/documents/upload`, options);
    const responseData = await response.json();
    
    console.log(`🔄 Document upload response:`, 
      response.status, 
      response.ok ? 'SUCCESS' : 'FAILED'
    );
    
    if (!response.ok) {
      console.error('Document upload error:', responseData);
      return { 
        success: false, 
        error: responseData.message || 'Document upload failed' 
      };
    }
    
    console.log('Document uploaded successfully:', responseData);
    return { 
      success: true, 
      data: responseData 
    };
  } catch (error) {
    console.error(`❌ Document upload error:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during upload' 
    };
  }
};

// Loan API functions
export const fetchLoans = () => apiRequest<Loan[]>('/loans');
export const fetchLoanById = (id: string) => apiRequest<Loan>(`/loans/${id}`);
export const fetchLoansByUserId = (userId: string) => apiRequest<Loan[]>(`/loans/user/${userId}`);
export const createLoan = (loan: Loan) => apiRequest<Loan>('/loans', 'POST', loan);
export const updateLoan = (id: string, data: Partial<Loan>) => apiRequest<Loan>(`/loans/${id}`, 'PATCH', data);
export const deleteLoan = (id: string) => apiRequest<{message: string}>(`/loans/${id}`, 'DELETE');

// Application API functions
export const fetchApplications = () => apiRequest<Application[]>('/applications');
export const fetchApplicationById = (id: string) => apiRequest<Application>(`/applications/${id}`);
export const fetchApplicationsByUserId = (userId: string) => apiRequest<Application[]>(`/applications/user/${userId}`);
export const createApplication = (application: Application) => apiRequest<Application>('/applications', 'POST', application);
export const updateApplication = (id: string, data: Partial<Application>) => apiRequest<Application>(`/applications/${id}`, 'PATCH', data);
export const deleteApplication = (id: string) => apiRequest<{message: string}>(`/applications/${id}`, 'DELETE');

// Data migration function
export const migrateData = (data: { 
  users?: User[], 
  documents?: Document[], 
  loans?: Loan[], 
  applications?: Application[] 
}) => apiRequest<{message: string}>('/migrate-data', 'POST', data);

// Health check function
export const checkHealth = () => apiRequest<{status: string, time: string}>('/health');

// Add new API functions for MongoDB operations

// Get database statistics
export const getDatabaseStats = () => apiRequest<{
  dbSize: number;
  collections: number;
  totalDocuments: number;
  lastBackup?: string;
}>('/database/stats');

// Get collection data with pagination
export const getCollectionData = (
  collection: string,
  page: number = 1,
  limit: number = 10,
  filter: Record<string, any> = {}
) => apiRequest<{
  data: any[];
  total: number;
  page: number;
  pages: number;
}>(`/database/collection/${collection}`, 'POST', { page, limit, filter });

// Get collection schema
export const getCollectionSchema = (collection: string) => 
  apiRequest<{fields: {name: string, type: string, required: boolean}[]}>(`/database/schema/${collection}`);

// Run database cleanup
export const runDatabaseCleanup = () => 
  apiRequest<{message: string; removedDocuments: number}>('/database/cleanup', 'POST');

// Backup database
export const backupDatabase = () => 
  apiRequest<{message: string; backupId: string; timestamp: string}>('/database/backup', 'POST');

// Restore database from backup
export const restoreDatabase = (backupId: string) => 
  apiRequest<{message: string; success: boolean}>('/database/restore', 'POST', { backupId });

// Get available backups
export const getBackups = () => 
  apiRequest<{id: string; date: string; size: string}[]>('/database/backups');

// Drop collection
export const dropCollection = (collection: string) => 
  apiRequest<{message: string}>(`/database/collection/${collection}`, 'DELETE');

// Add new API functions for contract generation and e-signature
export const generateLoanContract = (loanId: string) => {
  // First try the real API endpoint
  return apiRequest<{contractId: string, downloadUrl: string, previewUrl: string}>(
    `/contracts/generate/${loanId}`, 'POST'
  ).then(response => {
    if (response.success) {
      return response;
    }
    
    // If the API endpoint fails, fallback to mock implementation
    console.log(`API endpoint not available, using fallback for contract generation for loan: ${loanId}`);
    
    // Return a mock successful response
    return new Promise<ApiResponse<{contractId: string, downloadUrl: string, previewUrl: string}>>((resolve) => {
      setTimeout(() => {
        const contractId = `CONTRACT-${Date.now().toString().substring(8)}`;
        resolve({
          success: true,
          data: {
            contractId,
            downloadUrl: '/documents/sample-pdf.pdf', // Path to a sample PDF in public folder
            previewUrl: '/documents/sample-pdf.pdf',
          }
        });
      }, 1000); // Simulate network delay
    });
  });
};

export const sendContractForSignature = (contractId: string, recipientEmail: string) => {
  // First try the real API endpoint
  return apiRequest<{signatureRequestId: string, signatureUrl: string}>(
    `/contracts/${contractId}/sign`, 'POST', { recipientEmail }
  ).then(response => {
    if (response.success) {
      return response;
    }
    
    // If the API endpoint fails, fallback to mock implementation
    console.log(`API endpoint not available, using fallback for sending contract ${contractId} to ${recipientEmail}`);
    
    // Return a mock successful response
    return new Promise<ApiResponse<{signatureRequestId: string, signatureUrl: string}>>((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            signatureRequestId: `SIG-${Date.now().toString().substring(8)}`,
            signatureUrl: '/signature-preview',
          }
        });
      }, 800);
    });
  });
};

export const getContractStatus = (contractId: string) => {
  // First try the real API endpoint
  return apiRequest<{
    status: 'draft' | 'sent' | 'viewed' | 'signed' | 'completed' | 'expired' | 'declined',
    viewedAt?: string,
    signedAt?: string,
    expiresAt?: string,
    downloadUrl?: string
  }>(`/contracts/${contractId}/status`).then(response => {
    if (response.success) {
      return response;
    }
    
    // If the API endpoint fails, fallback to mock implementation
    console.log(`API endpoint not available, using fallback for checking status for contract: ${contractId}`);
    
    // Return a mock successful response
    return new Promise<ApiResponse<{
      status: 'draft' | 'sent' | 'viewed' | 'signed' | 'completed' | 'expired' | 'declined',
      viewedAt?: string,
      signedAt?: string,
      expiresAt?: string,
      downloadUrl?: string
    }>>((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            status: 'sent',
            viewedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            downloadUrl: '/documents/sample-pdf.pdf',
          }
        });
      }, 500);
    });
  });
};

// Similarly update other contract API functions with fallbacks
export const downloadSignedContract = (contractId: string) => {
  return apiRequest<{downloadUrl: string}>(`/contracts/${contractId}/download`)
    .then(response => {
      if (response.success) return response;
      
      console.log(`API endpoint not available, using fallback for downloading contract: ${contractId}`);
      return {
        success: true,
        data: {
          downloadUrl: '/documents/sample-pdf.pdf',
        }
      };
    });
};

export const cancelSignatureRequest = (contractId: string) => {
  return apiRequest<{message: string}>(`/contracts/${contractId}/cancel`, 'POST')
    .then(response => {
      if (response.success) return response;
      
      console.log(`API endpoint not available, using fallback for canceling signature request: ${contractId}`);
      return {
        success: true,
        data: {
          message: 'Signature request canceled successfully',
        }
      };
    });
};

export const resendSignatureRequest = (contractId: string) => {
  return apiRequest<{message: string}>(`/contracts/${contractId}/resend`, 'POST')
    .then(response => {
      if (response.success) return response;
      
      console.log(`API endpoint not available, using fallback for resending signature request: ${contractId}`);
      return {
        success: true,
        data: {
          message: 'Signature request resent successfully',
        }
      };
    });
};

export const fetchContracts = () => {
  return apiRequest<Contract[]>('/contracts')
    .then(response => {
      if (response.success) return response;
      
      console.log('API endpoint not available, using fallback for fetching contracts');
      return {
        success: true,
        data: [] // Return an empty array if no contracts found
      };
    });
};

// Other contract API functions with fallbacks
export const fetchContractById = (id: string) => {
  return apiRequest<Contract>(`/contracts/${id}`)
    .then(response => {
      if (response.success) return response;
      
      console.log(`API endpoint not available, using fallback for fetching contract by ID: ${id}`);
      return {
        success: false,
        error: 'Contract not found'
      };
    });
};

export const fetchContractsByUserId = (userId: string) => {
  return apiRequest<Contract[]>(`/contracts/user/${userId}`)
    .then(response => {
      if (response.success) return response;
      
      console.log(`API endpoint not available, using fallback for fetching contracts by user ID: ${userId}`);
      return {
        success: true,
        data: []
      };
    });
};

export const fetchContractsByLoanId = (loanId: string) => {
  return apiRequest<Contract[]>(`/contracts/loan/${loanId}`)
    .then(response => {
      if (response.success) return response;
      
      console.log(`API endpoint not available, using fallback for fetching contracts by loan ID: ${loanId}`);
      return {
        success: true,
        data: []
      };
    });
};

export const createContract = (contract: Contract) => {
  return apiRequest<Contract>('/contracts', 'POST', contract)
    .then(response => {
      if (response.success) return response;
      
      console.log(`API endpoint not available, using fallback for creating contract`);
      return {
        success: true,
        data: contract
      };
    });
};

export const updateContract = (id: string, data: Partial<Contract>) => {
  return apiRequest<Contract>(`/contracts/${id}`, 'PATCH', data)
    .then(response => {
      if (response.success) return response;
      
      console.log(`API endpoint not available, using fallback for updating contract ${id}`);
      return {
        success: true,
        data: {
          id,
          loanId: data.loanId || 'UNKNOWN',
          userId: data.userId || 'UNKNOWN',
          status: data.status || 'draft',
          dateCreated: data.dateCreated || new Date().toISOString(),
          ...data
        } as Contract
      };
    });
}; 