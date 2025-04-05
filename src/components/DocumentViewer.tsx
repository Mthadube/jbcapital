import React, { useState } from 'react';
import { Download, Eye, FileText, FileWarning, CheckCircle, Clock } from 'lucide-react';
import { Document } from '../utils/AppDataContext';
import DocumentPreview from './DocumentPreview';
import { toast } from 'sonner';
import { getDocumentTypeDisplayName } from '../utils/profileUtils';

interface DocumentViewerProps {
  document: Document;
  onDownload?: (document: Document) => void;
  onView?: (document: Document) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onDownload,
  onView
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: 'verified' | 'pending' | 'rejected') => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'rejected':
        return <FileWarning className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: 'verified' | 'pending' | 'rejected') => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf') || type === 'id' || type === 'bank_statement') {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (type.includes('image') || type === 'proof_of_residence') {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else if (type.includes('word') || type === 'contract') {
      return <FileText className="h-6 w-6 text-indigo-500" />;
    } else if (type.includes('spreadsheet') || type === 'payslip') {
      return <FileText className="h-6 w-6 text-green-500" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document);
    } else {
      // Default download behavior if no handler provided
      if (document.filePath) {
        try {
          const filePath = document.filePath.startsWith('/') 
            ? document.filePath 
            : `/${document.filePath}`;
            
          console.log("Downloading document:", filePath);
          
          // Create an anchor element and trigger the download
          const a = window.document.createElement('a');
          a.href = filePath;
          a.download = document.name;
          window.document.body.appendChild(a);
          a.click();
          window.document.body.removeChild(a);
          
          toast.success(`Downloading ${document.name}`);
        } catch (error) {
          console.error("Download error:", error);
          toast.error("Failed to download document. Please try again.");
        }
      } else {
        toast.error("Document doesn't have a file path specified.");
      }
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("View document clicked:", document);
    
    if (onView) {
      onView(document);
    } else {
      // Open preview modal directly
      setShowPreview(true);
      console.log("Preview modal should open now, showPreview =", true);
    }
  };

  return (
    <>
      <div className="border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getDocumentIcon(document.type)}
            <div>
              <h3 className="text-sm font-medium text-gray-900">{document.name}</h3>
              <div className="mt-1 flex items-center">
                <p className="text-xs text-gray-500 mr-2">
                  Uploaded on {formatDate(document.dateUploaded)}
                </p>
                {document.fileSize && (
                  <span className="text-xs text-gray-500">{document.fileSize}</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {getDocumentTypeDisplayName(document.type)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusLabel(document.verificationStatus)}
            <button 
              onClick={handleView}
              className="p-1 rounded-full text-gray-400 hover:text-primary focus:outline-none focus:text-primary hover:bg-gray-100"
              title="View document"
              aria-label="View document"
              type="button"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button 
              onClick={handleDownload}
              className="p-1 rounded-full text-gray-400 hover:text-primary focus:outline-none focus:text-primary hover:bg-gray-100"
              title="Download document"
              aria-label="Download document"
              type="button"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {document.notes && (
          <div className="mt-2 text-xs text-gray-500 italic border-t pt-2">
            {document.notes}
          </div>
        )}
      </div>
      
      {showPreview && (
        <DocumentPreview 
          document={document} 
          onClose={() => {
            console.log("Closing preview modal");
            setShowPreview(false);
          }} 
        />
      )}
    </>
  );
};

export default DocumentViewer; 