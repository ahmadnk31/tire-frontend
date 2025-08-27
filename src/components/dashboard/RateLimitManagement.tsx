import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';

interface RateLimitSettings {
  general: {
    windowMs: number;
    max: number;
    message: string;
  };
  auth: {
    windowMs: number;
    max: number;
    message: string;
  };
  payment: {
    windowMs: number;
    max: number;
    message: string;
  };
  upload: {
    windowMs: number;
    max: number;
    message: string;
  };
  speedLimit: {
    windowMs: number;
    delayAfter: number;
    delayMs: number;
    maxDelayMs: number;
  };
}

interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  topBlockedIPs: Array<{ ip: string; count: number }>;
  rateLimitHits: {
    general: number;
    auth: number;
    payment: number;
    upload: number;
  };
  last24Hours: {
    requests: number;
    blocked: number;
    uniqueIPs: number;
  };
}

export default function RateLimitManagement() {
  const [settings, setSettings] = useState<RateLimitSettings | null>(null);
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, statsRes] = await Promise.all([
        adminApi.getRateLimitSettings(),
        adminApi.getRateLimitStats()
      ]);
      
      setSettings(settingsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading rate limit data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rate limit settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await adminApi.updateRateLimitSettings({ settings });
      toast({
        title: 'Success',
        description: 'Rate limit settings updated successfully'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rate limit settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetCounters = async () => {
    try {
      await adminApi.resetRateLimitCounters();
      toast({
        title: 'Success',
        description: 'Rate limit counters reset successfully'
      });
      loadData(); // Reload stats
    } catch (error) {
      console.error('Error resetting counters:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset rate limit counters',
        variant: 'destructive'
      });
    }
  };

  const updateSetting = (category: keyof RateLimitSettings, field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rate Limit Management</h2>
          <p className="text-muted-foreground">
            Configure and monitor API rate limiting settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            Refresh
          </Button>
          <Button onClick={handleResetCounters} variant="destructive">
            Reset Counters
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Alert>
            <AlertDescription>
              Rate limits help protect your API from abuse. Changes take effect immediately.
            </AlertDescription>
          </Alert>

          {settings && (
            <div className="grid gap-6">
              {/* General Rate Limit */}
              <Card>
                <CardHeader>
                  <CardTitle>General API Rate Limit</CardTitle>
                  <CardDescription>
                    Limits for general API endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="general-max">Max Requests</Label>
                      <Input
                        id="general-max"
                        type="number"
                        value={settings?.general?.max || 200}
                        onChange={(e) => updateSetting('general', 'max', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="general-window">Window (minutes)</Label>
                      <Input
                        id="general-window"
                        type="number"
                        value={Math.round((settings?.general?.windowMs || 15 * 60 * 1000) / (1000 * 60))}
                        onChange={(e) => updateSetting('general', 'windowMs', parseInt(e.target.value) * 1000 * 60)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="general-message">Error Message</Label>
                    <Input
                      id="general-message"
                      value={settings?.general?.message || 'Too many requests, please try again later.'}
                      onChange={(e) => updateSetting('general', 'message', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Auth Rate Limit */}
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Rate Limit</CardTitle>
                  <CardDescription>
                    Stricter limits for login/register endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="auth-max">Max Attempts</Label>
                      <Input
                        id="auth-max"
                        type="number"
                        value={settings?.auth?.max || 10}
                        onChange={(e) => updateSetting('auth', 'max', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="auth-window">Window (minutes)</Label>
                      <Input
                        id="auth-window"
                        type="number"
                        value={Math.round((settings?.auth?.windowMs || 15 * 60 * 1000) / (1000 * 60))}
                        onChange={(e) => updateSetting('auth', 'windowMs', parseInt(e.target.value) * 1000 * 60)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Rate Limit */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Rate Limit</CardTitle>
                  <CardDescription>
                    Limits for payment processing endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment-max">Max Attempts</Label>
                      <Input
                        id="payment-max"
                        type="number"
                        value={settings?.payment?.max || 10}
                        onChange={(e) => updateSetting('payment', 'max', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="payment-window">Window (minutes)</Label>
                      <Input
                        id="payment-window"
                        type="number"
                        value={Math.round((settings?.payment?.windowMs || 15 * 60 * 1000) / (1000 * 60))}
                        onChange={(e) => updateSetting('payment', 'windowMs', parseInt(e.target.value) * 1000 * 60)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Rate Limit */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Rate Limit</CardTitle>
                  <CardDescription>
                    Limits for file upload endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="upload-max">Max Uploads</Label>
                      <Input
                        id="upload-max"
                        type="number"
                        value={settings?.upload?.max || 20}
                        onChange={(e) => updateSetting('upload', 'max', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="upload-window">Window (minutes)</Label>
                      <Input
                        id="upload-window"
                        type="number"
                        value={Math.round((settings?.upload?.windowMs || 15 * 60 * 1000) / (1000 * 60))}
                        onChange={(e) => updateSetting('upload', 'windowMs', parseInt(e.target.value) * 1000 * 60)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {stats ? (
            <div className="grid gap-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.blockedRequests.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last 24h Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.last24Hours.requests.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unique IPs (24h)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.last24Hours.uniqueIPs.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Rate Limit Hits */}
              <Card>
                <CardHeader>
                  <CardTitle>Rate Limit Hits by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.rateLimitHits.general}</div>
                      <div className="text-sm text-muted-foreground">General</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{stats.rateLimitHits.auth}</div>
                      <div className="text-sm text-muted-foreground">Auth</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.rateLimitHits.payment}</div>
                      <div className="text-sm text-muted-foreground">Payment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{stats.rateLimitHits.upload}</div>
                      <div className="text-sm text-muted-foreground">Upload</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Blocked IPs */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Blocked IP Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.topBlockedIPs.map((ip, index) => (
                      <div key={ip.ip} className="flex justify-between items-center p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <span className="font-mono">{ip.ip}</span>
                        </div>
                        <Badge variant="destructive">{ip.count} blocks</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No statistics available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
