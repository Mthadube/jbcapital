import React, { useMemo } from 'react';
import { useAppData } from '../../utils/AppDataContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const OverviewDashboard: React.FC = () => {
  const { applications } = useAppData();

  // Calculate application status counts
  const applicationStatusData = useMemo(() => {
    // Initialize counters for each status
    const counts = {
      pendingReview: 0,
      initialScreening: 0,
      documentReview: 0,
      creditAssessment: 0,
      incomeVerification: 0,
      finalDecision: 0,
      approved: 0,
      rejected: 0
    };

    // Count applications by status
    applications.forEach(app => {
      const status = (app.status || "").toLowerCase().trim();
      
      // Check the status and any additional indicators in the application
      if (status.includes("credit_assessment") || status.includes("credit")) {
        counts.creditAssessment++;
      } else if (status === "loan_created" || status.includes("document")) {
        counts.documentReview++;
      } else if (status.includes("screening") || status === "new" || !status) {
        counts.initialScreening++;
      } else if (status.includes("income") || status.includes("verification")) {
        counts.incomeVerification++;
      } else if (status.includes("final") || status.includes("decision")) {
        counts.finalDecision++;
      } else if (status === "funded" || status.includes("approved") || status.includes("accepted")) {
        counts.approved++;
      } else if (status.includes("rejected") || status.includes("declined") || status.includes("denied")) {
        counts.rejected++;
      } else {
        counts.pendingReview++;
      }
    });

    // Convert counts to array format with colors and names
    return [
      { name: "Pending Review", value: counts.pendingReview, color: "bg-gray-500" },
      { name: "Initial Screening", value: counts.initialScreening, color: "bg-blue-500" },
      { name: "Document Review", value: counts.documentReview, color: "bg-blue-500" },
      { name: "Credit Assessment", value: counts.creditAssessment, color: "bg-blue-500" },
      { name: "Income Verification", value: counts.incomeVerification, color: "bg-blue-500" },
      { name: "Final Decision", value: counts.finalDecision, color: "bg-blue-500" },
      { name: "Approved", value: counts.approved, color: "bg-green-500" },
      { name: "Rejected", value: counts.rejected, color: "bg-red-500" }
    ];
  }, [applications]);

  return (
    <div className="space-y-8">
      {/* Loan Application Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Application Status</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribution of applications by status
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applicationStatusData.map((status, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="min-w-[180px] flex-shrink-0">
                  <p className="text-sm font-medium leading-none">{status.name}</p>
                </div>
                <div className="flex-1 relative h-2">
                  <div className="absolute inset-0 rounded-full bg-secondary" />
                  {status.value > 0 && (
                    <div 
                      className={`absolute inset-0 rounded-full ${status.color}`}
                      style={{ 
                        width: `${(status.value / applications.length) * 100}%`,
                        transition: 'all 0.2s'
                      }}
                    />
                  )}
                </div>
                <div className="min-w-[40px] text-right">
                  <span className="text-sm font-medium">{status.value}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 