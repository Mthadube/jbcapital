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
  UserSearch
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter } from "@/components/ui/drawer";
import UserProfileView from "@/components/admin/UserProfileView";
import { useAppData } from '@/utils/AppDataContext';

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
  
  const applications = [
    { 
      id: "APP-2023-0421", 
      name: "John Smith", 
      email: "john.smith@example.com",
      phone: "+27 82 123 4567",
      dob: "1985-06-15",
      idNumber: "8506155012089",
      amount: "R250,000", 
      status: "Document Review", 
      date: "2023-06-21", 
      documents: [
        { name: "ID Document", url: "#", status: "Verified", date: "2023-06-22" },
        { name: "Proof of Income", url: "#", status: "Verified", date: "2023-06-22" },
        { name: "Bank Statements", url: "#", status: "Pending", date: "2023-06-21" }
      ], 
      completion: 80,
      requiredAction: "Verify employment details",
      notes: "Applicant has steady employment for 5+ years. Need to verify latest income statement.",
      statusHistory: [
        { status: "Initial Screening", date: "2023-06-21", user: "Admin", notes: "Application received and screening initiated" },
        { status: "Document Review", date: "2023-06-22", user: "Admin", notes: "Initial screening passed, moving to document review" }
      ],
      personalInfo: {
        address: "123 Main Street, Sandton, Johannesburg",
        province: "Gauteng",
        postalCode: "2196",
        gender: "Male",
        maritalStatus: "Married",
        dependents: 2
      },
      employmentInfo: {
        employmentStatus: "Full-time",
        employer: "ABC Corporation",
        jobTitle: "Senior Manager",
        employmentLength: "6 years",
        monthlyIncome: "R45,000",
        employerAddress: "456 Corporate Park, Sandton, Johannesburg"
      },
      financialInfo: {
        bankName: "Standard Bank",
        accountNumber: "XXXX-XXXX-XXXX-1234",
        accountType: "Cheque",
        monthlyExpenses: "R25,000",
        existingLoans: [
          { type: "Car Loan", amount: "R350,000", monthlyPayment: "R6,500", remainingTerm: "36 months" }
        ],
        creditScore: 720
      },
      loanDetails: {
        purpose: "Home Improvement",
        term: "60 months",
        requestedAmount: "R250,000",
        interestRate: "12.5%",
        monthlyPayment: "R5,625",
        totalRepayment: "R337,500",
        startDate: "2023-08-01",
        securityOffered: "None"
      }
    },
    { 
      id: "APP-2023-0422", 
      name: "Sarah Johnson", 
      email: "sarah.johnson@example.com",
      phone: "+27 83 234 5678",
      dob: "1990-03-22",
      idNumber: "9003225012089",
      amount: "R120,000", 
      status: "Credit Assessment", 
      date: "2023-06-21", 
      documents: [
        { name: "ID Document", url: "#", status: "Verified", date: "2023-06-22" },
        { name: "Proof of Income", url: "#", status: "Pending", date: "2023-06-21" }
      ], 
      completion: 65,
      requiredAction: "Check credit history",
      notes: "Credit score is borderline. Need additional verification.",
      statusHistory: [
        { status: "Initial Screening", date: "2023-06-21", user: "Admin", notes: "Application received and screening initiated" },
        { status: "Document Review", date: "2023-06-22", user: "Admin", notes: "Initial screening passed, moving to document review" },
        { status: "Credit Assessment", date: "2023-06-23", user: "Admin", notes: "Documents verified, moving to credit assessment" }
      ],
      personalInfo: {
        address: "456 Oak Avenue, Rosebank, Johannesburg",
        province: "Gauteng",
        postalCode: "2196",
        gender: "Female",
        maritalStatus: "Single",
        dependents: 0
      },
      employmentInfo: {
        employmentStatus: "Full-time",
        employer: "XYZ Ltd",
        jobTitle: "Marketing Specialist",
        employmentLength: "3 years",
        monthlyIncome: "R30,000",
        employerAddress: "789 Business Park, Rosebank, Johannesburg"
      },
      financialInfo: {
        bankName: "FNB",
        accountNumber: "XXXX-XXXX-XXXX-5678",
        accountType: "Savings",
        monthlyExpenses: "R18,000",
        existingLoans: [
          { type: "Personal Loan", amount: "R50,000", monthlyPayment: "R2,000", remainingTerm: "18 months" }
        ],
        creditScore: 680
      },
      loanDetails: {
        purpose: "Debt Consolidation",
        term: "36 months",
        requestedAmount: "R120,000",
        interestRate: "14.5%",
        monthlyPayment: "R4,100",
        totalRepayment: "R147,600",
        startDate: "2023-08-01",
        securityOffered: "None"
      }
    }
  ];
  
  useEffect(() => {
    setLoading(true);
    
    setTimeout(() => {
      const foundApplication = applications.find(app => app.id === id);
      if (foundApplication) {
        setApplication(foundApplication);
      }
      setLoading(false);
    }, 500);
  }, [id]);
  
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
    const stageOrder = [
      "Initial Screening", 
      "Document Review", 
      "Credit Assessment", 
      "Income Verification", 
      "Final Decision",
      "Approved"
    ];
    
    const currentIndex = stageOrder.indexOf(application.status);
    if (currentIndex < stageOrder.length - 1) {
      const newStatus = stageOrder[currentIndex + 1];
      const newCompletion = Math.min(application.completion + 15, 100);
      
      const updatedHistory = [
        ...application.statusHistory,
        { 
          status: newStatus, 
          date: new Date().toISOString().split('T')[0], 
          user: "Admin", 
          notes: statusNote || `Advanced to ${newStatus}` 
        }
      ];
      
      setApplication({
        ...application,
        status: newStatus,
        completion: newCompletion,
        statusHistory: updatedHistory
      });
      
      toast.success(`Application ${application.id} advanced to ${newStatus}`);
      setProcessingDialogOpen(false);
      setStatusNote("");
    }
  };

  const handleApproveApplication = () => {
    updateApplication(id, {
      status: "Approved",
      completion: 100
    });
    
    setApplication({
      ...application,
      status: "Approved",
      completion: 100
    });
    
    toast.success(`Application ${id} has been approved!`);
  };

  const handleRejectApplication = () => {
    updateApplication(id, {
      status: "Rejected",
      completion: 100
    });
    
    setApplication({
      ...application,
      status: "Rejected",
      completion: 100
    });
    
    toast.error(`Application ${id} has been rejected.`);
  };
  
  const handleVerifyDocument = (docIndex: number) => {
    const updatedDocuments = [...application.documents];
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
    if (!statusNote.trim()) {
      toast.error("Please enter a note");
      return;
    }
    
    const updatedHistory = [
      ...application.statusHistory,
      { 
        status: application.status, 
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
    const statusMap: Record<string, { color: string, icon: React.ReactNode }> = {
      "Initial Screening": { color: "bg-blue-100 text-blue-800", icon: <Clock size={16} className="text-blue-500" /> },
      "Document Review": { color: "bg-amber-100 text-amber-800", icon: <FileText size={16} className="text-amber-500" /> },
      "Credit Assessment": { color: "bg-purple-100 text-purple-800", icon: <CreditCard size={16} className="text-purple-500" /> },
      "Income Verification": { color: "bg-indigo-100 text-indigo-800", icon: <Briefcase size={16} className="text-indigo-500" /> },
      "Final Decision": { color: "bg-orange-100 text-orange-800", icon: <FilePen size={16} className="text-orange-500" /> },
      "Approved": { color: "bg-green-100 text-green-800", icon: <CheckCircle size={16} className="text-green-500" /> },
      "Rejected": { color: "bg-red-100 text-red-800", icon: <XCircle size={16} className="text-red-500" /> }
    };
    
    return statusMap[status] || { color: "bg-gray-100 text-gray-800", icon: <Clock size={16} className="text-gray-500" /> };
  };
  
  const handleUpdateStatus = (newStatus: string) => {
    const newCompletion = 
      newStatus === "Approved" || newStatus === "Rejected" 
        ? 100 
        : Math.min(application.completion + 15, 95);
    
    updateApplication(id, {
      status: newStatus,
      completion: newCompletion
    });
    
    setApplication({
      ...application,
      status: newStatus,
      completion: newCompletion
    });
    
    toast.success(`Application status updated to ${newStatus}`);
  };
  
  const statusDisplay = getStatusDisplay(application.status);
  
  // Create a user profile object from the application data
  const getUserProfileData = () => {
    return {
      id: application.id,
      firstName: application.name.split(' ')[0],
      lastName: application.name.split(' ')[1] || '',
      email: application.email,
      phone: application.phone,
      idNumber: application.idNumber,
      dateOfBirth: application.dob,
      gender: application.personalInfo?.gender,
      maritalStatus: application.personalInfo?.maritalStatus,
      dependents: application.personalInfo?.dependents,
      address: application.personalInfo?.address,
      suburb: application.personalInfo?.province, // Mixing field names to show how it adapts
      city: application.personalInfo?.province.split(', ')[0],
      state: application.personalInfo?.province,
      zipCode: application.personalInfo?.postalCode,
      country: "South Africa",
      employmentStatus: application.employmentInfo?.employmentStatus,
      employmentType: application.employmentInfo?.employmentType || application.employmentInfo?.employmentStatus,
      employmentSector: application.employmentInfo?.employer, // Using employer as sector for demo
      employerName: application.employmentInfo?.employer,
      jobTitle: application.employmentInfo?.jobTitle,
      yearsEmployed: application.employmentInfo?.employmentLength?.split(' ')[0],
      monthlyIncome: parseFloat(application.employmentInfo?.monthlyIncome?.replace(/[^\d.]/g, '')),
      paymentDate: application.employmentInfo?.paymentDate,
      bankName: application.financialInfo?.bankName,
      accountType: application.financialInfo?.accountType,
      accountNumber: application.financialInfo?.accountNumber,
      creditScore: application.financialInfo?.creditScore,
      existingLoans: application.financialInfo?.existingLoans?.length > 0,
      existingLoanAmount: application.financialInfo?.existingLoans?.[0]?.amount
        ? parseFloat(application.financialInfo.existingLoans[0].amount.replace(/[^\d.]/g, ''))
        : 0,
      monthlyDebt: parseFloat(application.financialInfo?.monthlyDebt?.replace(/[^\d.]/g, '') || "0"),
      totalMonthlyExpenses: 0, // Would calculate from all expenses
      loans: [
        {
          id: application.id,
          type: application.loanDetails?.purpose.toLowerCase(),
          amount: parseFloat(application.loanDetails?.requestedAmount.replace(/[^\d.]/g, '')),
          interestRate: parseFloat(application.loanDetails?.interestRate.replace(/[^0-9.]/g, '')),
          term: parseInt(application.loanDetails?.term),
          monthlyPayment: parseFloat(application.loanDetails?.monthlyPayment.replace(/[^\d.]/g, '')),
          status: application.status === "Approved" ? "active" : application.status === "Rejected" ? "rejected" : "pending",
          dateApplied: application.date,
          dateIssued: application.status === "Approved" ? application.date : undefined
        }
      ],
      documents: application.documents.map(doc => ({
        name: doc.name,
        type: doc.name.toLowerCase().replace(/\s+/g, '_'),
        dateUploaded: doc.date,
        verificationStatus: doc.status.toLowerCase()
      }))
    };
  };
  
  const handleViewFullProfile = (userData: any) => {
    navigate(`/admin/user/${userData.id}`);
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
                Application {application.id}
                <Badge className={statusDisplay.color}>
                  <div className="flex items-center gap-1">
                    {statusDisplay.icon}
                    <span>{application.status}</span>
                  </div>
                </Badge>
              </h1>
              <p className="text-muted-foreground">Submitted on {application.date}</p>
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
              disabled={application.status === "Approved" || application.status === "Rejected"}
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
            <span className="text-sm font-medium">{application.completion}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                application.completion >= 80 ? "bg-green-500" : 
                application.completion >= 50 ? "bg-blue-500" : 
                "bg-amber-500"
              }`}
              style={{ width: `${application.completion}%` }}
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
                    <span className="text-lg font-semibold">{application.name}</span>
                    <span className="text-sm text-muted-foreground">{application.email}</span>
                    <span className="text-sm text-muted-foreground">{application.phone}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Loan Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">{application.amount}</span>
                    <span className="text-sm text-muted-foreground">{application.loanDetails.purpose}</span>
                    <span className="text-sm text-muted-foreground">{application.loanDetails.term}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Required Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm bg-amber-50 p-2 rounded border border-amber-100">
                    {application.requiredAction}
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
                      <span className="text-sm">{application.idNumber}</span>
                      <span className="text-sm font-medium">Date of Birth:</span>
                      <span className="text-sm">{application.dob}</span>
                      <span className="text-sm font-medium">Marital Status:</span>
                      <span className="text-sm">{application.personalInfo.maritalStatus}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Employment</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-sm font-medium">Employer:</span>
                      <span className="text-sm">{application.employmentInfo.employer}</span>
                      <span className="text-sm font-medium">Job Title:</span>
                      <span className="text-sm">{application.employmentInfo.jobTitle}</span>
                      <span className="text-sm font-medium">Monthly Income:</span>
                      <span className="text-sm">{application.employmentInfo.monthlyIncome}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Financial Information</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-sm font-medium">Bank:</span>
                      <span className="text-sm">{application.financialInfo.bankName}</span>
                      <span className="text-sm font-medium">Credit Score:</span>
                      <span className="text-sm">{application.financialInfo.creditScore}</span>
                      <span className="text-sm font-medium">Monthly Expenses:</span>
                      <span className="text-sm">{application.financialInfo.monthlyExpenses}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Loan Details</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-sm font-medium">Purpose:</span>
                      <span className="text-sm">{application.loanDetails.purpose}</span>
                      <span className="text-sm font-medium">Amount:</span>
                      <span className="text-sm">{application.loanDetails.requestedAmount}</span>
                      <span className="text-sm font-medium">Monthly Payment:</span>
                      <span className="text-sm">{application.loanDetails.monthlyPayment}</span>
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
                  {application.statusHistory.slice(-3).reverse().map((history: any, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className={`mt-0.5 h-2 w-2 rounded-full ${
                        history.status === "Approved" ? "bg-green-500" : 
                        history.status === "Rejected" ? "bg-red-500" : 
                        "bg-blue-500"
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{history.status}</span>
                          <span className="text-xs text-muted-foreground">{history.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{history.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Applicant's personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Basic Information</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Full Name:</span>
                          <span className="text-sm col-span-2">{application.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">ID Number:</span>
                          <span className="text-sm col-span-2">{application.idNumber}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Date of Birth:</span>
                          <span className="text-sm col-span-2">{application.dob}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Gender:</span>
                          <span className="text-sm col-span-2">{application.personalInfo.gender}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Marital Status:</span>
                          <span className="text-sm col-span-2">{application.personalInfo.maritalStatus}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Dependents:</span>
                          <span className="text-sm col-span-2">{application.personalInfo.dependents}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Email:</span>
                          <span className="text-sm col-span-2">{application.email}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Phone:</span>
                          <span className="text-sm col-span-2">{application.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Address:</span>
                          <span className="text-sm col-span-2">{application.personalInfo.address}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Province:</span>
                          <span className="text-sm col-span-2">{application.personalInfo.province}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Postal Code:</span>
                          <span className="text-sm col-span-2">{application.personalInfo.postalCode}</span>
                        </div>
                      </div>
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
                <CardDescription>Applicant's employment and income details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium">Employment Status:</span>
                        <span className="text-sm col-span-2">{application.employmentInfo.employmentStatus}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium">Employer:</span>
                        <span className="text-sm col-span-2">{application.employmentInfo.employer}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium">Job Title:</span>
                        <span className="text-sm col-span-2">{application.employmentInfo.jobTitle}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium">Employment Length:</span>
                        <span className="text-sm col-span-2">{application.employmentInfo.employmentLength}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium">Monthly Income:</span>
                        <span className="text-sm col-span-2">{application.employmentInfo.monthlyIncome}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium">Employer Address:</span>
                        <span className="text-sm col-span-2">{application.employmentInfo.employerAddress}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Income Verification</h3>
                    <div className="rounded-md bg-muted p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-blue-500" />
                        <span className="text-sm">Income verification status: Pending</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Income verification is required to validate the applicant's stated monthly income.
                        Please check the documents section for pay slips and bank statements.
                      </p>
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
                <CardDescription>Banking details and financial status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Banking Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Bank Name:</span>
                          <span className="text-sm col-span-2">{application.financialInfo.bankName}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Account Number:</span>
                          <span className="text-sm col-span-2">{application.financialInfo.accountNumber}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Account Type:</span>
                          <span className="text-sm col-span-2">{application.financialInfo.accountType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Credit Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Credit Score:</span>
                          <span className="text-sm col-span-2">{application.financialInfo.creditScore}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Monthly Expenses:</span>
                          <span className="text-sm col-span-2">{application.financialInfo.monthlyExpenses}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Existing Loans</h3>
                    {application.financialInfo.existingLoans.length > 0 ? (
                      <div className="border rounded-md">
                        <div className="grid grid-cols-4 gap-2 bg-muted p-2 text-sm font-medium">
                          <div>Type</div>
                          <div>Amount</div>
                          <div>Monthly Payment</div>
                          <div>Remaining Term</div>
                        </div>
                        {application.financialInfo.existingLoans.map((loan: any, index: number) => (
                          <div key={index} className="grid grid-cols-4 gap-2 p-2 text-sm border-t">
                            <div>{loan.type}</div>
                            <div>{loan.amount}</div>
                            <div>{loan.monthlyPayment}</div>
                            <div>{loan.remainingTerm}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No existing loans reported.</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Affordability Analysis</h3>
                    <div className="rounded-md bg-muted p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Monthly Income:</span>
                          <span className="text-sm font-medium">{application.employmentInfo.monthlyIncome}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Monthly Expenses:</span>
                          <span className="text-sm font-medium">{application.financialInfo.monthlyExpenses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Existing Loan Payments:</span>
                          <span className="text-sm font-medium">
                            {application.financialInfo.existingLoans.reduce((total: number, loan: any) => 
                              total + parseInt(loan.monthlyPayment.replace(/\D/g, '')), 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Proposed Loan Payment:</span>
                          <span className="text-sm font-medium">{application.loanDetails.monthlyPayment}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span className="text-sm">Disposable Income:</span>
                          <span className="text-sm">R10,875</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-sm">Debt-to-Income Ratio:</span>
                          <span className="text-sm">35%</span>
                        </div>
                        <div className="mt-2 p-2 rounded bg-green-50 border border-green-100">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-sm font-medium text-green-700">Affordability Check: Passed</span>
                          </div>
                        </div>
                      </div>
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
                <CardDescription>Details of the requested loan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium">Loan Purpose:</span>
                        <span className="text-sm col-span-2">{application.loanDetails.purpose}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium">Requested Amount:</span>
                        <span className="text-sm col-span-2">{application.loanDetails.requestedAmount}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium">Loan Term:</span>
                        <span className="text-sm col-span-2">{application.loanDetails.term}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium">Interest Rate:</span>
                        <span className="text-sm col-span-2">{application.loanDetails.interestRate}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium">Monthly Payment:</span>
                        <span className="text-sm col-span-2">{application.loanDetails.monthlyPayment}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium">Total Repayment:</span>
                        <span className="text-sm col-span-2">{application.loanDetails.totalRepayment}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Loan Summary</h3>
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-muted p-4 rounded-md">
                              <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
                              <p className="text-xl font-bold">{application.loanDetails.requestedAmount}</p>
                            </div>
                            <div className="bg-muted p-4 rounded-md">
                              <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                              <p className="text-xl font-bold">{application.loanDetails.monthlyPayment}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="bg-muted p-3 rounded-md">
                              <p className="text-xs text-muted-foreground mb-1">Term</p>
                              <p className="text-sm font-semibold">{application.loanDetails.term}</p>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                              <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                              <p className="text-sm font-semibold">{application.loanDetails.interestRate}</p>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                              <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                              <p className="text-sm font-semibold">{application.loanDetails.startDate}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Risk Assessment</h3>
                    <div className="rounded-md bg-muted p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Credit Score Risk:</span>
                          <span className="text-sm font-medium">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Income Stability:</span>
                          <span className="text-sm font-medium">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Debt-to-Income Ratio:</span>
                          <span className="text-sm font-medium">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Overall Risk:</span>
                          <span className="text-sm font-medium">Medium</span>
                        </div>
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
                <CardTitle>Documents</CardTitle>
                <CardDescription>Uploaded documents for verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText size={20} className="text-primary" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">Uploaded on {doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={doc.status === "Verified" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"
                          }
                        >
                          {doc.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="outline" size="icon">
                            <Eye size={16} />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Download size={16} />
                          </Button>
                          {doc.status !== "Verified" && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleVerifyDocument(index)}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Document Requirements</h3>
                  <div className="rounded-md bg-muted p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>ID Document (Verified)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>Proof of Income (Verified)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock size={16} className="text-amber-500" />
                        <span>Bank Statements (Pending Verification)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle size={16} className="text-gray-300" />
                        <span className="text-muted-foreground">Proof of Address (Not Required)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
                <CardDescription>Complete history of application status changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 border-l-2 border-muted space-y-6">
                  {application.statusHistory.map((history: any, index: number) => (
                    <div key={index} className="relative mb-4">
                      <div className={`absolute -left-[17px] h-8 w-8 rounded-full flex items-center justify-center ${
                        history.status === "Approved" ? "bg-green-100" : 
                        history.status === "Rejected" ? "bg-red-100" : 
                        "bg-blue-100"
                      }`}>
                        {history.status === "Approved" ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : history.status === "Rejected" ? (
                          <XCircle size={16} className="text-red-500" />
                        ) : (
                          <Clock size={16} className="text-blue-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{history.status}</h3>
                          <Badge variant="outline" className="text-xs">
                            {history.date}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{history.notes}</p>
                        <p className="text-xs text-muted-foreground">Updated by: {history.user}</p>
                      </div>
                    </div>
                  ))}
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
                {application.id}
              </Badge>
              <Badge className={statusDisplay.color}>
                <div className="flex items-center gap-1">
                  {statusDisplay.icon}
                  <span>{application.status}</span>
                </div>
              </Badge>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Applicant</h4>
              <p className="text-base font-medium">{application.name}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Current Stage</h4>
              <p className="text-base">{application.status}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Required Action</h4>
              <p className="text-sm bg-amber-50 p-2 rounded border border-amber-100 my-2">
                {application.requiredAction}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Change Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {application.status !== "Initial Screening" && (
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
                
                {application.status !== "Document Review" && (
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
                
                {application.status !== "Credit Assessment" && (
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
                
                {application.status !== "Income Verification" && (
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
                
                {application.status !== "Final Decision" && (
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
