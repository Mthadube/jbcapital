import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppData } from '../utils/AppDataContext';

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
  allowedTypes?: string[];
  maxSize?: number; // in MB
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUploadComplete,
  allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxSize = 5, // 5MB default
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addDocument, currentUser, generateId } = useAppData();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!currentUser) {
      toast.error('You must be logged in to upload documents');
      return;
    }

    setIsUploading(true);
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExt)) {
        toast.error(`File type ${fileExt} is not supported. Please upload ${allowedTypes.join(', ')} files only.`);
        continue;
      }
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File size exceeds the maximum limit of ${maxSize}MB.`);
        continue;
      }
      
      try {
        // In a real app, you would upload to a server here
        // For this demo, we'll simulate server storage with local handling
        
        // Create unique filename
        const timestamp = new Date().getTime();
        const uniqueFileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
        const filePath = `/documents/${uniqueFileName}`;
        
        // In a real app, this would be an API call to upload the file
        // For demo purposes, we'll just add the document to our context
        const newDocument = {
          id: generateId('doc'),
          userId: currentUser.id,
          name: file.name,
          type: getDocumentType(file.name),
          dateUploaded: new Date().toISOString(),
          verificationStatus: 'pending' as 'pending' | 'verified' | 'rejected',
          fileSize: formatFileSize(file.size),
          fileType: file.type,
          filePath: filePath
        };
        
        const success = await addDocument(newDocument);
        
        if (success) {
          toast.success(`Document "${file.name}" uploaded successfully`);
        } else {
          toast.error(`Failed to upload document "${file.name}"`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Error uploading file: ${file.name}`);
      }
    }
    
    setIsUploading(false);
    
    if (onUploadComplete) {
      onUploadComplete();
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDocumentType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'Image';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'xls':
      case 'xlsx':
        return 'Spreadsheet';
      default:
        return 'Document';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept={allowedTypes.join(',')}
        />
        
        <Upload className="h-12 w-12 mx-auto text-gray-400" />
        
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {isUploading ? 'Uploading...' : 'Upload a document'}
        </h3>
        
        <p className="mt-1 text-xs text-gray-500">
          Drag and drop or click to upload
        </p>
        
        <p className="mt-2 text-xs text-gray-500">
          Supported formats: {allowedTypes.join(', ')} up to {maxSize}MB
        </p>
      </div>
      
      <div className="mt-4 flex items-center text-xs text-gray-500">
        <div className="flex items-center mr-4">
          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
          <span>Maximum {maxSize}MB</span>
        </div>
        
        <div className="flex items-center">
          <File className="h-4 w-4 mr-1 text-blue-500" />
          <span>Supported formats: {allowedTypes.join(', ')}</span>
        </div>
      </div>
      
      <div className="mt-2 flex items-center text-xs text-gray-500">
        <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
        <span>Documents will be reviewed for verification after upload</span>
      </div>
    </div>
  );
};

export default DocumentUploader; 