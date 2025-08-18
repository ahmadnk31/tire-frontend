import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Phone, 
  Calendar, 
  Search, 
  Filter,
  RefreshCw,
  Send,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import {
  getContactMessages,
  updateContactMessage,
  replyToContact,
  deleteContactMessage,
  resendContactConfirmation,
  sendAdminNotification,
  type ContactMessage,
  type ApiResponse
} from '@/lib/api/dashboard';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  pending: Clock,
  'in-progress': RefreshCw,
  resolved: CheckCircle,
  closed: AlertCircle,
};

export const ContactManagement = () => {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState<string>('');
  const [replyData, setReplyData] = useState({
    subject: '',
    message: '',
    markAsResolved: true
  });
  const [adminEmail, setAdminEmail] = useState('');

  const token = localStorage.getItem('token') || '';

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await getContactMessages(
        token,
        page,
        20,
        statusFilter === 'all' || !statusFilter ? undefined : statusFilter,
        inquiryTypeFilter === 'all' || !inquiryTypeFilter ? undefined : inquiryTypeFilter
      );
      
      if (response.success && response.data) {
        setContacts(response.data.messages || []);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, statusFilter, inquiryTypeFilter]);

  const handleStatusUpdate = async (contactId: number, newStatus: string) => {
    try {
      await updateContactMessage(token, contactId, { status: newStatus });
      fetchContacts();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleReply = async () => {
    if (!selectedContact) return;

    try {
      await replyToContact(token, selectedContact.id, replyData);
      setReplyDialogOpen(false);
      setReplyData({ subject: '', message: '', markAsResolved: true });
      fetchContacts();
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const handleDelete = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact message?')) return;

    try {
      await deleteContactMessage(token, contactId);
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleResendConfirmation = async (contactId: number) => {
    try {
      await resendContactConfirmation(token, contactId);
      alert('Confirmation email resent successfully');
    } catch (error) {
      console.error('Error resending confirmation:', error);
      alert('Failed to resend confirmation email');
    }
  };

  const handleSendAdminNotification = async (contactId: number) => {
    if (!adminEmail.trim()) {
      alert('Please enter an admin email address');
      return;
    }

    try {
      await sendAdminNotification(token, contactId, adminEmail);
      alert('Admin notification sent successfully');
      setAdminEmail('');
    } catch (error) {
      console.error('Error sending admin notification:', error);
      alert('Failed to send admin notification');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contact Management</h1>
          <p className="text-muted-foreground">Manage customer inquiries and messages</p>
        </div>
        <Button onClick={fetchContacts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Inquiry Type</label>
              <Select value={inquiryTypeFilter} onValueChange={setInquiryTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Email</label>
              <Input
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages ({filteredContacts.length})</CardTitle>
          <CardDescription>
            Manage and respond to customer inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading contacts...
                    </TableCell>
                  </TableRow>
                ) : filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No contact messages found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact) => {
                    const StatusIcon = statusIcons[contact.status as keyof typeof statusIcons];
                    return (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                            {contact.phone && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{contact.subject}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {contact.message}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {contact.inquiryType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[contact.status as keyof typeof statusColors]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {contact.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(contact.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Send className="h-3 w-3 mr-1" />
                                  Reply
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Reply to {contact.name}</DialogTitle>
                                  <DialogDescription>
                                    Send a response to this contact inquiry
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Subject</label>
                                    <Input
                                      value={replyData.subject}
                                      onChange={(e) => setReplyData({
                                        ...replyData,
                                        subject: e.target.value
                                      })}
                                      placeholder={`Re: ${contact.subject}`}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Message</label>
                                    <Textarea
                                      value={replyData.message}
                                      onChange={(e) => setReplyData({
                                        ...replyData,
                                        message: e.target.value
                                      })}
                                      placeholder="Your response..."
                                      rows={6}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={replyData.markAsResolved}
                                      onChange={(e) => setReplyData({
                                        ...replyData,
                                        markAsResolved: e.target.checked
                                      })}
                                    />
                                    <label className="text-sm">Mark as resolved after sending</label>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setReplyData({ subject: '', message: '', markAsResolved: true });
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        setSelectedContact(contact);
                                        handleReply();
                                      }}
                                      disabled={!replyData.subject || !replyData.message}
                                    >
                                      Send Reply
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Select
                              value={contact.status}
                              onValueChange={(value) => handleStatusUpdate(contact.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResendConfirmation(contact.id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Resend
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendAdminNotification(contact.id)}
                              disabled={!adminEmail.trim()}
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Notify
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(contact.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
