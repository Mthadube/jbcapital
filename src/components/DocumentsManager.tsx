import React, { useState, useRef } from 'react';
import { PlusCircle, FolderOpen } from 'lucide-react';
import DocumentList, { DocumentListRef } from './DocumentList';
import DocumentUploader from './DocumentUploader';
import { toast } from 'sonner';

interface DocumentsManagerProps {
  userId?: string;
  showUploader?: boolean;
  title?: string;
  className?: string;
}

const DocumentsManager: React.FC<DocumentsManagerProps> = ({
  userId,
  showUploader = true,
  title = "Documents",
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const documentsListRef = useRef<DocumentListRef>(null);

  const handleUploadComplete = () => {
    setIsUploading(false);
    
    // Refresh the document list
    if (documentsListRef.current) {
      documentsListRef.current.refreshDocuments();
    }
    
    // Show success toast
    toast.success("Document uploaded successfully and is pending verification.");
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
      )}
      
      {/* Document List */}
      <div className="mb-6">
        <DocumentList
          userId={userId}
          ref={documentsListRef}
          showSearch={true}
          showFilter={true}
          showSort={true}
          emptyStateMessage="No documents found. Upload documents to complete your profile."
        />
      </div>
      
      {/* Document Uploader */}
      {showUploader && (
        <div>
          {isUploading ? (
            <div className="glass-card-inner p-6">
              <h3 className="text-xl font-bold mb-4">Upload Document</h3>
              <DocumentUploader onUploadComplete={handleUploadComplete} />
              
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setIsUploading(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel Upload
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsUploading(true)}
              className="flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Upload New Document</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentsManager; 