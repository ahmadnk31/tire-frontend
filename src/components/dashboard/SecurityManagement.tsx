import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  Globe, 
  User, 
  Ban, 
  CheckCircle, 
  RefreshCw,
  Trash2,
  Search,
  Download
} from 'lucide-react';
import apiClient from '@/lib/api';

interface SecurityBlock {
  email: string;
  ipAddress: string;
  failedAttempts: number;
  totalAttempts: number;
  isBlocked: boolean;
  lastAttempt: string;
  lastAttemptType: string;
  blockReason: string;
  userAgent: string;
}

interface SecurityStatus {
  failedAttempts: number;
  isBlocked: boolean;
  attemptsRemaining: number;
  recentAttempts: number;
  nextAllowedTime: string | null;
}

export function SecurityManagement() {
  const [searchEmail, setSearchEmail] = useState('');
  const [clearEmail, setClearEmail] = useState('');
  const [clearIP, setClearIP] = useState('');
  const [selectedUser, setSelectedUser] = useState<SecurityStatus | null>(null);
  const queryClient = useQueryClient();

  // Fetch all security blocks
  const { data: securityData, isLoading, error } = useQuery({
    queryKey: ['security-blocks'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/security-blocks');
      return response;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Get user security status
  const getUserStatusMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.get(`/admin/security-status/${email}`);
      return response;
    },
    onSuccess: (data) => {
      setSelectedUser(data.securityStatus);
    },
  });

  // Clear security blocks
  const clearBlocksMutation = useMutation({
    mutationFn: async ({ email, ipAddress }: { email?: string; ipAddress?: string }) => {
      const response = await apiClient.post('/admin/clear-security-block', { email, ipAddress });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-blocks'] });
      setClearEmail('');
      setClearIP('');
    },
  });

  // Emergency clear all blocks
  const emergencyClearMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/admin/emergency-clear-blocks', {
        email: clearEmail.trim() || undefined,
        ipAddress: clearIP.trim() || undefined,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-blocks'] });
    },
  });

  const handleSearchUser = () => {
    if (searchEmail.trim()) {
      getUserStatusMutation.mutate(searchEmail.trim());
    }
  };

  const handleClearBlocks = () => {
    clearBlocksMutation.mutate({
      email: clearEmail.trim() || undefined,
      ipAddress: clearIP.trim() || undefined,
    });
  };

  const handleEmergencyClear = () => {
    if (window.confirm('Are you sure you want to clear ALL security blocks? This action cannot be undone.')) {
      emergencyClearMutation.mutate();
    }
  };

  const exportBlocksData = () => {
    if (securityData?.blocks) {
      const dataStr = JSON.stringify(securityData.blocks, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `security-blocks-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getBlockSeverity = (block: SecurityBlock) => {
    if (block.isBlocked) return 'destructive';
    if (block.failedAttempts >= 3) return 'default';
    return 'secondary';
  };

  const getBlockIcon = (block: SecurityBlock) => {
    if (block.isBlocked) return <Ban className="w-4 h-4" />;
    if (block.failedAttempts >= 3) return <AlertTriangle className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading security data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load security data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Management</h2>
          <p className="text-muted-foreground">Monitor and manage security blocks and login attempts</p>
        </div>
        <Button 
          onClick={exportBlocksData} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blocks</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityData?.blocks?.filter((b: SecurityBlock) => b.isBlocked).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {securityData?.blocks?.filter((b: SecurityBlock) => !b.isBlocked && b.failedAttempts >= 3).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitored IPs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(securityData?.blocks?.map((b: SecurityBlock) => b.ipAddress)).size || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityData?.blocks?.reduce((sum: number, b: SecurityBlock) => sum + b.totalAttempts, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="blocks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="blocks">Security Blocks</TabsTrigger>
          <TabsTrigger value="search">User Lookup</TabsTrigger>
          <TabsTrigger value="manage">Manage Blocks</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Security Blocks & Warnings</CardTitle>
              <CardDescription>
                Real-time view of all security incidents and blocked accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityData?.blocks?.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">All Clear!</h3>
                  <p className="text-muted-foreground">No security blocks or warnings at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {securityData?.blocks?.map((block: SecurityBlock, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getBlockIcon(block)}
                        <div>
                          <div className="font-medium">{block.email}</div>
                          <div className="text-sm text-muted-foreground">
                            IP: {block.ipAddress} • {block.failedAttempts} failed attempts
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last attempt: {formatDate(block.lastAttempt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getBlockSeverity(block)}>
                          {block.isBlocked ? 'Blocked' : block.failedAttempts >= 3 ? 'Warning' : 'Monitoring'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => clearBlocksMutation.mutate({ 
                            email: block.email, 
                            ipAddress: block.ipAddress 
                          })}
                          disabled={clearBlocksMutation.isPending}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Security Lookup</CardTitle>
              <CardDescription>
                Check the security status of any user account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="search-email">Email Address</Label>
                  <Input
                    id="search-email"
                    placeholder="user@example.com"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                  />
                </div>
                <Button 
                  onClick={handleSearchUser}
                  disabled={!searchEmail.trim() || getUserStatusMutation.isPending}
                  className="mt-6"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {selectedUser && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Status for {searchEmail}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Failed Attempts</Label>
                        <div className="text-2xl font-bold text-red-600">
                          {selectedUser.failedAttempts}
                        </div>
                      </div>
                      <div>
                        <Label>Attempts Remaining</Label>
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedUser.attemptsRemaining}
                        </div>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Badge variant={selectedUser.isBlocked ? 'destructive' : 'default'}>
                          {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                        </Badge>
                      </div>
                      <div>
                        <Label>Recent Attempts</Label>
                        <div className="text-lg font-semibold">
                          {selectedUser.recentAttempts}
                        </div>
                      </div>
                    </div>
                    {selectedUser.nextAllowedTime && (
                      <Alert className="mt-4">
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          Account will be unblocked at: {formatDate(selectedUser.nextAllowedTime)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clear Specific Blocks</CardTitle>
                <CardDescription>
                  Remove security blocks for specific email or IP address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clear-email">Email Address (optional)</Label>
                  <Input
                    id="clear-email"
                    placeholder="user@example.com"
                    value={clearEmail}
                    onChange={(e) => setClearEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="clear-ip">IP Address (optional)</Label>
                  <Input
                    id="clear-ip"
                    placeholder="192.168.1.1"
                    value={clearIP}
                    onChange={(e) => setClearIP(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleClearBlocks}
                  disabled={(!clearEmail.trim() && !clearIP.trim()) || clearBlocksMutation.isPending}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Blocks
                </Button>
                {clearBlocksMutation.isSuccess && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Security blocks cleared successfully!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Emergency Actions</CardTitle>
                <CardDescription>
                  Use these actions only in emergency situations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Emergency actions will affect all users and cannot be undone.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleEmergencyClear}
                  disabled={emergencyClearMutation.isPending}
                  variant="destructive"
                  className="w-full"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Clear ALL Security Blocks
                </Button>
                {emergencyClearMutation.isSuccess && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      All security blocks have been cleared!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
