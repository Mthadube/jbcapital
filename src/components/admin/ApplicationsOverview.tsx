import React from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, FileClock, CheckCircle, XCircle, Clock, AlertTriangle, Activity, Users, GanttChartSquare, ArrowRight, FileText } from "lucide-react";
import CreditCard from "./CreditCard";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAppData } from "@/utils/AppDataContext";

// Demo data
const statusData = [
  { name: "Pending", value: 42, color: "#F59E0B" },
  { name: "Approved", value: 25, color: "#10B981" },
  { name: "Rejected", value: 18, color: "#EF4444" },
  { name: "Under Review", value: 15, color: "#3B82F6" },
];

const applicationVolumeData = [
  { name: "Mon", value: 12 },
  { name: "Tue", value: 19 },
  { name: "Wed", value: 15 },
  { name: "Thu", value: 22 },
  { name: "Fri", value: 28 },
  { name: "Sat", value: 14 },
  { name: "Sun", value: 8 },
];

const riskScoreData = [
  { name: "Low Risk", value: 45, color: "#10B981" },
  { name: "Medium Risk", value: 32, color: "#F59E0B" },
  { name: "High Risk", value: 23, color: "#EF4444" },
];

const approvalTrendData = [
  { name: "Jan", approval: 68, rejection: 32 },
  { name: "Feb", approval: 72, rejection: 28 },
  { name: "Mar", approval: 65, rejection: 35 },
  { name: "Apr", approval: 70, rejection: 30 },
  { name: "May", approval: 75, rejection: 25 },
  { name: "Jun", approval: 82, rejection: 18 },
];

const recentApplications = [
  { id: "APP-2023-0421", name: "John Smith", amount: "R250,000", status: "Approved", date: "2023-06-21", risk: "Low" },
  { id: "APP-2023-0422", name: "Sarah Johnson", amount: "R120,000", status: "Pending", date: "2023-06-21", risk: "Medium" },
  { id: "APP-2023-0423", name: "Michael Brown", amount: "R450,000", status: "Under Review", date: "2023-06-20", risk: "Medium" },
  { id: "APP-2023-0424", name: "Emily Davis", amount: "R75,000", status: "Rejected", date: "2023-06-20", risk: "High" },
  { id: "APP-2023-0425", name: "Robert Wilson", amount: "R200,000", status: "Approved", date: "2023-06-19", risk: "Low" },
];

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "Approved":
      return <CheckCircle size={16} className="text-green-500" />;
    case "Rejected":
      return <XCircle size={16} className="text-red-500" />;
    case "Pending":
      return <Clock size={16} className="text-amber-500" />;
    case "Under Review":
      return <FileClock size={16} className="text-blue-500" />;
    default:
      return null;
  }
};

const RiskIcon = ({ risk }: { risk: string }) => {
  switch (risk) {
    case "Low":
      return <span className="chip bg-green-100 text-green-700">Low</span>;
    case "Medium":
      return <span className="chip bg-amber-100 text-amber-700">Medium</span>;
    case "High":
      return <span className="chip bg-red-100 text-red-700">High</span>;
    default:
      return null;
  }
};

const ApplicationsOverview = () => {
  const { applications, loans, users } = useAppData();
  const navigate = useNavigate();

  // Calculate statistics
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => 
    !["Approved", "Rejected"].includes(app.status)
  ).length;
  const approvedApplications = applications.filter(app => app.status === "Approved").length;
  const rejectedApplications = applications.filter(app => app.status === "Rejected").length;
  
  // Calculate approval rate (as percentage)
  const approvalRate = totalApplications 
    ? Math.round((approvedApplications / (approvedApplications + rejectedApplications || 1)) * 100) 
    : 0;
  
  // Get active loans
  const activeLoans = loans.filter(loan => loan.status === "active").length;
  
  // Calculate average processing time (mock data for demo)
  const avgProcessingTime = "3.5 days";
  
  // Handle card click to navigate
  const handleCardClick = (tab: string) => {
    navigate("/admin", { state: { activeTab: tab } });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Applications Card */}
        <Card className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => handleCardClick("applications")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round(totalApplications * 0.05)} from last month
            </p>
            <div className="mt-3 flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              <span>Average processing time: {avgProcessingTime}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Pending Applications Card */}
        <Card className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => handleCardClick("applications")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              Requiring review and processing
            </p>
            <div className="mt-3">
              <Progress value={(pendingApplications / (totalApplications || 1)) * 100} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round((pendingApplications / (totalApplications || 1)) * 100)}% of all applications
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Application Approval Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                <span>Approved: {approvedApplications}</span>
              </div>
              <div className="flex items-center">
                <XCircle className="mr-1 h-3 w-3 text-red-500" />
                <span>Rejected: {rejectedApplications}</span>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={approvalRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        {/* Active Loans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans}</div>
            <div className="mt-3 flex justify-between text-xs">
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-1 h-3 w-3" />
                <span>Total borrowers: {users.filter(u => u.loans?.length > 0).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Loan Application Status</CardTitle>
            <CardDescription>Distribution of applications by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { status: "Pending Review", count: applications.filter(a => a.status === "Pending Review").length },
                { status: "Initial Screening", count: applications.filter(a => a.status === "Initial Screening").length },
                { status: "Document Review", count: applications.filter(a => a.status === "Document Review").length },
                { status: "Credit Assessment", count: applications.filter(a => a.status === "Credit Assessment").length },
                { status: "Income Verification", count: applications.filter(a => a.status === "Income Verification").length },
                { status: "Final Decision", count: applications.filter(a => a.status === "Final Decision").length },
                { status: "Approved", count: approvedApplications },
                { status: "Rejected", count: rejectedApplications }
              ].map(item => (
                <div key={item.status} className="flex items-center">
                  <div className="w-1/3 text-sm">{item.status}</div>
                  <div className="w-2/3">
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={item.count ? (item.count / totalApplications) * 100 : 0} 
                        className="h-2" 
                      />
                      <span className="text-sm w-8 text-muted-foreground">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest application status changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* We'd normally fetch this from an activity log, but for the demo we'll use recent applications */}
              {applications
                .slice() // Create a copy before sorting
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(app => (
                  <div key={app.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                    <div className={`rounded-full p-2 ${
                      app.status === "Approved" ? "bg-green-100" :
                      app.status === "Rejected" ? "bg-red-100" :
                      "bg-blue-100"
                    }`}>
                      {app.status === "Approved" ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                       app.status === "Rejected" ? <XCircle className="h-4 w-4 text-red-600" /> :
                       <Clock className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{app.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Application {app.id} - {app.status}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {app.date}
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-4 text-center">
              <button 
                onClick={() => handleCardClick("applications")}
                className="text-sm text-primary flex items-center justify-center mx-auto hover:underline"
              >
                View all applications
                <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationsOverview;
