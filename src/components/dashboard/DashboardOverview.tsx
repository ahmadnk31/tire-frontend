import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ShoppingCart, Package, Users, DollarSign, AlertTriangle, Loader2 } from "lucide-react";
import { dashboardApi } from "@/lib/api";
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
        const [overviewData, ordersData, stockData] = await Promise.all([
          dashboardApi.getOverview(token),
          dashboardApi.getRecentOrders(token),
          dashboardApi.getLowStock(token)
        ]);
        // Defensive: check for error or missing fields
        if (
          !overviewData ||
          typeof overviewData !== 'object' ||
          overviewData.error ||
          overviewData.totalRevenue === undefined ||
          overviewData.totalOrders === undefined ||
          overviewData.totalUsers === undefined
        ) {
          throw new Error(overviewData?.error || 'Invalid dashboard overview data');
        }
        setStats({
          revenue: {
            total: overviewData.totalRevenue || 0,
            change: 0,
            trend: 'up',
          },
          orders: {
            today: overviewData.newOrders || 0,
            change: 0,
            trend: 'up',
          },
          customers: {
            total: overviewData.totalUsers || 0,
            change: 0,
            trend: 'up',
          },
          products: {
            inStock: 0,
            change: 0,
            trend: 'up',
          },
        });
        setRecentOrders(Array.isArray(ordersData) ? ordersData : []);
        setLowStockItems(stockData && stockData.products ? stockData.products : []);
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
      value: `$${stats.revenue.total.toLocaleString()}`,
      change: `${stats.revenue.change > 0 ? '+' : ''}${stats.revenue.change}%`,
      icon: DollarSign,
      trend: stats.revenue.trend
    },
    {
      title: "Orders Today", 
      value: stats.orders.today.toString(),
      change: `${stats.orders.change > 0 ? '+' : ''}${stats.orders.change}%`,
      icon: ShoppingCart,
      trend: stats.orders.trend
    },
    {
      title: "Total Customers",
      value: stats.customers.total.toLocaleString(),
      change: `${stats.customers.change > 0 ? '+' : ''}${stats.customers.change}%`,
      icon: Users,
      trend: stats.customers.trend
    },
    {
      title: "Products in Stock",
      value: stats.products.inStock.toLocaleString(),
      change: `${stats.products.change > 0 ? '+' : ''}${stats.products.change}%`,
      icon: Package,
      trend: stats.products.trend
    }
  ];
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsArray.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
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