import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Mail,
  Send,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAppData, Contract } from '@/utils/AppDataContext';

interface UserContractsProps {
  userId: string;
}

const UserContracts: React.FC<UserContractsProps> = ({ userId }) => {
  const { contracts, loans, getUserById } = useAppData();
  const [userContracts, setUserContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Filter contracts for this user
    const filteredContracts = contracts.filter(contract => contract.userId === userId);
    setUserContracts(filteredContracts);
    setIsLoading(false);
  }, [contracts, userId]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Handle view contract
  const handleViewContract = (contract: Contract) => {
    if (contract.downloadUrl) {
      window.open(contract.downloadUrl, '_blank');
    } else {
      toast.error('Contract preview not available');
    }
  };

  // Get filtered contracts based on active tab
  const getFilteredContracts = () => {
    switch (activeTab) {
      case 'pending':
        return userContracts.filter(c => ['sent', 'viewed'].includes(c.status));
      case 'signed':
        return userContracts.filter(c => ['signed', 'completed'].includes(c.status));
      case 'expired':
        return userContracts.filter(c => ['expired', 'declined'].includes(c.status));
      default:
        return userContracts;
    }
  };

  // Get loan details
  const getLoanDetails = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (loan) {
      return `${loan.type} - R${loan.amount.toLocaleString()}`;
    }
    return 'Unknown Loan';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">My Contracts</CardTitle>
        <CardDescription>
          View and manage your loan contracts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Contracts</TabsTrigger>
            <TabsTrigger value="pending">Pending Signature</TabsTrigger>
            <TabsTrigger value="signed">Signed</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {getFilteredContracts().length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredContracts().map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>{getLoanDetails(contract.loanId)}</TableCell>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewContract(contract)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No contracts found</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      You don't have any contracts at the moment.
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {getFilteredContracts().length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan</TableHead>
                        <TableHead>Date Sent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredContracts().map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>{getLoanDetails(contract.loanId)}</TableCell>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewContract(contract)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No pending contracts</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      You don't have any contracts waiting for signature.
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="signed" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {getFilteredContracts().length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan</TableHead>
                        <TableHead>Date Signed</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredContracts().map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>{getLoanDetails(contract.loanId)}</TableCell>
                          <TableCell>{formatDate(contract.dateSigned)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(contract.status) as any}>
                              <div className="flex items-center">
                                {getStatusIcon(contract.status)}
                                <span className="ml-1 capitalize">{contract.status}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewContract(contract)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No signed contracts</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      You don't have any signed contracts.
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="expired" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {getFilteredContracts().length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredContracts().map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>{getLoanDetails(contract.loanId)}</TableCell>
                          <TableCell>{formatDate(contract.dateExpires)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(contract.status) as any}>
                              <div className="flex items-center">
                                {getStatusIcon(contract.status)}
                                <span className="ml-1 capitalize">{contract.status}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewContract(contract)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No expired contracts</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      You don't have any expired or declined contracts.
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserContracts; 