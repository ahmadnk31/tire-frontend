import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Home, Heart, Menu, LogOut } from "lucide-react";
import { useTranslation } from 'react-i18next';

export const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  // Check if user is logged in
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token');

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



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('notifications');
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
              isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{t('navigation.home')}</span>
          </button>

          {/* Search */}
          <button
            onClick={() => navigate('/products')}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive('/products') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{t('navigation.products')}</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate('/cart')}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${
              isActive('/cart') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
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
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive('/wishlist') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Heart className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{t('navigation.wishlist')}</span>
          </button>



          {/* Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isMenuOpen ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Menu className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-xl rounded-t-2xl">
            <div className="p-4 space-y-4">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/categories'); }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">C</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{t('navigation.categories')}</div>
                    <div className="text-xs text-gray-500">Browse categories</div>
                  </div>
                </button>
                
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/brands'); }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">B</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{t('navigation.brands')}</div>
                    <div className="text-xs text-gray-500">View brands</div>
                  </div>
                </button>
                
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/sale'); }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">S</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{t('navigation.sale')}</div>
                    <div className="text-xs text-gray-500">Special offers</div>
                  </div>
                </button>
                
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/new-arrivals'); }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">N</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{t('navigation.newArrivals')}</div>
                    <div className="text-xs text-gray-500">Latest products</div>
                  </div>
                </button>
              </div>

              {/* Account Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">Account</div>
                    <div className="text-xs text-gray-500">Manage your account</div>
                  </div>
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/account'); }}
                    className="text-blue-600 text-sm font-medium"
                  >
                    View
                  </button>
                </div>
                
                {/* Logout Button */}
                {isLoggedIn && (
                  <button
                    onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors mt-2"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-red-900">Logout</div>
                      <div className="text-xs text-red-600">Sign out of your account</div>
                    </div>
                  </button>
                )}
              </div>

              {/* Support & Info */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/contact'); }}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-600 text-xs">📞</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{t('navigation.contact')}</span>
                </button>
                
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/faq'); }}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-600 text-xs">❓</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{t('navigation.faq')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* No automatic padding - let pages handle their own spacing */}
    </>
  );
};
