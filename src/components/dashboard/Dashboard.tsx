import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DashboardOverview } from "./DashboardOverview";
import { ProductManagement } from "./ProductManagement";
import { AddProduct } from "./AddProduct";
import { OrdersManagement } from "./OrdersManagement";
import { CustomersManagement } from "./CustomersManagement";
import { SecurityManagement } from "./SecurityManagement";
import { SettingsManagement } from "./SettingsManagement";
import { UploadDiagnostics } from "./UploadDiagnostics";
import { ContactManagement } from "./ContactManagement";
import { NewsletterManagement } from "./NewsletterManagement";
import CampaignManagement from "./CampaignManagement";
import BulkImport from "./BulkImport";
import { ReviewsManagement } from "./ReviewsManagement";
import { BlogManagement } from "./BlogManagement";
import CommentsManagement from "./CommentsManagement";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Package, Plus, Settings, Users, ShoppingCart, Shield, Upload, Mail, MessageSquare, LogOut, Menu, X, Star, FileText, MessageCircle, Gauge } from "lucide-react";

import { CategoryManagement } from "./CategoryManagement";
import { BannerManagement } from './BannerManagement';
import RateLimitManagement from './RateLimitManagement';
type DashboardView = 'overview' | 'products' | 'add-product' | 'orders' | 'customers' | 'security' | 'settings' | 'categories' | 'banners' | 'bulk-import' | 'contacts' | 'newsletter' | 'campaigns' | 'upload-diagnostics' | 'reviews' | 'blog' | 'comments' | 'rate-limits';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

const navigation: NavigationItem[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Settings },
  { id: 'banners', label: 'Banners', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'comments', label: 'Comments', icon: MessageCircle },
  { id: 'contacts', label: 'Contacts', icon: MessageSquare },
  { id: 'newsletter', label: 'Newsletter', icon: Mail },
  { id: 'campaigns', label: 'Campaigns', icon: Mail },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'rate-limits', label: 'Rate Limits', icon: Gauge },
  { id: 'bulk-import', label: 'Bulk Import', icon: Upload },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'upload-diagnostics', label: 'Upload Diagnostics', icon: Upload },
];

export const Dashboard = () => {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verify admin access with backend
  const { data: adminStatus, isLoading, error } = useQuery({
    queryKey: ['admin-verification'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Try to access an admin-only endpoint to verify permissions
      try {
        await dashboardApi.getOverview(token);
        return { isAdmin: true };
      } catch (error: any) {
        if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
          return { isAdmin: false };
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (error) {
      console.error('Admin verification failed:', error);
      toast({
        title: 'Access Denied',
        description: 'You do not have administrator privileges.',
        variant: 'destructive',
      });
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [error, navigate, toast]);

  // Close sidebar on desktop and handle keyboard shortcuts
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('logout'));
    navigate('/login');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] lg:min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-primary animate-pulse">Verifying admin permissions...</p>
          </div>
        </div>
      );
    }
    
    if (error || !adminStatus?.isAdmin) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] lg:min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 text-4xl mb-4">🚫</div>
            <h2 className="text-xl lg:text-2xl font-semibold text-red-500 mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Redirecting to login...</p>
          </div>
        </div>
      );
    }
    switch (currentView) {
      case 'overview':
        return <DashboardOverview />;
      case 'products':
        return <ProductManagement />;
      case 'add-product':
        return <AddProduct />;
      case 'categories':
        return <CategoryManagement />;
      case 'banners':
        return <BannerManagement />;
      case 'orders':
        return <OrdersManagement />;
      case 'customers':
        return <CustomersManagement />;
      case 'reviews':
        return <ReviewsManagement />;
      case 'blog':
        return <BlogManagement />;
      case 'contacts':
        return <ContactManagement />;
      case 'newsletter':
        return <NewsletterManagement />;
      case 'campaigns':
        return <CampaignManagement />;
      case 'security':
        return <SecurityManagement />;
      case 'rate-limits':
        return <RateLimitManagement />;
      case 'bulk-import':
        return <BulkImport />;
      case 'settings':
        return <SettingsManagement />;
      case 'upload-diagnostics':
        return <UploadDiagnostics />;
      case 'comments':
        return <CommentsManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleLogout}
          className="flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:min-h-screen p-4 lg:p-6
        `}>
          {/* Mobile close button */}
          <div className="lg:hidden flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
            </div>
            
            <nav className="space-y-1 lg:space-y-2">
              {navigation.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className="w-full justify-start text-sm lg:text-base"
                  onClick={() => {
                    setCurrentView(item.id as DashboardView);
                    setSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                >
                  <item.icon className="h-4 w-4 mr-2 lg:mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-auto bg-accent text-accent-foreground text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="pt-4 lg:pt-6 border-t">
              <h3 className="text-xs lg:text-sm font-medium text-muted-foreground mb-2 lg:mb-3 uppercase tracking-wide">
                Quick Actions
              </h3>
              <div className="space-y-1 lg:space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    setCurrentView('add-product');
                    setSidebarOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2 lg:mr-3" />
                  <span className="truncate">Add Product</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    setCurrentView('bulk-import');
                    setSidebarOpen(false);
                  }}
                >
                  <Upload className="h-4 w-4 mr-2 lg:mr-3" />
                  <span className="truncate">Bulk Import</span>
                </Button>
              </div>
            </div>

            {/* Logout - Hidden on mobile as it's in header */}
            <div className="hidden lg:block pt-4 lg:pt-6 border-t">
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8 min-w-0">
          {/* Mobile breadcrumb */}
          <div className="lg:hidden mb-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Dashboard</span>
              <span>/</span>
              <span className="font-medium text-foreground">
                {navigation.find(item => item.id === currentView)?.label || 'Overview'}
              </span>
            </div>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};