import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/admin/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileCheck,
  FileText,
  Flag,
  MessageCircle,
  Check,
  X,
  Clock,
  AlertTriangle,
  User,
  CheckCircle,
  XCircle,
  MessageSquare,
  Download,
  Eye,
  Briefcase,
  Home,
  FilePen,
  ArrowRight,
  UserSearch,
  MoreVertical,
  FileX,
  Trash
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter } from "@/components/ui/drawer";
import UserProfileView from "@/components/admin/UserProfileView";
import { useAppData } from '@/utils/AppDataContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { WORKFLOW_STEPS, ApplicationStatus } from "@/components/admin/ApplicationProcessing";
import { parseSouthAfricanID } from '@/utils/validation';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [showUserProfileDrawer, setShowUserProfileDrawer] = useState(false);
  
  const { updateApplication, getApplicationById, getUserById } = useAppData();
  
  useEffect(() => {
    setLoading(true);
    
    // Use a small timeout to simulate loading for better UX
    setTimeout(() => {
      if (id) {
        const foundApplication = getApplicationById(id);
      if (foundApplication) {
        setApplication(foundApplication);
        }
      }
      setLoading(false);
    }, 300);
  }, [id, getApplicationById]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardHeader />
        <div className="flex flex-1 justify-center items-center">
          <div className="animate-pulse">Loading application details...</div>
        </div>
      </div>
    );
  }
  
  if (!application) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardHeader />
        <div className="flex flex-1 justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
            <p className="mb-4">The application you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/admin')}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }
  
  const handleAdvanceStage = () => {
    if (!application) return;
    
    // Get the current workflow step
    const currentStep = WORKFLOW_STEPS.find(step => step.id === application.status);
    
    if (!currentStep || !currentStep.nextStep) {
      toast.info("Application is already in its final state");
      return;
    }
    
    // If the next step is "decision", we need special handling
    if (currentStep.nextStep === "decision") {
      toast.info("Application is ready for final decision", {
        description: "Please choose to approve or reject this application"
      });
      return;
    }
    
    // Otherwise, move to the next step
    const newStatus = currentStep.nextStep as ApplicationStatus;
    const newCompletion = Math.min((application.completion || 0) + 25, 100);
      
      const updatedHistory = [
      ...(application.statusHistory || []),
        { 
          status: newStatus, 
          date: new Date().toISOString().split('T')[0], 
          user: "Admin", 
          notes: statusNote || `Advanced to ${newStatus}` 
        }
      ];
    
    // Update status in the application
    updateApplication(application.id, {
      status: newStatus as any,
      completion: newCompletion
    });
      
      setApplication({
        ...application,
        status: newStatus,
        completion: newCompletion,
        statusHistory: updatedHistory
      });
      
    toast.success(`Application ${application.id} advanced to ${WORKFLOW_STEPS.find(step => step.id === newStatus)?.name || newStatus}`);
      setProcessingDialogOpen(false);
      setStatusNote("");
  };

  const handleApproveApplication = async () => {
    if (!id || !application) return;
    
    await updateApplication(id, {
      status: "approved",
      completion: 100
    });
    
    setApplication({
      ...application,
      status: "approved",
      completion: 100
    });
    
    toast.success(`Application ${id} has been approved!`);
  };

  const handleRejectApplication = async () => {
    if (!id || !application) return;
    
    await updateApplication(id, {
      status: "rejected",
      completion: 100
    });
    
    setApplication({
      ...application,
      status: "rejected",
      completion: 100
    });
    
    toast.error(`Application ${id} has been rejected.`);
  };
  
  const handleVerifyDocument = (docIndex: number) => {
    if (!application || !application.documents) return;
    
    const updatedDocuments = [...application.documents];
    if (!updatedDocuments[docIndex]) return;
    
    updatedDocuments[docIndex] = {
      ...updatedDocuments[docIndex],
      status: "Verified",
      date: new Date().toISOString().split('T')[0]
    };
    
    setApplication({
      ...application,
      documents: updatedDocuments
    });
    
    toast.success(`Document ${updatedDocuments[docIndex].name} has been verified!`);
  };
  
  const handleAddNote = () => {
    if (!application) return;
    
    if (!statusNote.trim()) {
      toast.error("Please enter a note");
      return;
    }
    
    const updatedHistory = [
      ...(application.statusHistory || []),
      { 
        status: application.status || "Status update", 
        date: new Date().toISOString().split('T')[0], 
        user: "Admin", 
        notes: statusNote 
      }
    ];
    
    setApplication({
      ...application,
      statusHistory: updatedHistory
    });
    
    toast.success("Note added successfully");
    setNotesDialogOpen(false);
    setStatusNote("");
  };
  
  const getStatusDisplay = (status: string) => {
    const workflowStep = WORKFLOW_STEPS.find(step => step.id === status);
    
    if (workflowStep) {
      return { 
        color: workflowStep.color, 
        icon: workflowStep.icon 
      };
    }
    
    // Fallback for unknown statuses
    return { color: "bg-gray-100 text-gray-800", icon: <Clock size={16} className="text-gray-500" /> };
  };
  
  const handleUpdateStatus = async (newStatus: string) => {
    // Find the application
    if (!application || !id) return;
    
    try {
      // Find the workflow step that matches the requested status
      const workflowStep = WORKFLOW_STEPS.find(step => step.id === newStatus || step.name === newStatus);
      
      if (!workflowStep) {
        toast.error(`Unknown status: ${newStatus}`);
        return;
      }
      
      // Update the application status
      const success = await updateApplication(id, {
        status: workflowStep.id as any // Type casting for now
      });
      
      if (success) {
        // Update the local state
        const updatedHistory = [
          ...(application.statusHistory || []),
          { 
            status: workflowStep.id, 
            date: new Date().toISOString().split('T')[0], 
            user: "Admin", 
            notes: statusNote || `Status updated to ${workflowStep.name}` 
          }
        ];
    
    setApplication({
      ...application,
          status: workflowStep.id,
          statusHistory: updatedHistory
        });
        
        toast.success(`Application status updated to ${workflowStep.name}`);
        setProcessingDialogOpen(false);
        setStatusNote("");
      } else {
        toast.error("Failed to update application status");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("An error occurred while updating status");
    }
  };
  
  // Add nullish coalescing operators to handle potentially undefined values
  const statusDisplay = application?.status ? getStatusDisplay(application.status) : 
    { color: "bg-gray-100 text-gray-800", icon: <Clock size={16} className="text-gray-500" /> };
  
  // Create a user profile object from the application data
  const getUserProfileData = () => {
    if (!application) return null;
    
    return {
      id: application.id || '',
      firstName: application.name ? application.name.split(' ')[0] : '',
      lastName: application.name ? (application.name.split(' ')[1] || '') : '',
      email: application.email || '',
      phone: application.phone || '',
      idNumber: application.idNumber || '',
      dateOfBirth: application.dob || '',
      gender: application.personalInfo?.gender || '',
      maritalStatus: application.personalInfo?.maritalStatus || '',
      dependents: application.personalInfo?.dependents || 0,
      address: application.personalInfo?.address || '',
      suburb: application.personalInfo?.province || '', // Mixing field names to show how it adapts
      city: application.personalInfo?.province ? application.personalInfo.province.split(', ')[0] : '',
      state: application.personalInfo?.province || '',
      zipCode: application.personalInfo?.postalCode || '',
      country: "South Africa",
      employmentStatus: application.employmentInfo?.employmentStatus || '',
      employmentType: application.employmentInfo?.employmentType || application.employmentInfo?.employmentStatus || '',
      employmentSector: application.employmentInfo?.employer || '', // Using employer as sector for demo
      employerName: application.employmentInfo?.employer || '',
      jobTitle: application.employmentInfo?.jobTitle || '',
      yearsEmployed: application.employmentInfo?.employmentLength ? application.employmentInfo.employmentLength.split(' ')[0] : '',
      monthlyIncome: application.employmentInfo?.monthlyIncome && typeof application.employmentInfo.monthlyIncome === 'string' ? 
        parseFloat(application.employmentInfo.monthlyIncome.replace(/[^\d.]/g, '') || '0') : 0,
      paymentDate: application.employmentInfo?.paymentDate || '',
      bankName: application.financialInfo?.bankName || '',
      accountType: application.financialInfo?.accountType || '',
      accountNumber: application.financialInfo?.accountNumber || '',
      creditScore: application.financialInfo?.creditScore || 0,
      existingLoans: application.financialInfo?.existingLoans?.length > 0 || false,
      existingLoanAmount: application.financialInfo?.existingLoans?.[0]?.amount && typeof application.financialInfo.existingLoans[0].amount === 'string'
        ? parseFloat(application.financialInfo.existingLoans[0].amount.replace(/[^\d.]/g, '') || '0') 
        : 0,
      monthlyDebt: application.financialInfo?.monthlyDebt && typeof application.financialInfo.monthlyDebt === 'string'
        ? parseFloat(application.financialInfo.monthlyDebt.replace(/[^\d.]/g, '') || "0") 
        : 0,
      totalMonthlyExpenses: 0, // Would calculate from all expenses
      loans: [
        {
          id: application.id || '',
          type: application.loanDetails?.purpose ? application.loanDetails.purpose.toLowerCase() : 'personal',
          amount: application.loanDetails?.requestedAmount && typeof application.loanDetails.requestedAmount === 'string'
            ? parseFloat(application.loanDetails.requestedAmount.replace(/[^\d.]/g, '') || '0') 
            : parseFloat(application.amount || '0'),
          interestRate: application.loanDetails?.interestRate && typeof application.loanDetails.interestRate === 'string'
            ? parseFloat(application.loanDetails.interestRate.replace(/[^0-9.]/g, '') || '0') 
            : 0,
          term: application.loanDetails?.term ? parseInt(application.loanDetails.term || '0') : 0,
          monthlyPayment: application.loanDetails?.monthlyPayment && typeof application.loanDetails.monthlyPayment === 'string'
            ? parseFloat(application.loanDetails.monthlyPayment.replace(/[^\d.]/g, '') || '0') 
            : 0,
          status: application.status === "Approved" || application.status === "approved" ? "active" : 
                 application.status === "Rejected" || application.status === "rejected" ? "rejected" : "pending",
          dateApplied: application.date || new Date().toISOString(),
          dateIssued: (application.status === "Approved" || application.status === "approved") ? application.date : undefined
        }
      ],
      documents: application.documents ? application.documents.map(doc => ({
        name: doc.name || 'Document',
        type: doc.name ? doc.name.toLowerCase().replace(/\s+/g, '_') : 'document',
        dateUploaded: doc.date || new Date().toISOString(),
        verificationStatus: doc.status ? doc.status.toLowerCase() : 'pending'
      })) : []
    };
  };
  
  const handleViewFullProfile = (userData: any) => {
    navigate(`/admin/user/${userData.id}`);
  };
  
  const getDocumentStatusIcon = (status: string) => {
    const statusMap: Record<string, React.ReactNode> = {
      "verified": <CheckCircle size={16} className="text-green-500" />,
      "pending": <Clock size={16} className="text-blue-500" />,
      "unverified": <XCircle size={16} className="text-red-500" />
    };
    
    return statusMap[status] || <Clock size={16} className="text-gray-500" />;
  };
  
  // Inside the ApplicationDetail component
  // Add this function to parse and format date of birth from ID number
  const extractDateOfBirthFromID = (idNumber: string | undefined) => {
    if (!idNumber) return 'N/A';
    
    const idInfo = parseSouthAfricanID(idNumber);
    if (idInfo) {
      return idInfo.formattedBirthDate;
    }
    
    // Fallback to application.dob if ID parsing fails
    return application?.dob || 'N/A';
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      
      <div className="flex-1 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Application {application?.id || 'Not Found'}
                <Badge className={statusDisplay.color}>
                  <div className="flex items-center gap-1">
                    {statusDisplay.icon}
                    <span>{application?.status || 'Unknown'}</span>
                  </div>
                </Badge>
              </h1>
              <p className="text-muted-foreground">Submitted on {application?.date || 'Unknown date'}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowUserProfileDrawer(true)}
            >
              <UserSearch className="mr-2 h-4 w-4" />
              View User Profile
            </Button>
            <Button 
              variant="default" 
              onClick={() => setProcessingDialogOpen(true)}
              disabled={application?.status === "Approved" || application?.status === "approved" || 
                      application?.status === "Rejected" || application?.status === "rejected"}
            >
              <Clock className="mr-2 h-4 w-4" />
              Process Application
            </Button>
            <Button variant="outline" onClick={() => setNotesDialogOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Add Note
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Application Progress</span>
            <span className="text-sm font-medium">{application?.completion || 0}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                (application?.completion || 0) >= 80 ? "bg-green-500" : 
                (application?.completion || 0) >= 50 ? "bg-blue-500" : 
                "bg-amber-500"
              }`}
              style={{ width: `${application?.completion || 0}%` }}
            ></div>
          </div>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="loan">Loan Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">Status History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Applicant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">{application?.name || 'No name provided'}</span>
                    <span className="text-sm text-muted-foreground">{application?.email || 'No email provided'}</span>
                    <span className="text-sm text-muted-foreground">{application?.phone || 'No phone provided'}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Loan Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">{application?.amount || 'N/A'}</span>
                    <span className="text-sm text-muted-foreground">{application?.loanDetails?.purpose || 'N/A'}</span>
                    <span className="text-sm text-muted-foreground">{application?.loanDetails?.term || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Required Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm bg-amber-50 p-2 rounded border border-amber-100">
                    {application?.requiredAction || 'No action required'}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
                <CardDescription>Key information about this loan application</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-sm font-medium">ID Number:</span>
                      <span className="text-sm">{application?.idNumber || 'N/A'}</span>
                      <span className="text-sm font-medium">Date of Birth:</span>
                      <span className="text-sm">{extractDateOfBirthFromID(application?.idNumber)}</span>
                      <span className="text-sm font-medium">Gender:</span>
                      <span className="text-sm">{application?.idNumber ? parseSouthAfricanID(application?.idNumber)?.gender || 'N/A' : 'N/A'}</span>
                      <span className="text-sm font-medium">Age:</span>
                      <span className="text-sm">{application?.idNumber ? parseSouthAfricanID(application?.idNumber)?.age + ' years' || 'N/A' : 'N/A'}</span>
                      <span className="text-sm font-medium">Marital Status:</span>
                      <span className="text-sm">{application?.personalInfo?.maritalStatus || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Employment</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-sm font-medium">Employer:</span>
                      <span className="text-sm">{application?.employmentInfo?.employer || 'N/A'}</span>
                      <span className="text-sm font-medium">Job Title:</span>
                      <span className="text-sm">{application?.employmentInfo?.jobTitle || 'N/A'}</span>
                      <span className="text-sm font-medium">Monthly Income:</span>
                      <span className="text-sm">{application?.employmentInfo?.monthlyIncome || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Financial Information</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-sm font-medium">Bank:</span>
                      <span className="text-sm">{application?.financialInfo?.bankName || 'N/A'}</span>
                      <span className="text-sm font-medium">Account Type:</span>
                      <span className="text-sm">{application?.financialInfo?.accountType || 'N/A'}</span>
                      <span className="text-sm font-medium">Account Number:</span>
                      <span className="text-sm">{application?.financialInfo?.accountNumber || 'N/A'}</span>
                      <span className="text-sm font-medium">Credit Score:</span>
                      <span className="text-sm">{application?.financialInfo?.creditScore || 'N/A'}</span>
                      <span className="text-sm font-medium">Monthly Expenses:</span>
                      <span className="text-sm">{application?.financialInfo?.monthlyExpenses || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Loan Details</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-sm font-medium">Amount:</span>
                      <span className="text-sm">{application?.amount || 'N/A'}</span>
                      <span className="text-sm font-medium">Purpose:</span>
                      <span className="text-sm">{application?.loanDetails?.purpose || 'N/A'}</span>
                      <span className="text-sm font-medium">Term:</span>
                      <span className="text-sm">{application?.loanDetails?.term || 'N/A'}</span>
                      <span className="text-sm font-medium">Interest Rate:</span>
                      <span className="text-sm">{application?.loanDetails?.interestRate || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Status Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application?.statusHistory ? (
                    application.statusHistory.slice(-3).reverse().map((history: any, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className={`mt-0.5 h-2 w-2 rounded-full ${
                          history.status === "Approved" || history.status === "approved" ? "bg-green-500" : 
                          history.status === "Rejected" || history.status === "rejected" ? "bg-red-500" : 
                        "bg-blue-500"
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{history.status}</span>
                          <span className="text-xs text-muted-foreground">{history.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{history.comment || 'No comment provided'}</p>
                        {history.user && typeof history.user === 'object' && history.user.name ? (
                          <div className="mt-2 flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback>{history.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">By {history.user.name}</span>
                      </div>
                        ) : history.user && typeof history.user === 'string' ? (
                          <div className="mt-2 flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback>{history.user.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">By {history.user}</span>
                    </div>
                        ) : null}
                      </div>
                    </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No status history available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label>Full Name</Label>
                      <Input value={application?.name || ''} readOnly />
                        </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <Input value={extractDateOfBirthFromID(application?.idNumber)} readOnly />
                        </div>
                    <div>
                      <Label>ID Number</Label>
                      <Input value={application?.idNumber || ''} readOnly />
                        </div>
                        </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Email Address</Label>
                      <Input value={application?.email || ''} readOnly />
                        </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input value={application?.phone || ''} readOnly />
                        </div>
                    <div>
                      <Label>Marital Status</Label>
                      <Input value={application?.personalInfo?.maritalStatus || ''} readOnly />
                      </div>
                    </div>
                  </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label>Street Address</Label>
                      <Input value={application?.address?.street || ''} readOnly />
                        </div>
                    <div>
                      <Label>City</Label>
                      <Input value={application?.address?.city || ''} readOnly />
                        </div>
                    <div>
                      <Label>State/Province</Label>
                      <Input value={application?.address?.state || ''} readOnly />
                      </div>
                    </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Zip/Postal Code</Label>
                      <Input value={application?.address?.zipCode || ''} readOnly />
                        </div>
                    <div>
                      <Label>Country</Label>
                      <Input value={application?.address?.country || ''} readOnly />
                        </div>
                    <div>
                      <Label>Time at Address</Label>
                      <Input value={application?.address?.timeAtAddress || ''} readOnly />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="employment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employment Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label>Employment Status</Label>
                      <Input value={application?.employmentInfo?.status || ''} readOnly />
                      </div>
                    <div>
                      <Label>Employer Name</Label>
                      <Input value={application?.employmentInfo?.employer || ''} readOnly />
                      </div>
                    <div>
                      <Label>Job Title</Label>
                      <Input value={application?.employmentInfo?.jobTitle || ''} readOnly />
                      </div>
                    </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Years at Employer</Label>
                      <Input value={application?.employmentInfo?.yearsAtEmployer || ''} readOnly />
                      </div>
                    <div>
                      <Label>Monthly Income</Label>
                      <Input value={application?.employmentInfo?.monthlyIncome || ''} readOnly />
                      </div>
                    <div>
                      <Label>Payment Frequency</Label>
                      <Input value={application?.employmentInfo?.paymentFrequency || ''} readOnly />
                      </div>
                    </div>
                  </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Employer Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                  <div>
                      <Label>Employer Phone</Label>
                      <Input value={application?.employmentInfo?.employerPhone || ''} readOnly />
                      </div>
                    <div>
                      <Label>Employer Address</Label>
                      <Input value={application?.employmentInfo?.employerAddress || ''} readOnly />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Supervisor Name</Label>
                      <Input value={application?.employmentInfo?.supervisorName || ''} readOnly />
                    </div>
                    <div>
                      <Label>Employment Verification Contact</Label>
                      <Input value={application?.employmentInfo?.verificationContact || ''} readOnly />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label>Bank Name</Label>
                      <Input value={application?.financialInfo?.bankName || ''} readOnly />
                        </div>
                    <div>
                      <Label>Account Type</Label>
                      <Input value={application?.financialInfo?.accountType || ''} readOnly />
                        </div>
                    <div>
                      <Label>Account Number</Label>
                      <Input value={application?.financialInfo?.accountNumber || ''} readOnly />
                        </div>
                  <div>
                      <Label>Credit Score</Label>
                      <div className="flex items-center">
                        <Input value={application?.financialInfo?.creditScore || ''} readOnly />
                        <div className="ml-3 px-3 py-1 rounded bg-blue-50 text-blue-700 text-sm">
                          {application?.financialInfo?.creditScoreBand || 'N/A'}
                        </div>
                        </div>
                      </div>
                    </div>
                  <div className="space-y-3">
                  <div>
                      <Label>Monthly Expenses</Label>
                      <Input value={application?.financialInfo?.monthlyExpenses || ''} readOnly />
                  </div>
                  <div>
                      <Label>Existing Debts</Label>
                      <Input value={application?.financialInfo?.existingDebts || ''} readOnly />
                        </div>
                    <div>
                      <Label>Other Income Sources</Label>
                      <Input value={application?.financialInfo?.otherIncomeSources || ''} readOnly />
                          </div>
                      </div>
                  </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                  <div>
                      <Label>Risk Level</Label>
                      <div className="flex items-center">
                        <Badge className={
                          application?.riskInfo?.level === 'High' ? 'bg-red-100 text-red-800' :
                          application?.riskInfo?.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {application?.riskInfo?.level || 'Unknown'}
                        </Badge>
                        </div>
                        </div>
                    <div>
                      <Label>DTI Ratio</Label>
                      <Input value={application?.riskInfo?.dtiRatio || ''} readOnly />
                        </div>
                        </div>
                      <div className="space-y-3">
                    <div>
                      <Label>Risk Factors</Label>
                      <div className="space-y-1">
                        {application?.riskInfo?.flags && application.riskInfo.flags.length > 0 ? (
                          application.riskInfo.flags.map((flag, index) => (
                            <div key={index} className="flex items-center py-1 px-2 bg-red-50 text-red-800 rounded text-sm">
                              <AlertTriangle size={14} className="mr-2" />
                              {flag}
                        </div>
                          ))
                        ) : (
                          <div className="text-green-700 text-sm">No risk factors identified</div>
                        )}
                        </div>
                          </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea value={application?.riskInfo?.notes || ''} readOnly className="h-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="loan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label>Loan Amount</Label>
                      <Input value={application?.amount || ''} readOnly />
                      </div>
                    <div>
                      <Label>Loan Purpose</Label>
                      <Input value={application?.loanDetails?.purpose || ''} readOnly />
                      </div>
                    <div>
                      <Label>Term (months)</Label>
                      <Input value={application?.loanDetails?.term || ''} readOnly />
                      </div>
                    </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Interest Rate</Label>
                      <Input value={application?.loanDetails?.interestRate || ''} readOnly />
                      </div>
                    <div>
                      <Label>Monthly Payment</Label>
                      <Input value={application?.loanDetails?.monthlyPayment || ''} readOnly />
                      </div>
                  <div>
                      <Label>First Payment Date</Label>
                      <Input value={application?.loanDetails?.firstPaymentDate || ''} readOnly />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Loan Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Payment Schedule</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Principal</TableHead>
                          <TableHead>Interest</TableHead>
                          <TableHead>Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {application?.loanDetails?.schedule && application.loanDetails.schedule.length > 0 ? (
                          application.loanDetails.schedule.slice(0, 5).map((payment, index) => (
                            <TableRow key={index}>
                              <TableCell>{payment.number}</TableCell>
                              <TableCell>{payment.date}</TableCell>
                              <TableCell>{payment.amount}</TableCell>
                              <TableCell>{payment.principal}</TableCell>
                              <TableCell>{payment.interest}</TableCell>
                              <TableCell>{payment.balance}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">Payment schedule not available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    {application?.loanDetails?.schedule && application.loanDetails.schedule.length > 5 && (
                      <div className="text-center mt-2">
                        <Button variant="outline" size="sm">View Full Schedule</Button>
                        </div>
                    )}
                        </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Loan Summary</h3>
                    <div className="bg-muted rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Principal</div>
                        <div className="font-medium">{application?.amount || 'N/A'}</div>
                        </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Interest</div>
                        <div className="font-medium">{application?.loanDetails?.totalInterest || 'N/A'}</div>
                        </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Cost</div>
                        <div className="font-medium">{application?.loanDetails?.totalCost || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">APR</div>
                        <div className="font-medium">{application?.loanDetails?.apr || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {application?.documents && application.documents.length > 0 ? (
                        application.documents.map((doc, index) => (
                          <div key={index} className="flex items-start p-3 rounded-lg border">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center mr-3">
                              {getDocumentStatusIcon(doc.verificationStatus || 'pending')}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                        <div>
                                  <h4 className="font-medium">{doc.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {doc.type} • Uploaded on {doc.dateUploaded}
                                  </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="icon">
                                    <Eye size={14} />
                          </Button>
                          <Button variant="outline" size="icon">
                                    <Download size={14} />
                          </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="icon">
                                        <MoreVertical size={14} />
                            </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        <span>Mark as Verified</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        <span>Mark as Rejected</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        <span>Request Resubmission</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">
                                        <Trash className="h-4 w-4 mr-2" />
                                        <span>Delete</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                        </div>
                      </div>
                              
                              {doc.verificationStatus === 'rejected' && (
                                <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                                  <span className="font-medium">Rejection reason: </span>
                                  {doc.notes || 'Document does not meet requirements.'}
                    </div>
                              )}
                </div>
                  </div>
                        ))
                      ) : (
                        <div className="text-center p-6 rounded-lg border border-dashed">
                          <FileX className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <h3 className="text-lg font-medium mb-1">No documents uploaded</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            The applicant has not uploaded any documents yet.
                          </p>
                          <Button variant="outline">Request Documents</Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative border-l-2 border-muted pl-8 ml-4 space-y-6">
                  {application?.statusHistory && application.statusHistory.length > 0 ? (
                    application.statusHistory.map((history, index) => (
                    <div key={index} className="relative mb-4">
                      <div className={`absolute -left-[17px] h-8 w-8 rounded-full flex items-center justify-center ${
                          history.status === "Approved" || history.status === "approved" ? "bg-green-100" : 
                          history.status === "Rejected" || history.status === "rejected" ? "bg-red-100" : 
                        "bg-blue-100"
                      }`}>
                          {history.status === "Approved" || history.status === "approved" ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : history.status === "Rejected" || history.status === "rejected" ? (
                            <XCircle size={16} className="text-red-600" />
                          ) : (
                            <Clock size={16} className="text-blue-600" />
                        )}
                      </div>
                        <div>
                          <h4 className="text-base font-medium flex items-center gap-2">
                            {history.status}
                            <span className="text-xs text-muted-foreground font-normal">{history.date}</span>
                          </h4>
                          <p className="text-sm text-muted-foreground">{history.comment || 'No comment provided'}</p>
                          {history.user && typeof history.user === 'object' && history.user.name ? (
                            <div className="mt-2 flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback>{history.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs">By {history.user.name}</span>
                        </div>
                          ) : history.user && typeof history.user === 'string' ? (
                            <div className="mt-2 flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback>{history.user.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs">By {history.user}</span>
                      </div>
                          ) : null}
                    </div>
                    </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">No status history available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={processingDialogOpen} onOpenChange={setProcessingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Process Application</DialogTitle>
            <DialogDescription>
              Take action on this loan application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex justify-between">
              <Badge variant="outline" className="px-3 py-1">
                {application?.id || ''}
              </Badge>
              <Badge className={statusDisplay.color}>
                <div className="flex items-center gap-1">
                  {statusDisplay.icon}
                  <span>{application?.status || 'Unknown'}</span>
                </div>
              </Badge>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Applicant</h4>
              <p className="text-base font-medium">{application?.name || 'Unknown'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Current Stage</h4>
              <p className="text-base">{application?.status || 'Not specified'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Required Action</h4>
              <p className="text-sm bg-amber-50 p-2 rounded border border-amber-100 my-2">
                {application?.requiredAction || 'No action required'}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Change Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {application?.status !== "Initial Screening" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200"
                    onClick={() => handleUpdateStatus("Initial Screening")}
                  >
                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                    Initial Screening
                  </Button>
                )}
                
                {application?.status !== "Document Review" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200"
                    onClick={() => handleUpdateStatus("Document Review")}
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    Document Review
                  </Button>
                )}
                
                {application?.status !== "Credit Assessment" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                    onClick={() => handleUpdateStatus("Credit Assessment")}
                  >
                    <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                    Credit Assessment
                  </Button>
                )}
                
                {application?.status !== "Income Verification" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-cyan-200"
                    onClick={() => handleUpdateStatus("Income Verification")}
                  >
                    <Briefcase className="mr-1.5 h-3.5 w-3.5" />
                    Income Verification
                  </Button>
                )}
                
                {application?.status !== "Final Decision" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200"
                    onClick={() => handleUpdateStatus("Final Decision")}
                  >
                    <FilePen className="mr-1.5 h-3.5 w-3.5" />
                    Final Decision
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Processing Notes</label>
              <textarea 
                id="notes"
                className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Enter notes about processing this application..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              ></textarea>
            </div>
            
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0 pt-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                {application.status === "Final Decision" ? (
                  <>
                    <Button onClick={handleApproveApplication} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button onClick={handleRejectApplication} variant="destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleAdvanceStage}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Advance to Next Stage
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                      onClick={() => handleUpdateStatus("Approved")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </>
                )}
              </div>
              <Button variant="outline" onClick={() => setProcessingDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note to this application's history.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex flex-col space-y-2">
              <label htmlFor="status-note" className="text-sm font-medium">Note</label>
              <textarea 
                id="status-note"
                className="min-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Enter your note..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              ></textarea>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>
                Add Note
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Profile Drawer */}
      <Drawer open={showUserProfileDrawer} onOpenChange={setShowUserProfileDrawer}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle className="text-2xl font-bold">User Profile</DrawerTitle>
            <DrawerDescription>
              {getUserProfileData() ? `Viewing complete details for ${getUserProfileData().firstName} ${getUserProfileData().lastName}` : "Loading user details..."}
            </DrawerDescription>
          </DrawerHeader>
          
          {getUserProfileData() && (
            <div className="p-4">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-4 w-full justify-start">
                  <TabsTrigger value="profile" className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="loans" className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Loans
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Documents
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-2">
                  <UserProfileView 
                    user={getUserProfileData()} 
                    onEditClick={(section) => {
                      toast.info(`Editing ${section} for ${getUserProfileData().firstName} ${getUserProfileData().lastName}`);
                    }} 
                  />
                </TabsContent>
                
                <TabsContent value="loans" className="mt-2">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Loan History</h3>
                    {getUserProfileData().loans && getUserProfileData().loans.length > 0 ? (
                      getUserProfileData().loans.map((loan, index) => (
                        <Card key={index} className="border border-muted">
                          <CardHeader className="py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant={loan.status === "active" ? "default" : loan.status === "completed" ? "outline" : "secondary"}>
                                  {loan.status}
                                </Badge>
                                <span className="font-semibold">Loan ID: {loan.id}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {loan.dateIssued ? `Issued: ${new Date(loan.dateIssued).toLocaleDateString()}` : 
                                 loan.dateApplied ? `Applied: ${new Date(loan.dateApplied).toLocaleDateString()}` : ""}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Loan Type</p>
                                <p className="text-base capitalize">{loan.type || "Personal"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                <p className="text-base">R {loan.amount?.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                                <p className="text-base">{loan.interestRate}%</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Term</p>
                                <p className="text-base">{loan.term} months</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Monthly Payment</p>
                                <p className="text-base">R {loan.monthlyPayment?.toLocaleString()}</p>
                              </div>
                              {loan.status === "active" && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Remaining Payments</p>
                                  <p className="text-base">{Math.max(1, Math.floor(loan.term * 0.8))} of {loan.term}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No loan history available.</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="mt-2">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Documents</h3>
                    {getUserProfileData().documents && getUserProfileData().documents.length > 0 ? (
                      <div className="overflow-hidden rounded-md border">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="p-3 text-left text-sm font-medium text-muted-foreground">Document</th>
                              <th className="p-3 text-left text-sm font-medium text-muted-foreground">Date Uploaded</th>
                              <th className="p-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                              <th className="p-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getUserProfileData().documents.map((doc, index) => (
                              <tr key={index} className="border-t border-border">
                                <td className="p-3 text-sm">{doc.name}</td>
                                <td className="p-3 text-sm">{new Date(doc.dateUploaded).toLocaleDateString()}</td>
                                <td className="p-3 text-sm">
                                  <Badge variant={doc.verificationStatus === "verified" ? "default" : "secondary"}>
                                    {doc.verificationStatus}
                                  </Badge>
                                </td>
                                <td className="p-3 text-sm text-right">
                                  <Button variant="outline" size="sm">View</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No documents available.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DrawerFooter className="border-t pt-4">
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setShowUserProfileDrawer(false)}>
                Close
              </Button>
              
              {getUserProfileData() && (
                <Button onClick={() => handleViewFullProfile(getUserProfileData())}>
                  View Full Profile
                </Button>
              )}
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ApplicationDetail;
