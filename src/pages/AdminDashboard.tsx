import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicationsOverview from "@/components/admin/ApplicationsOverview";
import ApplicationProcessing from "@/components/admin/ApplicationProcessing";
import UserManagement from "@/components/admin/UserManagement";
import LoanManagement from "@/components/admin/LoanManagement";
import DocumentManagement from "@/components/admin/DocumentManagement";
import RiskAssessment from "@/components/admin/RiskAssessment";
import ReportsAnalytics from "@/components/admin/ReportsAnalytics";
import DataManagement from "@/components/admin/DataManagement";
import ContactSubmissions from "@/components/admin/ContactSubmissions";
import ContractManagement from "@/components/admin/ContractManagement";
import DisplaySettings from "@/components/admin/DisplaySettings";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useRequireAuth } from "@/utils/useRequireAuth";
import { ThemeProvider } from "@/utils/ThemeProvider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { 
  Home, 
  FileText, 
  Users, 
  DollarSign, 
  FileCheck,
  LogOut,
  BarChart4,
  Bell,
  Settings,
  ShieldAlert,
  Database,
  FilePenLine,
  Smartphone,
  TabletSmartphone,
  Clock,
  CheckCircle,
  Check,
  X,
  ActivityIcon,
  History,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/utils/AppDataContext";
