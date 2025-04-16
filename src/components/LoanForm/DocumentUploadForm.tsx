import React, { useState, useEffect } from 'react';
import { useFormContext } from '@/utils/formContext';
import { toast } from "sonner";
import { Upload, FileText, X, Check, Info, CircleCheck, AlertCircle } from 'lucide-react';

type FileStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: FileStatus;
  progress: number;
  category: string;
}

// Required document types with their descriptions
const requiredDocuments = [
  { 
    id: 'id', 
    name: 'Identification Document', 
    description: 'Valid South African ID, passport, or driver\'s license',
    required: true,
    accepted: ".pdf,.jpg,.jpeg,.png"
  },
  { 
    id: 'selfieWithID', 
    name: 'Selfie with ID', 
    description: 'Selfie holding the ID document',
    required: true,
    accepted: ".jpg,.jpeg,.png"
  },
  { 
    id: 'proofOfIncome', 
    name: 'Proof of Income', 
    description: 'Latest 3 months\' payslips (employment letters not accepted)',
    required: true,
    accepted: ".pdf,.jpg,.jpeg,.png,.doc,.docx"
  },
  { 
    id: 'bankStatements', 
    name: 'Bank Statements', 
    description: 'Latest 3 months of bank statements',
    required: true,
    accepted: ".pdf,.csv,.xls,.xlsx"
  },
  { 
    id: 'proofOfAddress', 
    name: 'Proof of Address', 
    description: 'Utility bill, lease agreement, or rates and taxes invoice (not older than 3 months)',
    required: true,
    accepted: ".pdf,.jpg,.jpeg,.png"
  },
  { 
    id: 'employmentVerification', 
    name: 'Employment Verification Document', 
    description: 'Letter from employer confirming employment details',
    required: false,
    accepted: ".pdf,.jpg,.jpeg,.png,.doc,.docx"
  }
];

