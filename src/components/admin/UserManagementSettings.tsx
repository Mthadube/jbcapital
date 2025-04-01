import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, RefreshCw, UserPlus, UserX, Edit, MoreHorizontal, Lock, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAppData } from "@/utils/AppDataContext";

export default function UserManagementSettings() {
  const { users, updateUser, addUser, refreshData, isLoading } = useAppData();
  
  // State for user management
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
    isActive: true,
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || email.includes(search) || (user.id && user.id.includes(search));
  });

  // Reset form data
  const resetFormData = () => {
    setNewUserData({
      firstName: "",
      lastName: "",
      email: "",
      role: "user",
      isActive: true,
      password: "",
      confirmPassword: ""
    });
  };

  // Handle add user form input
  const handleAddUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserData({
      ...newUserData,
      [e.target.name]: e.target.value
    });
  };

  // Handle role change
  const handleRoleChange = (value: string) => {
    setNewUserData({
      ...newUserData,
      role: value
    });
  };

  // Handle active status change
  const handleActiveStatusChange = (checked: boolean) => {
    setNewUserData({
      ...newUserData,
      isActive: checked
    });
  };

  // Open edit user dialog
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setNewUserData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role || "user",
      isActive: user.accountStatus === "active",
      password: "",
      confirmPassword: ""
    });
    setShowEditUserDialog(true);
  };

  // Open reset password dialog
  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setNewUserData({
      ...newUserData,
      password: "",
      confirmPassword: ""
    });
    setShowResetPasswordDialog(true);
  };

  // Submit new user form
  const handleSubmitNewUser = async () => {
    // Validate form
    if (!newUserData.firstName || !newUserData.lastName || !newUserData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!newUserData.email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (newUserData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a unique ID for the new user
      const id = `USR-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the new user object
      const newUser = {
        id,
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        email: newUserData.email.toLowerCase(),
        password: newUserData.password,
        phone: "", // Required field, but we'll leave it empty for now
        idNumber: "", // Required field, but we'll leave it empty for now
        address: "", // Required field, but we'll leave it empty for now
        city: "", // Required field, but we'll leave it empty for now
        state: "", // Required field, but we'll leave it empty for now
        zipCode: "", // Required field, but we'll leave it empty for now
        monthlyIncome: 0, // Required field, setting a default
        accountStatus: newUserData.isActive ? "active" : "inactive",
        registrationDate: new Date().toISOString(),
        profileCompletionPercentage: 30,
        role: newUserData.role,
        documents: [],
        loans: []
      };
      
      // Add the user
      const success = await addUser(newUser);
      
      if (success) {
        toast.success("User added successfully");
        setShowAddUserDialog(false);
        resetFormData();
      } else {
        toast.error("Failed to add user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("An error occurred while adding the user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit edit user form
  const handleSubmitEditUser = async () => {
    // Validate form
    if (!newUserData.firstName || !newUserData.lastName || !newUserData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!newUserData.email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!selectedUser || !selectedUser.id) {
        toast.error("No user selected");
        setIsSubmitting(false);
        return;
      }
      
      const success = await updateUser(selectedUser.id, {
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        email: newUserData.email.toLowerCase(),
        role: newUserData.role,
        accountStatus: newUserData.isActive ? "active" : "inactive"
      });
      
      if (success) {
        toast.success("User updated successfully");
        setShowEditUserDialog(false);
        resetFormData();
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("An error occurred while updating the user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit reset password
  const handleSubmitResetPassword = async () => {
    // Validate passwords
    if (newUserData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!selectedUser || !selectedUser.id) {
        toast.error("No user selected");
        setIsSubmitting(false);
        return;
      }
      
      // In a real app, you would send this to your backend to update the password
      // For now, we'll just show a success message
      toast.success(`Password reset for ${selectedUser.firstName} ${selectedUser.lastName}`);
      setShowResetPasswordDialog(false);
      resetFormData();
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("An error occurred while resetting the password");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle refresh data
  const handleRefreshData = async () => {
    toast.info("Refreshing user data...");
    await refreshData();
    toast.success("User data refreshed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAddUserDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group">
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>
                          {user.role || "user"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.accountStatus === "active" ? "default" : "destructive"}
                          className={
                            user.accountStatus === "active" 
                              ? "bg-green-100 text-green-800 hover:bg-green-200" 
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }
                        >
                          {user.accountStatus || "inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.registrationDate}</TableCell>
                      <TableCell>{user.lastLogin || "Never"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResetPassword(user)}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                <Lock className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              {user.role !== "admin" && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      updateUser(user.id, { 
                                        role: "admin"
                                      });
                                      toast.success(`${user.firstName} ${user.lastName} is now an admin`);
                                    }}
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Make Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      updateUser(user.id, { 
                                        accountStatus: user.accountStatus === "active" ? "inactive" : "active" 
                                      });
                                      toast.success(`${user.firstName} ${user.lastName} has been ${user.accountStatus === "active" ? "deactivated" : "activated"}`);
                                    }}
                                  >
                                    {user.accountStatus === "active" ? (
                                      <>
                                        <UserX className="h-4 w-4 mr-2" />
                                        Deactivate User
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Activate User
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No users found. Try a different search query or add a new user.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. The user will receive an email to set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name"
                  value={newUserData.firstName}
                  onChange={handleAddUserChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter last name"
                  value={newUserData.lastName}
                  onChange={handleAddUserChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={newUserData.email}
                onChange={handleAddUserChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUserData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Account Status</Label>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium">Active</span>
                  <Switch
                    checked={newUserData.isActive}
                    onCheckedChange={handleActiveStatusChange}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={newUserData.password}
                onChange={handleAddUserChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={newUserData.confirmPassword}
                onChange={handleAddUserChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitNewUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and account settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name"
                  value={newUserData.firstName}
                  onChange={handleAddUserChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter last name"
                  value={newUserData.lastName}
                  onChange={handleAddUserChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={newUserData.email}
                onChange={handleAddUserChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUserData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Account Status</Label>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium">Active</span>
                  <Switch
                    checked={newUserData.isActive}
                    onCheckedChange={handleActiveStatusChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEditUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {selectedUser && `Reset password for ${selectedUser.firstName} ${selectedUser.lastName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password"
                value={newUserData.password}
                onChange={handleAddUserChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={newUserData.confirmPassword}
                onChange={handleAddUserChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitResetPassword} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 