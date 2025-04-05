import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertTriangle, Clock, FileText, Filter, 
  CheckCircle, XCircle, Eye, Search, Download, 
  ArrowUpRight, ArrowRight, UserSearch, User, CreditCard,
  DollarSign, CalendarCheck, FileCheck, Check, MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import UserProfileView from "./UserProfileView";
import { Progress } from "@/components/ui/progress";
import { useAppData, Application, Loan } from "@/utils/AppDataContext";
import { generateRandomId } from "@/utils/helpers";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { createLoan, updateApplication } from "@/utils/api";

// Define loan application status type
export type ApplicationStatus = 
  | "pending"
  | "document_verification" 
  | "credit_assessment"
  | "final_review"
  | "approved"
  | "rejected"
  | "disbursed"
  | "funded";

// Friendly display names for application statuses
const STATUS_DISPLAY_NAMES = {
  'pending': 'New Application',
  'document_verification': 'Document Verification',
  'credit_assessment': 'Credit Assessment',
  'final_review': 'Final Review',
  'approved': 'Approved',
  'rejected': 'Rejected'
};

// Define the workflow steps for loan application processing
export const WORKFLOW_STEPS = [
  {
    id: "pending",
    name: "New Application",
    description: "Initial application review",
    icon: <Clock className="h-4 w-4" />,
    color: "bg-amber-100 text-amber-800",
    requiredDocuments: ['id', 'proof_of_residence'],
    requiredChecks: ['application_completeness'],
    nextStep: "document_verification"
  },
  {
    id: "document_verification",
    name: "Document Verification",
    description: "Verify all submitted documents",
    icon: <FileText className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-800",
    requiredDocuments: ['bank_statement', 'payslip'],
    requiredChecks: ['document_authenticity', 'fraud_check'],
    nextStep: "credit_assessment"
  },
  {
    id: "credit_assessment",
    name: "Credit Assessment",
    description: "Evaluate credit worthiness",
    icon: <CreditCard className="h-4 w-4" />,
    color: "bg-indigo-100 text-indigo-800",
    requiredDocuments: [],
    requiredChecks: ['credit_score', 'affordability', 'debt_ratio'],
    nextStep: "final_review"
  },
  {
    id: "final_review",
    name: "Final Review",
    description: "Make final decision",
    icon: <FileCheck className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-800",
    requiredDocuments: [],
    requiredChecks: ['compliance', 'risk_assessment'],
    nextStep: "decision" // Special case - leads to either approved or rejected
  },
  {
    id: "approved",
    name: "Approved",
    description: "Application approved",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-green-100 text-green-800",
    requiredDocuments: [],
    requiredChecks: [],
    nextStep: null
  },
  {
    id: "rejected",
    name: "Rejected",
    description: "Application rejected",
    icon: <XCircle className="h-4 w-4" />,
    color: "bg-red-100 text-red-800",
    requiredDocuments: [],
    requiredChecks: [],
    nextStep: null
  }
];

// Define workflow step constants for the UI
export const WORKFLOW_STATUSES = [
  "pending",
  "document_verification", 
  "credit_assessment",
  "final_review",
  "approved",
  "rejected"
] as const;

// Export WORKFLOW_STATUSES as APPLICATION_STATUSES to avoid breaking existing code
export const APPLICATION_STATUSES = WORKFLOW_STATUSES;

// Status constants for badges
const badgeVariants = {
  pending: "secondary",
  document_verification: "outline",
  credit_assessment: "outline",
  final_review: "outline",
  approved: "default",
  rejected: "destructive"
};

// Override the Application interface to include our new status types
interface ExtendedApplication extends Omit<Application, 'status'> {
  status: ApplicationStatus;
}

