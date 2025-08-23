import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Clock, 
  Shield, 
  Database, 
  Mail, 
  Globe, 
  Save, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  Download,
  Upload,
  Key,
  Bell,
  Lock,
  Users,
  FileText,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';

interface SystemSettings {
  // Token Settings
  tokenExpirationHours: number;
  refreshTokenExpirationDays: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  
  // Security Settings
  requireEmailVerification: boolean;
  requireTwoFactorAuth: boolean;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  sessionTimeoutMinutes: number;
  
  // Email Settings
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  emailFromAddress: string;
  emailFromName: string;
  
  // System Settings
  maintenanceMode: boolean;
  debugMode: boolean;
  maxFileUploadSize: number;
  allowedFileTypes: string[];
  
  // Notification Settings
  emailNotifications: boolean;
  adminNotifications: boolean;
  notificationRetentionDays: number;
  
  // Backup Settings
  autoBackupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupRetentionDays: number;
  backupLocation: string;
}

interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'in_progress';
}

export function SettingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch system settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/settings');
      return response.settings as SystemSettings;
    },
  });

  // Fetch backup information
  const { data: backups, isLoading: backupsLoading } = useQuery({
    queryKey: ['system-backups'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/backups');
      return response.backups as BackupInfo[];
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation<unknown, Error, Partial<SystemSettings>>({
    mutationFn: async (newSettings: Partial<SystemSettings>) => {
      const response = await apiClient.put('/admin/settings', newSettings);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: "Settings Updated",
        description: "System settings have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/admin/backups/create', {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-backups'] });
      toast({
        title: "Backup Created",
        description: "System backup has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create backup.",
        variant: "destructive",
      });
    },
  });

  // Download backup mutation
  const downloadBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      const response = await apiClient.get(`/admin/backups/${backupId}/download`);
      return response;
    },
    onSuccess: (data, backupId) => {
      // Handle file download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = `backup-${backupId}.zip`;
      link.click();
      toast({
        title: "Download Started",
        description: "Backup download has started.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to download backup.",
        variant: "destructive",
      });
    },
  });

  // Delete backup mutation
  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      const response = await apiClient.delete(`/admin/backups/${backupId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-backups'] });
      toast({
        title: "Backup Deleted",
        description: "Backup has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete backup.",
        variant: "destructive",
      });
    },
  });

  // Test email settings mutation
  const testEmailMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/admin/settings/test-email', {});
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Test email has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = async (section: string, sectionSettings: Partial<SystemSettings>) => {
    setIsSaving(true);
    try {
      await updateSettingsMutation.mutateAsync(sectionSettings);
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load settings. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">Manage system configuration and security settings</p>
        </div>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['system-settings'] })}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="backups" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Backups
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General System Settings</CardTitle>
              <CardDescription>
                Configure basic system behavior and maintenance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenance-mode"
                      checked={settings?.maintenanceMode || false}
                      onCheckedChange={(checked) => 
                        handleSaveSettings('general', { maintenanceMode: checked })
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {settings?.maintenanceMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When enabled, only administrators can access the system
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debug-mode">Debug Mode</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="debug-mode"
                      checked={settings?.debugMode || false}
                      onCheckedChange={(checked) => 
                        handleSaveSettings('general', { debugMode: checked })
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {settings?.debugMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enable detailed error logging and debugging information
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-file-size">Maximum File Upload Size (MB)</Label>
                  <Input
                    id="max-file-size"
                    type="number"
                    value={settings?.maxFileUploadSize || 10}
                    onChange={(e) => 
                      handleSaveSettings('general', { maxFileUploadSize: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowed-file-types">Allowed File Types</Label>
                  <Input
                    id="allowed-file-types"
                    placeholder="jpg,png,pdf,doc"
                    value={settings?.allowedFileTypes?.join(',') || ''}
                    onChange={(e) => 
                      handleSaveSettings('general', { allowedFileTypes: e.target.value.split(',') })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of allowed file extensions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security & Authentication Settings</CardTitle>
              <CardDescription>
                Configure security policies and authentication requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="token-expiration">Token Expiration (hours)</Label>
                  <Input
                    id="token-expiration"
                    type="number"
                    value={settings?.tokenExpirationHours || 24}
                    onChange={(e) => 
                      handleSaveSettings('security', { tokenExpirationHours: parseInt(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    How long JWT tokens remain valid
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refresh-token-expiration">Refresh Token Expiration (days)</Label>
                  <Input
                    id="refresh-token-expiration"
                    type="number"
                    value={settings?.refreshTokenExpirationDays || 30}
                    onChange={(e) => 
                      handleSaveSettings('security', { refreshTokenExpirationDays: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-login-attempts">Maximum Login Attempts</Label>
                  <Input
                    id="max-login-attempts"
                    type="number"
                    value={settings?.maxLoginAttempts || 5}
                    onChange={(e) => 
                      handleSaveSettings('security', { maxLoginAttempts: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockout-duration"
                    type="number"
                    value={settings?.lockoutDurationMinutes || 15}
                    onChange={(e) => 
                      handleSaveSettings('security', { lockoutDurationMinutes: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings?.sessionTimeoutMinutes || 60}
                    onChange={(e) => 
                      handleSaveSettings('security', { sessionTimeoutMinutes: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-min-length">Minimum Password Length</Label>
                  <Input
                    id="password-min-length"
                    type="number"
                    value={settings?.passwordMinLength || 8}
                    onChange={(e) => 
                      handleSaveSettings('security', { passwordMinLength: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require-email-verification"
                    checked={settings?.requireEmailVerification || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings('security', { requireEmailVerification: checked })
                    }
                  />
                  <Label htmlFor="require-email-verification">Require Email Verification</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="require-2fa"
                    checked={settings?.requireTwoFactorAuth || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings('security', { requireTwoFactorAuth: checked })
                    }
                  />
                  <Label htmlFor="require-2fa">Require Two-Factor Authentication</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="password-special-chars"
                    checked={settings?.passwordRequireSpecialChars || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings('security', { passwordRequireSpecialChars: checked })
                    }
                  />
                  <Label htmlFor="password-special-chars">Require Special Characters in Passwords</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure SMTP settings for system emails and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    value={settings?.smtpHost || ''}
                    onChange={(e) => 
                      handleSaveSettings('email', { smtpHost: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={settings?.smtpPort || 587}
                    onChange={(e) => 
                      handleSaveSettings('email', { smtpPort: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-username">SMTP Username</Label>
                  <Input
                    id="smtp-username"
                    value={settings?.smtpUsername || ''}
                    onChange={(e) => 
                      handleSaveSettings('email', { smtpUsername: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={settings?.smtpPassword || ''}
                    onChange={(e) => 
                      handleSaveSettings('email', { smtpPassword: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-from">From Email Address</Label>
                  <Input
                    id="email-from"
                    type="email"
                    value={settings?.emailFromAddress || ''}
                    onChange={(e) => 
                      handleSaveSettings('email', { emailFromAddress: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-from-name">From Name</Label>
                  <Input
                    id="email-from-name"
                    value={settings?.emailFromName || ''}
                    onChange={(e) => 
                      handleSaveSettings('email', { emailFromName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => testEmailMutation.mutate()}
                  disabled={testEmailMutation.isPending}
                  variant="outline"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Test Email Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backups" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup Configuration</CardTitle>
                <CardDescription>
                  Configure automatic backup settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-backup"
                    checked={settings?.autoBackupEnabled || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings('backups', { autoBackupEnabled: checked })
                    }
                  />
                  <Label htmlFor="auto-backup">Enable Automatic Backups</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select
                    value={settings?.backupFrequency || 'daily'}
                    onValueChange={(value) => 
                      handleSaveSettings('backups', { backupFrequency: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-retention">Retention Period (days)</Label>
                  <Input
                    id="backup-retention"
                    type="number"
                    value={settings?.backupRetentionDays || 30}
                    onChange={(e) => 
                      handleSaveSettings('backups', { backupRetentionDays: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-location">Backup Location</Label>
                  <Input
                    id="backup-location"
                    value={settings?.backupLocation || ''}
                    onChange={(e) => 
                      handleSaveSettings('backups', { backupLocation: e.target.value })
                    }
                  />
                </div>

                <Button
                  onClick={() => createBackupMutation.mutate()}
                  disabled={createBackupMutation.isPending}
                  className="w-full"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Create Manual Backup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup History</CardTitle>
                <CardDescription>
                  View and manage existing backups
                </CardDescription>
              </CardHeader>
              <CardContent>
                {backupsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : backups && backups.length > 0 ? (
                  <div className="space-y-3">
                    {backups.map((backup) => (
                      <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{backup.filename}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatFileSize(backup.size)} • {formatDate(backup.createdAt)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={backup.status === 'completed' ? 'default' : 'destructive'}>
                              {backup.status}
                            </Badge>
                            <Badge variant="outline">
                              {backup.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadBackupMutation.mutate(backup.id)}
                            disabled={downloadBackupMutation.isPending}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteBackupMutation.mutate(backup.id)}
                            disabled={deleteBackupMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No backups found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-notifications"
                    checked={settings?.emailNotifications || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings('notifications', { emailNotifications: checked })
                    }
                  />
                  <Label htmlFor="email-notifications">Enable Email Notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="admin-notifications"
                    checked={settings?.adminNotifications || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings('notifications', { adminNotifications: checked })
                    }
                  />
                  <Label htmlFor="admin-notifications">Send Admin Notifications</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-retention">Notification Retention (days)</Label>
                <Input
                  id="notification-retention"
                  type="number"
                  value={settings?.notificationRetentionDays || 30}
                  onChange={(e) => 
                    handleSaveSettings('notifications', { notificationRetentionDays: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  How long to keep notification history
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced System Settings</CardTitle>
              <CardDescription>
                Advanced configuration options for system administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  These settings affect core system behavior. Please be careful when making changes.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="system-log-level">System Log Level</Label>
                  <Select defaultValue="info">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cache-ttl">Cache TTL (seconds)</Label>
                  <Input
                    id="cache-ttl"
                    type="number"
                    placeholder="3600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate-limit">Rate Limit (requests per minute)</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export Settings
                </Button>
                <Button variant="outline" className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
