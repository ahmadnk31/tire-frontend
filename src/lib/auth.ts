// Authentication utilities with 2-hour session timeout

// JWT token interface
interface DecodedToken {
  id: number;
  role: string;
  iat: number;
  exp: number;
}

// Helper to decode JWT token (without verification - just for expiration check)
function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

// Get time until token expires (in seconds)
export function getTokenTimeToExpiry(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, decoded.exp - currentTime);
}

// Logout function that clears all auth data
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  
  // Dispatch logout event
  window.dispatchEvent(new Event('logout'));
  
  // Redirect to login page
  window.location.href = '/login';
}

// Check if user is authenticated with valid token
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  if (isTokenExpired(token)) {
    logout();
    return false;
  }
  
  return true;
}

// Get authenticated user info
export function getAuthenticatedUser(): any {
  if (!isAuthenticated()) return null;
  
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

// Setup automatic token expiration check
export function setupTokenExpirationCheck(): void {
  // Check every minute
  const checkInterval = setInterval(() => {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      clearInterval(checkInterval);
      logout();
    }
  }, 60000); // Check every 60 seconds
  
  // Warning notification 10 minutes before expiration
  const warningInterval = setInterval(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const timeToExpiry = getTokenTimeToExpiry(token);
      
      // Show warning if less than 10 minutes remaining
      if (timeToExpiry > 0 && timeToExpiry <= 600) {
        const minutes = Math.ceil(timeToExpiry / 60);
        
        // Show notification (you can replace this with a proper toast/modal)
        if (window.confirm(`Your session will expire in ${minutes} minute(s). Would you like to extend your session?`)) {
          // Redirect to a page that requires authentication to refresh token
          window.location.href = '/account';
        }
        
        clearInterval(warningInterval);
      }
    }
  }, 30000); // Check every 30 seconds for warning
  
  // Store intervals so they can be cleared if needed
  (window as any).authIntervals = { checkInterval, warningInterval };
}

// Clear token expiration intervals
export function clearTokenExpirationCheck(): void {
  const intervals = (window as any).authIntervals;
  if (intervals) {
    clearInterval(intervals.checkInterval);
    clearInterval(intervals.warningInterval);
    delete (window as any).authIntervals;
  }
}

// Enhanced token storage with expiration tracking
export function setAuthToken(token: string, user: any): void {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Store additional user info for convenience
  localStorage.setItem('userId', user.id.toString());
  localStorage.setItem('userEmail', user.email);
  localStorage.setItem('userName', user.name);
  
  // Dispatch login event
  window.dispatchEvent(new Event('login'));
  
  // Setup automatic expiration check
  setupTokenExpirationCheck();
}

// Auto-logout on token expiration - call this once on app initialization
export function initializeAuthWatcher(): void {
  // Check authentication status on page load
  isAuthenticated();
  
  // Setup token expiration checking
  setupTokenExpirationCheck();
  
  // Listen for storage changes (useful for multi-tab scenarios)
  window.addEventListener('storage', (e) => {
    if (e.key === 'token' && !e.newValue) {
      // Token was removed in another tab
      clearTokenExpirationCheck();
      window.location.href = '/login';
    }
  });
  
  // Listen for beforeunload to clear intervals
  window.addEventListener('beforeunload', () => {
    clearTokenExpirationCheck();
  });
}
