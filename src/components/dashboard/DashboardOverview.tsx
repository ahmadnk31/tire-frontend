import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ShoppingCart, Package, Users, DollarSign, AlertTriangle, Loader2, Mail, MessageSquare } from "lucide-react";
import { getDashboardOverview, getRecentOrders, getLowStockProducts, type DashboardOverview as DashboardOverviewType } from "@/lib/api/dashboard";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  orders: {
    today: number;
    change: number;
    trend: 'up' | 'down';
  };
  customers: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  products: {
    inStock: number;
    change: number;
    trend: 'up' | 'down';
  };
  contacts: {
    total: number;
    pending: number;
    change: number;
    trend: 'up' | 'down';
  };
  newsletter: {
    total: number;
    active: number;
    change: number;
    trend: 'up' | 'down';
  };
}

interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  status: string;
  amount: string;
  date: string;
}

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  severity: string;
}

export const DashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const [overviewResponse, ordersData, stockData] = await Promise.all([
          getDashboardOverview(token || ''),
          getRecentOrders(token || ''),
          getLowStockProducts(token || '')
        ]);
        
        console.log('Dashboard API responses:', { overviewResponse, ordersData, stockData });
        // Defensive: check for error or missing fields
        if (!overviewResponse || typeof overviewResponse !== 'object') {
          throw new Error('No dashboard overview data received');
        }
        
        if (overviewResponse.totalRevenue === undefined) {
          console.warn('Missing totalRevenue in overview response');
        }
        if (overviewResponse.totalOrders === undefined) {
          console.warn('Missing totalOrders in overview response');  
        }
        if (overviewResponse.totalUsers === undefined) {
          console.warn('Missing totalUsers in overview response');
        }
        setStats({
          revenue: {
            total: overviewResponse.totalRevenue || 0,
            change: overviewResponse.newRevenue || 0,
            trend: (overviewResponse.newRevenue || 0) > 0 ? 'up' : 'down',
          },
          orders: {
            today: overviewResponse.totalOrders || 0,
            change: overviewResponse.newOrders || 0,
            trend: (overviewResponse.newOrders || 0) > 0 ? 'up' : 'down',
          },
          customers: {
            total: overviewResponse.totalUsers || 0,
            change: overviewResponse.newUsers || 0,
            trend: (overviewResponse.newUsers || 0) > 0 ? 'up' : 'down',
          },
          products: {
            inStock: overviewResponse.totalProducts || 0,
            change: 0,
            trend: 'up',
          },
          contacts: {
            total: overviewResponse.totalContacts || 0,
            pending: overviewResponse.pendingContacts || 0,
            change: overviewResponse.newContacts || 0,
            trend: (overviewResponse.newContacts || 0) > 0 ? 'up' : 'down',
          },
          newsletter: {
            total: overviewResponse.totalSubscriptions || 0,
            active: overviewResponse.activeSubscriptions || 0,
            change: overviewResponse.newSubscriptions || 0,
            trend: (overviewResponse.newSubscriptions || 0) > 0 ? 'up' : 'down',
          },
        });
        setRecentOrders(Array.isArray(ordersData?.orders) ? ordersData.orders : []);
        setLowStockItems(Array.isArray(stockData?.products) ? stockData.products : []);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: error?.message || "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
        setStats(null);
        setRecentOrders([]);
        setLowStockItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Unable to load dashboard</h2>
        <p className="text-muted-foreground">Please refresh the page to try again.</p>
      </div>
    );
  }

  const statsArray = [
    {
      title: "Total Revenue",
      value: `$${stats.revenue.total.toFixed(2)}`,
      change: `+$${stats.revenue.change.toFixed(2)} this week`,
      icon: DollarSign,
      trend: stats.revenue.trend
    },
    {
      title: "Total Orders", 
      value: stats.orders.today.toString(),
      change: `+${stats.orders.change} this week`,
      icon: ShoppingCart,
      trend: stats.orders.trend
    },
    {
      title: "Total Customers",
      value: stats.customers.total.toLocaleString(),
      change: `+${stats.customers.change} new this week`,
      icon: Users,
      trend: stats.customers.trend
    },
    {
      title: "Total Products",
      value: stats.products.inStock.toLocaleString(),
      change: `${stats.products.change > 0 ? '+' : ''}${stats.products.change}%`,
      icon: Package,
      trend: stats.products.trend
    },
    {
      title: "Total Contacts",
      value: stats.contacts.total.toLocaleString(),
      subtitle: `${stats.contacts.pending} pending`,
      change: `+${stats.contacts.change} this week`,
      icon: MessageSquare,
      trend: stats.contacts.trend
    },
    {
      title: "Newsletter Subscribers",
      value: stats.newsletter.total.toLocaleString(),
      subtitle: `${stats.newsletter.active} active`,
      change: `+${stats.newsletter.change} this week`,
      icon: Mail,
      trend: stats.newsletter.trend
    }
  ];
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statsArray.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  {(stat as any).subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">{(stat as any).subtitle}</p>
                  )}
                  <div className="flex items-center mt-2">
                    <TrendingUp className={`h-4 w-4 mr-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                    <p className="text-sm">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.amount}</p>
                    <Badge 
                      variant={
                        order.status === 'completed' ? 'default' :
                        order.status === 'processing' ? 'secondary' :
                        order.status === 'shipped' ? 'outline' : 'destructive'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="p-4 rounded-lg border border-orange-200 bg-orange-50">
                  <p className="font-medium text-sm">{item.name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground">
                      Stock: {item.stock} / Threshold: {item.threshold}
                    </span>
                    <Badge 
                      variant={item.severity === 'critical' ? 'destructive' : 'secondary'}
                      className={item.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'}
                    >
                      {item.severity === 'critical' ? 'Critical' : 'Low Stock'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};