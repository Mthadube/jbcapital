import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, Filter, ArrowUpDown, MoreHorizontal, 
  Calendar, DollarSign, CheckCircle, AlertTriangle, XCircle, Clock, RefreshCw, Plus, FilePenLine, Bell, PlusCircle
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
import { sendPaymentReminder, sendPaymentConfirmation } from '@/utils/twilioService';
import { cn } from "@/lib/utils";

const LoanManagement = () => {
  const { loans, users, updateLoan, refreshData, addLoan, addNotification } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingLoanId, setProcessingLoanId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch data when component mounts
  useEffect(() => {
    fetchLoans();
  }, []);

  // Fetch loans from API
  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      await refreshData();
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
        status: "active" as "active" | "pending" | "completed" | "rejected" | "approved",
        dateApplied: new Date().toISOString().split('T')[0],
        dateIssued: new Date().toISOString().split('T')[0],
        paidAmount: 0,
        paidMonths: 0,
        remainingPayments: 12,
        nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextPaymentAmount: 885
      };
      
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
      
      // Get user information
      const user = users.find(u => u.id === loan.userId);
      
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
        
        // Send payment confirmation SMS if user has phone number
        if (user && user.phone) {
          try {
            const smsResult = await sendPaymentConfirmation(
              user.phone,
              user.firstName,
              loan.monthlyPayment
            );
            
            if (smsResult.success) {
              console.log('Payment confirmation SMS sent successfully');
            } else {
              console.error('Failed to send payment confirmation SMS:', smsResult.error);
            }
          } catch (smsError) {
            console.error('Error sending payment confirmation SMS:', smsError);
          }
        }
        
        // Add a notification for the user
        if (user) {
          addNotification({
            id: `payment-confirmation-${Date.now()}`,
            userId: user.id,
            title: "Payment Received",
            message: `Your payment of R${loan.monthlyPayment.toLocaleString()} has been received and processed. Thank you!`,
            type: "success",
            date: new Date().toISOString(),
            read: false
          });
        }
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

  // Send payment reminder to user
  const handleSendPaymentReminder = async (loanId: string) => {
    setProcessingLoanId(loanId);
    try {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) {
        toast.error("Loan not found");
        return;
      }
      
      // Get user information
      const user = users.find(u => u.id === loan.userId);
      if (!user || !user.phone) {
        toast.error("User contact information not available");
        return;
      }
      
      // Send SMS reminder
      const result = await sendPaymentReminder(
        user.phone,
        user.firstName,
        loan.monthlyPayment,
        loan.nextPaymentDue || new Date().toISOString().split('T')[0]
      );
      
      if (result.success) {
        toast.success(`Payment reminder sent to ${user.firstName} ${user.lastName}`);
        
        // Add to notifications
        addNotification({
          id: `payment-reminder-${Date.now()}`,
          userId: user.id,
          title: "Payment Reminder",
          message: `Your loan payment of R${loan.monthlyPayment.toLocaleString()} is overdue. Please make your payment as soon as possible.`,
          type: "warning",
          date: new Date().toISOString(),
          read: false
        });
      } else {
        toast.error("Failed to send payment reminder");
        console.error("SMS sending error:", result.error);
      }
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      toast.error("An error occurred while sending payment reminder");
    } finally {
      setProcessingLoanId(null);
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
      <Card className="w-full rounded-lg shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-t-lg border-b border-blue-100 dark:border-blue-900">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent dark:from-blue-500 dark:to-indigo-500">
                Loan Management
              </CardTitle>
              <CardDescription>
                View and manage all loans in the system
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchLoans}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                <span>Refresh</span>
              </Button>
              <Button 
                size="sm"
                onClick={createTestLoan}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>Create Test Loan</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
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
                  <Table className="w-full">
                    <TableHeader className="bg-blue-50/50 dark:bg-blue-950/30">
                      <TableRow className="hover:bg-blue-50/80 dark:hover:bg-blue-900/20">
                        <TableHead className="font-medium">Loan ID</TableHead>
                        <TableHead className="font-medium">Borrower</TableHead>
                        <TableHead className="font-medium">Amount</TableHead>
                        <TableHead className="font-medium">Term</TableHead>
                        <TableHead className="font-medium">Status</TableHead>
                        <TableHead className="font-medium">Progress</TableHead>
                        <TableHead className="font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoans.length > 0 ? (
                        filteredLoans.map((loan) => (
                          <TableRow 
                            key={loan.id} 
                            className={cn(
                              "cursor-pointer transition-colors",
                              "hover:bg-blue-50/80 dark:hover:bg-blue-900/20"
                            )}
                          >
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
                  <Table className="w-full">
                    <TableHeader className="bg-blue-50/50 dark:bg-blue-950/30">
                      <TableRow className="hover:bg-blue-50/80 dark:hover:bg-blue-900/20">
                        <TableHead className="font-medium">Loan ID</TableHead>
                        <TableHead className="font-medium">Borrower</TableHead>
                        <TableHead className="font-medium">Amount</TableHead>
                        <TableHead className="font-medium">Monthly Payment</TableHead>
                        <TableHead className="font-medium">Next Payment</TableHead>
                        <TableHead className="font-medium">Progress</TableHead>
                        <TableHead className="font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoans.filter(loan => loan.status === "active").length > 0 ? (
                        filteredLoans
                          .filter(loan => loan.status === "active")
                          .map((loan) => (
                            <TableRow 
                              key={loan.id} 
                              className={cn(
                                "cursor-pointer transition-colors",
                                "hover:bg-blue-50/80 dark:hover:bg-blue-900/20"
                              )}
                            >
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
                  <Table className="w-full">
                    <TableHeader className="bg-blue-50/50 dark:bg-blue-950/30">
                      <TableRow className="hover:bg-blue-50/80 dark:hover:bg-blue-900/20">
                        <TableHead className="font-medium">Loan ID</TableHead>
                        <TableHead className="font-medium">Borrower</TableHead>
                        <TableHead className="font-medium">Days Overdue</TableHead>
                        <TableHead className="font-medium">Amount Due</TableHead>
                        <TableHead className="font-medium">Contact</TableHead>
                        <TableHead className="font-medium">Status</TableHead>
                        <TableHead className="font-medium text-right">Actions</TableHead>
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
                              <TableRow 
                                key={loan.id} 
                                className={cn(
                                  "cursor-pointer transition-colors",
                                  "hover:bg-blue-50/80 dark:hover:bg-blue-900/20"
                                )}
                              >
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
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleSendPaymentReminder(loan.id)}
                                      disabled={processingLoanId === loan.id}
                                    >
                                      {processingLoanId === loan.id ? (
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                      ) : (
                                        <Bell className="mr-2 h-4 w-4" />
                                      )}
                                      Remind
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
                  <Table className="w-full">
                    <TableHeader className="bg-blue-50/50 dark:bg-blue-950/30">
                      <TableRow className="hover:bg-blue-50/80 dark:hover:bg-blue-900/20">
                        <TableHead className="font-medium">Loan ID</TableHead>
                        <TableHead className="font-medium">Borrower</TableHead>
                        <TableHead className="font-medium">Amount</TableHead>
                        <TableHead className="font-medium">Term</TableHead>
                        <TableHead className="font-medium">Start Date</TableHead>
                        <TableHead className="font-medium">End Date</TableHead>
                        <TableHead className="font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoans.filter(loan => loan.status === "completed").length > 0 ? (
                        filteredLoans
                          .filter(loan => loan.status === "completed")
                          .map((loan: any) => (
                            <TableRow 
                              key={loan.id} 
                              className={cn(
                                "cursor-pointer transition-colors",
                                "hover:bg-blue-50/80 dark:hover:bg-blue-900/20"
                              )}
                            >
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
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanManagement; 