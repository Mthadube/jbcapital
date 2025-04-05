import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, Filter, FileText, CheckCircle, 
  XCircle, Download, Eye, UploadCloud, FileWarning, MoreHorizontal, UserCircle,
  RefreshCw, Clock
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
import DocumentPreview from "@/components/DocumentPreview";
import { getDocumentTypeDisplayName } from "@/utils/profileUtils";

// Extending the Document interface to ensure compatability with the component
interface DocumentInfo extends Document {}

const DocumentManagement = () => {
  const { documents, users, updateDocument, refreshData, isLoading, isError } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'pending' | 'rejected'>('verified');
  const [verificationNotes, setVerificationNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  // Collect all document types for filtering
  const documentTypes = Array.from(new Set(documents.map(doc => doc.type)));

  // Filter documents based on search term and filters
  const filteredDocuments = documents.filter(doc => {
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

  // View document details with enhanced preview
  const handleViewDocument = (document: DocumentInfo) => {
    setSelectedDocument(document);
    setShowDocumentDialog(true);
  };

  // Download document
  const handleDownloadDocument = (document: DocumentInfo) => {
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

  // Get user name for a document
  const getDocumentUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Document Management</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents, users..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-1 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">Status</p>
                <div className="mt-2 space-x-1">
                  <Badge
                    variant={statusFilter.includes("verified") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStatusFilter("verified")}
                  >
                    Verified
                  </Badge>
                  <Badge
                    variant={statusFilter.includes("pending") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStatusFilter("pending")}
                  >
                    Pending
                  </Badge>
                  <Badge
                    variant={statusFilter.includes("rejected") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStatusFilter("rejected")}
                  >
                    Rejected
                  </Badge>
                </div>
              </div>
              <div className="px-2 py-1.5 border-t">
                <p className="text-sm font-medium">Document Types</p>
                <div className="mt-2 space-x-1">
                  {documentTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={typeFilter.includes(type) ? "default" : "outline"}
                      className="cursor-pointer mb-1"
                      onClick={() => toggleTypeFilter(type)}
                    >
                      {type.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="border-t px-2 py-1.5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={resetFilters}
                >
                  Clear all filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
        
        {/* Document Viewer Dialog */}
        <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-4 py-2 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg">{selectedDocument?.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  {selectedDocument && (
                    <>
                      <Badge 
                        variant={selectedDocument.verificationStatus === "verified" ? "default" : "outline"}
                        className={
                          selectedDocument.verificationStatus === "verified" ? "bg-green-100 text-green-800 hover:bg-green-100" :
                          selectedDocument.verificationStatus === "rejected" ? "bg-red-100 text-red-800 hover:bg-red-100" :
                          "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        }
                      >
                        {selectedDocument.verificationStatus.charAt(0).toUpperCase() + selectedDocument.verificationStatus.slice(1)}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadDocument(selectedDocument)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <DialogDescription>
                {selectedDocument && (
                  <>Uploaded by {getDocumentUserName(selectedDocument.userId)} on {new Date(selectedDocument.dateUploaded).toLocaleDateString()}</>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-grow min-h-[500px] overflow-hidden">
              {selectedDocument && (
                <DocumentPreview document={selectedDocument} onClose={() => {}} />
              )}
            </div>
            
            <DialogFooter className="p-4 border-t">
              {selectedDocument && selectedDocument.verificationStatus === 'pending' && (
                <div className="flex gap-2 w-full justify-end">
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setShowDocumentDialog(false);
                      handleRejectDocument(selectedDocument);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700" 
                    onClick={() => {
                      setShowDocumentDialog(false);
                      handleVerifyDocument(selectedDocument);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verify Document
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
};

export default DocumentManagement; 