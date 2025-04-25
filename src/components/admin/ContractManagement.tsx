import React, { useState, useEffect } from 'react';
import { useAppData, Contract, Loan } from '@/utils/AppDataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Send, CheckCircle, Clock, AlertTriangle, Download, 
  RefreshCw, Eye, XCircle, Info, Mail, FileCheck 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { getContractStatus } from '@/utils/api';

const ContractManagement = () => {
  const { 
    contracts, 
    loans, 
    users, 
    generateContract, 
    sendContractForSignature,
    updateContract, 
    getContractById, 
    getContractsByLoanId,
    getUserById
  } = useAppData();
  
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Sort contracts by creation date in descending order
  const sortedContracts = [...contracts].sort((a, b) => {
    const dateA = new Date(a.dateCreated || 0);
    const dateB = new Date(b.dateCreated || 0);
    return dateB.getTime() - dateA.getTime();
  });

  // Filter contracts based on search term and status
  const filteredContracts = sortedContracts.filter(contract => {
    const searchMatch = contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       contract.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       contract.status.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter.length === 0 || statusFilter.includes(contract.status);
    return searchMatch && statusMatch;
  });

  // Handle generate contract
  const handleGenerateContract = async (loan: Loan) => {
    setSelectedLoan(loan);
    setIsGenerating(true);
    
    try {
      const contract = await generateContract(loan.id);
      if (contract) {
        setSelectedContract(contract);
        setShowSendDialog(true);
        setRecipientEmail(users.find(u => u.id === loan.userId)?.email || '');
        toast.success('Contract generated successfully');
      } else {
        toast.error('Failed to generate contract: No response from server');
      }
    } catch (error) {
      console.error('Error generating contract:', error);
      
      // More detailed error handling
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Network error: Could not connect to the server');
      } else if (error instanceof Error) {
        toast.error(`Failed to generate contract: ${error.message}`);
      } else {
        toast.error('Failed to generate contract');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle send contract for signature
  const handleSendForSignature = async () => {
    if (!selectedContract) return;
    
    setIsSending(true);
    
    try {
      const success = await sendContractForSignature(selectedContract.id, recipientEmail);
      if (success) {
        setShowSendDialog(false);
        toast.success('Contract sent for signature');
      } else {
        toast.error('Failed to send contract: No success response from server');
      }
    } catch (error) {
      console.error('Error sending contract:', error);
      
      // More detailed error handling
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Network error: Could not connect to the server');
      } else if (error instanceof Error) {
        toast.error(`Failed to send contract: ${error.message}`);
      } else {
        toast.error('Failed to send contract for signature');
      }
    } finally {
      setIsSending(false);
    }
  };

  // Handle download contract
  const handleDownloadContract = (contract: Contract) => {
    if (contract.downloadUrl) {
      window.open(contract.downloadUrl, '_blank');
    } else {
      toast.error('Download URL not available');
    }
  };

  // Handle refresh contract status
  const handleRefreshContractStatus = async (contract: Contract) => {
    setRefreshing(true);
    
    try {
      const response = await getContractStatus(contract.id);
      
      if (response.success && response.data) {
        await updateContract(contract.id, {
          status: response.data.status,
          dateViewed: response.data.viewedAt,
          dateSigned: response.data.signedAt,
          dateExpires: response.data.expiresAt,
          downloadUrl: response.data.downloadUrl
        });
        
        toast.success('Contract status updated');
      } else {
        console.error('Contract status refresh failed:', response.error);
        toast.error(`Failed to refresh contract status: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error refreshing contract status:', error);
      
      // More detailed error handling for different error types
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Network error: Could not connect to the server');
      } else if (error instanceof Error) {
        toast.error(`Error refreshing contract status: ${error.message}`);
      } else {
        toast.error('Error refreshing contract status');
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Get badge variant for contract status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'default';
      case 'viewed': return 'outline';
      case 'signed': return 'success';
      case 'completed': return 'success';
      case 'expired': return 'destructive';
      case 'declined': return 'destructive';
      default: return 'outline';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'viewed': return <Eye className="h-4 w-4" />;
      case 'signed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <FileCheck className="h-4 w-4" />;
      case 'expired': return <Clock className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user name
  const getUserName = (userId: string) => {
    const user = getUserById(userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  // Inside the ContractManagement component, add this effect after the state declarations
  useEffect(() => {
    // Check if we were navigated here with a loan ID to generate a contract for
    const checkForContractGeneration = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      
      // Only process if we're on the contracts tab
      if (tabParam === 'contracts') {
        // Check for state parameter from navigation
        const state = window.history.state?.state;
        const loanId = state?.generateContractForLoanId;
        
        if (loanId) {
          // Find the loan
          const loan = loans.find(l => l.id === loanId);
          if (loan) {
            // Clear the state to prevent re-processing
            window.history.replaceState(
              { ...window.history.state, state: { ...state, generateContractForLoanId: null } },
              document.title,
              window.location.href
            );
            
            // Generate the contract
            handleGenerateContract(loan);
          }
        }
      }
    };
    
    checkForContractGeneration();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Contract Management</h2>
        
        <div className="flex items-center space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate New Contract
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Contract</DialogTitle>
                <DialogDescription>
                  Select a loan to generate a contract for.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="loan" className="text-right">
                    Select Loan
                  </Label>
                  <div className="col-span-3">
                    <select
                      id="loan"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onChange={(e) => {
                        const loanId = e.target.value;
                        const loan = loans.find(l => l.id === loanId);
                        if (loan) {
                          setSelectedLoan(loan);
                        }
                      }}
                    >
                      <option value="">Select a loan</option>
                      {loans
                        .filter(loan => loan.status === 'active')
                        .map(loan => {
                          const user = users.find(u => u.id === loan.userId);
                          const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
                          
                          return (
                            <option key={loan.id} value={loan.id}>
                              {`${loan.id} - ${userName} - R${loan.amount.toLocaleString()}`}
                            </option>
                          );
                        })
                      }
                    </select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  onClick={() => {
                    if (selectedLoan) {
                      handleGenerateContract(selectedLoan);
                    }
                  }}
                  disabled={!selectedLoan || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Contract
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Input 
            type="search" 
            placeholder="Search contracts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="pending">Pending Signature</TabsTrigger>
          <TabsTrigger value="signed">Signed</TabsTrigger>
          <TabsTrigger value="expired">Expired/Declined</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Contracts</CardTitle>
              <CardDescription>
                View and manage all loan contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.length > 0 ? (
                    filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>{contract.id}</TableCell>
                        <TableCell>{contract.loanId}</TableCell>
                        <TableCell>{getUserName(contract.userId)}</TableCell>
                        <TableCell>{formatDate(contract.dateCreated)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(contract.status) as any}>
                            <div className="flex items-center">
                              {getStatusIcon(contract.status)}
                              <span className="ml-1 capitalize">{contract.status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(
                            contract.dateSigned || 
                            contract.dateViewed || 
                            contract.dateSent || 
                            contract.dateCreated
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <svg
                                  className="h-4 w-4"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              
                              <DropdownMenuItem onClick={() => handleDownloadContract(contract)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              
                              {contract.status === 'draft' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedContract(contract);
                                    setRecipientEmail(users.find(u => u.id === contract.userId)?.email || '');
                                    setShowSendDialog(true);
                                  }}
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Send for Signature
                                </DropdownMenuItem>
                              )}
                              
                              {['sent', 'viewed'].includes(contract.status) && (
                                <DropdownMenuItem onClick={() => handleRefreshContractStatus(contract)}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Refresh Status
                                </DropdownMenuItem>
                              )}
                              
                              {contract.status === 'sent' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedContract(contract);
                                    setRecipientEmail(users.find(u => u.id === contract.userId)?.email || '');
                                    setShowSendDialog(true);
                                  }}
                                >
                                  <Mail className="mr-2 h-4 w-4" />
                                  Resend
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No contracts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Signature Contracts</CardTitle>
              <CardDescription>
                Contracts that have been sent but not yet signed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.filter(c => ['sent', 'viewed'].includes(c.status)).length > 0 ? (
                    filteredContracts
                      .filter(c => ['sent', 'viewed'].includes(c.status))
                      .map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>{contract.id}</TableCell>
                          <TableCell>{contract.loanId}</TableCell>
                          <TableCell>{getUserName(contract.userId)}</TableCell>
                          <TableCell>{formatDate(contract.dateSent)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(contract.status) as any}>
                              <div className="flex items-center">
                                {getStatusIcon(contract.status)}
                                <span className="ml-1 capitalize">{contract.status}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRefreshContractStatus(contract)}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh Status
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setRecipientEmail(users.find(u => u.id === contract.userId)?.email || '');
                                  setShowSendDialog(true);
                                }}
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Resend
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No pending contracts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="signed">
          <Card>
            <CardHeader>
              <CardTitle>Signed Contracts</CardTitle>
              <CardDescription>
                Contracts that have been signed and completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Signed Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.filter(c => ['signed', 'completed'].includes(c.status)).length > 0 ? (
                    filteredContracts
                      .filter(c => ['signed', 'completed'].includes(c.status))
                      .map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>{contract.id}</TableCell>
                          <TableCell>{contract.loanId}</TableCell>
                          <TableCell>{getUserName(contract.userId)}</TableCell>
                          <TableCell>{formatDate(contract.dateSigned)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadContract(contract)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No signed contracts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expired">
          <Card>
            <CardHeader>
              <CardTitle>Expired or Declined Contracts</CardTitle>
              <CardDescription>
                Contracts that have expired or been declined
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.filter(c => ['expired', 'declined'].includes(c.status)).length > 0 ? (
                    filteredContracts
                      .filter(c => ['expired', 'declined'].includes(c.status))
                      .map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>{contract.id}</TableCell>
                          <TableCell>{contract.loanId}</TableCell>
                          <TableCell>{getUserName(contract.userId)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(contract.status) as any}>
                              <div className="flex items-center">
                                {getStatusIcon(contract.status)}
                                <span className="ml-1 capitalize">{contract.status}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(contract.dateExpires)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleGenerateContract(loans.find(l => l.id === contract.loanId)!)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Generate New
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No expired or declined contracts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Contract for Signature</DialogTitle>
            <DialogDescription>
              The contract will be sent to the client for electronic signature.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient-email">Recipient Email</Label>
              <Input
                id="recipient-email"
                placeholder="client@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSendDialog(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendForSignature}
              disabled={isSending || !recipientEmail}
            >
              {isSending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Contract
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractManagement; 