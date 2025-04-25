import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, Plus, Edit, Trash, Lock, MoreHorizontal, 
  Shield, Check, X, Clock, FileCheck, Eye, User,
  Wallet, FileText, Building, CreditCard, Phone, Mail, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UserProfileView from "./UserProfileView";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { useNavigate } from "react-router-dom";
import { useAppData } from "@/utils/AppDataContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentViewer from "@/components/DocumentViewer";
import { calculateProfileCompletion } from "@/utils/profileUtils";

// Define role types for better type safety
interface Role {
  id: string;
  name: string;
  permissions: string[];
  userCount: number;
}

const UserManagement = () => {
  const { users, updateUser, addUser: addAppDataUser, refreshData } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showUserProfileDrawer, setShowUserProfileDrawer] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<any>(null);
  const navigate = useNavigate();
  
  // System roles (in a real app, these would come from a backend)
  const [roles] = useState<Role[]>([
    { 
      id: "role-admin",
      name: "Admin", 
      permissions: ["Full system access", "User management", "System configuration", "Reporting"], 
      userCount: users.filter(u => u.role === "admin").length
    },
    { 
      id: "role-loan-officer",
      name: "Loan Officer", 
      permissions: ["Application processing", "Document verification", "Client communication"], 
      userCount: users.filter(u => u.role === "loan-officer").length
    },
    { 
      id: "role-user",
      name: "Regular User", 
      permissions: ["View own profile", "Submit applications", "Upload documents"], 
      userCount: users.filter(u => !u.role || u.role === "user").length
    }
  ]);

  // Sort users by creation date in descending order
  const sortedUsers = [...users].sort((a, b) => {
    const dateA = new Date(a.registrationDate || 0);
    const dateB = new Date(b.registrationDate || 0);
    return dateB.getTime() - dateA.getTime();
  });

  // Filter users based on search term
  const filteredUsers = sortedUsers.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // User Management Functions
  const handleAddUser = () => {
    const newUser = {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "user",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      accountStatus: "active",
      idNumber: "",
      monthlyIncome: 0,
      registrationDate: new Date().toISOString().split('T')[0],
      profileCompletionPercentage: 0,
      documents: [],
      loans: []
    };
    setCurrentUser(newUser);
    setIsEditMode(false);
    setShowUserDialog(true);
  };

  const handleEditUser = (user: any) => {
    setCurrentUser(user);
    setIsEditMode(true);
    setShowUserDialog(true);
  };

  const handleResetPassword = (user: any) => {
    // In a real app, this would trigger a password reset email
    toast.success(`Password reset link sent to ${user.email}`);
  };

  const handleDeleteUser = (user: any) => {
    setCurrentUser(user);
    setShowDeleteUserDialog(true);
  };

  const confirmDeleteUser = () => {
    if (currentUser) {
      // In a real app, you would call an API to delete the user
      // For now, we'll just show a toast
      toast.success(`User ${currentUser.firstName} ${currentUser.lastName} has been deleted`);
      setShowDeleteUserDialog(false);
    }
  };

  const saveUserChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const userData = {
      id: currentUser.id || `USR-${Date.now().toString(36)}`,
      firstName: String(formData.get('firstName') || ''),
      lastName: String(formData.get('lastName') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      role: String(formData.get('role') || 'user'),
      accountStatus: String(formData.get('status') || 'active'),
      address: currentUser.address || '',
      city: currentUser.city || '',
      state: currentUser.state || '',
      zipCode: currentUser.zipCode || '',
      idNumber: currentUser.idNumber || '',
      monthlyIncome: currentUser.monthlyIncome || 0,
      registrationDate: currentUser.registrationDate || new Date().toISOString().split('T')[0],
      profileCompletionPercentage: currentUser.profileCompletionPercentage || 0,
      documents: currentUser.documents || [],
      loans: currentUser.loans || []
    };

    if (isEditMode) {
      updateUser(userData.id, userData);
      toast.success(`User ${userData.firstName} ${userData.lastName} has been updated`);
    } else {
      addAppDataUser(userData);
      toast.success(`User ${userData.firstName} ${userData.lastName} has been added`);
    }
    setShowUserDialog(false);
  };

  // Function to view user profile details
  const handleViewUserProfile = (user: any) => {
    setSelectedUserForProfile(user);
    setShowUserProfileDrawer(true);
  };

  const handleEditUserProfile = (section: string) => {
    if (!selectedUserForProfile) {
      toast.error("No user selected");
      return;
    }
    toast.info(`Editing ${section} for ${selectedUserForProfile.firstName} ${selectedUserForProfile.lastName}`);
    // In a real app, this would open a form to edit the specific section
  };

  // Function to navigate to detailed user profile
  const handleViewDetailedProfile = (user: any) => {
    navigate(`/admin/user/${user.id}`);
  };

  // Calculate profile completion percentage
  const getUserProfileCompletion = (user: any) => {
    if (!user) return 0;
    
    // If the user already has a calculated percentage, use it
    if (user.profileCompletionPercentage) {
      return user.profileCompletionPercentage;
    }
    // Otherwise calculate it
    return calculateProfileCompletion(user);
  };

  // Helper to safely calculate profile completion
  const calculateProfileCompletion = (user: any) => {
    if (!user) return 0;
    
    // Define fields that should be completed for 100% profile
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'address',
      'dateOfBirth', 'idNumber'
    ];
    
    // Count completed fields
    const completedFields = requiredFields.filter(field => 
      user[field] && user[field].toString().trim() !== ''
    ).length;
    
    // Calculate percentage
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  // Get document count by status - with null check
  const getDocumentCountByStatus = (user: any, status: 'verified' | 'pending' | 'rejected') => {
    if (!user || !user.documents || !Array.isArray(user.documents)) return 0;
    
    return user.documents.filter(doc => doc.verificationStatus === status).length;
  };

  // Get total documents count - with null check
  const getTotalDocumentsCount = (user: any) => {
    if (!user || !user.documents || !Array.isArray(user.documents)) return 0;
    return user.documents.length;
  };

  // Get loans count by status - with null check
  const getLoansCountByStatus = (user: any, status: string) => {
    if (!user || !user.loans || !Array.isArray(user.loans)) return 0;
    return user.loans.filter(loan => loan.status === status).length;
  };

  // Get total loans count - with null check
  const getTotalLoansCount = (user: any) => {
    if (!user || !user.loans || !Array.isArray(user.loans)) return 0;
    return user.loans.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">User Management</h2>
        <Button onClick={handleAddUser} className="flex items-center gap-1">
          <Plus size={16} />
          <span>Add User</span>
        </Button>
      </div>
      
      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Users</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.role || "user"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                        user.accountStatus === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {user.accountStatus || "active"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewUserProfile(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Roles Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Roles Summary</CardTitle>
              <CardDescription>Overview of system roles and assigned users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <div className="rounded-full bg-primary/10 p-1">
                      <Shield size={16} className="text-primary" />
                    </div>
                  </div>
                  <CardDescription>{role.userCount} users</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="mb-2 text-sm font-medium">Permissions:</h4>
                  <ul className="space-y-1">
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="text-sm">
                        • {permission}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Dialog (Add/Edit) */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update user details and permissions.' 
                : 'Add a new user to the system.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={saveUserChanges}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  className="col-span-3"
                  defaultValue={currentUser?.firstName}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  className="col-span-3"
                  defaultValue={currentUser?.lastName}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="col-span-3"
                  defaultValue={currentUser?.email}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  className="col-span-3"
                  defaultValue={currentUser?.phone}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <select
                  id="role"
                  name="role"
                  className="col-span-3 h-10 rounded-md border border-input px-3 py-2"
                  defaultValue={currentUser?.role || "user"}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="loan-officer">Loan Officer</option>
                  <option value="user">Regular User</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="col-span-3 h-10 rounded-md border border-input px-3 py-2"
                  defaultValue={currentUser?.accountStatus || "active"}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Add User'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currentUser?.firstName} {currentUser?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Profile Drawer */}
      <Drawer open={showUserProfileDrawer} onOpenChange={setShowUserProfileDrawer}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                {selectedUserForProfile && 
                  `${selectedUserForProfile.firstName} ${selectedUserForProfile.lastName}`}
              </div>
            </DrawerTitle>
            <DrawerDescription>
              {selectedUserForProfile && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={selectedUserForProfile.accountStatus === "active" ? "default" : "secondary"}
                    className="mr-2"
                  >
                    {selectedUserForProfile.accountStatus || "Active"}
                  </Badge>
                  
                  <span className="text-sm">
                    {selectedUserForProfile.email}
                  </span>
                </div>
              )}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 border-b py-3 bg-muted/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-medium">
                  {selectedUserForProfile && getUserProfileCompletion(selectedUserForProfile)}%
                </p>
                <p className="text-sm text-muted-foreground">Profile Completion</p>
              </div>
              <div>
                <p className="text-lg font-medium">
                  {selectedUserForProfile && getTotalDocumentsCount(selectedUserForProfile)}
                </p>
                <p className="text-sm text-muted-foreground">Documents</p>
              </div>
              <div>
                <p className="text-lg font-medium">
                  {selectedUserForProfile && getTotalLoansCount(selectedUserForProfile)}
                </p>
                <p className="text-sm text-muted-foreground">Loans</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 overflow-auto flex-1">
            <Tabs defaultValue="overview">
              <TabsList className="w-full grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="loans">Loans</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                {/* Personal Information */}
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        Personal Information
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => handleEditUserProfile('personalInfo')}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">First Name</p>
                        <p>{selectedUserForProfile?.firstName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                        <p>{selectedUserForProfile?.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">ID Number</p>
                        <p>{selectedUserForProfile?.idNumber || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                        <p>{selectedUserForProfile?.dateOfBirth || "Not provided"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Contact Information */}
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-primary" />
                        Contact Information
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => handleEditUserProfile('contactInfo')}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{selectedUserForProfile?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p>{selectedUserForProfile?.phone || "Not provided"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <p>
                          {selectedUserForProfile?.address ? 
                            `${selectedUserForProfile.address}, ${selectedUserForProfile.city || ''}, ${selectedUserForProfile.state || ''}, ${selectedUserForProfile.zipCode || ''}` : 
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Financial Information */}
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-primary" />
                        Financial Information
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => handleEditUserProfile('financialInfo')}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                        <p>R {selectedUserForProfile?.monthlyIncome?.toLocaleString() || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Employment Status</p>
                        <p className="capitalize">{selectedUserForProfile?.employmentStatus || "Not provided"}</p>
                      </div>
                      {selectedUserForProfile?.monthlyExpenses && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
                          <p>R {selectedUserForProfile.monthlyExpenses?.toLocaleString()}</p>
                        </div>
                      )}
                      {selectedUserForProfile?.creditScore && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Credit Score</p>
                          <p>{selectedUserForProfile.creditScore}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Account Status */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-primary" />
                      Account Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-3">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">Profile Completion</p>
                          <p className="text-sm">{getUserProfileCompletion(selectedUserForProfile)}%</p>
                        </div>
                        <Progress value={getUserProfileCompletion(selectedUserForProfile)} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Documents Status</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                              {getDocumentCountByStatus(selectedUserForProfile, 'verified')} Verified
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                              {getDocumentCountByStatus(selectedUserForProfile, 'pending')} Pending
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Loans</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                              {getLoansCountByStatus(selectedUserForProfile, 'active')} Active
                            </Badge>
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
                              {getLoansCountByStatus(selectedUserForProfile, 'completed')} Completed
                            </Badge>
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
                    <CardTitle>User Documents</CardTitle>
                    <CardDescription>View and manage documents uploaded by this user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedUserForProfile?.documents && selectedUserForProfile.documents.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {selectedUserForProfile.documents.map((doc, index) => (
                          <DocumentViewer 
                            key={doc.id || index} 
                            document={doc} 
                            onDownload={(document) => {
                              toast.success(`Downloading document: ${document.name}`);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No documents uploaded by this user</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="loans" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Loans</CardTitle>
                    <CardDescription>View and manage loan applications for this user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedUserForProfile?.loans && selectedUserForProfile.loans.length > 0 ? (
                      <div className="space-y-4">
                        {selectedUserForProfile.loans.map((loan, index) => (
                          <Card key={loan.id || index} className="border">
                            <CardHeader className="py-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    loan.status === "active" ? "default" :
                                    loan.status === "completed" ? "outline" :
                                    loan.status === "defaulted" ? "destructive" : "secondary"
                                  }>
                                    {loan.status}
                                  </Badge>
                                  <span className="font-medium">{loan.id}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {loan.dateApplied ? new Date(loan.dateApplied).toLocaleDateString() : "No date"}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent className="py-3">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                  <p>R {loan.amount?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Term</p>
                                  <p>{loan.term} months</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Monthly Payment</p>
                                  <p>R {loan.monthlyPayment?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                                  <p>{loan.interestRate}%</p>
                                </div>
                              </div>
                              {loan.status === "active" && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Repayment Progress</span>
                                    <span>
                                      {loan.paidMonths || 0} of {loan.term} months
                                    </span>
                                  </div>
                                  <Progress 
                                    value={((loan.paidMonths || 0) / loan.term) * 100} 
                                    className="h-2"
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Wallet className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No loans for this user</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>View recent account activity and changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedUserForProfile?.lastLogin ? (
                      <div className="space-y-3">
                        <div className="flex items-center border-b pb-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Last Login</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(selectedUserForProfile.lastLogin).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center border-b pb-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <FileCheck className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Account Created</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(selectedUserForProfile.registrationDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No activity records available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <DrawerFooter className="border-t">
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setShowUserProfileDrawer(false)}>
                Close
              </Button>
              <Button onClick={() => handleViewDetailedProfile(selectedUserForProfile)}>
                  View Full Profile
                </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default UserManagement;
