import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, User, Briefcase, Home, CreditCard, FileText, AlignJustify, Phone, Mail, MapPin, Calendar, FileCheck, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DocumentViewer from "@/components/DocumentViewer";
import { useAppData } from "@/utils/AppDataContext";
import { toast } from "sonner";

type UserProfileViewProps = {
  user: any;
  onEditClick?: (section: string) => void;
};

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onEditClick }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "personalInfo",
    "contactInfo"
  ]);

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
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

  const SectionHeader = ({ title, icon, section, editable = true }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        {editable && onEditClick && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEditClick(section)}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            Edit
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => toggleSection(section)}
          className="h-8 px-2"
        >
          {expandedSections.includes(section) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader 
            title="Personal Information" 
            icon={<User className="h-5 w-5 text-primary" />} 
            section="personalInfo" 
          />
        </CardHeader>
        {expandedSections.includes("personalInfo") && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID Number</p>
                <p className="text-base">{user.idNumber || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p className="text-base">{formatDate(user.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="text-base capitalize">{user.gender || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Marital Status</p>
                <p className="text-base capitalize">{user.maritalStatus || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dependents</p>
                <p className="text-base">{user.dependents || "0"}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader 
            title="Contact Information" 
            icon={<Phone className="h-5 w-5 text-primary" />} 
            section="contactInfo" 
          />
        </CardHeader>
        {expandedSections.includes("contactInfo") && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="text-base">{user.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                <p className="text-base">{user.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alternative Phone Number</p>
                <p className="text-base">{user.alternativePhone || "Not provided"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Physical Address</p>
                <p className="text-base">
                  {user.address}, {user.suburb}, {user.city}, {user.state}, {user.zipCode}, {user.country || "South Africa"}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Employment Information */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader 
            title="Employment Information" 
            icon={<Briefcase className="h-5 w-5 text-primary" />} 
            section="employmentInfo" 
          />
        </CardHeader>
        {expandedSections.includes("employmentInfo") && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employment Status</p>
                <p className="text-base capitalize">{user.employmentStatus || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employment Type</p>
                <p className="text-base capitalize">{user.employmentType || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employer</p>
                <p className="text-base">{user.employerName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Job Title</p>
                <p className="text-base">{user.jobTitle || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industry/Sector</p>
                <p className="text-base">{user.employmentSector || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Years Employed</p>
                <p className="text-base">{user.yearsEmployed || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                <p className="text-base">R {user.monthlyIncome?.toLocaleString() || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                <p className="text-base">{user.paymentDate || "Not provided"}</p>
              </div>
              
              <div className="md:col-span-2 mt-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Work Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 rounded-md bg-muted/20">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Work Email</p>
                    <p className="text-base">{user.workEmail || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Work Phone</p>
                    <p className="text-base">{user.workPhoneNumber || "Not provided"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Work Address</p>
                    <p className="text-base">
                      {user.workAddress ? 
                        `${user.workAddress}, ${user.workCity || ''}, ${user.workPostalCode || ''}, ${user.workCountry || 'South Africa'}` 
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader 
            title="Financial Information" 
            icon={<CreditCard className="h-5 w-5 text-primary" />} 
            section="financialInfo" 
          />
        </CardHeader>
        {expandedSections.includes("financialInfo") && (
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                  <p className="text-base">{user.bankName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                  <p className="text-base capitalize">{user.accountType || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                  <p className="text-base">{user.accountNumber || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Banking Period</p>
                  <p className="text-base">{user.bankingPeriod || "Not provided"} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Credit Score</p>
                  <p className="text-base">{user.creditScore || "Not provided"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Monthly Expenses</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Expense Type</TableHead>
                      <TableHead className="text-right">Amount (R)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Rent/Mortgage</TableCell>
                      <TableCell className="text-right">{user.rentMortgage?.toLocaleString() || "0"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Car Payment</TableCell>
                      <TableCell className="text-right">{user.carPayment?.toLocaleString() || "0"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Groceries</TableCell>
                      <TableCell className="text-right">{user.groceries?.toLocaleString() || "0"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Utilities</TableCell>
                      <TableCell className="text-right">{user.utilities?.toLocaleString() || "0"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Insurance</TableCell>
                      <TableCell className="text-right">{user.insurance?.toLocaleString() || "0"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Other Expenses</TableCell>
                      <TableCell className="text-right">{user.otherExpenses?.toLocaleString() || "0"}</TableCell>
                    </TableRow>
                    <TableRow className="font-medium">
                      <TableCell>Total Monthly Expenses</TableCell>
                      <TableCell className="text-right">{user.totalMonthlyExpenses?.toLocaleString() || "0"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {user.existingLoans && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Existing Loans</p>
                  {user.existingLoanAmount ? (
                    <p className="text-base">R {user.existingLoanAmount?.toLocaleString()}</p>
                  ) : user.existingLoans === true ? (
                    <p className="text-base">Yes (amount not specified)</p>
                  ) : (
                    <p className="text-base">No existing loans</p>
                  )}
                  
                  <p className="text-sm font-medium text-muted-foreground mt-2">Monthly Debt Payments</p>
                  <p className="text-base">R {user.monthlyDebt?.toLocaleString() || "0"}</p>

                  <p className="text-sm font-medium text-muted-foreground mt-2">Debt to Income Ratio</p>
                  <p className="text-base">{user.debtToIncomeRatio?.toFixed(2) || "0"}%</p>
                </div>
              )}

              {user.additionalFinancialInfo && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Additional Financial Information</p>
                  <div className="border border-muted p-3 rounded-md bg-muted/10">
                    <p className="text-sm">{user.additionalFinancialInfo}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Active Loans */}
      {user.loans && user.loans.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader 
              title="Active Loans" 
              icon={<FileText className="h-5 w-5 text-primary" />} 
              section="activeLoans" 
              editable={false}
            />
          </CardHeader>
          {expandedSections.includes("activeLoans") && (
            <CardContent>
              <div className="space-y-4">
                {user.loans && user.loans.length > 0 ? (
                  user.loans.map((loan, index) => (
                    <Card key={loan.id || index} className="border border-muted">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={loan.status === "active" ? "default" : loan.status === "completed" ? "outline" : "secondary"}>
                              {loan.status}
                            </Badge>
                            <span className="font-semibold">Loan ID: {loan.id}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {loan.dateIssued ? `Issued: ${formatDate(loan.dateIssued)}` : 
                            loan.dateApplied ? `Applied: ${formatDate(loan.dateApplied)}` : ""}
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
                            <p className="text-base">R {loan.amount?.toLocaleString()}</p>
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
                            <p className="text-base">R {loan.monthlyPayment?.toLocaleString()}</p>
                          </div>
                          {loan.status === "active" && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Remaining Payments</p>
                              <p className="text-base">{loan.remainingPayments} of {loan.term}</p>
                            </div>
                          )}
                          {loan.paidAmount > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                              <p className="text-base">R {loan.paidAmount?.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No active loans</p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Documents */}
      {user.documents && user.documents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader 
              title="Documents" 
              icon={<FileCheck className="h-5 w-5 text-primary" />} 
              section="documents" 
              editable={false}
            />
          </CardHeader>
          {expandedSections.includes("documents") && (
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {user.documents && user.documents.length > 0 ? (
                  user.documents.map((doc, index) => (
                    <DocumentViewer 
                      key={doc.id || index} 
                      document={doc} 
                      onDownload={(document) => {
                        toast.success(`Downloading document: ${document.name}`);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No documents uploaded</p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader 
            title="Account Information" 
            icon={<User className="h-5 w-5 text-primary" />} 
            section="accountInfo" 
            editable={false}
          />
        </CardHeader>
        {expandedSections.includes("accountInfo") && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-base">{user.id || "Not available"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                <Badge variant={user.accountStatus === "active" ? "default" : "secondary"}>{user.accountStatus || "Active"}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
                <p className="text-base">{formatDate(user.registrationDate) || "Not available"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Completion</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${user.profileCompletionPercentage || 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{user.profileCompletionPercentage || 100}%</span>
                </div>
              </div>
            </div>
            {user.incompleteProfileItems && user.incompleteProfileItems.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Incomplete Profile Items</p>
                <ul className="list-disc list-inside space-y-1">
                  {user.incompleteProfileItems.map((item, index) => (
                    <li key={index} className="text-sm text-amber-600 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default UserProfileView; 