// PWA Utilities
class PWAManager {
  private deferredPrompt: any = null;
  private updateAvailable: boolean = false;
  private updateCallback: (() => void) | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Register service worker
    await this.registerServiceWorker();
    
    // Setup online/offline handling
    this.setupNetworkHandling();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Don't unregister existing service workers - let them update naturally
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none' // Always check for updates
        });
        
        console.log('PWA: Service Worker registered successfully:', registration);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('PWA: New service worker found, installing...');
            
            // Only show update notification once
            let updateNotified = false;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !updateNotified) {
                console.log('PWA: New version available');
                updateNotified = true;
                this.updateAvailable = true;
                this.showUpdateAvailable();
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_UPDATED') {
            console.log('PWA: Service worker updated to version:', event.data.version);
            this.handleServiceWorkerUpdate(event.data);
          }
        });

        // Check for updates periodically (disabled to prevent infinite refresh)
        // setInterval(() => {
        //   registration.update();
        // }, 60000); // Check every minute
        
        return registration;
      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  private setupNetworkHandling() {
    window.addEventListener('online', () => {
      console.log('PWA: App is online');
      this.checkForUpdates();
    });

    window.addEventListener('offline', () => {
      console.log('PWA: App is offline');
    });
  }

  private showUpdateAvailable() {
    // Check if user dismissed the notification in this session
    const dismissed = sessionStorage.getItem('pwa-update-dismissed');
    if (dismissed === 'true') {
      console.log('PWA: Update notification dismissed by user');
      return;
    }

    // Show a notification to the user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('App Update Available', {
        body: 'A new version of the app is available. Click to update.',
        icon: '/android-chrome-192x192.png',
        requireInteraction: true
      });
    }

    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
    
    // Call the update callback if set
    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  // Method to dismiss update notification for this session
  public dismissUpdateNotification(): void {
    sessionStorage.setItem('pwa-update-dismissed', 'true');
    this.updateAvailable = false;
  }

  // Method to register update callback
  public onUpdateAvailable(callback: () => void) {
    this.updateCallback = callback;
  }

  // Method to remove update listener
  public removeUpdateListener() {
    this.updateCallback = null;
  }

  private handleServiceWorkerUpdate(data: any) {
    console.log('PWA: Handling service worker update:', data);
    
    // Don't auto-refresh, let user control when to update
    this.updateAvailable = true;
    this.showUpdateAvailable();
  }

  public async checkForUpdates(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        console.log('PWA: Checking for updates...');
        await registration.update();
        return this.updateAvailable;
      }
    }
    return false;
  }

  // Method to manually trigger update check and show notification if available
  public async triggerUpdateCheck(): Promise<void> {
    const hasUpdate = await this.checkForUpdates();
    if (hasUpdate) {
      this.showUpdateAvailable();
    } else {
      console.log('PWA: No updates available');
    }
  }

  // Method to manually show update notification (for testing)
  public showUpdateNotification(): void {
    this.updateAvailable = true;
    this.showUpdateAvailable();
  }

  public async forceUpdate(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        console.log('PWA: Forcing update by skipping waiting service worker');
        // Send message to waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Listen for the controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('PWA: Service worker controller changed, refreshing...');
        window.location.reload();
      });
      } else {
        console.log('PWA: No waiting service worker found, checking for updates...');
        // If no waiting worker, try to update
        if (registration) {
          await registration.update();
        }
      }
    }
  }


  public getInstallStatus(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  public async installApp(): Promise<boolean> {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      return outcome === 'accepted';
    }
    return false;
  }

  public async clearAppData(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    if ('indexedDB' in window) {
      const databases = await (window as any).indexedDB.databases();
      databases.forEach((db: any) => {
        (window as any).indexedDB.deleteDatabase(db.name);
      });
    }
    
    localStorage.clear();
    sessionStorage.clear();
  }

  // Test function to verify service worker is working
  public async testServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          console.log('PWA: Service worker test - Registration found:', registration);
          console.log('PWA: Service worker test - Active worker:', registration.active);
          console.log('PWA: Service worker test - Waiting worker:', registration.waiting);
          console.log('PWA: Service worker test - Installing worker:', registration.installing);
          return true;
        } else {
          console.log('PWA: Service worker test - No registration found');
          return false;
        }
      } catch (error) {
        console.error('PWA: Service worker test failed:', error);
        return false;
      }
    } else {
      console.log('PWA: Service worker test - Service Worker not supported');
      return false;
    }
  }
}

// Create singleton instance
const pwaManager = new PWAManager();

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  pwaManager['deferredPrompt'] = e;
});

export default pwaManager;
