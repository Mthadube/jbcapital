import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, Filter, ArrowUpDown, MoreHorizontal, 
  Calendar, DollarSign, CheckCircle, AlertTriangle, XCircle, Clock, RefreshCw, Plus, FilePenLine
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
import { useAppData } from "@/utils/AppDataContext";
import { toast } from "sonner";
import * as api from "@/utils/api";
import { generateRandomId } from "@/utils/helpers";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const LoanManagement = () => {
  const { loans, users, updateLoan, refreshData, addLoan } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingLoanId, setProcessingLoanId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch data when component mounts
  useEffect(() => {
    console.log("LoanManagement component mounted");
    fetchLoans();
    
    // Log existing loans after a short delay to ensure data is loaded
    const timer = setTimeout(() => {
      console.log("Current loans in state:", loans);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Fetch loans from API
  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      await refreshData();
      console.log("Loans after refresh:", loans);
      toast.success("Loan data refreshed successfully");
    } catch (error) {
      console.error("Error fetching loans:", error);
      toast.error("Failed to fetch loans");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a test loan for debugging
  const createTestLoan = async () => {
    setIsLoading(true);
    try {
      // Find a user to associate with the loan
      const user = users[0];
      if (!user) {
        toast.error("No users available to create test loan");
        return;
      }
      
      // Create a new test loan
      const newLoan = {
        id: generateRandomId("LN"),
        userId: user.id,
        type: "Personal Loan",
        purpose: "Test Loan",
        amount: 10000,
        interestRate: 10.5,
        term: 12,
        monthlyPayment: 885,
        totalRepayment: 10620,
        status: "active",
        dateApplied: new Date().toISOString().split('T')[0],
        dateIssued: new Date().toISOString().split('T')[0],
        paidAmount: 0,
        paidMonths: 0,
        remainingPayments: 12,
        nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextPaymentAmount: 885
      };
      
      console.log("Creating test loan:", newLoan);
      const success = await addLoan(newLoan);
      
      if (success) {
        toast.success("Test loan created successfully");
        await fetchLoans(); // Refresh data to show the new loan
      } else {
        toast.error("Failed to create test loan");
      }
    } catch (error) {
      console.error("Error creating test loan:", error);
      toast.error("An error occurred while creating test loan");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Log whenever filteredLoans changes
  useEffect(() => {
    console.log("Filtered loans:", filteredLoans);
  }, [filteredLoans]);

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
  const handleProcessPayment = async (loanId: string) => {
    setProcessingLoanId(loanId);
    try {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) {
        toast.error("Loan not found");
        return;
      }
      
      // Calculate updated values
      const updatedLoan = {
        ...loan,
        paidAmount: (loan.paidAmount || 0) + loan.monthlyPayment,
        paidMonths: (loan.paidMonths || 0) + 1,
      };
      
      // Update using API
      const success = await updateLoan(loanId, updatedLoan);
      
      if (success) {
        toast.success(`Payment of R${loan.monthlyPayment.toLocaleString()} processed for loan ${loanId}`);
      } else {
        toast.error("Failed to process payment");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("An error occurred while processing payment");
    } finally {
      setProcessingLoanId(null);
    }
  };

  // Mark a loan as defaulted
  const handleMarkAsDefaulted = async (loanId: string) => {
    setProcessingLoanId(loanId);
    try {
      // Using type assertion to bypass type checking
      const success = await updateLoan(loanId, { status: "defaulted" as any });
      
      if (success) {
        toast.success(`Loan ${loanId} marked as defaulted`);
      } else {
        toast.error("Failed to update loan status");
      }
    } catch (error) {
      console.error("Error updating loan status:", error);
      toast.error("An error occurred while updating loan status");
    } finally {
      setProcessingLoanId(null);
    }
  };

  // Mark a loan as completed
  const handleMarkAsCompleted = async (loanId: string) => {
    setProcessingLoanId(loanId);
    try {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) {
        toast.error("Loan not found");
        return;
      }
      
      // Using type assertion to bypass type checking
      const updateData: any = { 
        status: "completed",
        paidAmount: loan.amount,
        paidMonths: loan.term
      };
      
      const success = await updateLoan(loanId, updateData);
      
      if (success) {
        toast.success(`Loan ${loanId} marked as completed`);
      } else {
        toast.error("Failed to update loan status");
      }
    } catch (error) {
      console.error("Error updating loan status:", error);
      toast.error("An error occurred while updating loan status");
    } finally {
      setProcessingLoanId(null);
    }
  };

  // Add handleGenerateContract function after the other handler functions
  const handleGenerateContract = async (loanId: string) => {
    setProcessingLoanId(loanId);
    try {
      // Get the loan and user
      const loan = loans.find(l => l.id === loanId);
      if (!loan) {
        toast.error("Loan not found");
        return;
      }

      // Navigate to the contracts tab with the loan ID
      navigate("/admin?tab=contracts", { 
        state: { 
          generateContractForLoanId: loanId 
        }
      });
      
      toast.success(`Navigating to contract generation for loan ${loanId}`);
    } catch (error) {
      console.error("Error navigating to contract generation:", error);
      toast.error("An error occurred while preparing contract generation");
    } finally {
      setProcessingLoanId(null);
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
      case "defaulted": return "destructive";
      case "pending": return "secondary";
      default: return "default";
    }
  };

  // Calculate loan progress
  const calculateLoanProgress = (loan: any) => {
    const paidMonths = loan.paidMonths || 0;
    const term = loan.term || 1;
    return Math.min(100, Math.round((paidMonths / term) * 100));
  };

  // Format date string
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  // Show loading state if data is loading
  if (isLoading && loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-medium">Loading loan data...</h3>
      </div>
    );
  }

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
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchLoans}
            disabled={isLoading}
            className="gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={createTestLoan}
            disabled={isLoading}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Create Test Loan</span>
          </Button>
        </div>
      </div>

      {/* Debugging information */}
      <div className="rounded-md border p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">Debug Information</h3>
        <p>Total loans in system: {loans.length}</p>
        <p>Loans shown after filtering: {filteredLoans.length}</p>
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => console.log("Current loans:", loans)}
          >
            Log Loans to Console
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["active", "completed", "defaulted", "pending"].map(status => (
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
                            <Progress value={calculateLoanProgress(loan)} className="h-2" />
                            <span className="text-xs">{calculateLoanProgress(loan)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={processingLoanId === loan.id}>
                                {processingLoanId === loan.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
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
                                  <DropdownMenuItem onClick={() => handleGenerateContract(loan.id)}>
                                    <FilePenLine className="mr-2 h-4 w-4" />
                                    Generate Contract
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMarkAsDefaulted(loan.id)}>
                                    Mark as Defaulted
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
              <CardDescription>Manage loans that are currently active</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Monthly Payment</TableHead>
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
                          <TableCell>R{loan.monthlyPayment.toLocaleString()}</TableCell>
                          <TableCell>{formatDate(loan.nextPaymentDue)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={calculateLoanProgress(loan)} className="h-2" />
                              <span className="text-xs">
                                {loan.paidMonths || 0}/{loan.term} months
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleProcessPayment(loan.id)}
                              disabled={processingLoanId === loan.id}
                            >
                              {processingLoanId === loan.id ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <DollarSign className="mr-2 h-4 w-4" />
                              )}
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
                  {filteredLoans.filter(loan => 
                    loan.status === "active" && 
                    loan.nextPaymentDue && 
                    new Date(loan.nextPaymentDue) < new Date()
                  ).length > 0 ? (
                    filteredLoans
                      .filter(loan => 
                        loan.status === "active" && 
                        loan.nextPaymentDue && 
                        new Date(loan.nextPaymentDue) < new Date()
                      )
                      .map((loan) => {
                        const user = users.find(u => u.id === loan.userId);
                        const daysSinceLastPayment = loan.nextPaymentDue 
                          ? Math.floor((new Date().getTime() - new Date(loan.nextPaymentDue).getTime()) / (1000 * 60 * 60 * 24)) 
                          : 0;
                          
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
                                  disabled={processingLoanId === loan.id}
                                >
                                  {processingLoanId === loan.id ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <DollarSign className="mr-2 h-4 w-4" />
                                  )}
                                  Payment
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleMarkAsDefaulted(loan.id)}
                                  disabled={processingLoanId === loan.id}
                                >
                                  {processingLoanId === loan.id ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="mr-2 h-4 w-4" />
                                  )}
                                  Default
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
                      .map((loan: any) => (
                        <TableRow key={loan.id}>
                          <TableCell>{loan.id}</TableCell>
                          <TableCell>{getLoanUserName(loan.userId)}</TableCell>
                          <TableCell>R{loan.amount.toLocaleString()}</TableCell>
                          <TableCell>{loan.term} months</TableCell>
                          <TableCell>{formatDate(loan.dateIssued)}</TableCell>
                          <TableCell>{formatDate(loan.completionDate)}</TableCell>
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
                      ))
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