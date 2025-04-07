
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from "sonner";
import { Upload, FileText, X, Check, Info } from 'lucide-react';

type FileStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: FileStatus;
  progress: number;
}

const DocumentUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  
  // Required document types
  const requiredDocuments = [
    { id: 'id', name: 'Identification', description: 'Government-issued ID, passport, or driver\'s license' },
    { id: 'income', name: 'Proof of Income', description: 'Recent pay stubs, W-2s, or tax returns' },
    { id: 'address', name: 'Proof of Address', description: 'Utility bill, bank statement, or lease agreement' },
    { id: 'employment', name: 'Employment Verification', description: 'Letter from employer or recent pay stubs' },
  ];
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'idle' as FileStatus,
      progress: 0,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload for each file
    newFiles.forEach(simulateUpload);
  };
  
  const simulateUpload = (file: UploadFile) => {
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'uploading' } : f));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      
      if (progress >= 100) {
        clearInterval(interval);
        progress = 100;
        
        // Randomly succeed or fail for demo purposes
        const success = Math.random() > 0.2;
        
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, progress, status: success ? 'success' : 'error' } 
            : f
        ));
        
        if (success) {
          toast.success(`${file.name} uploaded successfully!`);
        } else {
          toast.error(`Failed to upload ${file.name}. Please try again.`);
        }
      } else {
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress } : f
        ));
      }
    }, 200);
  };
  
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.info("File removed");
  };
  
  const retryUpload = (file: UploadFile) => {
    simulateUpload({
      ...file,
      status: 'idle',
      progress: 0,
    });
  };
  
  const getDragHandlers = (active: boolean = false) => ({
    className: `border-2 border-dashed rounded-lg p-6 transition-all duration-200 text-center ${
      active
        ? 'border-primary bg-primary/5'
        : 'border-border hover:border-primary/50 hover:bg-secondary/50'
    }`,
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
    onDragEnter: (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
    onDrop: handleDrop,
  });
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="flex-grow pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="chip mx-auto">Document Upload</div>
              <h1 className="heading-lg mt-4">Upload Your Documents</h1>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto mt-4">
                Please upload the required documents to support your loan application. All documents are securely stored and encrypted.
              </p>
            </div>
            
            <div className="glass-card p-6 mb-8">
              <h2 className="heading-md mb-4">Required Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {requiredDocuments.map(doc => (
                  <div key={doc.id} className="p-4 bg-secondary/30 rounded-lg flex">
                    <div className="mr-4 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{doc.name}</h3>
                      <p className="text-sm text-foreground/70">{doc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div {...getDragHandlers()}>
                <div className="py-8 flex flex-col items-center">
                  <Upload className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Drag & Drop Your Files Here</h3>
                  <p className="text-foreground/70 mb-4">or click to browse your files</p>
                  <label className="btn-primary cursor-pointer">
                    <span>Browse Files</span>
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      onChange={handleFileInput}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </label>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-foreground/70 flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <p>
                  Accepted file formats: PDF, JPG, PNG, DOC, DOCX. Maximum file size: 10MB per file.
                </p>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="glass-card p-6 animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
                <div className="space-y-4">
                  {files.map(file => (
                    <div key={file.id} className="border rounded-lg p-3 relative">
                      <div className="flex items-center">
                        <div className="mr-3 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-grow mr-8">
                          <p className="font-medium truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-foreground/70">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {file.status === 'success' && (
                            <span className="text-green-500 mr-2">
                              <Check className="h-5 w-5" />
                            </span>
                          )}
                          
                          {file.status === 'error' && (
                            <button 
                              onClick={() => retryUpload(file)}
                              className="text-primary mr-2 p-1 hover:bg-secondary/50 rounded"
                              title="Retry upload"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 2v6h-6"></path>
                                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                                <path d="M3 22v-6h6"></path>
                                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                              </svg>
                            </button>
                          )}
                          
                          <button 
                            onClick={() => removeFile(file.id)}
                            className="text-foreground/50 hover:text-destructive p-1 hover:bg-secondary/50 rounded transition-colors"
                            title="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {file.status === 'uploading' && (
                        <div className="w-full h-1 bg-secondary/50 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-200 ease-out"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-8">
                  <Link to="/" className="btn-secondary">
                    Back to Home
                  </Link>
                  <Link to="/application" className="btn-primary">
                    Continue Application
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default DocumentUpload;