const ApplicationProcessing = () => {
  const { applications, updateApplication, users, getUserById, addNotification, addLoan, refreshData } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [currentApplication, setCurrentApplication] = useState<any>(null);
  const [showUserProfileDrawer, setShowUserProfileDrawer] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<any>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Filter applications based on search term and status filters
  const filteredApplications = applications.filter(app => {
    const user = getUserById(app.userId);
    const userName = user ? `${user.firstName} ${user.lastName}` : "";
    
    const matchesSearch = app.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.amount?.toString().includes(searchTerm);
    
    const matchesStatusFilter = statusFilter.length === 0 || statusFilter.includes(app.status);
    
    return matchesSearch && matchesStatusFilter;
  }) as ExtendedApplication[];

  // Get the applicant name from userId
  const getApplicantName = (userId: string) => {
    const user = getUserById(userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown";
  };

  // Utility function to get appropriate variant for status badges
  const getStatusVariant = (status: string) => {
    switch(status) {
      case "approved": return "default";
      case "rejected": return "destructive";
      case "pending": return "secondary";
      case "document_verification": return "outline";
      case "credit_assessment": return "outline";
      case "final_review": return "outline";
      default: return "secondary";
    }
  };

  // Handle clicking on an application to process it
  const handleProcessApplication = (app: any) => {
    setCurrentApplication(app);
    // Navigate to the detailed view
    navigate(`/admin/application/${app.id}`);
  };

  // Handle viewing details of an application
  const handleViewDetails = (app: any) => {
    setCurrentApplication(app);
    navigate(`/admin/application/${app.id}`);
  };

  // Advance the application to the next stage in the workflow
  const handleAdvanceStage = (app: any) => {
    // Find the current step in the workflow
    const currentStep = WORKFLOW_STEPS.find(step => step.id === app.status);
    
    if (!currentStep || !currentStep.nextStep) {
      toast.info("Application is already in its final state");
      return;
    }
    
    // If the next step is "decision", we should prompt for approval/rejection
    if (currentStep.nextStep === "decision") {
      toast.info("Application is ready for final decision", {
        description: "Please choose to approve or reject this application"
      });
      return;
    }
    
    // Otherwise, move to the next step in the workflow
    const nextStepId = currentStep.nextStep;
    handleStatusChange(app.id, nextStepId as any);
  };

  // Approve the application
  const handleApproveApplication = async (app: any) => {
    await handleStatusChange(app.id, "approved");
    toast.success(`Application ${app.id} has been approved`);
  };

  // Reject the application
  const handleRejectApplication = async (app: any) => {
    await handleStatusChange(app.id, "rejected");
    toast.success(`Application ${app.id} has been rejected`);
  };

  // Request more information for an application
  const handleRequestMoreInfo = (app: any) => {
    updateApplication(app.id, { 
      requiredAction: "Additional information required"
    });
    toast.info(`Request for more information sent to applicant`);
  };

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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

  // Get icon for a status
  const getStatusIcon = (status: string) => {
    const step = WORKFLOW_STEPS.find(step => step.id === status);
    return step?.icon || <AlertTriangle size={16} />;
  };

  // Get display name for status
  const getStatusDisplayName = (status: string): string => {
    const step = WORKFLOW_STEPS.find(step => step.id === status);
    return step?.name || status;
  };

  // Add a helper function to prepare loan data with consistent formatting
  const prepareLoanData = (
    application: Application, 
    userId: string,
    useApplicationId: boolean = false
  ): any => {
    // Get the loan amount as a number - remove currency symbols and commas
    const amount = parseFloat(application.amount.replace(/[^0-9.]/g, ''));
    
    // Get current date for issue date
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Parse interest rate - remove percentage sign if present
    let interestRate = 10.5; // Default value
    if (application.loanDetails?.interestRate) {
      // Convert to string first to ensure we can handle both string and number types
      const rateStr = String(application.loanDetails.interestRate);
      // Remove percentage sign and any non-numeric characters except decimal point
      interestRate = parseFloat(rateStr.replace(/[^0-9.]/g, ''));
    }
    
    // Parse term as number
    let term = 12; // Default value
    if (application.loanDetails?.term) {
      // Convert to string first
      const termStr = String(application.loanDetails.term);
      term = parseInt(termStr, 10);
    }
    
    // Ensure we have valid numbers
    if (isNaN(interestRate)) interestRate = 10.5;
    if (isNaN(term) || term <= 0) term = 12;
    
    // Calculate monthly payment
    let calculatedPayment: number;
    
    // Try to parse from the application first
    if (application.loanDetails?.monthlyPayment) {
      calculatedPayment = parseFloat(String(application.loanDetails.monthlyPayment).replace(/[^0-9.]/g, ''));
    } else {
      // Calculate it if not provided
      const monthlyInterestRate = interestRate / 1200;
      
      // Handle edge case where interest rate is 0
      if (monthlyInterestRate === 0) {
        calculatedPayment = amount / term;
      } else {
        calculatedPayment = amount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, term)) 
                        / (Math.pow(1 + monthlyInterestRate, term) - 1);
      }
    }
    
    // Ensure it's a valid number
    if (isNaN(calculatedPayment) || !isFinite(calculatedPayment)) {
      // Fallback calculation
      calculatedPayment = amount / term * (1 + (interestRate / 100) / 12);
    }
    
    // Round the monthly payment
    const roundedMonthlyPayment = Math.round(calculatedPayment);
    const totalRepayment = roundedMonthlyPayment * term;
    
    // Create the loan object with properly formatted values
    return {
      id: useApplicationId ? application.id : generateRandomId("LN"),
      userId: userId,
      type: 'Personal Loan',
      purpose: application.loanDetails?.purpose || 'Personal',
      amount: amount,
      interestRate: interestRate,
      term: term,
      monthlyPayment: roundedMonthlyPayment,
      totalRepayment: totalRepayment,
      status: 'active' as const,
      dateApplied: application.date,
      dateIssued: currentDate,
      paidAmount: 0,
      paidMonths: 0,
      remainingPayments: term,
      nextPaymentDue: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      nextPaymentAmount: roundedMonthlyPayment,
      notes: `Loan created from application ${application.id}`
    };
  };

  // Function to create a loan from an application
  const createLoanFromApplication = (application: ExtendedApplication, userId: string) => {
    return prepareLoanData(application, userId, true);
  };

  // Fix handleStatusChange function to handle the new statuses
  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    // Find the application
    const application = applications.find(app => app.id === applicationId) as unknown as ExtendedApplication;
    if (!application) return;
    
    try {
      // Get user who submitted application
      const user = users.find(u => u.id === application.userId);
      
      // Special handling for approved applications
      if (newStatus === 'approved' && user) {
        // Create a loan from the application
        const newLoan = createLoanFromApplication(application, user.id);
        
        // Add the loan
        const loanAdded = await addLoan(newLoan);
        
        if (!loanAdded) {
          toast.error("Failed to create loan from application");
          return false;
        }
      }
      
      // Update the application status with type casting for now
      // This will need a proper fix in the AppDataContext in future
      const success = await updateApplication(applicationId, {
        status: newStatus as any
      });
      
      if (success) {
        // Create a notification
        const notificationType = getNotificationTypeForStatus(newStatus);
        
        // Get user name if user exists
        const userName = user ? `${user.firstName} ${user.lastName}` : "Unknown user";
        
        // Create notification for admin
        addNotification({
          id: `app-status-${Date.now()}`,
          userId: "",
          title: `Application ${getStatusDisplayName(newStatus)}`,
          message: `Application ${application.id} from ${userName} has been ${getStatusDisplayName(newStatus)}`,
          type: notificationType,
          date: new Date().toISOString(),
          read: false
        });
        
        // Also create notification for the user (if user exists)
        if (user) {
          addNotification({
            id: `user-app-status-${Date.now()}`,
            userId: user.id, // Target specific user
            title: `Your loan application has been ${getStatusDisplayName(newStatus)}`,
            message: getStatusMessage(newStatus, application.id),
            type: notificationType,
            date: new Date().toISOString(),
            read: false
          });
        }
        
        toast.success(`Application status updated to ${getStatusDisplayName(newStatus)}`);
        return true;
      } else {
        toast.error("Failed to update application status");
        return false;
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("An error occurred while updating status");
      return false;
    }
  };
  
  // Get notification type based on application status
  const getNotificationTypeForStatus = (status: string): string => {
    switch (status) {
      case "approved":
        return "application";
      case "rejected":
        return "warning";
      case "pending":
        return "document";
      default:
        return "system";
    }
  };
  
  // Get message for user notification based on status
  const getStatusMessage = (status: string, applicationId: string): string => {
    switch (status) {
      case "approved":
        return `Congratulations! Your loan application ${applicationId} has been approved. Please check your dashboard for next steps.`;
      case "rejected":
        return `We regret to inform you that your loan application ${applicationId} has been rejected. Please contact our support team for more information.`;
      case "pending":
        return `Your loan application ${applicationId} is now pending additional review. We may contact you for more information.`;
      default:
        return `Your loan application ${applicationId} status has been updated to ${getStatusDisplayName(status)}.`;
    }
  };

  // View the applicant profile
  const handleViewApplicantProfile = (app: any) => {
    // Find the user associated with this application
    const user = getUserById(app.userId);
    
    if (user) {
      navigate(`/admin/user/${user.id}`);
    } else {
      toast.error("User data not found", {
        description: "Could not find user associated with this application"
      });
    }
  };

  // Find the next workflow step for an application
  const getNextWorkflowStep = (currentStatus: string): string | null => {
    const currentStep = WORKFLOW_STEPS.find(step => step.id === currentStatus);
    return currentStep?.nextStep || null;
  };

  // Get the workflow step object by status ID
  const getWorkflowStep = (statusId: string) => {
    return WORKFLOW_STEPS.find(step => step.id === statusId) || WORKFLOW_STEPS[0];
  };

  // Create a component to visualize workflow progress
  const WorkflowProgressBar = ({ currentStatus }: { currentStatus: string }) => {
    // Filter out the final states (approved/rejected) for the progress bar
    const processingSteps = WORKFLOW_STEPS.filter(step => 
      step.id !== "approved" && step.id !== "rejected"
    );
    
    // Find the index of the current step
    const currentIndex = processingSteps.findIndex(step => step.id === currentStatus);
    
    // If we're in a final state, show the appropriate indicator
    if (currentStatus === "approved" || currentStatus === "rejected") {
      return (
        <div className="flex items-center mt-1">
          {currentStatus === "approved" ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Approved</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <XCircle className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Rejected</span>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-1 mt-1">
        {processingSteps.map((step, index) => {
          // Determine if this step is current, completed, or upcoming
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.id} className="flex items-center">
              {/* Progress circle */}
              <div 
                className={`flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center ${
                  isCurrent 
                    ? "bg-blue-500 ring-2 ring-blue-200" 
                    : isCompleted
                      ? "bg-blue-500"
                      : "bg-gray-200"
                }`}
              >
                {isCompleted && !isCurrent && (
                  <Check className="h-2.5 w-2.5 text-white" />
                )}
              </div>
              
              {/* Connecting line (except for the last item) */}
              {index < processingSteps.length - 1 && (
                <div 
                  className={`h-0.5 w-6 ${
                    index < currentIndex ? "bg-blue-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Component to render a workflow status badge with icon and tooltip
  const WorkflowStatusBadge = ({ status }: { status: string }) => {
    const step = getWorkflowStep(status);
    
    return (
      <div className="flex flex-col">
        <Badge variant={getStatusVariant(status)}>
          <div className="flex items-center">
            {step.icon}
            <span className="ml-1">{step.name}</span>
          </div>
        </Badge>
        <div className="text-xs text-muted-foreground mt-1">{step.description}</div>
      </div>
    );
  };

  // Update the handleCreateLoan function to use the helper
  const handleCreateLoan = (application: ExtendedApplication) => {
    // Only create loans from approved applications
    if (application.status !== 'approved') {
      console.error('Cannot create loan: Application is not approved');
      return;
    }

    // Get the user ID from the application's linked user
    const userId = application.userId;
    if (!userId) {
      console.error('Cannot create loan: No user ID found in application');
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare the loan data
      const newLoan = prepareLoanData(application, userId);
      console.log('Creating loan with data:', newLoan);

      // Call the API to create the loan
      createLoan(newLoan)
        .then(response => {
          console.log('Loan creation response:', response);
          if (response.success) {
            // Update application status to 'funded'
            updateApplication(application.id, { status: 'funded' })
              .then(() => {
                refreshData();
                toast.success('Loan created successfully');
                
                // Navigate to the loan management tab after a short delay to allow data refresh
                setTimeout(() => {
                  navigate('/admin?tab=loans');
                }, 1000);
              })
              .catch(updateError => {
                console.error('Error updating application:', updateError);
                toast.error('Loan created but failed to update application status');
              });
          } else {
            console.error('Failed to create loan:', response.error);
            toast.error(`Failed to create loan: ${response.error || 'Unknown error'}`);
          }
        })
        .catch(error => {
          console.error('Error creating loan:', error);
          toast.error('Error creating loan. See console for details.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      console.error('Error in handleCreateLoan:', error);
      toast.error('Error preparing loan data');
      setIsLoading(false);
    }
  };

  // Find the renderApplicationActions function and modify it to add the Create Loan button for approved applications
  const renderApplicationActions = (application: Application) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleViewDetails(application)}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleViewApplicantProfile(application)}>
            Applicant Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {application.status === "approved" && (
            <DropdownMenuItem onClick={() => handleCreateLoan(application as ExtendedApplication)}>
              Create Loan
            </DropdownMenuItem>
          )}
          {application.status !== "rejected" && (
            <DropdownMenuItem onClick={() => handleRejectApplication(application)}>
              Reject
            </DropdownMenuItem>
          )}
          {WORKFLOW_STATUSES.map((status) => (
            application.status !== status && (
              <DropdownMenuItem 
                key={status} 
                onClick={() => handleStatusChange(application.id, status as ApplicationStatus)}
              >
                Move to {getStatusDisplayName(status)}
              </DropdownMenuItem>
            )
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Loan Application Processing</h2>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search applications..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={handleSearch}
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
        {WORKFLOW_STATUSES.map(status => (
          <Badge 
            key={status}
            variant={statusFilter.includes(status) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleStatusFilter(status)}
          >
            {getStatusDisplayName(status)}
          </Badge>
        ))}
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="pending">New</TabsTrigger>
          <TabsTrigger value="document_verification">Document Verification</TabsTrigger>
          <TabsTrigger value="credit_assessment">Credit Assessment</TabsTrigger>
          <TabsTrigger value="final_review">Final Review</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        {/* All Applications */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Loan Applications</CardTitle>
              <CardDescription>View and process all loan applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                        <TableCell>{app.id}</TableCell>
                        <TableCell>{getApplicantName(app.userId)}</TableCell>
                      <TableCell>{app.amount}</TableCell>
                      <TableCell>
                          <WorkflowStatusBadge status={app.status} />
                      </TableCell>
                      <TableCell>
                        <WorkflowProgressBar currentStatus={app.status} />
                      </TableCell>
                      <TableCell>{app.date}</TableCell>
                      <TableCell>
                          {renderApplicationActions(app)}
                      </TableCell>
                    </TableRow>
                  ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No applications found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Workflow Tabs - Replace the existing pending/in_review tabs */}
        <TabsContent value="pending">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>New Applications</CardTitle>
                <CardDescription>Applications awaiting initial review</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <span className="font-medium text-amber-500">Step 1</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border mb-4 p-4 bg-amber-50/50">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Required in this step:</h3>
                    <ul className="mt-1.5 text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Verify applicant's identity documents</li>
                      <li>Check all required fields are completed</li>
                      <li>Confirm contact details are valid</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications
                    .filter(app => app.status === "pending")
                    .length > 0 ? (
                    filteredApplications
                      .filter(app => app.status === "pending")
                    .map((app) => (
                      <TableRow key={app.id}>
                          <TableCell>{app.id}</TableCell>
                        <TableCell>{getApplicantName(app.userId)}</TableCell>
                        <TableCell>{app.amount}</TableCell>
                          <TableCell>{app.date}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(app)}
                              >
                              <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleAdvanceStage(app)}
                              >
                              <ArrowRight className="h-4 w-4 mr-1" />
                                Advance to Document Verification
                              </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No pending applications
                        </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="document_verification">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Document Verification</CardTitle>
                <CardDescription>Verify all applicant documents</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-500">Step 2</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border mb-4 p-4 bg-blue-50/50">
                <div className="flex items-start space-x-3">
                  <FileCheck className="h-6 w-6 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Required in this step:</h3>
                    <ul className="mt-1.5 text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Verify bank statements</li>
                      <li>Check proof of income (payslips)</li>
                      <li>Confirm documents are authentic and recent</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications
                    .filter(app => app.status === "document_verification")
                    .length > 0 ? (
                    filteredApplications
                      .filter(app => app.status === "document_verification")
                    .map((app) => (
                      <TableRow key={app.id}>
                          <TableCell>{app.id}</TableCell>
                        <TableCell>{getApplicantName(app.userId)}</TableCell>
                        <TableCell>{app.amount}</TableCell>
                          <TableCell>{app.date}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(app)}
                              >
                              <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleAdvanceStage(app)}
                              >
                              <ArrowRight className="h-4 w-4 mr-1" />
                                Advance to Credit Assessment
                              </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No applications in document verification
                        </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="credit_assessment">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Credit Assessment</CardTitle>
                <CardDescription>Evaluate applicant creditworthiness</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-indigo-500" />
                <span className="font-medium text-indigo-500">Step 3</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border mb-4 p-4 bg-indigo-50/50">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-6 w-6 text-indigo-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Required in this step:</h3>
                    <ul className="mt-1.5 text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Confirm credit score meets requirements</li>
                      <li>Calculate debt-to-income ratio</li>
                      <li>Assess affordability of loan repayments</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications
                    .filter(app => app.status === "credit_assessment")
                    .length > 0 ? (
                    filteredApplications
                      .filter(app => app.status === "credit_assessment")
                    .map((app) => (
                      <TableRow key={app.id}>
                          <TableCell>{app.id}</TableCell>
                        <TableCell>{getApplicantName(app.userId)}</TableCell>
                        <TableCell>{app.amount}</TableCell>
                          <TableCell>{app.date}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(app)}
                              >
                              <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleAdvanceStage(app)}
                              >
                              <ArrowRight className="h-4 w-4 mr-1" />
                                Advance to Final Review
                              </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No applications in credit assessment
                        </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="final_review">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Final Review</CardTitle>
                <CardDescription>Make final decision on applications</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-purple-500">Step 4</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border mb-4 p-4 bg-purple-50/50">
                <div className="flex items-start space-x-3">
                  <FileCheck className="h-6 w-6 text-purple-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Final decision required:</h3>
                    <ul className="mt-1.5 text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Review all application material</li>
                      <li>Perform final risk assessment</li>
                      <li>Determine loan approval or rejection</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications
                    .filter(app => app.status === "final_review")
                    .length > 0 ? (
                    filteredApplications
                      .filter(app => app.status === "final_review")
                    .map((app) => (
                      <TableRow key={app.id}>
                          <TableCell>{app.id}</TableCell>
                        <TableCell>{getApplicantName(app.userId)}</TableCell>
                        <TableCell>{app.amount}</TableCell>
                          <TableCell>{app.date}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(app)}
                              >
                              <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleApproveApplication(app)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                              </Button>
                              <Button 
                              variant="default" 
                                size="sm"
                                onClick={() => handleRejectApplication(app)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                              </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No applications in final review
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

export default ApplicationProcessing;
