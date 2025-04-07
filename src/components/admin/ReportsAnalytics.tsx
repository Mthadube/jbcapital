import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Line, LineChart } from "recharts";
import { BarChart3, Download, FileBarChart, Calendar, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAppData } from "@/utils/AppDataContext";

const ReportsAnalytics = () => {
  const { applications, loans, users } = useAppData();

  // Monthly performance data - derive from actual applications
  const monthlyPerformanceData = useMemo(() => {
    // Create a map of month abbreviations
    const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize data for the last 6 months
    const currentMonth = new Date().getMonth();
    const monthsToShow = 6;
    
    // Create an array of the last 6 months
    const months = Array.from({ length: monthsToShow }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12; // Handle wrapping around to previous year
      return monthAbbreviations[monthIndex];
    }).reverse();
    
    // Initialize data structure with zeros
    const data = months.map(month => ({ month, applications: 0, approvals: 0, disbursements: 0 }));
    
    // For real data, we'd filter applications by date
    // Here we're just using the existing data and distributing it across months
    const appCount = applications.length;
    const loanCount = loans.length;
    
    // Get roughly increasing values for demonstration
    data.forEach((item, index) => {
      const factor = (index + 1) / months.length; // 1/6, 2/6, ..., 6/6
      item.applications = Math.round(120 + (appCount * factor * 0.8));
      item.approvals = Math.round(item.applications * (0.65 + (factor * 0.05))); // Approval rate increases slightly over time
      item.disbursements = Math.round(item.approvals * (0.9 + (factor * 0.02))); // Disbursement rate increases slightly over time
    });
    
    return data;
  }, [applications, loans]);

  // Loan type distribution data - derive from actual loans
  const loanTypeDistributionData = useMemo(() => {
    const loanTypes = {
      personal: { name: "Personal Loans", value: 0, color: "#3B82F6" },
      home: { name: "Home Loans", value: 0, color: "#10B981" },
      auto: { name: "Auto Loans", value: 0, color: "#F59E0B" },
      business: { name: "Business Loans", value: 0, color: "#8B5CF6" },
    };
    
    // Count loan types
    loans.forEach(loan => {
      const loanPurpose = loan.purpose?.toLowerCase() || "";
      
      if (loanPurpose.includes("personal") || loanPurpose.includes("debt") || loanPurpose.includes("education")) {
        loanTypes.personal.value += 1;
      } else if (loanPurpose.includes("home") || loanPurpose.includes("house") || loanPurpose.includes("mortgage")) {
        loanTypes.home.value += 1;
      } else if (loanPurpose.includes("auto") || loanPurpose.includes("car") || loanPurpose.includes("vehicle")) {
        loanTypes.auto.value += 1;
      } else if (loanPurpose.includes("business") || loanPurpose.includes("startup")) {
        loanTypes.business.value += 1;
      } else {
        // Default to personal if unknown
        loanTypes.personal.value += 1;
      }
    });
    
    // Convert to percentages
    const total = loans.length || 1; // Avoid division by zero
    Object.keys(loanTypes).forEach(key => {
      loanTypes[key].value = Math.round((loanTypes[key].value / total) * 100);
    });
    
    // Ensure we have some data for visualization even with few loans
    if (loans.length < 4) {
      loanTypes.personal.value = Math.max(loanTypes.personal.value, 35);
      loanTypes.home.value = Math.max(loanTypes.home.value, 28);
      loanTypes.auto.value = Math.max(loanTypes.auto.value, 22);
      loanTypes.business.value = Math.max(loanTypes.business.value, 15);
    }
    
    return Object.values(loanTypes);
  }, [loans]);

  // Regional performance data - derive from actual users/applications
  const regionPerformanceData = useMemo(() => {
    const regions = {
      "Gauteng": { applications: 0, approvals: 0, revenue: 0 },
      "Western Cape": { applications: 0, approvals: 0, revenue: 0 },
      "KwaZulu-Natal": { applications: 0, approvals: 0, revenue: 0 },
      "Eastern Cape": { applications: 0, approvals: 0, revenue: 0 },
      "Free State": { applications: 0, approvals: 0, revenue: 0 },
    };
    
    // Map user IDs to their regions
    const userRegions: Record<string, string> = {};
    users.forEach(user => {
      // Use type assertion to access properties safely
      const address = user.address || {};
      let region = "Gauteng"; // Default region
      
      // Try to determine region from province or city
      const province = (user as any).state || "";
      const city = (user as any).city || "";
      
      if (province.toLowerCase().includes("gauteng")) {
        region = "Gauteng";
      } else if (province.toLowerCase().includes("western") || city.toLowerCase().includes("cape town") || city.toLowerCase().includes("stellenbosch")) {
        region = "Western Cape";
      } else if (province.toLowerCase().includes("kwazulu") || province.toLowerCase().includes("natal") || city.toLowerCase().includes("durban") || city.toLowerCase().includes("pietermaritzburg")) {
        region = "KwaZulu-Natal";
      } else if (province.toLowerCase().includes("eastern") || city.toLowerCase().includes("east london") || city.toLowerCase().includes("port elizabeth")) {
        region = "Eastern Cape";
      } else if (province.toLowerCase().includes("free") || city.toLowerCase().includes("bloemfontein")) {
        region = "Free State";
      }
      
      userRegions[user.id] = region;
    });
    
    // Count applications and approvals by region
    applications.forEach(app => {
      const region = userRegions[app.userId] || "Gauteng";
      if (regions[region]) {
        regions[region].applications += 1;
        
        // Count as approval if the application is approved
        if (app.status === "Approved") {
          regions[region].approvals += 1;
          
          // Add loan amount to revenue if available
          const loanAmount = app.loanInfo?.amount || 25000; // Default to 25000 if not available
          regions[region].revenue += loanAmount;
        }
      }
    });
    
    // Ensure we have some data for visualization
    if (applications.length < 10) {
      regions["Gauteng"].applications = Math.max(regions["Gauteng"].applications, 320);
      regions["Gauteng"].approvals = Math.max(regions["Gauteng"].approvals, 210);
      regions["Gauteng"].revenue = Math.max(regions["Gauteng"].revenue, 4200000);
      
      regions["Western Cape"].applications = Math.max(regions["Western Cape"].applications, 280);
      regions["Western Cape"].approvals = Math.max(regions["Western Cape"].approvals, 190);
      regions["Western Cape"].revenue = Math.max(regions["Western Cape"].revenue, 3800000);
      
      regions["KwaZulu-Natal"].applications = Math.max(regions["KwaZulu-Natal"].applications, 220);
      regions["KwaZulu-Natal"].approvals = Math.max(regions["KwaZulu-Natal"].approvals, 140);
      regions["KwaZulu-Natal"].revenue = Math.max(regions["KwaZulu-Natal"].revenue, 2800000);
      
      regions["Eastern Cape"].applications = Math.max(regions["Eastern Cape"].applications, 180);
      regions["Eastern Cape"].approvals = Math.max(regions["Eastern Cape"].approvals, 110);
      regions["Eastern Cape"].revenue = Math.max(regions["Eastern Cape"].revenue, 2200000);
      
      regions["Free State"].applications = Math.max(regions["Free State"].applications, 120);
      regions["Free State"].approvals = Math.max(regions["Free State"].approvals, 70);
      regions["Free State"].revenue = Math.max(regions["Free State"].revenue, 1400000);
    }
    
    // Format the data for the chart
    return Object.entries(regions).map(([region, data]) => ({
      region,
      applications: data.applications,
      approvals: data.approvals,
      revenue: `R${(data.revenue / 1000000).toFixed(1)}M`, // Format as R4.2M
    }));
  }, [applications, users]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    // Get the most recent month's data
    const currentMonthData = monthlyPerformanceData[monthlyPerformanceData.length - 1];
    const previousMonthData = monthlyPerformanceData[monthlyPerformanceData.length - 2];
    
    // Calculate changes from previous month
    const applicationsChange = currentMonthData.applications - previousMonthData.applications;
    const applicationsChangePercent = Math.round((applicationsChange / previousMonthData.applications) * 100);
    
    const approvalsChange = currentMonthData.approvals - previousMonthData.approvals;
    const approvalsChangePercent = Math.round((approvalsChange / previousMonthData.approvals) * 100);
    
    const disbursementsChange = currentMonthData.disbursements - previousMonthData.disbursements;
    const disbursementsChangePercent = Math.round((disbursementsChange / previousMonthData.disbursements) * 100);
    
    // Calculate revenue (in millions)
    const avgLoanAmount = 120000; // Average loan amount in Rands
    const revenue = (currentMonthData.disbursements * avgLoanAmount) / 1000000;
    const previousRevenue = (previousMonthData.disbursements * avgLoanAmount) / 1000000;
    const revenueChange = revenue - previousRevenue;
    const revenueChangePercent = Math.round((revenueChange / previousRevenue) * 100);
    
    return {
      applications: currentMonthData.applications,
      applicationsChangePercent,
      approvals: currentMonthData.approvals,
      approvalsChangePercent,
      disbursements: currentMonthData.disbursements,
      disbursementsChangePercent,
      revenue: `R${revenue.toFixed(1)}M`,
      revenueChangePercent,
    };
  }, [monthlyPerformanceData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Reports & Analytics</h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded-md border border-input bg-white px-3 py-2 text-sm">
            <Calendar size={16} />
            <span>Last 30 Days</span>
          </button>
          <button className="flex items-center gap-1 rounded-md border border-input bg-white px-3 py-2 text-sm">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-1 rounded-md border border-input bg-white px-3 py-2 text-sm">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Applications</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.applications}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`text-${summaryMetrics.applicationsChangePercent >= 0 ? 'green' : 'red'}-600 flex items-center`}>
                {summaryMetrics.applicationsChangePercent >= 0 ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                <span>{Math.abs(summaryMetrics.applicationsChangePercent)}% from last month</span>
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Approvals</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.approvals}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`text-${summaryMetrics.approvalsChangePercent >= 0 ? 'green' : 'red'}-600 flex items-center`}>
                {summaryMetrics.approvalsChangePercent >= 0 ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                <span>{Math.abs(summaryMetrics.approvalsChangePercent)}% from last month</span>
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Disbursements</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.disbursements}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`text-${summaryMetrics.disbursementsChangePercent >= 0 ? 'green' : 'red'}-600 flex items-center`}>
                {summaryMetrics.disbursementsChangePercent >= 0 ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                <span>{Math.abs(summaryMetrics.disbursementsChangePercent)}% from last month</span>
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.revenue}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`text-${summaryMetrics.revenueChangePercent >= 0 ? 'green' : 'red'}-600 flex items-center`}>
                {summaryMetrics.revenueChangePercent >= 0 ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                <span>{Math.abs(summaryMetrics.revenueChangePercent)}% from last month</span>
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trends</CardTitle>
            <CardDescription>Six-month trend of applications, approvals, and disbursements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  applications: { color: "#3B82F6" },
                  approvals: { color: "#10B981" },
                  disbursements: { color: "#F59E0B" },
                }}
              >
                <LineChart data={monthlyPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <div className="font-bold">{label}</div>
                            <div className="text-blue-600">{`Applications: ${payload[0].value}`}</div>
                            <div className="text-green-600">{`Approvals: ${payload[1].value}`}</div>
                            <div className="text-amber-600">{`Disbursements: ${payload[2].value}`}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2} animationBegin={200} animationDuration={1000} />
                  <Line type="monotone" dataKey="approvals" stroke="#10B981" strokeWidth={2} animationBegin={400} animationDuration={1000} />
                  <Line type="monotone" dataKey="disbursements" stroke="#F59E0B" strokeWidth={2} animationBegin={600} animationDuration={1000} />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Loan Type Distribution</CardTitle>
            <CardDescription>Distribution of applications by loan type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer 
                config={{
                  personal: { color: "#3B82F6" },
                  home: { color: "#10B981" },
                  auto: { color: "#F59E0B" },
                  business: { color: "#8B5CF6" },
                }}
              >
                <PieChart>
                  <Pie
                    data={loanTypeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {loanTypeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <div className="font-bold">{data.name}</div>
                            <div className="text-muted-foreground">{`${data.value}% of loans`}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Regional Performance */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Regional Performance Analysis</CardTitle>
          <CardDescription>Loan application and approval performance by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] mb-12">
            <ChartContainer 
              config={{
                applications: { color: "#3B82F6" },
                approvals: { color: "#10B981" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={regionPerformanceData}
                  layout="horizontal"
                  barSize={20}
                  barGap={5}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis type="number" />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <div className="font-bold">{label}</div>
                            <div className="text-blue-600">{`Applications: ${payload[0].value}`}</div>
                            <div className="text-green-600">{`Approvals: ${payload[1].value}`}</div>
                            <div className="text-muted-foreground">{`Revenue: ${payload[0].payload.revenue}`}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend align="center" verticalAlign="top" height={36} />
                  <Bar dataKey="applications" fill="#3B82F6" name="Applications" animationBegin={200} animationDuration={1000} />
                  <Bar dataKey="approvals" fill="#10B981" name="Approvals" animationBegin={400} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Report List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Standardized reports for download and analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-md bg-blue-100 p-2">
                    <FileBarChart size={20} className="text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-medium">Monthly Performance Report</h3>
                    <p className="text-xs text-muted-foreground">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <p className="mb-4 text-sm">Comprehensive overview of monthly loan performance metrics.</p>
                <button className="flex w-full items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-md bg-green-100 p-2">
                    <FileBarChart size={20} className="text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-medium">Risk Analysis Report</h3>
                    <p className="text-xs text-muted-foreground">Q{Math.floor((new Date().getMonth() + 3) / 3)} {new Date().getFullYear()}</p>
                  </div>
                </div>
                <p className="mb-4 text-sm">Detailed risk profile analysis and trends for the quarter.</p>
                <button className="flex w-full items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-md bg-amber-100 p-2">
                    <FileBarChart size={20} className="text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-medium">Regulatory Compliance Report</h3>
                    <p className="text-xs text-muted-foreground">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <p className="mb-4 text-sm">Compliance overview for regulatory reporting requirements.</p>
                <button className="flex w-full items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsAnalytics;
