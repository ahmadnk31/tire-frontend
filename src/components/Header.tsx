import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, Bell, X, LogOut, Settings, Heart, UserCircle, List, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SearchBar } from "@/components/store/SearchBar";
import { MegaMenu } from "@/components/MegaMenu";


export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = location.pathname.startsWith('/dashboard') ? 'dashboard' : 'store';
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  // User state
  const [user, setUser] = useState<any>(null);

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchExpanded(false);
    // Also update user state on route change
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
  }, [location]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setIsSearchExpanded(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-2 md:px-4">
        <div className="w-full flex flex-col">
        {/* Top bar (Download app, links) - Hidden on mobile */}
        <div className="w-full border-b border-gray-100 bg-white hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-end text-xs text-gray-500 py-1 gap-4">
            <span>Download Ariana App</span>
            <div className="flex-1" />
            <a href="#" className="hover:underline"></a>
            <a href="#" className="hover:underline">About Ariana</a>
            <a href="#" className="hover:underline">Ariana Plus</a>
            <a href="#" className="hover:underline">Promo</a>
            {!user && (
              <>
                <span className="mx-2">|</span>
                <button onClick={() => navigate('/register')} className="font-semibold text-gray-900 hover:underline bg-transparent border-none cursor-pointer">Sign Up</button>
                <button onClick={() => navigate('/login')} className="font-semibold text-gray-900 hover:underline bg-transparent border-none cursor-pointer">Login</button>
              </>
            ) }
          </div>
        </div>

        {/* Main navbar */}
        <div className="w-full bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Desktop Layout */}
            <div className="hidden md:flex w-full items-center h-20 justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href="/">
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">
                    <img src="/logo.png" className="h-24" alt="Ariana Bandencentraal" />
                  </span>
                </a>
              </div>
              
              {/* Center: SearchBar */}
              <div className="flex-1 flex justify-center items-center min-w-0 max-w-2xl mx-8">
                <SearchBar />
              </div>
              
              {/* Actions right */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <button
                  className="relative p-2 rounded-full hover:bg-gray-100 transition"
                  onClick={() => navigate('/cart')}
                  aria-label="Cart"
                >
                  <ShoppingCart className="h-6 w-6 text-gray-400" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5  rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button className="relative p-2 rounded-full hover:bg-gray-100 transition" aria-label="Notifications">
                  <Bell className="h-6 w-6 text-gray-400" />
                </button>
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="ml-2 p-0 bg-transparent border-none cursor-pointer">
                        <Avatar>
                          <AvatarFallback>{user.name ? user.name[0] : <UserCircle className="w-6 h-6" />}</AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate('/account')}>
                        <User className="w-4 h-4 mr-2" /> Account
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/orders')}>
                        <List className="w-4 h-4 mr-2" /> Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                        <Heart className="w-4 h-4 mr-2" /> Wishlist
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Settings className="w-4 h-4 mr-2" /> Settings
                      </DropdownMenuItem>
                      {/* Dashboard - only for admin users */}
                      {user && user.role === 'admin' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                            <BarChart3 className="w-4 h-4 mr-2" /> Dashboard
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          setUser(null);
                          window.dispatchEvent(new Event('logout'));
                          navigate('/login');
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* MegaMenu under navbar (desktop only) */}
            <div className="hidden md:block w-full">
              <MegaMenu />
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
              {/* Mobile Header Row */}
              <div className="flex items-center h-16  justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href="/" className="flex items-center">
                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                       <img src="/logo.png" className="h-20" alt="Ariana Bandencentraal" />
                    </span>
                  </a>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center gap-2">
                  {/* Search Toggle */}
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5 text-gray-400" />
                  </button>

                  {/* Cart */}
                  <button
                    className="relative p-2 rounded-full hover:bg-gray-100 transition"
                    onClick={() => navigate('/cart')}
                    aria-label="Cart"
                  >
                    <ShoppingCart className="h-5 w-5 text-gray-400" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold border-2 border-white p-2">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications */}
                  <button className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Notifications">
                    <Bell className="h-5 w-5 text-gray-400" />
                  </button>

                  {/* Mobile Menu Toggle */}
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Menu"
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Menu className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Mobile Search */}
              {isSearchExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                  <div className="pt-4">
                    <SearchBar />
                  </div>
                </div>
              )}

              {/* Mobile Menu Dropdown */}
              {isMobileMenuOpen && (
                <div className="border-t border-gray-100 bg-white shadow-lg">
                  <div className="px-4 py-4 space-y-3">
                    {/* Top bar links for mobile */}
                    <div className="space-y-2 pb-3 border-b border-gray-100">
                      <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 py-1">
                        Download Ariana App
                      </a>
                      <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 py-1">
                        About Ariana
                      </a>
                      <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 py-1">
                        Ariana Plus
                      </a>
                      <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 py-1">
                        Promo
                      </a>
                    </div>
                    
                    {/* Auth links - only show if user is NOT signed in */}
                    {!user && (
                      <div className="space-y-2 pb-3 border-b border-gray-100">
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }} className="block w-full text-left text-sm font-semibold text-gray-900 hover:text-gray-700 py-2 bg-transparent border-none cursor-pointer">
                          Sign Up
                        </button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="block w-full text-left text-sm font-semibold text-gray-900 hover:text-gray-700 py-2 bg-transparent border-none cursor-pointer">
                          Login
                        </button>
                      </div>
                    )}

                    {/* User menu items - only show if user IS signed in */}
                    {user && (
                      <div className="space-y-2 pb-3 border-b border-gray-100">
                        {/* User info */}
                        <div className="flex items-center gap-3 py-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-sm">{user.name ? user.name[0] : <UserCircle className="w-4 h-4" />}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user.name || 'User'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        
                        {/* User menu items */}
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/account'); }} className="flex items-center gap-3 w-full text-left text-sm text-gray-900 hover:text-gray-700 py-2 bg-transparent border-none cursor-pointer">
                          <User className="w-4 h-4" />
                          Account
                        </button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/orders'); }} className="flex items-center gap-3 w-full text-left text-sm text-gray-900 hover:text-gray-700 py-2 bg-transparent border-none cursor-pointer">
                          <List className="w-4 h-4" />
                          Orders
                        </button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/wishlist'); }} className="flex items-center gap-3 w-full text-left text-sm text-gray-900 hover:text-gray-700 py-2 bg-transparent border-none cursor-pointer">
                          <Heart className="w-4 h-4" />
                          Wishlist
                        </button>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/settings'); }} className="flex items-center gap-3 w-full text-left text-sm text-gray-900 hover:text-gray-700 py-2 bg-transparent border-none cursor-pointer">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        {/* Dashboard - only for admin users */}
                        {user && user.role === 'admin' && (
                          <button onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }} className="flex items-center gap-3 w-full text-left text-sm text-gray-900 hover:text-gray-700 py-2 bg-transparent border-none cursor-pointer">
                            <BarChart3 className="w-4 h-4" />
                            Dashboard
                          </button>
                        )}
                        <button 
                          onClick={() => { 
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            setUser(null);
                            window.dispatchEvent(new Event('logout'));
                            setIsMobileMenuOpen(false);
                            navigate('/login');
                          }} 
                          className="flex items-center gap-3 w-full text-left text-sm text-red-600 hover:text-red-700 py-2 bg-transparent border-none cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </header>
    </>
  );
};