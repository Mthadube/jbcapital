import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, Filter, FileText, CheckCircle, 
  XCircle, Download, Eye, UploadCloud, FileWarning, MoreHorizontal, UserCircle,
  RefreshCw, Clock, X, DollarSign, File, User, Home, FileIcon, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAppData, Document } from "@/utils/AppDataContext";
import DocumentViewer from "@/components/DocumentViewer";
import { getDocumentTypeDisplayName } from "@/utils/profileUtils";
import { getDocumentViewUrl } from '@/utils/api';
import { sendSMS } from '@/utils/twilioService';

// Extending the Document interface to ensure compatability with the component
interface DocumentInfo extends Document {}

const DocumentManagement = () => {
  const { documents, users, updateDocument, refreshData, isLoading, isError, addNotification } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'pending' | 'rejected'>('verified');
  const [verificationNotes, setVerificationNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");

  // Collect all document types for filtering
  const documentTypes = Array.from(new Set(documents.map(doc => doc.type)));

  // Filter documents based on search term and filters
  const filteredDocuments = documents
    .slice() // Create a copy of the array for sorting
    .sort((a, b) => {
      // Sort by date, newest first
      return new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime();
    })
    .filter(doc => {
      const user = users.find(u => u.id === doc.userId);
      const userName = user ? `${user.firstName} ${user.lastName}` : "";
      
      const matchesSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatusFilter = statusFilter.length === 0 || statusFilter.includes(doc.verificationStatus);
      const matchesTypeFilter = typeFilter.length === 0 || typeFilter.includes(doc.type);

      return matchesSearch && matchesStatusFilter && matchesTypeFilter;
    });

  // Toggle a status filter
  const toggleStatusFilter = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  // Toggle a type filter
  const toggleTypeFilter = (type: string) => {
    if (typeFilter.includes(type)) {
      setTypeFilter(typeFilter.filter(t => t !== type));
    } else {
      setTypeFilter([...typeFilter, type]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setTypeFilter([]);
    setFilterOpen(false);
    setDocumentTypeFilter("");
    setDateFromFilter("");
    setDateToFilter("");
  };

  // Handle document verification
  const handleVerifyDocument = (document: DocumentInfo) => {
    setSelectedDocument(document);
    setVerificationStatus("verified");
    setVerificationNotes("");
    setShowVerifyDialog(true);
  };

  // Handle document rejection
  const handleRejectDocument = (document: DocumentInfo) => {
    setSelectedDocument(document);
    setVerificationStatus("rejected");
    setVerificationNotes("");
    setShowVerifyDialog(true);
  };

  // View document
  const handleViewDocument = (document: DocumentInfo) => {
    if (document.id) {
      const apiUrl = getDocumentViewUrl(document.id);
      window.open(apiUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error("Document ID not found");
    }
  };

  // Download document
  const handleDownloadDocument = (document: DocumentInfo) => {
    if (document.id) {
      try {
        const apiUrl = getDocumentViewUrl(document.id);
        
        console.log("Opening document in new tab:", apiUrl);
        
        // Open in a new tab (same as viewing)
        window.open(apiUrl, '_blank', 'noopener,noreferrer');
        
        toast.success(`Opening ${document.name}`);
      } catch (error) {
        console.error("Document open error:", error);
        toast.error("Failed to open document. Please try again.");
      }
    } else {
      toast.error("Document ID not found");
    }
  };

  // Submit verification/rejection
  const handleSubmitVerification = async () => {
    if (selectedDocument) {
      setUpdating(true);
      const success = await updateDocument(selectedDocument.id, {
        verificationStatus: verificationStatus,
        notes: verificationNotes
      });

      if (success) {
        toast.success(`Document ${verificationStatus === "verified" ? "verified" : "rejected"} successfully`);
        
        // Add notification for users when their document is rejected
        if (verificationStatus === "rejected" && selectedDocument.userId) {
          // Find the user who uploaded the document
          const user = users.find(u => u.id === selectedDocument.userId);
          
          if (user) {
            // Create notification for the user
            const notificationData = {
              id: `doc-${verificationStatus}-${Date.now()}`,
              userId: selectedDocument.userId,
              title: "Document Rejected",
              message: `Your document "${selectedDocument.name}" was rejected. Reason: ${verificationNotes}. Please upload a new version.`,
              type: "warning",
              date: new Date().toISOString(),
              read: false
            };
            
            // Add notification to the system
            addNotification(notificationData);
            
            // Send an SMS notification if the user has a phone number
            if (user.phone) {
              try {
                // Send SMS notification about rejected document
                sendSMS(
                  user.phone,
                  `Hi ${user.firstName}, your document "${selectedDocument.name}" has been rejected. Reason: ${verificationNotes}. Please log in to your account to upload a new version.`
                ).then(result => {
                  if (result.success) {
                    console.log('Document rejection SMS sent successfully');
                  } else {
                    console.error('Failed to send document rejection SMS:', result.error);
                  }
                }).catch(error => {
                  console.error('Error sending document rejection SMS:', error);
                });
              } catch (error) {
                console.error('Error using Twilio service:', error);
              }
            }
          }
        }
        
        setShowVerifyDialog(false);
      } else {
        toast.error(`Failed to ${verificationStatus === "verified" ? "verify" : "reject"} document`);
      }
      setUpdating(false);
    }
  };

  // Handle refresh data
  const handleRefreshData = async () => {
    toast.info("Refreshing document data...");
    await refreshData();
    toast.success("Document data refreshed");
  };

  useEffect(() => {
    // Set document loading state based on the global isLoading state
    if (isLoading) {
      toast.loading("Loading documents...", {
        id: "documents-loading",
      });
    } else {
      toast.dismiss("documents-loading");
    }
  }, [isLoading]);

  // Display error if there is one
  useEffect(() => {
    if (isError) {
      toast.error("Error loading documents. Please try again.");
    }
  }, [isError]);

  // Get user name for a document
  const getDocumentUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
          Document Management
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-indigo-200 hover:border-indigo-400 transition-colors"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-indigo-200 hover:border-indigo-400 transition-colors"
            onClick={() => resetFilters()}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>
      
      {filterOpen && (
        <div className="p-4 rounded-lg border border-indigo-100 bg-indigo-50/50 shadow-sm mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-indigo-800">Document Type</label>
              <Select 
                value={documentTypeFilter || ""} 
                onValueChange={(value) => setDocumentTypeFilter(value || "")}
              >
                <SelectTrigger className="bg-white border-indigo-200">
                  <SelectValue placeholder="All Document Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Document Types</SelectItem>
                  <SelectItem value="ID Document">ID Document</SelectItem>
                  <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                  <SelectItem value="Proof of Address">Proof of Address</SelectItem>
                  <SelectItem value="Proof of Income">Proof of Income</SelectItem>
                  <SelectItem value="Loan Agreement">Loan Agreement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-indigo-800">Status</label>
              <Select 
                value={statusFilter.length ? statusFilter[0] : ""} 
                onValueChange={(value) => setStatusFilter(value ? [value] : [])}
              >
                <SelectTrigger className="bg-white border-indigo-200">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="verified">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-indigo-800">Upload Date</label>
              <div className="flex gap-2">
                <Input 
                  type="date" 
                  placeholder="From" 
                  className="bg-white border-indigo-200" 
                  value={dateFromFilter || ""}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
                <Input 
                  type="date" 
                  placeholder="To" 
                  className="bg-white border-indigo-200" 
                  value={dateToFilter || ""}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((document) => (
          <div key={document.id} className="border border-indigo-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300 bg-white">
            <div className={`p-3 ${
              document.verificationStatus === 'verified' ? 'bg-gradient-to-r from-green-50 to-green-100/50' : 
              document.verificationStatus === 'rejected' ? 'bg-gradient-to-r from-red-50 to-red-100/50' : 
              'bg-gradient-to-r from-indigo-50 to-indigo-100/50'
            }`}>
              <div className="flex justify-between items-center">
                <div className="font-medium truncate max-w-[180px]">{document.name}</div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                  document.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 
                  document.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
                  'bg-indigo-100 text-indigo-800'
                }`}>
                  {document.verificationStatus.charAt(0).toUpperCase() + document.verificationStatus.slice(1)}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  document.type === 'id_document' ? 'bg-blue-100 text-blue-600' : 
                  document.type === 'bank_statement' ? 'bg-green-100 text-green-600' : 
                  document.type === 'proof_of_address' ? 'bg-amber-100 text-amber-600' : 
                  document.type === 'proof_of_income' ? 'bg-purple-100 text-purple-600' : 
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  {document.type === 'id_document' ? <UserCircle className="h-4 w-4" /> : 
                   document.type === 'bank_statement' ? <CreditCard className="h-4 w-4" /> : 
                   document.type === 'proof_of_address' ? <Home className="h-4 w-4" /> : 
                   document.type === 'proof_of_income' ? <DollarSign className="h-4 w-4" /> : 
                   <File className="h-4 w-4" />}
                </div>
                <div>
                  <div className="text-sm font-medium">{document.type.replace(/_/g, " ")}</div>
                  <div className="text-xs text-muted-foreground">Uploaded: {document.dateUploaded}</div>
                </div>
              </div>
              
              <div className="text-sm flex items-center gap-1 mb-4">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">User: {document.userId}</span>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-indigo-200 hover:border-indigo-400 transition-colors"
                  onClick={() => handleViewDocument(document)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                {document.verificationStatus === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerifyDocument(document)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleRejectDocument(document)}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredDocuments.length === 0 && (
        <div className="border border-dashed border-indigo-200 rounded-lg p-10 text-center bg-indigo-50/50">
          <FileIcon className="h-12 w-12 text-indigo-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-indigo-900 mb-1">No documents found</h3>
          <p className="text-indigo-600">Try changing your filters or uploading new documents.</p>
        </div>
      )}
      
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          <TabsTrigger value="verified">Verified Documents</TabsTrigger>
          <TabsTrigger value="rejected">Rejected Documents</TabsTrigger>
        </TabsList>
        
        {/* All Documents Tab */}
        <TabsContent value="all">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Documents</CardTitle>
          <CardDescription>Manage and verify user submitted documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px]">Document ID</TableHead>
                      <TableHead>Document Type</TableHead>
                  <TableHead>Submitted By</TableHead>
                      <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                    {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-mono text-xs">{doc.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {doc.type === 'id' && <FileText className="h-4 w-4 text-red-500" />}
                              {doc.type === 'proof_of_residence' && <FileText className="h-4 w-4 text-blue-500" />}
                              {doc.type === 'bank_statement' && <FileText className="h-4 w-4 text-green-500" />}
                              {doc.type === 'payslip' && <FileText className="h-4 w-4 text-amber-500" />}
                              {!['id', 'proof_of_residence', 'bank_statement', 'payslip'].includes(doc.type) && 
                                <FileText className="h-4 w-4 text-gray-500" />}
                              {getDocumentTypeDisplayName(doc.type)}
                            </div>
                          </TableCell>
                      <TableCell>
                            <div className="flex items-center gap-2">
                              <UserCircle className="h-4 w-4 text-primary" />
                          {getDocumentUserName(doc.userId)}
                        </div>
                      </TableCell>
                          <TableCell>{new Date(doc.dateUploaded).toLocaleDateString()}</TableCell>
                      <TableCell>
                            {doc.verificationStatus === 'verified' && (
                              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                                <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                                Verified
                              </Badge>
                            )}
                            {doc.verificationStatus === 'pending' && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-50">
                                <Clock className="h-3 w-3 mr-1 text-amber-500" />
                                Pending
                        </Badge>
                            )}
                            {doc.verificationStatus === 'rejected' && (
                              <Badge variant="outline" className="bg-red-50 text-red-800 hover:bg-red-50">
                                <XCircle className="h-3 w-3 mr-1 text-red-500" />
                                Rejected
                        </Badge>
                            )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                                variant="outline" 
                                size="sm"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                                variant="outline" 
                                size="sm"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                  {doc.verificationStatus !== 'verified' && (
                              <DropdownMenuItem onClick={() => handleVerifyDocument(doc)}>
                                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                      Verify Document
                              </DropdownMenuItem>
                                  )}
                                  {doc.verificationStatus !== 'rejected' && (
                              <DropdownMenuItem onClick={() => handleRejectDocument(doc)}>
                                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                      Reject Document
                              </DropdownMenuItem>
                                  )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No documents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
        
        {/* Pending Verification Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Pending Documents</CardTitle>
              <CardDescription>Documents awaiting verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments
                  .filter(doc => doc.verificationStatus === 'pending')
                  .map(doc => (
                    <div key={doc.id} className="rounded-lg border overflow-hidden">
                      <DocumentViewer 
                        document={doc} 
                        onView={() => handleViewDocument(doc)}
                        onDownload={() => handleDownloadDocument(doc)}
                      />
                      <div className="p-3 bg-amber-50 border-t flex justify-between items-center">
                        <span className="text-sm text-amber-800 font-medium">Awaiting Verification</span>
                        <div className="flex gap-2">
                <Button 
                            variant="outline" 
                  size="sm" 
                            className="h-8 border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => handleVerifyDocument(doc)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                  Verify
                </Button>
                <Button 
                            variant="outline" 
                  size="sm" 
                            className="h-8 border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => handleRejectDocument(doc)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {filteredDocuments.filter(doc => doc.verificationStatus === 'pending').length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">All caught up!</h3>
                    <p className="text-gray-500">No documents awaiting verification.</p>
                  </div>
              )}
            </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Document Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
          <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {verificationStatus === "verified" ? "Verify Document" : "Reject Document"}
            </DialogTitle>
            <DialogDescription>
              {verificationStatus === "verified"
                  ? "Confirm document verification and add optional notes." 
                : "Provide a reason for rejecting this document."}
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-4 py-2">
            {selectedDocument && (
                <div className="flex items-center space-x-3 border p-3 rounded-md bg-muted/50">
                  <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{selectedDocument.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded by {getDocumentUserName(selectedDocument.userId)} on {' '}
                      {new Date(selectedDocument.dateUploaded).toLocaleDateString()}
                    </p>
                  </div>
              </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="verification-notes">
                  {verificationStatus === "verified" ? "Verification Notes (Optional)" : "Rejection Reason"}
              </Label>
              <Textarea
                  id="verification-notes" 
                  placeholder={verificationStatus === "verified" 
                    ? "Add any notes about the document verification..." 
                    : "Please explain why this document is being rejected..."}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                  className="min-h-[100px]"
                  required={verificationStatus === "rejected"}
              />
            </div>
          </div>
            <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowVerifyDialog(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitVerification}
                disabled={updating || (verificationStatus === "rejected" && !verificationNotes.trim())}
                className={verificationStatus === "verified" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {updating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {verificationStatus === "verified" ? "Verifying..." : "Rejecting..."}
                  </>
                ) : (
                  <>
                    {verificationStatus === "verified" ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Document
                </>
              ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Document
                      </>
                    )}
                  </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </Tabs>
    </div>
  );
};

export default DocumentManagement; 