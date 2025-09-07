import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Download, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Smartphone,
  Settings,
  Info
} from 'lucide-react';
import pwaManager from '@/lib/pwa';

export function PWASettings() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Get PWA status
    setIsInstalled(pwaManager.getInstallStatus());
    setCanInstall(pwaManager.canInstall());

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    const success = await pwaManager.installApp();
    if (success) {
      setIsInstalled(true);
      setCanInstall(false);
    }
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    try {
      await pwaManager.forceUpdate();
    } catch (error) {
      console.error('Failed to update:', error);
      setIsUpdating(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await pwaManager.clearAppData();
      // Reload after clearing
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to clear data:', error);
      setIsClearing(false);
    }
  };

  const checkForUpdates = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update();
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">PWA Settings</h2>
        <p className="text-muted-foreground">
          Manage your Progressive Web App installation and data
        </p>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            App Status
          </CardTitle>
          <CardDescription>
            Current status of your Progressive Web App
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              Network Status
            </span>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Installation Status
            </span>
            <Badge variant={isInstalled ? "default" : "secondary"}>
              {isInstalled ? "Installed" : "Not Installed"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Can Install
            </span>
            <Badge variant={canInstall ? "default" : "secondary"}>
              {canInstall ? "Yes" : "No"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Installation */}
      {canInstall && !isInstalled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Install App
            </CardTitle>
            <CardDescription>
              Install the app on your device for a better experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInstall} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Install Ariana Tires App
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            App Updates
          </CardTitle>
          <CardDescription>
            Check for updates and manage app versions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={checkForUpdates} 
            variant="outline" 
            className="w-full"
            disabled={!isOnline}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check for Updates
          </Button>
          
          <Button 
            onClick={handleForceUpdate} 
            variant="default" 
            className="w-full"
            disabled={isUpdating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Updating...' : 'Force Update & Reload'}
          </Button>
          
          <Button 
            onClick={() => pwaManager.triggerUpdateCheck()} 
            variant="outline" 
            className="w-full"
          >
            <Info className="h-4 w-4 mr-2" />
            Test Update Check
          </Button>
          
          <Button 
            onClick={() => pwaManager.showUpdateNotification()} 
            variant="outline" 
            className="w-full"
          >
            <Info className="h-4 w-4 mr-2" />
            Show Update Notification
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Clear cached data and reset the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleClearData} 
            variant="destructive" 
            className="w-full"
            disabled={isClearing}
          >
            <Trash2 className={`h-4 w-4 mr-2 ${isClearing ? 'animate-pulse' : ''}`} />
            {isClearing ? 'Clearing...' : 'Clear All App Data'}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            This will clear all cached data, stored preferences, and reload the app. 
            You will need to log in again.
          </p>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">User Agent:</span>
            <span className="text-right text-xs max-w-[60%] break-all">
              {navigator.userAgent.split(' ').slice(-2).join(' ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">PWA Support:</span>
            <span>{'serviceWorker' in navigator ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cache API:</span>
            <span>{'caches' in window ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Notifications:</span>
            <span>{'Notification' in window ? 'Yes' : 'No'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
