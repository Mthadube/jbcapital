import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/admin/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, User, Mail, Phone, Home, Briefcase, 
  CreditCard, FileText, Shield, Clock, Edit, 
  AlertTriangle, Calendar, CheckCircle, XCircle 
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { scrollToTop } from "@/components/ScrollToTop";
import UserProfileView from "@/components/admin/UserProfileView";
import { useAppData } from "@/utils/AppDataContext";

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editSection, setEditSection] = useState("");

  const { getUserById } = useAppData();

  useEffect(() => {
    scrollToTop(false);
    
    // Get user data from context instead of using mock data
    setLoading(true);
    
    setTimeout(() => {
      if (id) {
        const foundUser = getUserById(id);
        if (foundUser) {
          setUser(foundUser);
        }
      }
      setLoading(false);
    }, 300);
  }, [id, getUserById]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    scrollToTop(true);
  };

  const handleBackClick = () => {
    navigate('/admin');
  };

  const handleEditClick = (section: string) => {
    setEditSection(section);
    setShowEditDialog(true);
  };

  const handleEditSave = () => {
    toast.success(`${editSection} updated successfully`);
    setShowEditDialog(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardHeader />
        <div className="container mx-auto py-8">
          <div className="glass-card p-6">
            <p className="text-center">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardHeader />
        <div className="container mx-auto py-8">
          <div className="glass-card p-6">
            <h2 className="heading-md mb-4">User Not Found</h2>
            <p className="mb-6">The requested user could not be found.</p>
            <Button onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User Management
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">User Profile</h1>
          </div>
          
          <div>
            <Badge variant={user.status === "Active" ? "default" : "destructive"} className="mr-2">
              {user.status}
            </Badge>
            <Badge variant="outline">{user.role}</Badge>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-4">
          {/* User sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  
                  <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  
                  <div className="mt-4 w-full">
                    <Separator className="my-4" />
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{user.role}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Last active: {user.lastActive}</span>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <Button className="w-full" onClick={() => handleEditClick("Account Status")}>
                      <Edit className="h-4 w-4 mr-2" />
                      Manage User
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">User ID</span>
                    <span className="text-sm font-medium">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Registered</span>
                    <span className="text-sm font-medium">{formatDate(user.registrationDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={user.accountStatus === "active" ? "default" : "secondary"}>
                      {user.accountStatus}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-muted-foreground mb-1.5">Profile Completion</div>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            user.profileCompletionPercentage >= 90 ? 'bg-green-500' :
                            user.profileCompletionPercentage >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${user.profileCompletionPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{user.profileCompletionPercentage}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-4">
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
                <TabsTrigger value="activity" className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Notes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>User Profile</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick("User Profile")}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <CardDescription>Complete user information and details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UserProfileView user={user} onEditClick={handleEditClick} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="loans" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Loan History</CardTitle>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View All
                      </Button>
                    </div>
                    <CardDescription>Active and historical loans for this user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.loans && user.loans.length > 0 ? (
                        user.loans.map((loan, index) => (
                          <Card key={index} className="border border-muted">
                            <CardHeader className="py-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    loan.status === "active" ? "default" : 
                                    loan.status === "completed" ? "outline" : 
                                    "secondary"
                                  }>
                                    {loan.status}
                                  </Badge>
                                  <span className="font-semibold">Loan ID: {loan.id}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {loan.dateIssued ? formatDate(loan.dateIssued) : 
                                  loan.dateApplied ? formatDate(loan.dateApplied) : ""}
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
                                  <p className="text-base">R{loan.amount?.toLocaleString()}</p>
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
                                  <p className="text-base">R{loan.monthlyPayment?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                                  <Badge variant={
                                    loan.status === "active" ? "default" : 
                                    loan.status === "completed" ? "outline" : 
                                    loan.status === "rejected" ? "destructive" : 
                                    "secondary"
                                  }>
                                    {loan.status}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex justify-end mt-4">
                                <Button variant="outline" size="sm" onClick={() => navigate(`/admin/application/${loan.id}`)}>
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No loans found for this user.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Documents</CardTitle>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Request Document
                      </Button>
                    </div>
                    <CardDescription>Documents uploaded by the user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.documents && user.documents.length > 0 ? (
                        user.documents.map((doc, index) => (
                          <div key={index} className="flex items-start border-b border-border last:border-0 pb-4 last:pb-0">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center mr-3">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">{doc.name}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.type} • Uploaded on {formatDate(doc.dateUploaded)}
                                  </p>
                                </div>
                                <div className="flex gap-2 items-start">
                                  <Badge variant={
                                    doc.verificationStatus === "verified" ? "default" : 
                                    doc.verificationStatus === "rejected" ? "destructive" : 
                                    "secondary"
                                  }>
                                    {doc.verificationStatus}
                                  </Badge>
                                  <Button variant="outline" size="sm">View</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No documents found for this user.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>User's recent actions and system events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.activity && user.activity.length > 0 ? (
                        user.activity.map((activity, index) => (
                          <div key={index} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                            <div className={`rounded-full p-2 ${
                              activity.type === 'login' ? 'bg-green-100' : 
                              activity.type === 'profile_update' ? 'bg-blue-100' : 
                              activity.type === 'document_upload' ? 'bg-purple-100' : 
                              activity.type === 'password_change' ? 'bg-amber-100' : 'bg-gray-100'
                            }`}>
                              {activity.type === 'login' && <User className="h-4 w-4 text-green-700" />}
                              {activity.type === 'profile_update' && <Edit className="h-4 w-4 text-blue-700" />}
                              {activity.type === 'document_upload' && <FileText className="h-4 w-4 text-purple-700" />}
                              {activity.type === 'password_change' && <Shield className="h-4 w-4 text-amber-700" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium">{activity.details}</p>
                                <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                              </div>
                              <p className="text-sm text-muted-foreground capitalize">
                                {activity.type && activity.type.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No activity records found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Notes & Comments</CardTitle>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Add Note
                      </Button>
                    </div>
                    <CardDescription>Internal notes about this user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.notes && user.notes.length > 0 ? (
                        user.notes.map((note, index) => (
                          <div key={index} className="border border-border rounded-md p-4">
                            <div className="flex justify-between mb-2">
                              <p className="font-medium">{note.author}</p>
                              <p className="text-sm text-muted-foreground">{note.date}</p>
                            </div>
                            <p className="text-sm">{note.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No notes available for this user.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editSection}</DialogTitle>
            <DialogDescription>
              Update the information in this section.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This is where the edit form for {editSection} would appear. In a production application, 
              this would include the appropriate form fields based on which section is being edited.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserDetail; 