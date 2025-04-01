import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, Filter, MoreHorizontal, 
  CheckCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAppData, Loan, User } from "@/utils/AppDataContext";

interface LoanExtended extends Loan {
  paidAmount?: number;
  paidMonths?: number;
  lastPaymentDate?: string;
  completionDate?: string;
}

const LoanManagement = () => {
  const { loans, users, updateLoan } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const navigate = useNavigate();

  // Filter loans based on search term and status filters
  const filteredLoans = loans.filter(loan => {
    const user = users.find(u => u.id === loan.userId);
    const fullName = user ? `${user.firstName} ${user.lastName}` : "";
    
    const matchesSearch = 
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.amount.toString().includes(searchTerm);
    
    const matchesStatusFilter = statusFilter.length === 0 || statusFilter.includes(loan.status);
    
    return matchesSearch && matchesStatusFilter;
  });

  // Toggle a status filter
  const toggleStatusFilter = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
  };

  // Handle loan details view
  const handleViewLoanDetails = (loanId: string) => {
    // Navigate to loan details page
    navigate(`/admin/loan/${loanId}`);
  };

  // Process payment for a loan
  const handleProcessPayment = (loanId: string) => {
    // In a real app, this would open a payment processing form
    const loan = loans.find(l => l.id === loanId) as LoanExtended;
    if (loan) {
      // For demo, we'll just update the loan with a new payment
      const updatedLoan = {
        ...loan,
        paidAmount: (loan.paidAmount || 0) + loan.monthlyPayment,
        paidMonths: (loan.paidMonths || 0) + 1,
        lastPaymentDate: new Date().toISOString().split('T')[0]
      };
      
      updateLoan(loanId, updatedLoan);
    }
  };

  // Mark a loan as defaulted
  const handleMarkAsDefaulted = (loanId: string) => {
    // Since "defaulted" is not in the loan status types, we'll use "rejected" instead
    updateLoan(loanId, { status: "rejected" });
  };

  // Mark a loan as completed
  const handleMarkAsCompleted = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (loan) {
      const updatedLoanData: Partial<LoanExtended> = { 
        status: "completed",
        paidAmount: loan.amount,
        paidMonths: loan.term
      };

      // Cast to use our extended properties
      updateLoan(loanId, updatedLoanData as Partial<Loan>);
    }
  };

  // Get user name for a loan
  const getLoanUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  // Get badge variant based on loan status
  const getLoanStatusVariant = (status: string) => {
    switch(status) {
      case "active": return "default";
      case "completed": return "outline";
      case "rejected": return "destructive";
      case "pending": return "secondary";
      default: return "default";
    }
  };

  // Calculate loan progress
  const calculateLoanProgress = (loan: LoanExtended) => {
    const paidMonths = loan.paidMonths || 0;
    const term = loan.term || 1;
    return Math.min(100, Math.round((paidMonths / term) * 100));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Loan Management</h2>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search loans..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetFilters}
            className="gap-1"
          >
            <Filter className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["active", "completed", "rejected", "pending"].map(status => (
          <Badge 
            key={status}
            variant={statusFilter.includes(status) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        ))}
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All Loans</TabsTrigger>
          <TabsTrigger value="active">Active Loans</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Payments</TabsTrigger>
          <TabsTrigger value="completed">Completed Loans</TabsTrigger>
        </TabsList>
        
        {/* All Loans Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Loan Portfolio</CardTitle>
              <CardDescription>Manage all loans in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.id}</TableCell>
                        <TableCell>{getLoanUserName(loan.userId)}</TableCell>
                        <TableCell>R{loan.amount.toLocaleString()}</TableCell>
                        <TableCell>{loan.term} months</TableCell>
                        <TableCell>
                          <Badge variant={getLoanStatusVariant(loan.status)}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={calculateLoanProgress(loan as LoanExtended)} className="h-2" />
                            <span className="text-xs">{calculateLoanProgress(loan as LoanExtended)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewLoanDetails(loan.id)}>
                                View Details
                              </DropdownMenuItem>
                              {loan.status === "active" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleProcessPayment(loan.id)}>
                                    Process Payment
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMarkAsDefaulted(loan.id)}>
                                    Mark as Rejected
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMarkAsCompleted(loan.id)}>
                                    Mark as Completed
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No loans found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Active Loans Tab */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
              <CardDescription>Currently active loans in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Next Payment</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.filter(loan => loan.status === "active").length > 0 ? (
                    filteredLoans
                      .filter(loan => loan.status === "active")
                      .map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>{loan.id}</TableCell>
                          <TableCell>{getLoanUserName(loan.userId)}</TableCell>
                          <TableCell>R{loan.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            R{(loan.amount - ((loan as LoanExtended).paidAmount || 0)).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {/* For demo, we'll just show next month */}
                            {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={calculateLoanProgress(loan as LoanExtended)} className="h-2" />
                              <span className="text-xs">{calculateLoanProgress(loan as LoanExtended)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleProcessPayment(loan.id)}
                            >
                              Payment
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No active loans found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Overdue Payments Tab */}
        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Payments</CardTitle>
              <CardDescription>Loans with late or missed payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* For demo purposes, we'll show overdue loans */}
                  {filteredLoans.filter(loan => 
                    loan.status === "active" && 
                    (!(loan as LoanExtended).lastPaymentDate || 
                      new Date((loan as LoanExtended).lastPaymentDate as string).getTime() < new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
                  ).length > 0 ? (
                    filteredLoans
                      .filter(loan => 
                        loan.status === "active" && 
                        (!(loan as LoanExtended).lastPaymentDate || 
                          new Date((loan as LoanExtended).lastPaymentDate as string).getTime() < new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
                      )
                      .map((loan) => {
                        const user = users.find(u => u.id === loan.userId);
                        const extendedLoan = loan as LoanExtended;
                        const daysSinceLastPayment = extendedLoan.lastPaymentDate 
                          ? Math.floor((new Date().getTime() - new Date(extendedLoan.lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24)) 
                          : 30;
                          
                        return (
                          <TableRow key={loan.id}>
                            <TableCell>{loan.id}</TableCell>
                            <TableCell>{getLoanUserName(loan.userId)}</TableCell>
                            <TableCell className="text-red-500">{daysSinceLastPayment} days</TableCell>
                            <TableCell>R{loan.monthlyPayment.toLocaleString()}</TableCell>
                            <TableCell>{user?.phone || "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">Overdue</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleProcessPayment(loan.id)}
                                >
                                  Payment
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleMarkAsDefaulted(loan.id)}
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No overdue payments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Completed Loans Tab */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Loans</CardTitle>
              <CardDescription>Loans that have been fully repaid</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.filter(loan => loan.status === "completed").length > 0 ? (
                    filteredLoans
                      .filter(loan => loan.status === "completed")
                      .map((loan) => {
                        const extendedLoan = loan as LoanExtended;
                        return (
                          <TableRow key={loan.id}>
                            <TableCell>{loan.id}</TableCell>
                            <TableCell>{getLoanUserName(loan.userId)}</TableCell>
                            <TableCell>R{loan.amount.toLocaleString()}</TableCell>
                            <TableCell>{loan.term} months</TableCell>
                            <TableCell>{loan.dateIssued || "N/A"}</TableCell>
                            <TableCell>{extendedLoan.completionDate || "N/A"}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewLoanDetails(loan.id)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No completed loans found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanManagement; 