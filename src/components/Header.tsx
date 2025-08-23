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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchBar } from "@/components/store/SearchBar";
import { MegaMenu } from "@/components/MegaMenu";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTranslation } from 'react-i18next';
import { getNotifications } from '@/lib/notifications';


export const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = location.pathname.startsWith('/dashboard') ? 'dashboard' : 'store';
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
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

  // Load notifications
  useEffect(() => {
    const loadNotifications = () => {
      setNotifications(getNotifications());
    };
    loadNotifications();
    
    // Listen for notification updates
    window.addEventListener('notifications-updated', loadNotifications);
    return () => {
      window.removeEventListener('notifications-updated', loadNotifications);
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
            <span>{t('header.downloadApp')}</span>
            <div className="flex-1" />
            <a href="#" className="hover:underline">{t('header.about')}</a>
            <a href="#" className="hover:underline">{t('header.plus')}</a>
            <a href="#" className="hover:underline">{t('header.promo')}</a>
            {!user && (
              <>
                <span className="mx-2">|</span>
                <button onClick={() => navigate('/register')} className="font-semibold text-gray-900 hover:underline bg-transparent border-none cursor-pointer">{t('auth.signUp')}</button>
                <button onClick={() => navigate('/login')} className="font-semibold text-gray-900 hover:underline bg-transparent border-none cursor-pointer">{t('auth.loginButton')}</button>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      className="relative p-2 rounded-full hover:bg-gray-100 transition" 
                      aria-label="Notifications"
                    >
                      <Bell className="h-6 w-6 text-gray-400" />
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
                          {notifications.length > 9 ? '9+' : notifications.length}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{t('navigation.notifications')}</h3>
                        <button
                          onClick={() => {
                            setNotifications([]);
                            localStorage.removeItem('notifications');
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Clear All
                        </button>
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {notifications.map((notification, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'sale' ? 'bg-red-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {notification.message}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.timestamp).toLocaleDateString()}
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  const updatedNotifications = notifications.filter((_, i) => i !== index);
                                  setNotifications(updatedNotifications);
                                  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
                                }} 
                                className="text-gray-400 hover:text-gray-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <LanguageSwitcher />
                {user ? (
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
                        <User className="w-4 h-4 mr-2" /> {t('navigation.account')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/orders')}>
                        <List className="w-4 h-4 mr-2" /> {t('navigation.orders')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                        <Heart className="w-4 h-4 mr-2" /> {t('navigation.wishlist')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Settings className="w-4 h-4 mr-2" /> {t('navigation.settings')}
                      </DropdownMenuItem>
                      {/* Dashboard - only for admin users */}
                      {user && user.role === 'admin' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                            <BarChart3 className="w-4 h-4 mr-2" /> {t('navigation.dashboard')}
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
                        <LogOut className="w-4 h-4 mr-2" /> {t('navigation.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="ml-2 p-0 bg-transparent border-none cursor-pointer">
                        <Avatar>
                          <AvatarFallback>
                            <UserCircle className="w-6 h-6 text-gray-400" />
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate('/login')}>
                        <User className="w-4 h-4 mr-2" /> {t('auth.loginButton')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/register')}>
                        <UserCircle className="w-4 h-4 mr-2" /> {t('auth.signUp')}
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

            {/* Mobile Layout - Simplified for Bottom Nav */}
            <div className="md:hidden">
              {/* Mobile Header Row */}
              <div className="flex items-center h-16 justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href="/" className="flex items-center">
                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                       <img src="/logo.png" className="h-20" alt="Ariana Bandencentraal" />
                    </span>
                  </a>
                </div>

                {/* Mobile Actions - Simplified */}
                <div className="flex items-center gap-2">
                  {/* Search Toggle */}
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5 text-gray-400" />
                  </button>

                  {/* Notifications */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="relative p-2 rounded-full hover:bg-gray-100 transition" 
                        aria-label="Notifications"
                      >
                        <Bell className="h-5 w-5 text-gray-400" />
                        {notifications.length > 0 && (
                          <span className="absolute -top-1 -right-1 px-1 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center border border-white">
                            {notifications.length > 9 ? '9+' : notifications.length}
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{t('navigation.notifications')}</h3>
                          <button
                            onClick={() => {
                              setNotifications([]);
                              localStorage.removeItem('notifications');
                            }}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Clear All
                          </button>
                        </div>
                        
                        {notifications.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No notifications yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {notifications.map((notification, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === 'sale' ? 'bg-red-500' : 'bg-blue-500'
                                }`} />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {notification.message}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.timestamp).toLocaleDateString()}
                                  </div>
                                </div>
                                <button 
                                  onClick={() => {
                                    const updatedNotifications = notifications.filter((_, i) => i !== index);
                                    setNotifications(updatedNotifications);
                                    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
                                  }} 
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* User Avatar - Mobile */}
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-0 bg-transparent border-none cursor-pointer">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-sm">{user.name ? user.name[0] : <UserCircle className="w-4 h-4" />}</AvatarFallback>
                          </Avatar>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate('/account')}>
                          <User className="w-4 h-4 mr-2" /> {t('navigation.account')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/orders')}>
                          <List className="w-4 h-4 mr-2" /> {t('navigation.orders')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                          <Heart className="w-4 h-4 mr-2" /> {t('navigation.wishlist')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/settings')}>
                          <Settings className="w-4 h-4 mr-2" /> {t('navigation.settings')}
                        </DropdownMenuItem>
                        {/* Dashboard - only for admin users */}
                        {user && user.role === 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                              <BarChart3 className="w-4 h-4 mr-2" /> {t('navigation.dashboard')}
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
                          <LogOut className="w-4 h-4 mr-2" /> {t('navigation.logout')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-0 bg-transparent border-none cursor-pointer">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-sm">
                              <UserCircle className="w-4 h-4 text-gray-400" />
                            </AvatarFallback>
                          </Avatar>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate('/login')}>
                          <User className="w-4 h-4 mr-2" /> {t('auth.loginButton')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/register')}>
                          <UserCircle className="w-4 h-4 mr-2" /> {t('auth.signUp')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  <LanguageSwitcher />
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


            </div>
          </div>
        </div>
      </div>
      </header>


    </>
  );
};