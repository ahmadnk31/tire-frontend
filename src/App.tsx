import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import './i18n'; // Initialize i18n
import { Analytics } from "@vercel/analytics/react"
import Index from "./pages/Index";
import Footer from "@/components/Footer";
import NotFound from "./pages/NotFound";
import ProductPage from "./pages/Product";
import Products from "./pages/Products";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Dashboard } from "@/components/dashboard/Dashboard";
import CartPage from "./pages/Cart";
import Login from "./pages/Login";
import EmailNotVerified from "./pages/EmailNotVerified";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import ForgotPassword from "./pages/ForgotPassword";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Settings from "./pages/Settings";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import About from "./pages/About";
import SizeGuide from "./pages/SizeGuide";
import Contact from "./pages/Contact";
import Unsubscribe from "./pages/Unsubscribe";
import FAQ from "./pages/FAQ";
import Returns from "./pages/Returns";
import Shipping from "./pages/Shipping";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Sustainability from "./pages/Sustainability";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Accessibility from "./pages/Accessibility";
import Sitemap from "./pages/Sitemap";
import Brands from "./pages/Brands";
import NewArrivals from "./pages/NewArrivals";
import Sale from "./pages/Sale";
import Categories from "./pages/Categories";
import { PWAUpdateNotification } from '@/components/PWAUpdateNotification';
import pwaManager from '@/lib/pwa';

// Test service worker on app load (without causing infinite refresh)
if (typeof window !== 'undefined') {
  // Test service worker after a delay to avoid interfering with initial load
  setTimeout(() => {
    pwaManager.testServiceWorker().then((isWorking) => {
      console.log('🔧 PWA Test Result:', isWorking ? '✅ Service Worker Working' : '❌ Service Worker Not Working');
    });
  }, 5000); // Increased delay to 5 seconds
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache for 10 minutes (was cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
  },
});


const AppContent = () => {
  const location = useLocation();
  
  // Define auth routes that should not show header/footer
  const authRoutes = ['/login', '/register', '/forgot-password', '/email-not-verified', '/verify'];
  const isAuthRoute = authRoutes.includes(location.pathname);
  
  return (
    <>
      <ScrollToTop />
      {!isAuthRoute && <Header />}
      {!isAuthRoute && <Breadcrumbs />}
      {!isAuthRoute && <BottomNav />}
      {!isAuthRoute && <ScrollToTopButton />}
      <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products/:slug" element={<ProductPage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/email-not-verified" element={<EmailNotVerified />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/about" element={<About />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/sale" element={<Sale />} />
            <Route path="/categories" element={<Categories />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {!isAuthRoute && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Analytics />
          <Toaster />
          <Sonner />
          <PWAUpdateNotification />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
