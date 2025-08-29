import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Home, Heart, Menu, LogOut } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { wishlistApi } from '@/lib/wishlistApi';
import { dashboardApi } from '@/lib/api';

export const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  // Check if user is logged in
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token');
  const token = localStorage.getItem('token');

  // Verify admin access with backend
  const { data: adminStatus, isLoading: adminLoading } = useQuery({
    queryKey: ['bottomnav-admin-verification'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return { isAdmin: false };
      }
      
      // Check if user has admin role from localStorage first
      try {
        const userInfo = JSON.parse(localStorage.getItem('user') || 'null');
        if (userInfo?.role === 'admin') {
          // Only try dashboard API if user has admin role
          try {
            await dashboardApi.getOverview(token);
            return { isAdmin: true };
          } catch (error: any) {
            console.log('Dashboard API check failed:', error.message);
            return { isAdmin: false };
          }
        }
        return { isAdmin: false };
      } catch (error) {
        return { isAdmin: false };
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user, // Only run if user is logged in
  });

  // Fetch wishlist count
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist', token],
    queryFn: async () => {
      if (!token) return { wishlist: [] };
      const res = await wishlistApi.getWishlist(token);
      return res;
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const wishlistCount = wishlistData?.wishlist?.length || 0;

  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cart-updated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('cart-updated', update);
    };
  }, []);

  // Handle user state changes
  useEffect(() => {
    // Try to get user from localStorage (token and user info)
    const token = localStorage.getItem('token');
    let userInfo = null;
    try {
      userInfo = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {}
    if (token && userInfo) {
      setUser(userInfo);
    } else {
      setUser(null);
    }
    // Listen for login/logout events
    const handleAuth = () => {
      let u = null;
      try { u = JSON.parse(localStorage.getItem('user') || 'null'); } catch {}
      setUser(u);
    };
    window.addEventListener('login', handleAuth);
    window.addEventListener('logout', handleAuth);
    return () => {
      window.removeEventListener('login', handleAuth);
      window.removeEventListener('logout', handleAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('notifications');
    // Dispatch cart-updated event to update cart notification icons
    window.dispatchEvent(new Event('cart-updated'));
    window.dispatchEvent(new Event('logout'));
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Home */}
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive('/') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{t('navigation.home')}</span>
          </button>

          {/* Search */}
          <button
            onClick={() => navigate('/products')}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive('/products') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{t('navigation.products')}</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate('/cart')}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${
              isActive('/cart') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 mb-1" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{t('navigation.cart')}</span>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => navigate('/wishlist')}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${
              isActive('/wishlist') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="relative">
              <Heart className="h-5 w-5 mb-1" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{t('navigation.wishlist')}</span>
          </button>

          {/* User Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive('/account') || isActive('/dashboard') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{t('navigation.profile')}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-lg shadow-xl p-4">
            <div className="space-y-2">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      navigate('/account');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>{t('navigation.profile')}</span>
                  </button>
                  {adminStatus?.isAdmin && (
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Menu className="h-5 w-5" />
                      <span>{t('navigation.dashboard')}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>{t('navigation.logout')}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>{t('navigation.login')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
