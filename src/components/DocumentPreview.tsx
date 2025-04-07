import React, { useState, useEffect } from 'react';
import { X, Download, AlertCircle, FileText } from 'lucide-react';
import { Document as AppDocument } from '../utils/AppDataContext';
import { toast } from 'sonner';

interface DocumentPreviewProps {
  document: AppDocument;
  onClose: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  // Use sample path if none provided (development only)
  useEffect(() => {
    console.log("Document preview mounted:", document);
  }, [document]);
  
  // Fix document path with proper fallbacks
  const getDocumentPath = (): string => {
    console.log("Getting document path for:", document.name, "filepath:", document.filePath);
    
    // Check if document has a valid filepath
    if (document.filePath) {
      // If the path is for an uploaded document from API, resolve correctly
      if (document.filePath.startsWith('/documents/')) {
        return document.filePath;
      }
      
      // If the path starts with http/https, use it as is
      if (document.filePath.startsWith('http')) {
        return document.filePath;
      }
      
      // For paths like "documents/123456_filename.pdf" (without leading slash)
      if (document.filePath.startsWith('documents/')) {
        return `/${document.filePath}`;
      }
      
      // If we have a relative path with filename but no folder structure
      if (!document.filePath.includes('/')) {
        return `/documents/${document.filePath}`;
      }
      
      // For any other path format, add a leading slash if needed
      return document.filePath.startsWith('/') ? document.filePath : `/${document.filePath}`;
    }
    
    // If no filePath, use fallbacks based on document type and name
    const documentType = document.type?.toLowerCase() || '';
    const fileName = document.name?.toLowerCase() || '';
    
    // Determine file type by name
    if (fileName.endsWith('.pdf') || documentType.includes('pdf') || 
        documentType === 'id' || documentType === 'bank_statement') {
      return '/documents/sample-pdf.pdf';
    } else if (fileName.match(/\.(jpg|jpeg|png|gif)$/i) || 
              documentType.includes('image') || 
              documentType === 'proof_of_residence') {
      return '/documents/sample-image.jpg';
    }
    
    // Final fallback
    return '/documents/placeholder.svg';
  };
  
  const retryLoading = () => {
    setLoading(true);
    setLoadError(false);
    // Force re-render of the preview content
    setTimeout(() => {
      const previewContainer = window.document.getElementById('document-preview-container');
      if (previewContainer) {
        // Clear and re-append the content (this forces iframe reload)
        const content = previewContainer.innerHTML;
        previewContainer.innerHTML = '';
        setTimeout(() => {
          previewContainer.innerHTML = content;
        }, 50);
      }
    }, 100);
  };
  
  const getFileType = (): string => {
    const name = document.name?.toLowerCase() || '';
    const type = document.type?.toLowerCase() || '';
    
    // 1. Use explicit fileType if available
    if (document.fileType) {
      return document.fileType.toLowerCase();
    }
    
    // 2. Check file extension from name
    if (name.endsWith('.pdf')) return 'application/pdf';
    if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
    if (name.endsWith('.png')) return 'image/png';
    if (name.endsWith('.gif')) return 'image/gif';
    
    // 3. Infer from document type
    if (type === 'id' || type === 'bank_statement' || type.includes('pdf')) {
      return 'application/pdf';
    } else if (type === 'proof_of_residence' || type.includes('image')) {
      return 'image/jpeg';
    }
    
    // 4. Default fallback
    return 'application/octet-stream';
  };
  
  const getPreviewContent = () => {
    const documentPath = getDocumentPath();
    const fileType = getFileType();
    
    console.log("Preview details:", { 
      path: documentPath, 
      type: fileType,
      documentType: document.type,
      name: document.name
    });
    
    // Check if it's an image type
    const isImage = fileType.includes('image') || document.name?.match(/\.(jpg|jpeg|png|gif)$/i);
    
    // Check if it's a PDF type
    const isPdf = fileType.includes('pdf') || document.name?.match(/\.pdf$/i);
    
    if (isImage) {
      return (
        <img 
          src={documentPath} 
          alt={document.name} 
          className="max-w-full max-h-full object-contain"
          onLoad={() => {
            setLoading(false);
            setLoadError(false);
            console.log("Image loaded successfully");
          }}
          onError={(e) => {
            console.error("Image failed to load:", e);
            setLoading(false);
            setLoadError(true);
          }}
        />
      );
    } else if (isPdf) {
      // Use iframe for PDF viewing which has better browser support
      return (
        <iframe
          src={`${documentPath}#toolbar=1&view=FitH`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          onLoad={() => {
            setLoading(false);
            setLoadError(false);
            console.log("PDF loaded successfully with iframe");
          }}
          onError={() => {
            console.error("PDF failed to load with iframe");
            setLoading(false);
            setLoadError(true);
          }}
          title={document.name}
        >
          <p>Unable to display PDF. <a href={documentPath} target="_blank" rel="noopener noreferrer">Download</a> instead.</p>
        </iframe>
      );
    } else {
      // For non-previewable files, show a placeholder with download option
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <FileText className="h-20 w-20 text-gray-400 mb-4" />
          <p className="text-gray-700 text-lg font-medium mb-2">{document.name}</p>
          <p className="text-gray-500 mb-6">
            {loadError 
              ? "Failed to load document preview." 
              : "Preview not available for this file type."}
          </p>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download File
          </button>
        </div>
      );
    }
  };
  
  const handleDownload = () => {
    try {
      const documentPath = getDocumentPath();
      console.log("Downloading from path:", documentPath);
      
      // Create an anchor element and trigger the download
      const a = window.document.createElement('a');
      a.href = documentPath;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      
      toast.success("Document download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium truncate">{document.name}</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleDownload}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary focus:outline-none transition-colors"
              title="Download document"
            >
              <Download className="h-5 w-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none transition-colors"
              title="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div id="document-preview-container" className="flex-1 p-4 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          
          {loadError && (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-gray-700 font-medium mb-2">
                Failed to load document preview
              </p>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                The document could not be loaded. You can try again or download the file directly.
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={retryLoading}
                  className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Retry
                </button>
                <button 
                  onClick={handleDownload}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          )}
          
          {!loading && !loadError && getPreviewContent()}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview; 