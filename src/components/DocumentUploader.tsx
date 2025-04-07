import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppData, Activity } from '../utils/AppDataContext';
import * as api from '../utils/api';
import { v4 as uuidv4 } from 'uuid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
  allowedTypes?: string[];
  maxSize?: number; // in MB
  defaultDocumentType?: string;
}

// Document type options
export const DOCUMENT_TYPES = [
  { value: "id", label: "ID Document" },
  { value: "proof_of_residence", label: "Proof of Residence" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "payslip", label: "Payslip" },
  { value: "employment_letter", label: "Employment Letter" },
  { value: "contract", label: "Contract" },
  { value: "application", label: "Application Form" },
  { value: "other", label: "Other Document" }
];

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUploadComplete,
  allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxSize = 5, // 5MB default
  defaultDocumentType = "other"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(defaultDocumentType);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addDocument, currentUser, generateId, addUserActivity, addNotification } = useAppData();

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

    // Validate document type selection
    if (!selectedDocumentType) {
      toast.error('Please select the document type before uploading');
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
        // Use the uploadDocumentFile API function with the user-selected document type
        const response = await api.uploadDocumentFile(
          file,
          currentUser.id,
          selectedDocumentType,
          `Uploaded as ${getDocumentTypeLabel(selectedDocumentType)}`
        );
        
        if (response.success && response.data) {
          // Add the document to the app context
          await addDocument(response.data);
          
          // Create activity for document upload
          const activityData: Activity = {
            id: uuidv4(),
            userId: currentUser.id,
            title: "Document Uploaded",
            description: `You uploaded ${file.name} as ${getDocumentTypeLabel(selectedDocumentType)}`,
            type: "document",
            date: new Date().toISOString()
          };
          
          // Add notification
          const notificationData = {
            id: uuidv4(),
            userId: currentUser.id,
            title: "Document Uploaded Successfully",
            message: `Your ${getDocumentTypeLabel(selectedDocumentType)} has been uploaded and is pending verification.`,
            type: "document",
            date: new Date().toISOString(),
            read: false
          };
          
          // Call the appropriate context functions to add activity and notification
          addUserActivity(currentUser.id, activityData);
          addNotification(notificationData);
          
          toast.success(`${getDocumentTypeLabel(selectedDocumentType)} uploaded successfully`);
        } else {
          toast.error(`Failed to upload document "${file.name}": ${response.error}`);
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

  // Get the display label for a document type
  const getDocumentTypeLabel = (typeValue: string): string => {
    const docType = DOCUMENT_TYPES.find(type => type.value === typeValue);
    return docType ? docType.label : "Document";
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
      {/* Document Type Selector */}
      <div className="mb-4">
        <Label htmlFor="document-type" className="block text-sm font-medium mb-1">Document Type</Label>
        <Select 
          value={selectedDocumentType} 
          onValueChange={setSelectedDocumentType}
        >
          <SelectTrigger id="document-type" className="w-full">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map((docType) => (
              <SelectItem key={docType.value} value={docType.value}>
                {docType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-gray-500">
          Please select the type of document you are uploading
        </p>
      </div>

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
          {isUploading ? 'Uploading...' : `Upload ${getDocumentTypeLabel(selectedDocumentType)}`}
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