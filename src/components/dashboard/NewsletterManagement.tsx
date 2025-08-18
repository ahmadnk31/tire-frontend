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
  Calendar, 
  Search, 
  Filter,
  RefreshCw,
  Send,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Globe
} from 'lucide-react';
import {
  getNewsletterSubscriptions,
  updateNewsletterSubscription,
  sendNewsletterEmail,
  deleteNewsletterSubscription,
  resendNewsletterWelcome,
  type NewsletterSubscription,
  type ApiResponse
} from '@/lib/api/dashboard';

const statusColors = {
  active: 'bg-green-100 text-green-800',
  unsubscribed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const statusIcons = {
  active: CheckCircle,
  unsubscribed: XCircle,
  pending: Clock,
};

export const NewsletterManagement = () => {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipients: 'active' as 'all' | 'active' | 'specific',
    tags: [] as string[]
  });
  const [emailLoading, setEmailLoading] = useState(false);

  const token = localStorage.getItem('token') || '';

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await getNewsletterSubscriptions(
        token,
        page,
        20,
        statusFilter === 'all' || !statusFilter ? undefined : statusFilter,
        sourceFilter === 'all' || !sourceFilter ? undefined : sourceFilter
      );
      
      if (response.success && response.data) {
        setSubscriptions(response.data.subscriptions || []);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, statusFilter, sourceFilter]);

  const handleStatusUpdate = async (subscriptionId: number, newStatus: string) => {
    try {
      await updateNewsletterSubscription(token, subscriptionId, { status: newStatus });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSendEmail = async () => {
    try {
      setEmailLoading(true);
      const response = await sendNewsletterEmail(token, emailData);
      
      if (response.success) {
        alert(`Email sent successfully to ${response.data?.totalRecipients} recipients`);
        setSendEmailDialogOpen(false);
        setEmailData({
          subject: '',
          message: '',
          recipients: 'active',
          tags: []
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDelete = async (subscriptionId: number) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    try {
      await deleteNewsletterSubscription(token, subscriptionId);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  const handleResendWelcome = async (subscriptionId: number) => {
    try {
      await resendNewsletterWelcome(token, subscriptionId);
      alert('Welcome email resent successfully');
    } catch (error) {
      console.error('Error resending welcome email:', error);
      alert('Failed to resend welcome email');
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subscription.name && subscription.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const unsubscribedCount = subscriptions.filter(s => s.status === 'unsubscribed').length;
  const pendingCount = subscriptions.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Management</h1>
          <p className="text-muted-foreground">Manage newsletter subscriptions and campaigns</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={sendEmailDialogOpen} onOpenChange={setSendEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Newsletter Campaign</DialogTitle>
                <DialogDescription>
                  Send an email campaign to your newsletter subscribers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={emailData.subject}
                    onChange={(e) => setEmailData({
                      ...emailData,
                      subject: e.target.value
                    })}
                    placeholder="Campaign subject"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Recipients</label>
                  <Select
                    value={emailData.recipients}
                    onValueChange={(value: 'all' | 'active' | 'specific') => 
                      setEmailData({ ...emailData, recipients: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active Subscribers ({activeSubscriptions})</SelectItem>
                      <SelectItem value="all">All Subscribers ({subscriptions.length})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={emailData.message}
                    onChange={(e) => setEmailData({
                      ...emailData,
                      message: e.target.value
                    })}
                    placeholder="Your newsletter content..."
                    rows={8}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSendEmailDialogOpen(false)}
                    disabled={emailLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    disabled={!emailData.subject || !emailData.message || emailLoading}
                  >
                    {emailLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Campaign
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={fetchSubscriptions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unsubscribedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="contact-form">Contact Form</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Subscriptions ({filteredSubscriptions.length})</CardTitle>
          <CardDescription>
            Manage newsletter subscribers and send campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscriber</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Last Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading subscriptions...
                    </TableCell>
                  </TableRow>
                ) : filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No newsletter subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((subscription) => {
                    const StatusIcon = statusIcons[subscription.status as keyof typeof statusIcons];
                    return (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {subscription.email}
                            </div>
                            {subscription.name && (
                              <div className="text-sm text-muted-foreground">
                                {subscription.name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[subscription.status as keyof typeof statusColors]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            <Globe className="h-3 w-3 mr-1" />
                            {subscription.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(subscription.subscribedAt), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {subscription.lastEmailSent ? (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(subscription.lastEmailSent), 'MMM dd, yyyy')}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={subscription.status}
                              onValueChange={(value) => handleStatusUpdate(subscription.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResendWelcome(subscription.id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Welcome
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(subscription.id)}
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
