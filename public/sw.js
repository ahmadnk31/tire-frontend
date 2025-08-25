// Cache version should be updated with each deployment
const CACHE_VERSION = '2025-08-25T09-12-10'; // Update this version number with each deployment
const CACHE_NAME = `ariana-tires-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `ariana-tires-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `ariana-tires-dynamic-v${CACHE_VERSION}`;

// Build timestamp for additional cache busting
const BUILD_TIMESTAMP = 1756113130836;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/products',
  '/cart',
  '/account',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/logo.png',
  '/site.webmanifest'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/banners/
];

// Install event - cache static assets and force update
self.addEventListener('install', (event) => {
  console.log(`Service Worker: Installing version ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting to activate immediately');
        return self.skipWaiting(); // Force the waiting service worker to become active
      })
      .catch((error) => {
        console.error('Service Worker: Cache installation failed:', error);
      })
  );
});

// Activate event - clean up ALL old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log(`Service Worker: Activating version ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('Service Worker: Found caches:', cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete any cache that doesn't match current version
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Taking control of all clients');
        return self.clients.claim(); // Take control of all clients immediately
      })
      .then(() => {
        // Notify all clients about the update
        return self.clients.matchAll({ includeUncontrolled: true });
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION,
            timestamp: BUILD_TIMESTAMP
          });
        });
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets and pages
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Check if this API endpoint should be cached
  const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  if (!shouldCache) {
    // For non-cacheable APIs (like auth, cart), always go to network
    try {
      return await fetch(request);
    } catch (error) {
      console.log('Service Worker: Network request failed for API:', url.pathname);
      return new Response(
        JSON.stringify({ error: 'Network unavailable', offline: true }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Network-first strategy for cacheable APIs
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for:', url.pathname);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Add offline indicator to cached response
      const responseData = await cachedResponse.json();
      return new Response(
        JSON.stringify({ ...responseData, offline: true }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Return offline message if no cache available
    return new Response(
      JSON.stringify({ error: 'Content unavailable offline', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses for static assets
    if (networkResponse.ok && request.url.startsWith(self.location.origin)) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Request failed:', request.url);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const cachedIndex = await caches.match('/');
      if (cachedIndex) {
        return cachedIndex;
      }
    }
    
    // Return a generic offline response
    return new Response(
      '<h1>Offline</h1><p>You are currently offline. Please check your internet connection.</p>',
      {
        status: 503,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-cart') {
    event.waitUntil(syncCartData());
  }
  
  if (event.tag === 'background-sync-wishlist') {
    event.waitUntil(syncWishlistData());
  }
});

// Sync cart data when back online
async function syncCartData() {
  try {
    // Get pending cart updates from IndexedDB or localStorage
    const pendingUpdates = JSON.parse(localStorage.getItem('pendingCartUpdates') || '[]');
    
    for (const update of pendingUpdates) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${update.token}`
          },
          body: JSON.stringify(update.data)
        });
      } catch (error) {
        console.log('Service Worker: Failed to sync cart update:', error);
        // Keep the update for next sync attempt
        continue;
      }
    }
    
    // Clear synced updates
    localStorage.removeItem('pendingCartUpdates');
    console.log('Service Worker: Cart data synced successfully');
  } catch (error) {
    console.error('Service Worker: Cart sync failed:', error);
  }
}

// Sync wishlist data when back online
async function syncWishlistData() {
  try {
    const pendingUpdates = JSON.parse(localStorage.getItem('pendingWishlistUpdates') || '[]');
    
    for (const update of pendingUpdates) {
      try {
        await fetch('/api/wishlist', {
          method: update.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${update.token}`
          },
          body: JSON.stringify(update.data)
        });
      } catch (error) {
        console.log('Service Worker: Failed to sync wishlist update:', error);
        continue;
      }
    }
    
    localStorage.removeItem('pendingWishlistUpdates');
    console.log('Service Worker: Wishlist data synced successfully');
  } catch (error) {
    console.error('Service Worker: Wishlist sync failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'Check out our latest tire deals!',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Products',
        icon: '/android-chrome-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/android-chrome-192x192.png'
      }
    ]
  };

  if (event.data) {
    const pushData = event.data.json();
    options.body = pushData.body || options.body;
    options.data = pushData.data || options.data;
  }

  event.waitUntil(
    self.registration.showNotification('Ariana Bandencentraal', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/products')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