import { cn } from "@/lib/utils";
import NotificationCenter from "@/components/admin/NotificationCenter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const AdminDashboard = () => {
  // Use the auth hook to require admin privileges
  const isAdmin = useRequireAuth(true);
  const { logout, unreadNotificationsCount } = useAppData();
  const navigate = useNavigate();
  
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  
  // Check if location.state includes a tab to activate
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  
  // Add window resize listener for both width and height
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // If not authenticated as admin, the hook will handle redirect
  if (!isAdmin) {
    return null;
  }

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  // Check if we should show the responsive message
  // For tablets: require width ≥ 768px AND width > height (landscape mode)
  // Either should be a tablet in landscape or a desktop/laptop
  const isScreenTooSmall = windowWidth < 768 || (windowWidth < 1024 && windowWidth < windowHeight);

  // Show responsive message for small screens or portrait tablets
  if (isScreenTooSmall) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-primary/10 to-primary/5">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <TabletSmartphone className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Admin Dashboard Unavailable</h1>
          <p className="text-gray-700 mb-6">
            The admin dashboard is optimized for laptops and tablets in landscape mode.
            <br/><br/>
            Please access it from a laptop or desktop computer, or rotate your tablet to landscape mode.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              Sign Out
            </Button>
            <Button asChild className="w-full">
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Sidebar className="bg-gradient-to-b from-blue-600 to-blue-800 text-white border-0 dark:from-blue-950 dark:to-blue-900">
            <SidebarHeader className="border-b border-white/10 py-4">
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="bg-white/90 rounded-lg p-2 shadow-md">
                  <img src="/logo.png" alt="JB Capital Logo" className="h-10" />
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent className="flex flex-col justify-between h-full pb-8">
              <div>
                <SidebarGroup>
                  <SidebarGroupLabel className="text-white/70 uppercase tracking-wider text-xs font-semibold px-4 py-2">
                    Main Navigation
                  </SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === "overview"} 
                        onClick={() => setActiveTab("overview")}
                        tooltip="Overview"
                        className={cn(
                          "text-white hover:bg-white/10",
                          activeTab === "overview" && "bg-white/20 font-medium hover:bg-white/20"
                        )}
                      >
                        <Home className="h-4 w-4 text-blue-300" />
                        <span>Overview</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === "applications"} 
                        onClick={() => setActiveTab("applications")}
                        tooltip="Applications"
                        className={cn(
                          "text-white hover:bg-white/10",
                          activeTab === "applications" && "bg-white/20 font-medium hover:bg-white/20"
                        )}
                      >
                        <FileText className="h-4 w-4 text-green-300" />
                        <span>Applications</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === "users"} 
                        onClick={() => setActiveTab("users")}
                        tooltip="User Management"
                        className={cn(
                          "text-white hover:bg-white/10",
                          activeTab === "users" && "bg-white/20 font-medium hover:bg-white/20"
                        )}
                      >
                        <Users className="h-4 w-4 text-yellow-300" />
                        <span>User Management</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === "loans"} 
                        onClick={() => setActiveTab("loans")}
                        tooltip="Loan Management"
                        className={cn(
                          "text-white hover:bg-white/10",
                          activeTab === "loans" && "bg-white/20 font-medium hover:bg-white/20"
                        )}
                      >
                        <DollarSign className="h-4 w-4 text-purple-300" />
                        <span>Loan Management</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === "documents"} 
                        onClick={() => setActiveTab("documents")}
                        tooltip="Documents"
                        className={cn(
                          "text-white hover:bg-white/10",
                          activeTab === "documents" && "bg-white/20 font-medium hover:bg-white/20"
                        )}
                      >
                        <FileCheck className="h-4 w-4 text-teal-300" />
                        <span>Documents</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === "contracts"} 
                        onClick={() => setActiveTab("contracts")}
                        tooltip="Contracts"
                        className={cn(
                          "text-white hover:bg-white/10",
                          activeTab === "contracts" && "bg-white/20 font-medium hover:bg-white/20"
                        )}
                      >
                        <FilePenLine className="h-4 w-4 text-indigo-300" />
                        <span>Contracts</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === "reports"} 
                        onClick={() => setActiveTab("reports")}
                        tooltip="Reports & Analytics"
                        className={cn(
                          "text-white hover:bg-white/10",
                          activeTab === "reports" && "bg-white/20 font-medium hover:bg-white/20"
                        )}
                      >
                        <BarChart4 className="h-4 w-4 text-orange-300" />
                        <span>Reports & Analytics</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === "risk"} 
                        onClick={() => setActiveTab("risk")}
                        tooltip="Risk Assessment"
                        className={cn(
                          "text-white hover:bg-white/10",
                          activeTab === "risk" && "bg-white/20 font-medium hover:bg-white/20"
                        )}
                      >
                        <ShieldAlert className="h-4 w-4 text-red-300" />
                        <span>Risk Assessment</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === "database"} 
                        onClick={() => setActiveTab("database")}
                        tooltip="Database Management"
                        className={cn(
                          "text-white hover:bg-white/10",
                          activeTab === "database" && "bg-white/20 font-medium hover:bg-white/20"
                        )}
                      >
                        <Database className="h-4 w-4 text-blue-300" />
                        <span>Database</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === "contacts"} 
                        onClick={() => setActiveTab("contacts")}
                        tooltip="Contact Submissions"
                        className={cn(
                          "text-white hover:bg-white/10",
                          activeTab === "contacts" && "bg-white/20 font-medium hover:bg-white/20"
                        )}
                      >
                        <MessageSquare className="h-4 w-4 text-pink-300" />
                        <span>Contacts</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
                
                <SidebarGroup>
                  <SidebarGroupLabel className="text-white/70 uppercase tracking-wider text-xs font-semibold px-4 py-2">
                    Additional
                  </SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === "notifications"} 
                        onClick={() => setActiveTab("notifications")}
                        tooltip="Notifications"
                        className={cn(
                          "text-white hover:bg-white/10",
                          activeTab === "notifications" && "bg-white/20 font-medium hover:bg-white/20"
                        )}
                      >
                        <div className="relative">
                          <Bell className="h-4 w-4 text-red-300" />
                          {unreadNotificationsCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[9px] text-white font-bold flex items-center justify-center">
                                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                              </span>
                            </span>
                          )}
                        </div>
                        <span>Notifications</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === "settings"} 
                        onClick={() => setActiveTab("settings")}
                        tooltip="Settings"
                        className={cn(
                          "text-white hover:bg-white/10",
                          activeTab === "settings" && "bg-white/20 font-medium hover:bg-white/20"
                        )}
                      >
                        <Settings className="h-4 w-4 text-cyan-300" />
                        <span>Settings</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </div>
              
              <SidebarFooter className="border-t border-white/10 pt-4 px-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-2 text-white hover:bg-white/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4 text-pink-300" />
                  <span>Sign out</span>
                </Button>
              </SidebarFooter>
            </SidebarContent>
          </Sidebar>
          
          <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-blue-50/20 to-indigo-50/20 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/20">
            <div className="flex items-center gap-2 p-2">
              <SidebarTrigger className="text-primary" />
              <ThemeToggle variant="outline" size="sm" />
            </div>
            <div className="container max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center shadow-md">
                    <img src="/icon.png" alt="JB Capital Icon" className="h-10" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage loan applications, users, and system settings</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="bg-white/70 backdrop-blur-sm p-2 rounded-lg shadow-sm flex items-center gap-2 border border-blue-100 hover:border-blue-300 transition-all duration-300">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Admin User</div>
                      <div className="text-xs text-muted-foreground">admin@jbcapital.com</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-10 w-full bg-white/50 p-1 backdrop-blur-sm rounded-xl shadow-sm border border-blue-50">
                  <TabsTrigger value="overview" className="relative data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-300 rounded-full data-[state=inactive]:opacity-0" data-state={activeTab === "overview" ? "active" : "inactive"} />
                    <Home className="h-4 w-4 text-blue-500 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="relative data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-300 rounded-full data-[state=inactive]:opacity-0" data-state={activeTab === "applications" ? "active" : "inactive"} />
                    <FileText className="h-4 w-4 text-green-500 mr-2" />
                    Applications
                  </TabsTrigger>
                  <TabsTrigger value="users" className="relative data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-300 rounded-full data-[state=inactive]:opacity-0" data-state={activeTab === "users" ? "active" : "inactive"} />
                    <Users className="h-4 w-4 text-yellow-500 mr-2" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="loans" className="relative data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-300 rounded-full data-[state=inactive]:opacity-0" data-state={activeTab === "loans" ? "active" : "inactive"} />
                    <DollarSign className="h-4 w-4 text-purple-500 mr-2" />
                    Loans
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="relative data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-300 rounded-full data-[state=inactive]:opacity-0" data-state={activeTab === "documents" ? "active" : "inactive"} />
                    <FileCheck className="h-4 w-4 text-teal-500 mr-2" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="contracts" className="relative data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-300 rounded-full data-[state=inactive]:opacity-0" data-state={activeTab === "contracts" ? "active" : "inactive"} />
                    <FilePenLine className="h-4 w-4 text-indigo-500 mr-2" />
                    Contracts
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="relative data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-300 rounded-full data-[state=inactive]:opacity-0" data-state={activeTab === "reports" ? "active" : "inactive"} />
                    <BarChart4 className="h-4 w-4 text-orange-500 mr-2" />
                    Reports
                  </TabsTrigger>
                  <TabsTrigger value="risk" className="relative data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-300 rounded-full data-[state=inactive]:opacity-0" data-state={activeTab === "risk" ? "active" : "inactive"} />
                    <ShieldAlert className="h-4 w-4 text-red-500 mr-2" />
                    Risk
                  </TabsTrigger>
                  <TabsTrigger value="contacts" className="relative data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-300 rounded-full data-[state=inactive]:opacity-0" data-state={activeTab === "contacts" ? "active" : "inactive"} />
                    <MessageSquare className="h-4 w-4 text-pink-500 mr-2" />
                    Contacts
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <ApplicationsOverview />
                </TabsContent>
                
                <TabsContent value="applications" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <ApplicationProcessing />
                </TabsContent>
                
                <TabsContent value="users" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <UserManagement />
                </TabsContent>
                
                <TabsContent value="loans" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <LoanManagement />
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <DocumentManagement />
                </TabsContent>
                
                <TabsContent value="contracts" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <ContractManagement />
                </TabsContent>
                
                <TabsContent value="reports" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <ReportsAnalytics />
                </TabsContent>
                
                <TabsContent value="risk" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <RiskAssessment />
                </TabsContent>
                
                <TabsContent value="contacts" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <ContactSubmissions />
                </TabsContent>
                
                <TabsContent value="database" className="p-6 h-full overflow-auto">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold">Database Management</h1>
                    <p className="text-muted-foreground">
                      Manage your MongoDB database connection and data migration
                    </p>
                  </div>
                  <div className="grid gap-6">
                    <DataManagement />
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <NotificationCenter />
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent dark:from-blue-500 dark:to-indigo-500">Admin Settings</h1>
                    <p className="text-muted-foreground">
                      Configure system settings and preferences
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <DisplaySettings />
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Configure how you receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Notification settings are available in the Notifications tab.
                        </p>
                        <Button 
                          className="mt-4" 
                          onClick={() => setActiveTab("notifications")}
                        >
                          Go to Notifications
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>Update your admin profile</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Profile management coming soon.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default AdminDashboard;
