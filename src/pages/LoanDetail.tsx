import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppData } from "@/utils/AppDataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  FileText,
  AlertCircle,
  RefreshCw,
  Bell,
  FilePenLine,
  XCircle,
  CheckCircle,
  Clock,
  BarChart,
  FileCheck,
  History
} from "lucide-react";
import { sendPaymentReminder } from "@/utils/twilioService";

const LoanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loans, users, updateLoan, addNotification, refreshData } = useAppData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  // Find the loan
  const loan = loans.find(l => l.id === id);
  
  // Find the associated user
  const user = loan ? users.find(u => u.id === loan.userId) : null;

  if (!loan) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loan Not Found</h2>
            <p className="text-muted-foreground">The loan you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate loan progress
  const progress = Math.min(100, Math.round(((loan.paidMonths || 0) / loan.term) * 100));

  // Format currency
  const formatCurrency = (amount: number) => `R${amount.toLocaleString()}`;

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Handle payment processing
  const handleProcessPayment = async () => {
    setIsProcessing(true);
    try {
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid payment amount");
        return;
      }

      const newPaidAmount = (loan.paidAmount || 0) + amount;
      const newPaidMonths = Math.floor(newPaidAmount / loan.monthlyPayment);
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      const success = await updateLoan(loan.id, {
        paidAmount: newPaidAmount,
        paidMonths: newPaidMonths,
        nextPaymentDue: nextPaymentDate.toISOString().split('T')[0]
      });

      if (success) {
        toast.success(`Payment of ${formatCurrency(amount)} processed successfully`);
        if (user) {
          // Send SMS notification
          await sendPaymentReminder(
            user.phone,
            user.firstName,
            amount,
            nextPaymentDate.toISOString().split('T')[0]
          );
          
          // Add to notifications
          addNotification({
            id: `payment-${Date.now()}`,
            userId: user.id,
            title: "Payment Processed",
            message: `Your payment of ${formatCurrency(amount)} has been processed successfully.`,
            type: "success",
            date: new Date().toISOString(),
            read: false
          });
        }
        setShowPaymentDialog(false);
        refreshData();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle sending payment reminder
  const handleSendReminder = async () => {
    setIsProcessing(true);
    try {
      if (!user?.phone) {
        toast.error("User contact information not available");
        return;
      }

      const result = await sendPaymentReminder(
        user.phone,
        user.firstName,
        loan.monthlyPayment,
        loan.nextPaymentDue || new Date().toISOString().split('T')[0]
      );

      if (result.success) {
        toast.success(`Payment reminder sent to ${user.firstName} ${user.lastName}`);
        addNotification({
          id: `reminder-${Date.now()}`,
          userId: user.id,
          title: "Payment Reminder Sent",
          message: `A payment reminder has been sent for your loan ${loan.id}`,
          type: "info",
          date: new Date().toISOString(),
          read: false
        });
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send payment reminder");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle marking loan as defaulted
  const handleMarkAsDefaulted = async () => {
    setIsProcessing(true);
    try {
      const success = await updateLoan(loan.id, { status: "rejected" });
      if (success) {
        toast.success(`Loan ${loan.id} marked as rejected`);
        refreshData();
      }
    } catch (error) {
      console.error("Error updating loan status:", error);
      toast.error("Failed to update loan status");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle marking loan as completed
  const handleMarkAsCompleted = async () => {
    setIsProcessing(true);
    try {
      const success = await updateLoan(loan.id, {
        status: "completed",
        paidAmount: loan.amount,
        paidMonths: loan.term
      });
      if (success) {
        toast.success(`Loan ${loan.id} marked as completed`);
        refreshData();
      }
    } catch (error) {
      console.error("Error updating loan status:", error);
      toast.error("Failed to update loan status");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Loans
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSendReminder}
            disabled={isProcessing || loan.status !== "active"}
          >
            {isProcessing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Bell className="h-4 w-4 mr-2" />
            )}
            Send Reminder
          </Button>
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogTrigger asChild>
              <Button disabled={isProcessing || loan.status !== "active"}>
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <DollarSign className="h-4 w-4 mr-2" />
                )}
                Process Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Payment</DialogTitle>
                <DialogDescription>
                  Enter the payment amount to process for this loan.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    className="col-span-3"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter payment amount"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProcessPayment} disabled={isProcessing}>
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    "Process Payment"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Header Card */}
        <Card className="border-blue-100 dark:border-blue-900">
          <CardHeader className="border-b border-blue-100 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent dark:from-blue-500 dark:to-indigo-500">
                  Loan Details
                </CardTitle>
                <CardDescription>Loan ID: {loan.id}</CardDescription>
              </div>
              <Badge variant={
                loan.status === "active" ? "default" :
                loan.status === "completed" ? "outline" :
                loan.status === "rejected" ? "destructive" :
                "secondary"
              } className="ml-auto">
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/30">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Amount</span>
                </div>
                <p className="text-2xl font-semibold">{formatCurrency(loan.amount)}</p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Term</span>
                </div>
                <p className="text-2xl font-semibold">{loan.term} months</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-950/30">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                  <FileText className="h-4 w-4" />
                  <span>Monthly Payment</span>
                </div>
                <p className="text-2xl font-semibold">{formatCurrency(loan.monthlyPayment)}</p>
              </div>
              <div className="p-4 rounded-lg bg-pink-50/50 dark:bg-pink-950/30">
                <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-2">
                  <User className="h-4 w-4" />
                  <span>Borrower</span>
                </div>
                <p className="text-2xl font-semibold">
                  {user ? `${user.firstName} ${user.lastName}` : "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Repayment Progress</CardTitle>
                <CardDescription>Track the loan repayment progress and upcoming payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{progress}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-blue-100 dark:border-blue-900">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <DollarSign className="h-4 w-4" />
                          <CardTitle className="text-sm">Paid Amount</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold">{formatCurrency(loan.paidAmount || 0)}</p>
                        <p className="text-sm text-muted-foreground">
                          {loan.paidMonths || 0} of {loan.term} months paid
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-indigo-100 dark:border-indigo-900">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                          <Clock className="h-4 w-4" />
                          <CardTitle className="text-sm">Remaining Amount</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold">
                          {formatCurrency(loan.amount - (loan.paidAmount || 0))}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {loan.term - (loan.paidMonths || 0)} months remaining
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-100 dark:border-purple-900">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                          <Calendar className="h-4 w-4" />
                          <CardTitle className="text-sm">Next Payment</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold">{formatCurrency(loan.monthlyPayment)}</p>
                        <p className="text-sm text-muted-foreground">
                          Due on {formatDate(loan.nextPaymentDue)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Loan Information</CardTitle>
                <CardDescription>Detailed information about the loan terms and conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <FileText className="h-4 w-4" />
                      Loan Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30">
                        <span className="text-muted-foreground">Loan Type</span>
                        <span className="font-medium">{loan.type}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30">
                        <span className="text-muted-foreground">Purpose</span>
                        <span className="font-medium">{loan.purpose || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30">
                        <span className="text-muted-foreground">Interest Rate</span>
                        <span className="font-medium">{loan.interestRate}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30">
                        <span className="text-muted-foreground">Total Repayment</span>
                        <span className="font-medium">{formatCurrency(loan.totalRepayment || loan.amount)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <Calendar className="h-4 w-4" />
                      Important Dates
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30">
                        <span className="text-muted-foreground">Application Date</span>
                        <span className="font-medium">{formatDate(loan.dateApplied)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30">
                        <span className="text-muted-foreground">Issue Date</span>
                        <span className="font-medium">{formatDate(loan.dateIssued)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30">
                        <span className="text-muted-foreground">First Payment</span>
                        <span className="font-medium">{loan.dateIssued ? new Date(loan.dateIssued).toLocaleDateString() : 'Not set'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30">
                        <span className="text-muted-foreground">Next Payment Due</span>
                        <span className="font-medium">{loan.nextPaymentDue ? new Date(loan.nextPaymentDue).toLocaleDateString() : 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track all payments and transactions for this loan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Payment history would go here - we'll need to add this data to the loan model */}
                  <p className="text-muted-foreground text-center py-8">
                    Payment history feature coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Loan Actions</CardTitle>
                <CardDescription>Manage loan status and perform administrative actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-blue-100 dark:border-blue-900">
                    <CardHeader>
                      <CardTitle className="text-lg">Status Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleMarkAsCompleted}
                        disabled={isProcessing || loan.status === "completed"}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-destructive"
                        onClick={handleMarkAsDefaulted}
                        disabled={isProcessing || loan.status === "rejected"}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Mark as Rejected
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-indigo-100 dark:border-indigo-900">
                    <CardHeader>
                      <CardTitle className="text-lg">Document Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate("/admin?tab=contracts", { state: { generateContractForLoanId: loan.id } })}
                      >
                        <FilePenLine className="h-4 w-4 mr-2" />
                        Generate Contract
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {/* Add statement download logic */}}
                      >
                        <FileCheck className="h-4 w-4 mr-2" />
                        Download Statement
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoanDetail; 