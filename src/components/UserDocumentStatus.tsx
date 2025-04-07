import React, { useEffect, useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileCheck, 
  Upload, 
  XCircle 
} from 'lucide-react';
import { Document, useAppData } from '@/utils/AppDataContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import DocumentUploader, { DOCUMENT_TYPES } from './DocumentUploader';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

interface UserDocumentStatusProps {
  userId?: string;
  className?: string;
}

const UserDocumentStatus: React.FC<UserDocumentStatusProps> = ({ 
  userId,
  className = ""
}) => {
  const { currentUser, documents, getDocumentsByUserId } = useAppData();
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>("id");
  const [uploadDialogTitle, setUploadDialogTitle] = useState<string>("Upload Document");
  
  // Get the user ID (from props or current user)
  const targetUserId = userId || (currentUser ? currentUser.id : "");
  
  // Required document types that users should have
  const requiredDocumentTypes = [
    "id",
    "proof_of_residence",
    "bank_statement",
    "payslip"
  ];
  
  // Fetch user documents
  useEffect(() => {
    if (targetUserId) {
      const docs = getDocumentsByUserId(targetUserId);
      setUserDocuments(docs);
    }
  }, [targetUserId, getDocumentsByUserId, documents]);
  
  // Group documents by type
  const documentsByType = userDocuments.reduce<Record<string, Document[]>>((acc, doc) => {
    if (!acc[doc.type]) {
      acc[doc.type] = [];
    }
    acc[doc.type].push(doc);
    return acc;
  }, {});
  
  // Check if document type has a rejected document
  const hasRejectedDocument = (type: string): boolean => {
    return (documentsByType[type] || []).some(doc => doc.verificationStatus === 'rejected');
  };
  
  // Get most recent document of a type
  const getMostRecentDocument = (type: string): Document | null => {
    const docs = documentsByType[type] || [];
    if (docs.length === 0) return null;
    
    // Sort by upload date (newest first) and return the first one
    return [...docs].sort((a, b) => 
      new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime()
    )[0];
  };
  
  // Get verification status for a document type
  const getDocumentTypeStatus = (type: string): 'verified' | 'pending' | 'rejected' | 'missing' => {
    const doc = getMostRecentDocument(type);
    if (!doc) return 'missing';
    return doc.verificationStatus;
  };

  // Get document type name
  const getDocumentTypeName = (type: string): string => {
    const docType = DOCUMENT_TYPES.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };
  
  // Get rejection reason for document
  const getRejectionReason = (type: string): string => {
    const docs = documentsByType[type] || [];
    const rejectedDoc = docs.find(doc => doc.verificationStatus === 'rejected');
    return rejectedDoc?.notes || 'Document was rejected';
  };
  
  // Handle upload button click
  const handleUploadClick = (type: string) => {
    setSelectedDocType(type);
    setUploadDialogTitle(`Upload ${getDocumentTypeName(type)}`);
    setShowUploader(true);
  };
  
  // Handle upload completion
  const handleUploadComplete = () => {
    setShowUploader(false);
    // Refresh the document list by re-fetching
    if (targetUserId) {
      const docs = getDocumentsByUserId(targetUserId);
      setUserDocuments(docs);
    }
  };
  
  // Render status badge and icon
  const renderStatusBadge = (status: 'verified' | 'pending' | 'rejected' | 'missing') => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'missing':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Missing
          </Badge>
        );
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium mb-4">Required Documents</h3>
      
      <div className="space-y-2">
        {requiredDocumentTypes.map(docType => {
          const status = getDocumentTypeStatus(docType);
          
          return (
            <div 
              key={docType} 
              className={`p-4 border rounded-lg flex items-center justify-between ${
                status === 'rejected' ? 'bg-red-50 border-red-100' : 
                status === 'verified' ? 'bg-green-50 border-green-100' : 
                status === 'pending' ? 'bg-yellow-50 border-yellow-100' : 
                'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-center">
                <FileCheck className="w-5 h-5 mr-3 text-primary" />
                <div>
                  <div className="font-medium">{getDocumentTypeName(docType)}</div>
                  {status === 'rejected' && (
                    <div className="text-sm text-red-600 mt-1">
                      <span className="font-medium">Reason:</span> {getRejectionReason(docType)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {renderStatusBadge(status)}
                
                {(status === 'rejected' || status === 'missing') && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          onClick={() => handleUploadClick(docType)}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {status === 'rejected' 
                          ? 'Upload a new version of this document' 
                          : 'Upload this required document'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Document Upload Dialog */}
      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{uploadDialogTitle}</DialogTitle>
            <DialogDescription>
              Upload a valid document that meets our requirements
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-4">
            <DocumentUploader 
              onUploadComplete={handleUploadComplete}
              defaultDocumentType={selectedDocType}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDocumentStatus; 