import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Line, LineChart } from "recharts";
import { BarChart3, Download, FileBarChart, Calendar, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAppData } from "@/utils/AppDataContext";
import { Button } from "@/components/ui/button";
import { Application, Loan, User } from "@/utils/AppDataContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format as formatDate, addMonths, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define chart configuration types
interface ChartConfig {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
}

// Chart configurations
const chartConfig = {
  monthly: {
    applications: { label: "Applications", color: "#3B82F6" },
    approvals: { label: "Approvals", color: "#10B981" },
    disbursements: { label: "Disbursements", color: "#F59E0B" }
  },
  loanTypes: {
    personal: { label: "Personal Loans", color: "#3B82F6" },
    home: { label: "Home Loans", color: "#10B981" },
    auto: { label: "Auto Loans", color: "#F59E0B" },
    business: { label: "Business Loans", color: "#8B5CF6" },
    other: { label: "Other Loans", color: "#6B7280" }
  },
  regional: {
    applications: { label: "Applications", color: "#3B82F6" },
    approvals: { label: "Approvals", color: "#10B981" }
  }
} as const;

const ReportsAnalytics = () => {
  const { applications, loans, users } = useAppData();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date()
  });
  const [reportType, setReportType] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");

  // South African provinces
  const provinces = [
    "Eastern Cape",
    "Free State",
    "Gauteng",
    "KwaZulu-Natal",
    "Limpopo",
    "Mpumalanga",
    "Northern Cape",
    "North West",
    "Western Cape"
  ];

  // Filter data based on date range, report type, and province
  const filteredData = useMemo(() => {
    let filtered = {
      applications: [...applications],
      loans: [...loans]
    };

    // Date range filter
    if (dateRange?.from) {
      const from = dateRange.from;
      const to = dateRange.to || new Date();

      filtered.applications = filtered.applications.filter(app => {
        const appDate = new Date(app.createdAt);
        return appDate >= from && appDate <= to;
      });

      filtered.loans = filtered.loans.filter(loan => {
        const loanDate = new Date(loan.disbursementDate || "");
        return loanDate >= from && loanDate <= to;
      });
    }

    // Report type filter
    if (reportType !== "all") {
      switch (reportType) {
        case "applications":
          filtered.applications = filtered.applications.filter(app => app.status === "Pending");
          break;
        case "approvals":
          filtered.applications = filtered.applications.filter(app => app.status === "Approved");
          break;
        case "disbursements":
          filtered.applications = filtered.applications.filter(app => app.status === "Funded");
          break;
      }
    }

    // Province filter
    if (selectedProvince !== "all") {
      filtered.applications = filtered.applications.filter(app => {
        const user = users.find(u => u.id === app.userId);
        return user?.province === selectedProvince;
      });
    }

    return filtered;
  }, [applications, loans, dateRange, reportType, selectedProvince, users]);

  // Monthly performance data - derive from filtered applications
  const monthlyPerformanceData = useMemo(() => {
    // Create a map of month abbreviations
    const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize data for the last 6 months
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthsToShow = 6;
    
    // Create an array of the last 6 months with year
    const monthsData = Array.from({ length: monthsToShow }, (_, i) => {
      const date = new Date(currentYear, currentMonth - i, 1);
      return {
        month: monthAbbreviations[date.getMonth()],
        year: date.getFullYear(),
        fullDate: date
      };
    }).reverse();
    
    // Initialize data structure
    const data = monthsData.map(({ month, year, fullDate }) => {
      const nextMonth = new Date(fullDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      // Filter applications for this month
      const monthApplications = applications.filter(app => {
        const appDate = new Date(app.createdAt);
        return appDate >= fullDate && appDate < nextMonth;
      });

      // Filter loans for this month
      const monthLoans = loans.filter(loan => {
        const loanDate = new Date(loan.disbursementDate || loan.dateIssued || loan.dateApplied || "");
        return loanDate >= fullDate && loanDate < nextMonth;
      });
      
      // Count applications and approvals with improved status checking
      const applicationCount = monthApplications.length;
      const approvalCount = monthApplications.filter(app => {
        const status = (app.status || "").toLowerCase().trim();
        // Check for any status that indicates approval
        return status === "approved" || 
               status === "accepted" || 
               status === "funded" ||
               status.includes("approved") || 
               status.includes("accepted") ||
               status.includes("funded");
      }).length;
      
      const disbursementCount = monthLoans.filter(loan => {
        const status = (loan.status || "").toLowerCase().trim();
        // Check for any status that indicates disbursement
        return status === "disbursed" || 
               status === "funded" || 
               status.includes("disbursed") || 
               status.includes("funded") ||
               (loan.disbursementDate && new Date(loan.disbursementDate) <= new Date());
      }).length;
      
      return {
        month: `${month} ${year}`,
        applications: applicationCount,
        approvals: approvalCount,
        disbursements: disbursementCount
      };
    });
    
    return data;
  }, [applications, loans]);

  // Loan type distribution data - derive from actual loans with date filtering
  const loanTypeDistributionData = useMemo(() => {
    const loanTypes = {
      personal: { name: "Personal Loans", value: 0, count: 0, color: "#3B82F6" },
      home: { name: "Home Loans", value: 0, count: 0, color: "#10B981" },
      auto: { name: "Auto Loans", value: 0, count: 0, color: "#F59E0B" },
      business: { name: "Business Loans", value: 0, count: 0, color: "#8B5CF6" },
      other: { name: "Other Loans", value: 0, count: 0, color: "#6B7280" }
    };
    
    // Count loan types from actual loans within date range
    loans
      .filter(loan => {
        const loanDate = new Date(loan.dateIssued || loan.dateApplied || "");
        return dateRange?.from && dateRange?.to && 
               loanDate >= dateRange.from && 
               loanDate <= dateRange.to;
      })
      .forEach(loan => {
        const loanPurpose = (loan.purpose || "").toLowerCase();
        const loanAmount = loan.amount || 0;
        
        if (loanPurpose.includes("personal") || loanPurpose.includes("debt") || loanPurpose.includes("education")) {
          loanTypes.personal.value += loanAmount;
          loanTypes.personal.count++;
        } else if (loanPurpose.includes("home") || loanPurpose.includes("house") || loanPurpose.includes("mortgage")) {
          loanTypes.home.value += loanAmount;
          loanTypes.home.count++;
        } else if (loanPurpose.includes("auto") || loanPurpose.includes("car") || loanPurpose.includes("vehicle")) {
          loanTypes.auto.value += loanAmount;
          loanTypes.auto.count++;
        } else if (loanPurpose.includes("business") || loanPurpose.includes("startup")) {
          loanTypes.business.value += loanAmount;
          loanTypes.business.count++;
        } else {
          loanTypes.other.value += loanAmount;
          loanTypes.other.count++;
        }
      });
    
    // Calculate total and convert to percentages
    const total = Object.values(loanTypes).reduce((sum, type) => sum + type.value, 0);
    
    return Object.values(loanTypes)
      .filter(type => type.value > 0)
      .map(type => ({
        ...type,
        percentage: Math.round((type.value / (total || 1)) * 100),
        formattedAmount: formatCurrency(type.value),
        averageAmount: type.count > 0 ? formatCurrency(type.value / type.count) : 'R0'
      }));
  }, [loans, dateRange]);

  // Regional performance data - derive from actual applications and users
  const regionPerformanceData = useMemo(() => {
    // First map users to their regions
    const userRegions: Record<string, string> = {};
    users.forEach(user => {
      userRegions[user.id] = user.province || "Unknown";
    });
    
    // Initialize regions data structure
    const regions: Record<string, { region: string; applications: number; approvals: number; revenue: number }> = {};
    
    // Process applications by region
    applications.forEach(app => {
      const region = userRegions[app.userId] || "Unknown";
      
      if (!regions[region]) {
        regions[region] = {
          region,
          applications: 0,
          approvals: 0,
          revenue: 0
        };
      }
      
      regions[region].applications++;
      
      if (app.status === "Approved") {
        regions[region].approvals++;
        regions[region].revenue += app.loanInfo?.amount || 0;
      }
    });
    
    // Convert to array and sort by applications count
    return Object.values(regions)
      .sort((a, b) => b.applications - a.applications)
      .map(region => ({
        ...region,
        revenue: `R${(region.revenue / 1000000).toFixed(1)}M`
      }));
  }, [applications, users]);

  // Calculate summary metrics from real data
  const summaryMetrics = useMemo(() => {
    // Get current month's data
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get previous month's data
    const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Filter applications for current month
    const currentMonthApplications = filteredData.applications.filter(app => {
      const appDate = new Date(app.createdAt);
      return appDate >= currentMonthStart && appDate <= currentMonthEnd;
    });

    // Filter applications for previous month
    const previousMonthApplications = applications.filter(app => {
      const appDate = new Date(app.createdAt);
      return appDate >= previousMonthStart && appDate <= previousMonthEnd;
    });

    // Calculate current month revenue from loans
    const currentMonthRevenue = loans
      .filter(loan => {
        const loanDate = new Date(loan.dateIssued || loan.disbursementDate || loan.dateApplied || "");
        return loanDate >= currentMonthStart && loanDate <= currentMonthEnd;
      })
      .reduce((sum, loan) => sum + (loan.amount || 0), 0);

    // Calculate previous month revenue from loans
    const previousMonthRevenue = loans
      .filter(loan => {
        const loanDate = new Date(loan.dateIssued || loan.disbursementDate || loan.dateApplied || "");
        return loanDate >= previousMonthStart && loanDate <= previousMonthEnd;
      })
      .reduce((sum, loan) => sum + (loan.amount || 0), 0);

    // Count current month metrics
    const currentMetrics = {
      applications: currentMonthApplications.length,
      approvals: currentMonthApplications.filter(app => app.status.toLowerCase() === "approved").length,
      disbursements: currentMonthApplications.filter(app => app.status.toLowerCase() === "funded").length,
      revenue: currentMonthRevenue
    };

    // Count previous month metrics
    const previousMetrics = {
      applications: previousMonthApplications.length,
      approvals: previousMonthApplications.filter(app => app.status.toLowerCase() === "approved").length,
      disbursements: previousMonthApplications.filter(app => app.status.toLowerCase() === "funded").length,
      revenue: previousMonthRevenue
    };

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    
    return {
      applications: currentMetrics.applications,
      applicationsChangePercent: calculateChange(currentMetrics.applications, previousMetrics.applications),
      approvals: currentMetrics.approvals,
      approvalsChangePercent: calculateChange(currentMetrics.approvals, previousMetrics.approvals),
      disbursements: currentMetrics.disbursements,
      disbursementsChangePercent: calculateChange(currentMetrics.disbursements, previousMetrics.disbursements),
      revenue: formatCurrency(currentMetrics.revenue),
      revenueChangePercent: calculateChange(currentMetrics.revenue, previousMetrics.revenue)
    };
  }, [filteredData.applications, applications, loans]);

  // Function to generate detailed reports
  const generateReport = async (reportType: string, format: string = "pdf") => {
    try {
      const reportData = {
        dateRange,
        reportType,
        summary: summaryMetrics,
        details: []
      };

      // Format currency function
      const formatCurrency = (amount: number) => {
        return `R${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      // Add detailed data based on report type
      switch (reportType) {
        case "monthly":
          reportData.details = filteredData.applications
            .map(app => {
              // Find the associated user
              const user = users.find(u => u.id === app.userId);
              const amount = app.loanInfo?.amount || 0;
              
              return {
                date: formatDate(new Date(app.createdAt), "yyyy-MM-dd"),
                applicant: user ? 
                  `${user.firstName} ${user.lastName}` : 
                  `${app.firstName} ${app.lastName}`.trim() || 'Unknown',
                amount: formatCurrency(amount),
                status: app.status || 'Pending',
                type: app.loanInfo?.purpose || 
                      (app.loanDetails?.purpose ? 
                        app.loanDetails.purpose.charAt(0).toUpperCase() + 
                        app.loanDetails.purpose.slice(1) : 
                        'Personal Loan')
              };
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          break;

        case "risk":
          reportData.details = filteredData.applications
            .filter(app => app.status === "Approved")
            .map(app => {
              const user = users.find(u => u.id === app.userId);
              return {
                applicant: user ? 
                  `${user.firstName} ${user.lastName}` : 
                  `${app.firstName} ${app.lastName}`.trim() || 'Unknown',
                creditScore: app.creditScore || 'N/A',
                debtToIncome: `${((app.debtToIncome || 0) * 100).toFixed(1)}%`,
                riskLevel: calculateRiskLevel(app),
                amount: formatCurrency(app.loanInfo?.amount || 0)
              };
            });
          break;

        case "compliance":
          reportData.details = filteredData.applications
            .map(app => {
              const user = users.find(u => u.id === app.userId);
              return {
                date: formatDate(new Date(app.createdAt), "yyyy-MM-dd"),
                applicant: user ? 
                  `${user.firstName} ${user.lastName}` : 
                  `${app.firstName} ${app.lastName}`.trim() || 'Unknown',
                status: app.status || 'Pending',
                compliant: isCompliant(app) ? 'Yes' : 'No',
                issues: getComplianceIssues(app).join(", ") || 'None'
              };
            });
          break;
      }

      // Generate PDF report
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 20, 20);
      
      // Add date range
      doc.setFontSize(12);
      doc.text(`Date Range: ${formatDate(dateRange?.from || new Date(), "yyyy-MM-dd")} to ${formatDate(dateRange?.to || new Date(), "yyyy-MM-dd")}`, 20, 30);

      // Add summary metrics
      doc.text('Summary Metrics:', 20, 45);
      let y = 55;
      
      // Format summary metrics for better display
      const formattedSummary = {
        'Total Applications': summaryMetrics.applications,
        'Applications Change': `${summaryMetrics.applicationsChangePercent}%`,
        'Total Approvals': summaryMetrics.approvals,
        'Approvals Change': `${summaryMetrics.approvalsChangePercent}%`,
        'Total Disbursements': summaryMetrics.disbursements,
        'Disbursements Change': `${summaryMetrics.disbursementsChangePercent}%`,
        'Total Revenue': summaryMetrics.revenue,
        'Revenue Change': `${summaryMetrics.revenueChangePercent}%`
      };

      Object.entries(formattedSummary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 20, y);
        y += 10;
      });

      // Add detailed data table
      if (reportData.details.length > 0) {
        doc.text('Detailed Data:', 20, y + 10);
        const headers = Object.keys(reportData.details[0]);
        const data = reportData.details.map(item => Object.values(item));

        autoTable(doc, {
          startY: y + 20,
          head: [headers.map(h => h.charAt(0).toUpperCase() + h.slice(1).replace(/_/g, ' '))],
          body: data,
          margin: { top: 20 },
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246] },
          columnStyles: {
            amount: { halign: 'right' },
            creditScore: { halign: 'right' },
            debtToIncome: { halign: 'right' }
          }
        });
      }

      // Save the PDF
      const fileName = `${reportType}-report-${formatDate(dateRange?.from || new Date(), "yyyy-MM-dd")}-to-${formatDate(dateRange?.to || new Date(), "yyyy-MM-dd")}.${format}`;
      doc.save(fileName);

      // Show success message
      toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded successfully`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please check console for details.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Reports & Analytics</h2>
        <div className="flex items-center gap-4">
          <DatePickerWithRange
            className="w-[300px]"
            value={dateRange}
            onChange={(newDateRange: DateRange | undefined) => setDateRange(newDateRange)}
          />
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="applications">Pending Applications</SelectItem>
              <SelectItem value="approvals">Approved Applications</SelectItem>
              <SelectItem value="disbursements">Disbursed Loans</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Province" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Provinces</SelectItem>
              {provinces.map(province => (
                <SelectItem key={province} value={province}>{province}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trends</CardTitle>
            <CardDescription>Six-month trend of applications, approvals, and disbursements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ChartContainer
                config={{
                  applications: { label: "Applications", color: "#3B82F6" },
                  approvals: { label: "Approvals", color: "#10B981" },
                  disbursements: { label: "Disbursements", color: "#F59E0B" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      className="text-xs"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      className="text-xs"
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <div className="font-bold">{label}</div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                                  <span className="text-sm">Applications: {payload[0].value.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-500" />
                                  <span className="text-sm">Approvals: {payload[1].value.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                                  <span className="text-sm">Disbursements: {payload[2].value.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      content={({ payload }) => (
                        <div className="flex justify-center gap-6">
                          {payload?.map((entry, index) => (
                            <div key={`item-${index}`} className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full bg-${entry.color}`} />
                              <span className="text-sm font-medium">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="applications" 
                      stroke={chartConfig.monthly.applications.color} 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="approvals" 
                      stroke={chartConfig.monthly.approvals.color} 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="disbursements" 
                      stroke={chartConfig.monthly.disbursements.color} 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Loan Type Distribution</CardTitle>
            <CardDescription>Analysis of approved loans by type and amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
                <div>Loan Type</div>
                <div className="text-right">Count</div>
                <div className="text-right">Total Value</div>
                <div className="text-right">Average Value</div>
                <div className="text-right">% of Total</div>
              </div>

              {/* Table Content */}
              <div className="space-y-4">
                {loanTypeDistributionData.map((type, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 text-sm items-center">
                    <div className="font-medium">{type.name}</div>
                    <div className="text-right">{type.count.toLocaleString()}</div>
                    <div className="text-right">{type.formattedAmount}</div>
                    <div className="text-right">{type.averageAmount}</div>
                    <div className="text-right">{type.percentage}%</div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="pt-6 border-t">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Loans</p>
                    <p className="text-2xl font-bold">
                      {loanTypeDistributionData.reduce((sum, type) => sum + type.count, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(loanTypeDistributionData.reduce((sum, type) => sum + type.value, 0))}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Average Loan</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        loanTypeDistributionData.reduce((sum, type) => sum + type.value, 0) /
                        loanTypeDistributionData.reduce((sum, type) => sum + type.count, 0) || 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Regional Performance - Textual Presentation */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Analysis</CardTitle>
          <CardDescription>Loan application and approval performance by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
              <div>Region</div>
              <div className="text-right">Applications</div>
              <div className="text-right">Approvals</div>
              <div className="text-right">Revenue</div>
            </div>
            
            {/* Table Content */}
            <div className="space-y-4">
              {regionPerformanceData.map((region, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 text-sm items-center">
                  <div className="font-medium">{region.region}</div>
                  <div className="text-right">{region.applications.toLocaleString()}</div>
                  <div className="text-right">{region.approvals.toLocaleString()}</div>
                  <div className="text-right">{region.revenue}</div>
                </div>
              ))}
            </div>
            
            {/* Summary Statistics */}
            <div className="pt-6 border-t">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Average Approval Rate</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (regionPerformanceData.reduce((sum, region) => sum + region.approvals, 0) /
                        regionPerformanceData.reduce((sum, region) => sum + region.applications, 0)) * 100
                    )}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">
                    {regionPerformanceData
                      .reduce((sum, region) => sum + region.applications, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    R{(regionPerformanceData
                      .reduce((sum, region) => sum + parseFloat(region.revenue.replace(/[^0-9.]/g, '')), 0))
                      .toFixed(1)}M
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>View and download detailed reports for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Monthly Performance</TabsTrigger>
              <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
              <TabsTrigger value="compliance">Regulatory Compliance</TabsTrigger>
            </TabsList>

            {/* Monthly Performance Report */}
            <TabsContent value="monthly" className="space-y-4">
              <div className="rounded-md border">
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold">Monthly Performance Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Applications</p>
                      <p className="text-2xl font-bold">{monthlyPerformanceData[monthlyPerformanceData.length - 1]?.applications || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approval Rate</p>
                      <p className="text-2xl font-bold">
                        {Math.round((monthlyPerformanceData[monthlyPerformanceData.length - 1]?.approvals || 0) / 
                        (monthlyPerformanceData[monthlyPerformanceData.length - 1]?.applications || 1) * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">{summaryMetrics.revenue}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Recent Applications</h4>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 gap-4 p-3 bg-muted text-sm font-medium">
                        <div>Date</div>
                        <div>Applicant</div>
                        <div className="text-right">Amount</div>
                        <div className="text-right">Status</div>
                      </div>
                      <div className="divide-y">
                        {filteredData.applications.slice(0, 5).map((app, index) => {
                          // Find the user associated with this application
                          const applicant = users.find(u => u.id === app.userId);
                          const amount = typeof app.loanInfo?.amount === 'string' ? 
                            parseFloat(app.loanInfo.amount) : 
                            app.loanInfo?.amount || 0;

                          return (
                            <div key={index} className="grid grid-cols-4 gap-4 p-3 text-sm">
                              <div>{formatDate(new Date(app.createdAt), 'MMM d, yyyy')}</div>
                              <div>
                                {applicant ? 
                                  `${applicant.firstName} ${applicant.lastName}` : 
                                  `${app.firstName || ''} ${app.lastName || 'Unknown'}`}
                              </div>
                              <div className="text-right">
                                {amount ? `R${amount.toLocaleString()}` : 'R0.00'}
                              </div>
                              <div className="text-right">
                                <span className={`capitalize ${
                                  app.status === 'Approved' ? 'text-green-600' :
                                  app.status === 'Rejected' ? 'text-red-600' :
                                  'text-yellow-600'
                                }`}>
                                  {app.status || 'Pending'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted border-t">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => generateReport("monthly", "pdf")}
                  >
                    <Download size={16} className="mr-2" />
                    Download PDF Report
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Risk Analysis Report */}
            <TabsContent value="risk" className="space-y-4">
              <div className="rounded-md border">
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold">Risk Analysis Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Credit Score</p>
                      <p className="text-2xl font-bold">
                        {Math.round(filteredData.applications.reduce((sum, app) => sum + (app.creditScore || 0), 0) / 
                        filteredData.applications.length)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average DTI Ratio</p>
                      <p className="text-2xl font-bold">
                        {(filteredData.applications.reduce((sum, app) => sum + (app.debtToIncome || 0), 0) / 
                        filteredData.applications.length).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">High Risk Applications</p>
                      <p className="text-2xl font-bold">
                        {filteredData.applications.filter(app => calculateRiskLevel(app) === "High").length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Risk Distribution</h4>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 gap-4 p-3 bg-muted text-sm font-medium">
                        <div>Risk Level</div>
                        <div className="text-right">Applications</div>
                        <div className="text-right">Average Amount</div>
                        <div className="text-right">Average Score</div>
                      </div>
                      <div className="divide-y">
                        {["Low", "Medium", "High"].map((risk) => {
                          const riskApps = filteredData.applications.filter(app => calculateRiskLevel(app) === risk);
                          const avgAmount = riskApps.length ? 
                            riskApps.reduce((sum, app) => sum + (app.loanInfo?.amount || 0), 0) / riskApps.length : 0;
                          const avgScore = riskApps.length ?
                            riskApps.reduce((sum, app) => sum + (app.creditScore || 0), 0) / riskApps.length : 0;
                          
                          return (
                            <div key={risk} className="grid grid-cols-4 gap-4 p-3 text-sm">
                              <div>{risk}</div>
                              <div className="text-right">{riskApps.length}</div>
                              <div className="text-right">R{avgAmount.toLocaleString()}</div>
                              <div className="text-right">{Math.round(avgScore)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted border-t">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => generateReport("risk", "pdf")}
                  >
                    <Download size={16} className="mr-2" />
                    Download PDF Report
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Compliance Report */}
            <TabsContent value="compliance" className="space-y-4">
              <div className="rounded-md border">
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold">Compliance Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reviews</p>
                      <p className="text-2xl font-bold">{filteredData.applications.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Compliance Rate</p>
                      <p className="text-2xl font-bold">
                        {Math.round(filteredData.applications.filter(app => isCompliant(app)).length / 
                        filteredData.applications.length * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Issues Found</p>
                      <p className="text-2xl font-bold">
                        {filteredData.applications.reduce((sum, app) => sum + getComplianceIssues(app).length, 0)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Recent Compliance Reviews</h4>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 gap-4 p-3 bg-muted text-sm font-medium">
                        <div>Date</div>
                        <div>Application ID</div>
                        <div>Status</div>
                        <div className="text-right">Issues</div>
                      </div>
                      <div className="divide-y">
                        {filteredData.applications.slice(0, 5).map((app, index) => (
                          <div key={index} className="grid grid-cols-4 gap-4 p-3 text-sm">
                            <div>{formatDate(new Date(app.createdAt), 'MMM d, yyyy')}</div>
                            <div>{app.id}</div>
                            <div className={`${isCompliant(app) ? 'text-green-600' : 'text-red-600'}`}>
                              {isCompliant(app) ? 'Compliant' : 'Non-Compliant'}
                            </div>
                            <div className="text-right">{getComplianceIssues(app).length}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted border-t">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => generateReport("compliance", "pdf")}
                  >
                    <Download size={16} className="mr-2" />
                    Download PDF Report
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions for report generation
const calculateRiskLevel = (application: Application) => {
  const creditScore = application.creditScore || 0;
  const dti = application.debtToIncome || 0;
  
  if (creditScore >= 750 && dti < 0.3) return "Low";
  if (creditScore >= 650 && dti < 0.4) return "Medium";
  return "High";
};

const isCompliant = (application: Application) => {
  // Add your compliance rules here
  return true;
};

const getComplianceIssues = (application: Application) => {
  // Add your compliance checking logic here
  return [];
};

// Add this helper function at the top of the file with other utility functions
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `R${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `R${(amount / 1000).toFixed(1)}K`;
  } else {
    return `R${amount.toFixed(2)}`;
  }
};

export default ReportsAnalytics;
