import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { FolderOpen, Search, Filter, SortDesc, SortAsc, AlertCircle } from 'lucide-react';
import { Document, useAppData } from '../utils/AppDataContext';
import DocumentViewer from './DocumentViewer';
import { toast } from 'sonner';

interface DocumentListProps {
  userId?: string;
  maxItems?: number;
  showSearch?: boolean;
  showFilter?: boolean;
  showSort?: boolean;
  emptyStateMessage?: string;
  className?: string;
  showPlaceholder?: boolean;
  hideWhenEmpty?: boolean;
  isEditable?: boolean;
  onDocumentDeleted?: () => void;
}

export interface DocumentListRef {
  refreshDocuments: () => void;
}

const DocumentList = forwardRef<DocumentListRef, DocumentListProps>(({
  userId,
  maxItems,
  showSearch = true,
  showFilter = true,
  showSort = true,
  emptyStateMessage = "No documents found",
  className = "",
  showPlaceholder = true,
  hideWhenEmpty = false,
  isEditable = false,
  onDocumentDeleted
}, ref) => {
  const { currentUser, documents, getDocumentsByUserId, updateDocument, viewDocument } = useAppData();
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isDebug, setIsDebug] = useState<boolean>(false);

  // Get unique document types for filter dropdown
  const documentTypes = [...new Set(userDocuments.map(doc => doc.type))];

  const refreshDocuments = () => {
    // Use the provided userId or fall back to currentUser.id
    const targetUserId = userId || (currentUser ? currentUser.id : undefined);
    
    if (targetUserId) {
      const docs = getDocumentsByUserId(targetUserId);
      setUserDocuments(docs);
    }
  };

  // Expose refreshDocuments method to parent components via ref
  useImperativeHandle(ref, () => ({
    refreshDocuments
  }));

  useEffect(() => {
    refreshDocuments();
  }, [userId, currentUser, documents, getDocumentsByUserId]);

  // Filter and sort documents
  const filteredDocuments = userDocuments
    .filter(doc => {
      // Apply search filter
      const matchesSearch = searchTerm === '' || 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply type filter
      const matchesType = filterType === null || doc.type === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // Sort by date uploaded
      const dateA = new Date(a.dateUploaded).getTime();
      const dateB = new Date(b.dateUploaded).getTime();
      
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Apply max items limit if specified
  const displayedDocuments = maxItems ? filteredDocuments.slice(0, maxItems) : filteredDocuments;

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDownload = (document: Document) => {
    try {
      const filePath = viewDocument(document.id);
      if (!filePath) {
        toast.error(`Could not find document: ${document.name}`);
        return;
      }

      console.log("Downloading document:", document.name, "path:", filePath);
      
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
      toast.error("Failed to download document");
    }
  };

  const handleView = (document: Document) => {
    try {
      const filePath = viewDocument(document.id);
      if (!filePath) {
        toast.error(`Could not find document: ${document.name}`);
        return;
      }
      
      console.log("Viewing document:", document.name, "path:", filePath);
      
      // Update the document object with the resolved path for the viewer
      const docWithPath = {
        ...document,
        filePath: filePath
      };
      
      // This is handled by the DocumentViewer component
      // which will open the preview modal
      // We just need to pass the document with the correct path
      return docWithPath;
    } catch (error) {
      console.error("View error:", error);
      toast.error("Failed to view document");
      return document; // Return original document
    }
  };

  // Toggle debug mode
  const toggleDebug = () => {
    setIsDebug(!isDebug);
  };

  if (userDocuments.length === 0 && hideWhenEmpty) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{userDocuments.length} Documents</h3>
        <button 
          onClick={toggleDebug}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {isDebug ? 'Hide Debug' : 'Debug'}
        </button>
      </div>
      
      {(showSearch || showFilter || showSort) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {showSearch && (
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          
          {showFilter && (
            <div className="relative min-w-[140px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className="w-full p-2 pl-10 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={filterType || ''}
                onChange={(e) => setFilterType(e.target.value || null)}
              >
                <option value="">All Types</option>
                {documentTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}
          
          {showSort && (
            <button
              onClick={toggleSortOrder}
              className="flex items-center space-x-1 p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {sortOrder === 'asc' ? (
                <>
                  <SortAsc className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Oldest first</span>
                </>
              ) : (
                <>
                  <SortDesc className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Newest first</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
      
      {userDocuments.length === 0 && showPlaceholder ? (
        <div className="text-center py-6 border border-dashed rounded-lg">
          <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedDocuments.map((document) => (
            <div key={document.id}>
              <DocumentViewer 
                document={handleView(document)} 
                onDownload={() => handleDownload(document)}
              />
              {isDebug && (
                <div className="text-xs border border-gray-200 p-2 mb-2 bg-gray-50 rounded text-gray-500 overflow-x-auto">
                  <div><strong>ID:</strong> {document.id}</div>
                  <div><strong>Name:</strong> {document.name}</div>
                  <div><strong>Type:</strong> {document.type}</div>
                  <div><strong>Original Path:</strong> {document.filePath || 'none'}</div>
                  <div><strong>Resolved Path:</strong> {viewDocument(document.id)}</div>
                  <div><strong>Status:</strong> {document.verificationStatus}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// Add display name for better debugging
DocumentList.displayName = 'DocumentList';

export default DocumentList;