const DocumentUploadForm: React.FC = () => {
  const { updateFormData, prevStep, nextStep } = useFormContext();
  const [files, setFiles] = useState<Record<string, UploadFile[]>>({
    id: [],
    selfieWithID: [],
    proofOfIncome: [],
    bankStatements: [],
    proofOfAddress: [],
    employmentVerification: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Update progress when files change
  useEffect(() => {
    updateUploadProgress();
  }, [files]);
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    if (e.target.files) {
      handleFiles(e.target.files, category);
    }
  };
  
  const handleFiles = (fileList: FileList, category: string) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'idle' as FileStatus,
      progress: 0,
      category
    }));
    
    setFiles(prev => ({
      ...prev,
      [category]: [...prev[category], ...newFiles]
    }));
    
    // Simulate upload for each file
    newFiles.forEach(file => simulateUpload(file, category));
  };
  
  const simulateUpload = (file: UploadFile, category: string) => {
    setFiles(prev => ({
      ...prev,
      [category]: prev[category].map(f => 
        f.id === file.id ? { ...f, status: 'uploading' } : f
      )
    }));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      
      if (progress >= 100) {
        clearInterval(interval);
        progress = 100;
        
        // Randomly succeed or fail for demo purposes (higher success rate)
        const success = Math.random() > 0.1;
        
        setFiles(prev => ({
          ...prev,
          [category]: prev[category].map(f => 
            f.id === file.id 
              ? { ...f, progress, status: success ? 'success' : 'error' } 
              : f
          )
        }));
        
        if (success) {
          toast.success(`${file.name} uploaded successfully!`);
        } else {
          toast.error(`Failed to upload ${file.name}. Please try again.`);
        }
      } else {
        setFiles(prev => ({
          ...prev,
          [category]: prev[category].map(f => 
            f.id === file.id ? { ...f, progress } : f
          )
        }));
      }
    }, 200);
  };
  
  const removeFile = (id: string, category: string) => {
    setFiles(prev => ({
      ...prev,
      [category]: prev[category].filter(f => f.id !== id)
    }));
    toast.info("File removed");
  };
  
  const retryUpload = (file: UploadFile, category: string) => {
    simulateUpload({
      ...file,
      status: 'idle',
      progress: 0,
    }, category);
  };
  
  const updateUploadProgress = () => {
    const requiredDocsCount = requiredDocuments.filter(doc => doc.required).length;
    const uploadedDocsCount = requiredDocuments
      .filter(doc => doc.required)
      .filter(doc => hasSuccessfulUpload(doc.id))
      .length;
    
    setProgress((uploadedDocsCount / requiredDocsCount) * 100);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all required documents have been uploaded
    const missingRequiredDocs = requiredDocuments
      .filter(doc => doc.required)
      .filter(doc => !hasSuccessfulUpload(doc.id));
    
    if (missingRequiredDocs.length > 0) {
      toast.error(`Please upload the following required documents: ${missingRequiredDocs.map(d => d.name).join(', ')}`);
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare uploaded document data
    const uploadedDocs = Object.entries(files).reduce((acc, [category, fileList]) => {
      acc[category] = fileList
        .filter(file => file.status === 'success')
        .map(file => ({
          id: file.id,
          name: file.name, 
          size: file.size,
          type: file.type
        }));
      return acc;
    }, {} as Record<string, any>);
    
    // Update form data
    updateFormData({ 
      documentsUploaded: true,
      uploadedDocuments: uploadedDocs
    });
    
    setTimeout(() => {
      setIsSubmitting(false);
      nextStep();
    }, 1000);
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Check if a category has at least one successfully uploaded file
  const hasSuccessfulUpload = (category: string) => {
    return files[category].some(file => file.status === 'success');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <h2 className="heading-md mb-2">Document Upload</h2>
        <p className="text-foreground/70 mb-4">
          Please upload the required documents to support your loan application.
        </p>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Upload progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          {requiredDocuments.map((doc) => (
            <div key={doc.id} className="border border-border rounded-lg overflow-hidden">
              <div className="p-3 bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <FileText className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate text-sm">
                      {doc.name}
                      {doc.required && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Required</span>
                      )}
                    </h3>
                    <p className="text-xs text-foreground/70 truncate">{doc.description}</p>
                  </div>
                </div>
                <div className="flex items-center flex-shrink-0 ml-2">
                  {hasSuccessfulUpload(doc.id) ? (
                    <CircleCheck className="h-5 w-5 text-green-500" />
                  ) : files[doc.id].length === 0 ? (
                    <label className={`${doc.required ? 'btn-primary' : 'btn-secondary'} text-xs cursor-pointer px-2 py-1 flex items-center rounded`}>
                      <Upload className="h-3 w-3 mr-1" />
                      <span>Upload</span>
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        onChange={(e) => handleFileInput(e, doc.id)}
                        accept={doc.accepted}
                      />
                    </label>
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  )}
                </div>
              </div>
              
              {files[doc.id].length > 0 ? (
                <div className="px-3 py-2 bg-secondary/10 border-t border-border">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {files[doc.id].map(file => (
                      <div key={file.id} className="flex items-center bg-white/40 rounded px-2 py-1 text-xs border border-border relative">
                        <FileText className="h-3 w-3 text-primary mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[140px]" title={`${file.name} (${formatFileSize(file.size)})`}>{file.name}</span>
                        <div className="flex items-center ml-2">
                          {file.status === 'success' && (
                            <Check className="h-3 w-3 text-green-500 ml-1" />
                          )}
                          
                          {file.status === 'error' && (
                            <button 
                              onClick={() => retryUpload(file, doc.id)}
                              className="text-primary ml-1 p-0.5 hover:bg-secondary/50 rounded"
                              title="Retry upload"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 2v6h-6"></path>
                                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                                <path d="M3 22v-6h6"></path>
                                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                              </svg>
                            </button>
                          )}
                          
                          <button 
                            onClick={() => removeFile(file.id, doc.id)}
                            className="text-foreground/50 hover:text-destructive p-0.5 hover:bg-secondary/50 rounded transition-colors ml-1"
                            title="Remove file"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        
                        {file.status === 'uploading' && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary/50">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <label className="btn-secondary text-xs cursor-pointer px-2 py-1 flex items-center rounded">
                      <Upload className="h-3 w-3 mr-1" />
                      <span>Add</span>
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        onChange={(e) => handleFileInput(e, doc.id)}
                        accept={doc.accepted}
                      />
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-foreground/70 flex items-start">
          <Info className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
          <p>
            Files should be clear, legible and not exceed 10MB in size.
          </p>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <button 
          type="button" 
          className="btn-secondary min-w-[150px]"
          onClick={prevStep}
        >
          Back
        </button>
        <button 
          type="submit" 
          className="btn-primary min-w-[180px] relative"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="opacity-0">Continue</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            </>
          ) : (
            progress < 100 ? "Continue" : "Review Application"
          )}
        </button>
      </div>
    </form>
  );
};

export default DocumentUploadForm;
