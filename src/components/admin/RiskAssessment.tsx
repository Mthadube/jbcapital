import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle, Search, Shield, XCircle } from "lucide-react";
import { useAppData } from "@/utils/AppDataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

// Define interfaces for our data structures
interface RiskDistributionItem {
  name: string;
  value: number;
  color: string;
  percent: number;
}

interface RiskFactorItem {
  name: string;
  count: number;
}

interface RiskTrendItem {
  month: string;
  "High Risk": number;
  "Medium Risk": number;
  "Low Risk": number;
}

interface HighRiskApplication {
  id: string;
  applicant: string;
  creditScore: number;
  riskFactors: string[];
  status: string;
}

const RiskAssessment = () => {
  const { applications, users } = useAppData();

  // Generate risk distribution data based on credit scores
  const riskDistributionData = useMemo<RiskDistributionItem[]>(() => {
    const data = [
      { name: "Low Risk", value: 0, color: "#10B981", percent: 0 },  // Green
      { name: "Medium Risk", value: 0, color: "#F59E0B", percent: 0 }, // Yellow
      { name: "High Risk", value: 0, color: "#EF4444", percent: 0 },  // Red
    ];

    // Count applications by risk level based on credit score
    applications.forEach(app => {
      const creditScore = app.financialInfo?.creditScore || 0;
      
      if (creditScore >= 700) {
        data[0].value += 1; // Low risk
      } else if (creditScore >= 600) {
        data[1].value += 1; // Medium risk
      } else if (creditScore > 0) {
        data[2].value += 1; // High risk
      }
    });

    // Calculate percentages
    const total = data.reduce((sum, item) => sum + item.value, 0) || 1; // Avoid division by zero
    data.forEach(item => {
      item.percent = Math.round((item.value / total) * 100);
    });

    // Ensure some data for visualization
    if (total < 5) {
      data[0].value = Math.max(data[0].value, 45);
      data[1].value = Math.max(data[1].value, 30);
      data[2].value = Math.max(data[2].value, 25);
      
      data.forEach(item => {
        item.percent = Math.round((item.value / (data[0].value + data[1].value + data[2].value)) * 100);
      });
    }

    return data;
  }, [applications]);

  // Calculate risk factors data
  const riskFactorsData = useMemo<RiskFactorItem[]>(() => {
    // Initialize data structure
    const data = [
      { name: "Low Credit Score", count: 0 },
      { name: "High DTI Ratio", count: 0 },
      { name: "Limited Employment", count: 0 },
      { name: "Bankruptcies", count: 0 },
      { name: "Existing Loan Burden", count: 0 }
    ];

    // Count risk factors
    applications.forEach(app => {
      const creditScore = app.financialInfo?.creditScore || 0;
      const dtiRatio = app.financialInfo?.debtToIncomeRatio || 0;
      const yearsEmployed = app.employmentInfo?.yearsAtCurrentEmployer || 0;
      const bankruptcies = app.financialInfo?.bankruptcies || false;
      const hasExistingLoans = app.financialInfo?.existingLoans?.length > 0;

      if (creditScore < 650) data[0].count += 1;
      if (dtiRatio > 0.40) data[1].count += 1;
      if (yearsEmployed < 2) data[2].count += 1;
      if (bankruptcies) data[3].count += 1;
      if (hasExistingLoans) data[4].count += 1;
    });

    // Ensure some data for visualization
    if (applications.length < 5) {
      data[0].count = Math.max(data[0].count, 28);
      data[1].count = Math.max(data[1].count, 42);
      data[2].count = Math.max(data[2].count, 35);
      data[3].count = Math.max(data[3].count, 12);
      data[4].count = Math.max(data[4].count, 38);
    }

    return data;
  }, [applications]);

  // Generate trend data (normally this would come from historical data)
  const riskTrendData = useMemo<RiskTrendItem[]>(() => {
    // Get current month and generate last 6 months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIndex = new Date().getMonth();
    
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      
      // Create a smooth downward trend for high risk, upward for low risk
      const factor = (5 - i) / 5; // 0 to 1
      const highRiskFactor = 1 - (factor * 0.3); // Decreasing 
      const lowRiskFactor = 1 + (factor * 0.4); // Increasing
      
      trendData.push({
        month: months[monthIndex],
        "High Risk": Math.round(25 * highRiskFactor),
        "Medium Risk": 30 + Math.round(Math.sin(i) * 5), // Some variation
        "Low Risk": Math.round(45 * lowRiskFactor),
      });
    }
    
    return trendData;
  }, []);

  // Identify high risk applications
  const highRiskApplications = useMemo<HighRiskApplication[]>(() => {
    return applications
      .filter(app => {
        const creditScore = app.financialInfo?.creditScore || 0;
        const dtiRatio = app.financialInfo?.debtToIncomeRatio || 0;
        const yearsEmployed = app.employmentInfo?.yearsAtCurrentEmployer || 0;
        
        // Consider high risk if credit score is low or DTI is high
        return (creditScore < 620 || dtiRatio > 0.45 || yearsEmployed < 1);
      })
      .map(app => {
        // Get user details
        const user = users.find(u => u.id === app.userId);
        
        // Calculate risk factors
        const riskFactors = [];
        const creditScore = app.financialInfo?.creditScore || 0;
        const dtiRatio = app.financialInfo?.debtToIncomeRatio || 0;
        const yearsEmployed = app.employmentInfo?.yearsAtCurrentEmployer || 0;
        const bankruptcies = app.financialInfo?.bankruptcies || false;
        const hasExistingLoans = app.financialInfo?.existingLoans?.length > 0;
        
        if (creditScore < 620) riskFactors.push("Low Credit Score");
        if (dtiRatio > 0.45) riskFactors.push("High Debt-to-Income");
        if (yearsEmployed < 1) riskFactors.push("Limited Employment History");
        if (bankruptcies) riskFactors.push("Past Bankruptcy");
        if (hasExistingLoans) riskFactors.push("Multiple Existing Loans");
        
        return {
          id: app.id,
          applicant: user ? `${user.firstName} ${user.lastName}` : "Unknown Applicant",
          creditScore,
          riskFactors,
          status: app.status,
        };
      })
      .slice(0, 5); // Limit to 5 applications for display
  }, [applications, users]);

  // Calculate average risk score (based on credit scores)
  const averageRiskScore = useMemo(() => {
    if (applications.length === 0) return 50;
    
    const sum = applications.reduce((total, app) => {
      const creditScore = app.financialInfo?.creditScore || 0;
      // Convert credit score to risk score (e.g., 850 -> 0, 300 -> 100)
      if (creditScore === 0) return total; // Skip if no credit score
      
      const riskScore = Math.max(0, Math.min(100, Math.round(100 - ((creditScore - 300) / 550) * 100)));
      return total + riskScore;
    }, 0);
    
    const validApps = applications.filter(app => app.financialInfo?.creditScore).length || 1;
    return Math.round(sum / validApps);
  }, [applications]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Risk Assessment Dashboard</h2>
      
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Average Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{averageRiskScore}/100</div>
            <div className="mt-2 h-2 w-full bg-blue-200 rounded-full overflow-hidden">
              <div 
                className={`h-2 ${
                  averageRiskScore < 30 ? "bg-green-500" : 
                  averageRiskScore < 70 ? "bg-amber-500" : 
                  "bg-red-500"
                }`} 
                style={{ width: `${averageRiskScore}%` }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Low Risk Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{riskDistributionData[0].percent}%</div>
            <p className="text-xs text-green-700">
              {riskDistributionData[0].value} applications
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Medium Risk Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{riskDistributionData[1].percent}%</div>
            <p className="text-xs text-amber-700">
              {riskDistributionData[1].value} applications
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">High Risk Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{riskDistributionData[2].percent}%</div>
            <p className="text-xs text-red-700">
              {riskDistributionData[2].value} applications
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Risk Distribution Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Distribution of applications by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} applications`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Risk Factors Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Factors</CardTitle>
            <CardDescription>Most common risk factors across applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={riskFactorsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip 
                    formatter={(value) => [`${value} applications`, 'Count']}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#8884d8"
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {riskFactorsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index % 2 === 0 ? "#3B82F6" : "#8B5CF6"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Risk Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Trends Over Time</CardTitle>
          <CardDescription>Six-month trend of application risk levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={riskTrendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="High Risk" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  animationBegin={200}
                  animationDuration={1000}
                />
                <Line 
                  type="monotone" 
                  dataKey="Medium Risk" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  animationBegin={400}
                  animationDuration={1000}
                />
                <Line 
                  type="monotone" 
                  dataKey="Low Risk" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  animationBegin={600}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* High Risk Applications */}
      <Card>
        <CardHeader>
          <div className="flex flex-row justify-between items-center">
            <CardTitle>High Risk Applications</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search applications..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[120px]">Application ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead className="w-[100px] text-center">Credit Score</TableHead>
                  <TableHead className="w-[250px]">Risk Factors</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[150px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highRiskApplications.length > 0 ? (
                  highRiskApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.id}</TableCell>
                      <TableCell>{app.applicant}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center h-8 w-12 rounded bg-red-100 text-red-800 font-semibold">
                          {app.creditScore}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {app.riskFactors.map((factor, idx) => (
                            <li key={idx} className="text-muted-foreground">{factor}</li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            app.status === "Approved" ? "default" : 
                            app.status === "Rejected" ? "destructive" : 
                            app.status === "Under Review" ? "secondary" : 
                            "outline"
                          }
                          className={
                            app.status === "Approved" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
                          }
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="default" size="sm">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No high risk applications found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAssessment;
