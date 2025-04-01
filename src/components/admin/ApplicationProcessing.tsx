import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertTriangle, Clock, FileText, Filter, 
  CheckCircle, XCircle, Eye, Search, Download, 
  ArrowUpRight, ArrowRight, UserSearch, User, CreditCard,
  DollarSign, CalendarCheck
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
import { useAppData, Application } from "@/utils/AppDataContext";

// Define loan application statuses for the workflow
const APPLICATION_STATUSES = [
  "Pending Review",
  "Initial Screening",
  "Document Review",
  "Credit Assessment",
  "Income Verification",
  "Final Decision",
  "Approved",
  "Rejected"
];

const ApplicationProcessing = () => {
  const { applications, updateApplication, users, getUserById, addNotification } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [currentApplication, setCurrentApplication] = useState<any>(null);
  const [showUserProfileDrawer, setShowUserProfileDrawer] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<any>(null);
  const navigate = useNavigate();

  // Filter applications based on search term and status filters
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatusFilter = statusFilter.length === 0 || statusFilter.includes(app.status);
    
    return matchesSearch && matchesStatusFilter;
  });

  // Utility function to get appropriate variant for status badges
  const getStatusVariant = (status: string) => {
    switch(status) {
      case "Approved": return "default";
      case "Rejected": return "destructive";
      case "Pending Review": return "secondary";
      case "Initial Screening": return "outline";
      case "Document Review": return "outline";
      case "Credit Assessment": return "secondary";
      case "Income Verification": return "secondary";
      case "Final Decision": return "default";
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
    const currentIndex = APPLICATION_STATUSES.indexOf(app.status);
    
    if (currentIndex < APPLICATION_STATUSES.length - 3) { // -3 because we have "Approved" and "Rejected" at the end
      const nextStatus = APPLICATION_STATUSES[currentIndex + 1];
      handleStatusChange(app.id, nextStatus);
    } else {
      // If at Final Decision, prompt for approval/rejection
      toast.info("Application is ready for final decision", {
        description: "Please choose to approve or reject this application"
      });
    }
  };

  // Approve the application
  const handleApproveApplication = async (app: any) => {
    await handleStatusChange(app.id, "Approved");
    toast.success(`Application ${app.id} has been approved`);
  };

  // Reject the application
  const handleRejectApplication = async (app: any) => {
    await handleStatusChange(app.id, "Rejected");
    toast.success(`Application ${app.id} has been rejected`);
  };

  // Request more information for an application
  const handleRequestMoreInfo = (app: any) => {
    updateApplication(app.id, { 
      requiredAction: "Additional information required", 
      notes: app.notes ? `${app.notes}\nAdditional information requested on ${new Date().toLocaleDateString()}` : "Additional information requested"
    });
    toast.info(`Request for more information sent to applicant`);
  };

  // Mark document as verified
  const handleVerifyDocument = (doc: any, app: any) => {
    // In real app, we would update the document status here
    toast.success(`Document "${doc.name}" marked as verified`);
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
    switch(status) {
      case "Approved": return <CheckCircle size={16} />;
      case "Rejected": return <XCircle size={16} />;
      case "Pending Review": return <Clock size={16} />;
      case "Initial Screening": return <FileText size={16} />;
      case "Document Review": return <FileText size={16} />;
      case "Credit Assessment": return <CreditCard size={16} />;
      case "Income Verification": return <DollarSign size={16} />;
      case "Final Decision": return <CalendarCheck size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  // Change the status of an application
  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    // Find the application
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;
    
    try {
      // Update the application status
      const success = await updateApplication(applicationId, {
        status: newStatus
      });
      
      if (success) {
        // Create a notification
        const notificationType = getNotificationTypeForStatus(newStatus);
        
        // Get user who submitted application (if exists)
        const user = users.find(u => u.id === application.userId);
        const userName = user ? `${user.firstName} ${user.lastName}` : "Unknown user";
        
        // Create notification for admin
        addNotification({
          id: `app-status-${Date.now()}`,
          title: `Application ${newStatus}`,
          message: `Application ${application.id} from ${userName} has been ${newStatus}`,
          type: notificationType,
          date: new Date().toISOString(),
          read: false,
          importance: "high",
          link: `/admin/applications/${applicationId}`
        });
        
        // Also create notification for the user (if user exists)
        if (user) {
          addNotification({
            id: `user-app-status-${Date.now()}`,
            userId: user.id, // Target specific user
            title: `Your loan application has been ${newStatus}`,
            message: getStatusMessage(newStatus, application.id),
            type: notificationType,
            date: new Date().toISOString(),
            read: false,
            importance: "high",
            link: `/dashboard/applications/${applicationId}`
          });
        }
        
        toast.success(`Application status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update application status");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("An error occurred while updating status");
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
        return `Your loan application ${applicationId} status has been updated to ${status}.`;
    }
  };

  // View the user profile for an application
  const handleViewUserProfile = (app: any) => {
    // Find the user associated with this application
    const user = getUserById(app.userId);
    
    if (user) {
      setSelectedUserForProfile(user);
      setShowUserProfileDrawer(true);
    } else {
      toast.error("User data not found", {
        description: "Could not find user associated with this application"
      });
    }
  };

  // View the applicant info
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
        {APPLICATION_STATUSES.map(status => (
          <Badge 
            key={status}
            variant={statusFilter.includes(status) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleStatusFilter(status)}
          >
            {status}
          </Badge>
        ))}
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-7 mb-4">
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="initial">Initial Screening</TabsTrigger>
          <TabsTrigger value="documents">Document Review</TabsTrigger>
          <TabsTrigger value="credit">Credit Assessment</TabsTrigger>
          <TabsTrigger value="income">Income Verification</TabsTrigger>
          <TabsTrigger value="final">Final Decision</TabsTrigger>
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
                    <TableHead>Date</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                        <TableCell>{app.id}</TableCell>
                      <TableCell>{app.name}</TableCell>
                      <TableCell>{app.amount}</TableCell>
                      <TableCell>
                          <Badge variant={getStatusVariant(app.status)}>
                            {app.status}
                          </Badge>
                      </TableCell>
                        <TableCell>{app.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <Progress value={app.completion} className="h-2" />
                          <span className="text-xs">{app.completion}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(app)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewApplicantProfile(app)}
                            >
                              Profile
                            </Button>
                        </div>
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
        
        {/* Initial Screening */}
        <TabsContent value="initial">
          <Card>
            <CardHeader>
              <CardTitle>Initial Screening</CardTitle>
              <CardDescription>Review new applications for completeness</CardDescription>
            </CardHeader>
            <CardContent>
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
                    .filter(app => app.status === "Initial Screening" || app.status === "Pending Review")
                    .length > 0 ? (
                    filteredApplications
                      .filter(app => app.status === "Initial Screening" || app.status === "Pending Review")
                    .map((app) => (
                      <TableRow key={app.id}>
                          <TableCell>{app.id}</TableCell>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.amount}</TableCell>
                          <TableCell>{app.date}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(app)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleAdvanceStage(app)}
                              >
                                Advance
                              </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No applications in initial screening
                        </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Review */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Review</CardTitle>
              <CardDescription>Verify applicant's documents</CardDescription>
            </CardHeader>
            <CardContent>
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
                    .filter(app => app.status === "Document Review")
                    .length > 0 ? (
                    filteredApplications
                    .filter(app => app.status === "Document Review")
                    .map((app) => (
                      <TableRow key={app.id}>
                          <TableCell>{app.id}</TableCell>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.amount}</TableCell>
                          <TableCell>{app.date}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(app)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleAdvanceStage(app)}
                              >
                                Advance
                              </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No applications in document review
                        </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Credit Assessment */}
        <TabsContent value="credit">
          <Card>
            <CardHeader>
              <CardTitle>Credit Assessment</CardTitle>
              <CardDescription>Evaluate applicant's credit worthiness</CardDescription>
            </CardHeader>
            <CardContent>
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
                    .filter(app => app.status === "Credit Assessment")
                    .length > 0 ? (
                    filteredApplications
                    .filter(app => app.status === "Credit Assessment")
                    .map((app) => (
                      <TableRow key={app.id}>
                          <TableCell>{app.id}</TableCell>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.amount}</TableCell>
                          <TableCell>{app.date}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(app)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleAdvanceStage(app)}
                              >
                                Advance
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
        
        {/* Income Verification */}
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Income Verification</CardTitle>
              <CardDescription>Verify applicant's income and employment</CardDescription>
            </CardHeader>
            <CardContent>
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
                    .filter(app => app.status === "Income Verification")
                    .length > 0 ? (
                    filteredApplications
                    .filter(app => app.status === "Income Verification")
                    .map((app) => (
                      <TableRow key={app.id}>
                          <TableCell>{app.id}</TableCell>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.amount}</TableCell>
                          <TableCell>{app.date}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(app)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleAdvanceStage(app)}
                              >
                                Advance
                              </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No applications in income verification
                        </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Final Decision */}
        <TabsContent value="final">
          <Card>
            <CardHeader>
              <CardTitle>Final Decision</CardTitle>
              <CardDescription>Make final loan approval decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications
                    .filter(app => app.status === "Final Decision")
                    .length > 0 ? (
                    filteredApplications
                    .filter(app => app.status === "Final Decision")
                    .map((app) => (
                      <TableRow key={app.id}>
                          <TableCell>{app.id}</TableCell>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.amount}</TableCell>
                          <TableCell>{app.date}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(app)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleApproveApplication(app)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRejectApplication(app)}
                            >
                              Reject
                              </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No applications waiting for final decision
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Completed Applications */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Applications</CardTitle>
              <CardDescription>Applications with final decisions (approved or rejected)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications
                    .filter(app => app.status === "Approved" || app.status === "Rejected")
                    .length > 0 ? (
                    filteredApplications
                      .filter(app => app.status === "Approved" || app.status === "Rejected")
                      .map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>{app.id}</TableCell>
                          <TableCell>{app.name}</TableCell>
                          <TableCell>{app.amount}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(app.status)}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{app.date}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                            onClick={() => handleViewDetails(app)}
                          >
                              View
                            </Button>
                        </TableCell>
                      </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No completed applications
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* User Profile Drawer */}
      <Drawer open={showUserProfileDrawer} onOpenChange={setShowUserProfileDrawer}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle className="text-2xl font-bold">Applicant Profile</DrawerTitle>
            <DrawerDescription>
              {selectedUserForProfile ? `Viewing details for ${selectedUserForProfile.firstName} ${selectedUserForProfile.lastName}` : "Loading applicant details..."}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-6">
            {selectedUserForProfile && (
              <UserProfileView 
                user={selectedUserForProfile} 
                onEditClick={() => {}} 
              />
            )}
            </div>
            
          <DrawerFooter className="border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowUserProfileDrawer(false)}
            >
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ApplicationProcessing;
