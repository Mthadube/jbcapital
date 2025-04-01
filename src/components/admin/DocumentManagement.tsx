import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, Filter, FileText, CheckCircle, 
  XCircle, Download, Eye, UploadCloud, FileWarning, MoreHorizontal, UserCircle,
  RefreshCw
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

  // View document details
  const handleViewDocument = (document: DocumentInfo) => {
    setSelectedDocument(document);
    setShowDocumentDialog(true);
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

  // Simulating download functionality
  const handleDownloadDocument = (document: DocumentInfo) => {
    toast.success(`Downloading ${document.name}`);
    // In a real app, this would trigger a file download
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
                  <TableHead>Document Name</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date Uploaded</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                        Loading documents...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-red-500">
                      Error loading documents. Please try refreshing.
                    </TableCell>
                  </TableRow>
                ) : filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-mono text-xs">{doc.id}</TableCell>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <UserCircle className="mr-1 h-4 w-4 text-muted-foreground" />
                          {getDocumentUserName(doc.userId)}
                        </div>
                      </TableCell>
                      <TableCell>{doc.dateUploaded}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <FileText className="mr-1 h-3 w-3" />
                          {doc.type.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            doc.verificationStatus === "verified" ? "default" :
                            doc.verificationStatus === "rejected" ? "destructive" : 
                            "outline"
                          }
                        >
                          {doc.verificationStatus === "verified" ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : doc.verificationStatus === "rejected" ? (
                            <XCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <FileWarning className="mr-1 h-3 w-3" />
                          )}
                          {doc.verificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleVerifyDocument(doc)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRejectDocument(doc)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No documents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Document View Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              View and manage document information
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedDocument.name}</h3>
                    <p className="text-sm text-muted-foreground">Submitted by {getDocumentUserName(selectedDocument.userId)}</p>
                  </div>
                  <Badge 
                    variant={
                      selectedDocument.verificationStatus === "verified" ? "default" :
                      selectedDocument.verificationStatus === "rejected" ? "destructive" : 
                      "outline"
                    }
                  >
                    {selectedDocument.verificationStatus}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Document ID</p>
                  <p className="text-sm font-mono">{selectedDocument.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date Uploaded</p>
                  <p className="text-sm">{selectedDocument.dateUploaded}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Document Type</p>
                  <p className="text-sm">{selectedDocument.type.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">File Info</p>
                  <p className="text-sm">{selectedDocument.fileType}, {selectedDocument.fileSize || 'Unknown size'}</p>
                </div>
              </div>
              
              {selectedDocument.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm mt-1 p-2 border rounded-md">{selectedDocument.notes}</p>
                </div>
              )}
              
              <div className="border rounded-lg p-6 flex justify-center items-center h-64 bg-muted/50">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 font-medium">Document Preview</p>
                  <p className="text-sm text-muted-foreground">Preview unavailable</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleDownloadDocument(selectedDocument)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Document
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex items-center justify-between">
            <div className="flex space-x-2">
              {selectedDocument?.verificationStatus !== "verified" && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center text-green-600" 
                  onClick={() => {
                    setShowDocumentDialog(false);
                    handleVerifyDocument(selectedDocument!);
                  }}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Verify
                </Button>
              )}
              {selectedDocument?.verificationStatus !== "rejected" && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center text-red-600" 
                  onClick={() => {
                    setShowDocumentDialog(false);
                    handleRejectDocument(selectedDocument!);
                  }}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => setShowDocumentDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify/Reject Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verificationStatus === "verified" ? "Verify Document" : "Reject Document"}
            </DialogTitle>
            <DialogDescription>
              {verificationStatus === "verified"
                ? "Confirm that this document meets all requirements."
                : "Provide a reason for rejecting this document."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDocument && (
              <div className="flex items-center space-x-4 p-2 border rounded-md">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">{selectedDocument.name}</p>
                  <p className="text-sm text-muted-foreground">Submitted by {getDocumentUserName(selectedDocument.userId)}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">
                {verificationStatus === "verified" ? "Verification Notes (Optional)" : "Rejection Reason (Required)"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  verificationStatus === "verified"
                    ? "Add any notes about this verification..."
                    : "Explain why this document is being rejected..."
                }
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVerifyDialog(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              variant={verificationStatus === "verified" ? "default" : "destructive"}
              onClick={handleSubmitVerification}
              disabled={
                (verificationStatus === "rejected" && !verificationNotes.trim()) || 
                updating
              }
            >
              {updating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                verificationStatus === "verified" ? "Verify Document" : "Reject Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentManagement; 