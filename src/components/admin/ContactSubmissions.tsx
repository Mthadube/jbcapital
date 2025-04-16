import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Check, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Mail, 
  MessageCircle, 
  MoreHorizontal, 
  Phone, 
  Search, 
  User, 
  XCircle 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchContactSubmissions, updateContactSubmission, sendSmsNotification, ContactFormData } from '@/utils/api';

const ContactSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactFormData[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ContactFormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactFormData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);

  // Load submissions from API
  useEffect(() => {
    const loadSubmissions = async () => {
      setIsLoading(true);
      try {
        const response = await fetchContactSubmissions();
        if (response.success && response.data) {
          setSubmissions(response.data);
          setFilteredSubmissions(response.data);
        } else {
          toast.error('Failed to load contact submissions');
        }
      } catch (error) {
        console.error('Error loading contact submissions:', error);
        toast.error('An error occurred while loading contact submissions');
      } finally {
        setIsLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  // Filter submissions when search or filter changes
  useEffect(() => {
    let filtered = [...submissions];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(submission => 
        submission.name.toLowerCase().includes(query) ||
        submission.email.toLowerCase().includes(query) ||
        submission.subject.toLowerCase().includes(query) ||
        submission.message.toLowerCase().includes(query) ||
        (submission.phone && submission.phone.includes(query))
      );
    }
    
    // Apply tab filter
    if (currentTab === 'new') {
      filtered = filtered.filter(submission => submission.status === 'new');
    } else if (currentTab === 'in_progress') {
      filtered = filtered.filter(submission => submission.status === 'in_progress');
    } else if (currentTab === 'resolved') {
      filtered = filtered.filter(submission => submission.status === 'resolved');
    }
    
    setFilteredSubmissions(filtered);
  }, [submissions, searchQuery, statusFilter, currentTab]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-ZA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Open submission details
  const openSubmissionDetails = (submission: ContactFormData) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.notes || '');
    setIsDetailsOpen(true);
  };

  // Update submission status
  const updateStatus = async (id: string | undefined, status: 'new' | 'in_progress' | 'resolved') => {
    if (!id) return;
    
    try {
      const response = await updateContactSubmission(id, { status });
      if (response.success && response.data) {
        // Update submissions list
        setSubmissions(prev => 
          prev.map(sub => sub.id === id ? { ...sub, status } : sub)
        );
        
        // Update selected submission if open
        if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission({ ...selectedSubmission, status });
        }
        
        toast.success(`Status updated to ${status.replace('_', ' ')}`);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('An error occurred while updating status');
    }
  };

  // Save admin notes
  const saveNotes = async () => {
    if (!selectedSubmission?.id) return;
    
    try {
      const response = await updateContactSubmission(selectedSubmission.id, { notes: adminNotes });
      if (response.success && response.data) {
        // Update submissions list
        setSubmissions(prev => 
          prev.map(sub => sub.id === selectedSubmission.id ? { ...sub, notes: adminNotes } : sub)
        );
        
        // Update selected submission
        setSelectedSubmission({ ...selectedSubmission, notes: adminNotes });
        
        toast.success('Notes saved successfully');
      } else {
        toast.error('Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('An error occurred while saving notes');
    }
  };

  // Open SMS dialog
  const openSmsDialog = (submission: ContactFormData) => {
    setSelectedSubmission(submission);
    setSmsMessage(`Dear ${submission.name}, Thank you for contacting JB Capital. Regarding your inquiry about ${submission.subject}, `);
    setIsSmsDialogOpen(true);
  };

  // Send SMS
  const sendSms = async () => {
    if (!selectedSubmission || !selectedSubmission.phone) {
      toast.error('Phone number is required to send SMS');
      return;
    }
    
    setIsSendingSms(true);
    try {
      // Format phone number by removing spaces and ensuring it starts with local format
      let phoneNumber = selectedSubmission.phone.replace(/\s+/g, '');
      if (phoneNumber.startsWith('+')) {
        phoneNumber = phoneNumber.substring(1);
      }
      if (phoneNumber.startsWith('27')) {
        phoneNumber = '0' + phoneNumber.substring(2);
      }
      
      const response = await sendSmsNotification(phoneNumber, smsMessage);
      if (response.success) {
        toast.success('SMS sent successfully');
        setIsSmsDialogOpen(false);
        
        // Add a note about the SMS
        const newNotes = adminNotes 
          ? `${adminNotes}\n\n[${new Date().toLocaleString()}] SMS sent: ${smsMessage}`
          : `[${new Date().toLocaleString()}] SMS sent: ${smsMessage}`;
        
        setAdminNotes(newNotes);
        
        // Save the note
        if (selectedSubmission.id) {
          await updateContactSubmission(selectedSubmission.id, { notes: newNotes });
          
          // Update submissions list
          setSubmissions(prev => 
            prev.map(sub => sub.id === selectedSubmission.id ? { ...sub, notes: newNotes } : sub)
          );
          
          // Update selected submission
          setSelectedSubmission({ ...selectedSubmission, notes: newNotes });
        }
      } else {
        toast.error('Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('An error occurred while sending SMS');
    } finally {
      setIsSendingSms(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-blue-500">New</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-yellow-500">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-500">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get subject icon
  const getSubjectIcon = (subject?: string) => {
    switch (subject) {
      case 'general':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'application':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'support':
        return <User className="h-4 w-4 text-yellow-500" />;
      case 'feedback':
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Contact Form Submissions</CardTitle>
              <CardDescription>Manage and respond to inquiries from the contact form</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {filteredSubmissions.length} submissions
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="flex items-center w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">
                New
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                  {submissions.filter(s => s.status === 'new').length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="m-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-lg">Loading submissions...</span>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="bg-muted/30 rounded-lg py-12 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <h3 className="text-lg font-medium">No submissions found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search' : 'No contact form submissions match your current filters'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[80px]">Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="hidden md:table-cell">Email / Phone</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.map((submission) => (
                        <TableRow 
                          key={submission.id}
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() => openSubmissionDetails(submission)}
                        >
                          <TableCell>
                            {getStatusBadge(submission.status)}
                          </TableCell>
                          <TableCell className="font-medium">{submission.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getSubjectIcon(submission.subject)}
                              <span className="ml-2">{submission.subject}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col">
                              <div className="flex items-center text-sm">
                                <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                {submission.email}
                              </div>
                              {submission.phone && (
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {submission.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {formatDate(submission.date)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(submission.id, 'new');
                                  }}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Mark as New
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(submission.id, 'in_progress');
                                  }}
                                >
                                  <Loader2 className="h-4 w-4 mr-2" />
                                  Mark as In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(submission.id, 'resolved');
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Mark as Resolved
                                </DropdownMenuItem>
                                {submission.phone && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openSmsDialog(submission);
                                    }}
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Send SMS Response
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Submission Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Contact Submission Details</DialogTitle>
                <DialogDescription>
                  Inquiry from {selectedSubmission.name} • {formatDate(selectedSubmission.date)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="flex space-x-2">
                    {getStatusBadge(selectedSubmission.status)}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">Update</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => updateStatus(selectedSubmission.id, 'new')}>
                          <Clock className="h-4 w-4 mr-2" />
                          Mark as New
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(selectedSubmission.id, 'in_progress')}>
                          <Loader2 className="h-4 w-4 mr-2" />
                          Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(selectedSubmission.id, 'resolved')}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark as Resolved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Subject</h3>
                  <div className="flex items-center">
                    {getSubjectIcon(selectedSubmission.subject)}
                    <span className="ml-2 font-medium capitalize">{selectedSubmission.subject}</span>
                  </div>
                </div>
                
                {selectedSubmission.phone && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Actions</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openSmsDialog(selectedSubmission)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send SMS Response
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                  <div className="p-3 bg-muted/30 rounded-md space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-primary mr-2" />
                      <span className="font-medium">{selectedSubmission.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-primary mr-2" />
                      <a href={`mailto:${selectedSubmission.email}`} className="text-blue-600 hover:underline">
                        {selectedSubmission.email}
                      </a>
                    </div>
                    {selectedSubmission.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-primary mr-2" />
                        <a href={`tel:${selectedSubmission.phone}`} className="text-blue-600 hover:underline">
                          {selectedSubmission.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Message</h3>
                  <div className="p-3 bg-muted/30 rounded-md whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </div>
                </div>
              </div>

              <div className="space-y-2 my-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Admin Notes</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={saveNotes}
                  >
                    Save Notes
                  </Button>
                </div>
                <Textarea 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this inquiry and any follow-up actions taken..."
                  className="min-h-[120px]"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* SMS Dialog */}
      <Dialog open={isSmsDialogOpen} onOpenChange={setIsSmsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send SMS Response</DialogTitle>
            <DialogDescription>
              Send an SMS to {selectedSubmission?.name} at {selectedSubmission?.phone}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sms-message">Message</Label>
              <Textarea
                id="sms-message"
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Type your response..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Characters: {smsMessage.length}/160
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSmsDialogOpen(false)}>Cancel</Button>
            <Button onClick={sendSms} disabled={isSendingSms || !smsMessage.trim()}>
              {isSendingSms ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send SMS'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactSubmissions; 