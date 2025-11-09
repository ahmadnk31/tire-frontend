import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import pwaManager from '@/lib/pwa';

interface PWAUpdateNotificationProps {
  onUpdate?: () => void;
  onDismiss?: () => void;
}

export function PWAUpdateNotification({ onUpdate, onDismiss }: PWAUpdateNotificationProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for update available events
    const handleUpdateAvailable = () => {
      setShowNotification(true);
    };

    pwaManager.onUpdateAvailable(handleUpdateAvailable);

    return () => {
      pwaManager.removeUpdateListener();
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      console.log('PWA Update: Starting update process...');
      await pwaManager.forceUpdate();
      console.log('PWA Update: Update process completed');
      onUpdate?.();
    } catch (error) {
      console.error('PWA Update: Failed to update:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    pwaManager.dismissUpdateNotification(); // Remember dismissal for this session
    onDismiss?.();
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="font-semibold">New Version Available!</div>
            <div className="text-sm opacity-90">Update now to get the latest features</div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            variant="secondary"
            size="sm"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            {isUpdating ? 'Updating...' : 'Update Now'}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
