import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, Plus, Edit, Trash, Lock, MoreHorizontal, 
  Shield, Check, X, Clock, FileCheck, Eye, User
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

// Define role types for better type safety
interface Role {
  id: string;
  name: string;
  permissions: string[];
  userCount: number;
}

const UserManagement = () => {
  const { users, updateUser, addUser: addAppDataUser } = useAppData();
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

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    (user.firstName + " " + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    toast.info(`Editing ${section} for ${selectedUserForProfile.firstName} ${selectedUserForProfile.lastName}`);
    // In a real app, this would open a form to edit the specific section
  };

  // Function to navigate to detailed user profile
  const handleViewDetailedProfile = (user: any) => {
    navigate(`/admin/user/${user.id}`);
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
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle className="text-2xl font-bold">User Profile</DrawerTitle>
            <DrawerDescription>
              {selectedUserForProfile ? `Viewing complete details for ${selectedUserForProfile.firstName} ${selectedUserForProfile.lastName}` : "Loading user details..."}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-6">
            {selectedUserForProfile && (
              <UserProfileView 
                user={selectedUserForProfile} 
                onEditClick={handleEditUserProfile} 
              />
            )}
          </div>
          
          <DrawerFooter className="border-t pt-4">
            <div className="flex justify-between w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowUserProfileDrawer(false)}
              >
                Close
              </Button>
              
              {selectedUserForProfile && (
                <Button 
                  onClick={() => handleViewDetailedProfile(selectedUserForProfile)}
                >
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

export default UserManagement;
