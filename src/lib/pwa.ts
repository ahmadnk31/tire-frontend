// PWA Utilities
class PWAManager {
  private deferredPrompt: any = null;
  private isInstalled = false;
  private isOnline = navigator.onLine;

  constructor() {
    this.init();
  }

  private async init() {
    // Register service worker
    await this.registerServiceWorker();
    
    // Setup PWA event listeners
    this.setupEventListeners();
    
    // Check if app is already installed
    this.checkInstallStatus();
    
    // Setup online/offline handling
    this.setupNetworkHandling();
  }

  private async registerServiceWorker() {
    // Temporarily disable service worker to fix checkout issues
    console.log('PWA: Service Worker registration disabled for checkout testing');
    return null;
    
    if ('serviceWorker' in navigator) {
      try {
        // First, unregister any existing service workers to avoid conflicts
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
        
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('PWA: Service Worker registered successfully:', registration);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('PWA: New service worker found, installing...');
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('PWA: New version available');
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

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
        
        return registration;
      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error);
        // Don't throw error, just log it to avoid breaking the app
      }
    }
  }

  private handleServiceWorkerUpdate(data: any) {
    console.log('PWA: Handling service worker update', data);
    // Force reload to use new version
    window.location.reload();
  }

  private setupEventListeners() {
    // Listen for app install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt triggered');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallBanner();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.isInstalled = true;
      this.hideInstallBanner();
      this.showInstallSuccess();
    });

    // Handle navigation changes for better UX
    if ('navigation' in window) {
      // @ts-ignore
      window.navigation.addEventListener('navigate', (e) => {
        // Add loading states, transitions, etc.
        this.handleNavigation(e);
      });
    }
  }

  private checkInstallStatus() {
    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.matchMedia('(display-mode: fullscreen)').matches ||
        // @ts-ignore
        window.navigator.standalone === true) {
      this.isInstalled = true;
      document.body.classList.add('pwa-installed');
    }
  }

  private setupNetworkHandling() {
    // Online/offline event listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatus();
      console.log('PWA: App is online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOfflineStatus();
      console.log('PWA: App is offline');
    });

    // Initial status
    if (!this.isOnline) {
      this.handleOfflineStatus();
    }
  }

  public async installApp() {
    if (!this.deferredPrompt) {
      console.log('PWA: Install prompt not available');
      return false;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted install prompt');
        this.deferredPrompt = null;
        return true;
      } else {
        console.log('PWA: User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Install failed:', error);
      return false;
    }
  }

  private showInstallBanner() {
    // Create install banner
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed bottom-4 left-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
    banner.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
          📱
        </div>
        <div>
          <div class="font-semibold">Install Ariana Tires</div>
          <div class="text-sm opacity-90">Get the full app experience</div>
        </div>
      </div>
      <div class="flex space-x-2">
        <button id="pwa-install-btn" class="bg-primary-foreground text-primary px-4 py-2 rounded-md text-sm font-medium">
          Install
        </button>
        <button id="pwa-dismiss-btn" class="text-primary-foreground/80 hover:text-primary-foreground px-2">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('pwa-install-btn')?.addEventListener('click', () => {
      this.installApp();
    });

    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }

  private hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  private showInstallSuccess() {
    // Show success message
    this.showToast('App installed successfully! 🎉', 'success');
  }

  private showUpdateAvailable() {
    // Remove any existing update banner
    const existingBanner = document.getElementById('pwa-update-banner');
    if (existingBanner) {
      existingBanner.remove();
    }

    // Show update banner
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.className = 'fixed top-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between animate-in slide-in-from-top duration-300';
    banner.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-spin">
          🔄
        </div>
        <div>
          <div class="font-semibold">New Version Available!</div>
          <div class="text-sm opacity-90">Update now to get the latest features</div>
        </div>
      </div>
      <div class="flex space-x-2">
        <button id="pwa-update-btn" class="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
          Update Now
        </button>
        <button id="pwa-update-later-btn" class="text-white/80 hover:text-white px-2 text-sm">
          Later
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
      this.showToast('Updating app...', 'success');
      // Clear all caches first
      this.clearAllCaches().then(() => {
        window.location.reload();
      });
    });

    document.getElementById('pwa-update-later-btn')?.addEventListener('click', () => {
      banner.remove();
    });

    // Auto-hide after 30 seconds if no action
    setTimeout(() => {
      if (document.getElementById('pwa-update-banner')) {
        banner.remove();
      }
    }, 30000);
  }

  private async clearAllCaches() {
    try {
      const cacheNames = await caches.keys();
      console.log('PWA: Clearing caches:', cacheNames);
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('PWA: All caches cleared');
    } catch (error) {
      console.error('PWA: Failed to clear caches:', error);
    }
  }

  private handleOnlineStatus() {
    document.body.classList.remove('app-offline');
    document.body.classList.add('app-online');
    
    // Trigger background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        // @ts-ignore - Background Sync API may not be in all TypeScript definitions
        return registration.sync?.register('background-sync-cart');
      }).catch((error) => {
        console.log('PWA: Background sync registration failed:', error);
      });
    }

    this.showToast('Back online! Data syncing...', 'success');
  }

  private handleOfflineStatus() {
    document.body.classList.remove('app-online');
    document.body.classList.add('app-offline');
    
    this.showToast('You are offline. Some features may be limited.', 'warning');
  }

  private handleNavigation(event: any) {
    // Add loading indicator for navigation
    document.body.classList.add('navigating');
    
    // Remove after a short delay (page should load quickly with caching)
    setTimeout(() => {
      document.body.classList.remove('navigating');
    }, 500);
  }

  private showToast(message: string, type: 'success' | 'warning' | 'error' = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transition-all duration-300 ${
      type === 'success' ? 'bg-green-600' : 
      type === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    toast.style.transform = 'translateX(-50%) translateY(100px)';

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Public methods
  public getInstallStatus() {
    return this.isInstalled;
  }

  public getOnlineStatus() {
    return this.isOnline;
  }

  public canInstall() {
    return !!this.deferredPrompt;
  }

  public async forceUpdate() {
    console.log('PWA: Force updating app...');
    await this.clearAllCaches();
    
    // Unregister service worker and re-register
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }
    
    // Reload the page
    window.location.reload();
  }

  public async clearAppData() {
    console.log('PWA: Clearing all app data...');
    
    // Clear caches
    await this.clearAllCaches();
    
    // Clear local storage
    localStorage.clear();
    
    // Clear session storage
    sessionStorage.clear();
    
    // Clear IndexedDB if used
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            return new Promise((resolve, reject) => {
              const deleteRequest = indexedDB.deleteDatabase(db.name!);
              deleteRequest.onsuccess = () => resolve(true);
              deleteRequest.onerror = () => reject(deleteRequest.error);
            });
          })
        );
      } catch (error) {
        console.error('PWA: Failed to clear IndexedDB:', error);
      }
    }
    
    this.showToast('App data cleared successfully', 'success');
  }
}

// Initialize PWA Manager
export const pwaManager = new PWAManager();

// Export for use in components
export default pwaManager;
