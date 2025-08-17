import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardOverview } from "./DashboardOverview";
import { ProductManagement } from "./ProductManagement";
import { AddProduct } from "./AddProduct";
import { OrdersManagement } from "./OrdersManagement";
import { CustomersManagement } from "./CustomersManagement";
import { SecurityManagement } from "./SecurityManagement";
import BulkImport from "./BulkImport";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Package, Plus, Settings, Users, ShoppingCart, Shield, Upload } from "lucide-react";

import { CategoryManagement } from "./CategoryManagement";
import { BannerManagement } from './BannerManagement';
type DashboardView = 'overview' | 'products' | 'add-product' | 'orders' | 'customers' | 'security' | 'settings' | 'categories' | 'banners' | 'bulk-import';

const navigation = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Settings },
  { id: 'banners', label: 'Banners', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: '12' },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'bulk-import', label: 'Bulk Import', icon: Upload },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Dashboard = () => {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check user role from localStorage
    const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
    if (!user || user.role !== 'admin') {
      setAllowed(false);
      setTimeout(() => navigate('/login'), 1200);
    } else {
      setAllowed(true);
    }
  }, [navigate]);

  const renderContent = () => {
    if (allowed === false) {
      return <div className="text-center py-12 text-red-500 font-semibold text-xl">Not allowed. Redirecting...</div>;
    }
    if (allowed === null) {
      return <div className="text-center py-12 text-primary animate-pulse">Checking permissions...</div>;
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
      case 'security':
        return <SecurityManagement />;
      case 'bulk-import':
        return <BulkImport />;
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r min-h-screen p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentView(item.id as DashboardView)}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge className="ml-auto bg-accent text-accent-foreground">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="pt-6 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setCurrentView('add-product')}
                >
                  <Plus className="h-4 w-4 mr-3" />
                  Add Product
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setCurrentView('bulk-import')}
                >
                  <Upload className="h-4 w-4 mr-3" />
                  Bulk Import
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};