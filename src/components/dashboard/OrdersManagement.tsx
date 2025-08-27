import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatEuro } from '@/lib/currency';
import { NoProductsFound } from '@/components/ui/NoProductsFound';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit,
  Package,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';

interface Order {
  id: number;
  orderNumber: string;
  userEmail: string;
  userName: string;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: any;
  billingAddress?: any;
  trackingNumber?: string;
  orderItems?: any[];
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const paymentStatusOptions = [
  { value: 'all', label: 'All Payment Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'default';
    case 'shipped': return 'secondary';
    case 'processing': return 'outline';
    case 'pending': return 'secondary';
    case 'cancelled': return 'destructive';
    case 'paid': return 'default';
    case 'failed': return 'destructive';
    case 'refunded': return 'secondary';
    default: return 'outline';
  }
};

export const OrdersManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch orders with filters
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', currentPage, statusFilter, paymentStatusFilter, searchTerm],
    queryFn: () => ordersApi.getAll({
      page: currentPage,
      limit: 10,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      paymentStatus: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
    }),
  });

  // Fetch order statistics
  const { data: statsData } = useQuery({
    queryKey: ['orderStats'],
    queryFn: () => ordersApi.getStats(),
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => ordersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Order updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order',
        variant: 'destructive',
      });
    },
  });

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;
  const stats = statsData || {};

  // Debug logging
  console.log('🔍 [OrdersManagement] Orders data:', orders);
  console.log('🔍 [OrdersManagement] First order:', orders[0]);

  const handleUpdateOrder = (status: string, paymentStatus?: string) => {
    if (!selectedOrder) return;
    
    const updateData: any = { status };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    
    updateOrderMutation.mutate({
      id: selectedOrder.orderNumber,
      data: updateData
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.todayOrders || 0} today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEuro(stats.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatEuro(stats.todayRevenue || 0)} today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEuro(stats.averageOrderValue || 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthOrders || 0}</div>
            <p className="text-xs text-muted-foreground">orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orders Management</h2>
          <p className="text-muted-foreground">Manage and track all customer orders</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by payment" />
            </SelectTrigger>
            <SelectContent>
              {paymentStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <NoProductsFound 
                      type="no-results"
                      title={t('orders.noOrdersFound')}
                      description={t('orders.noOrdersDescription')}
                      onClearFilters={() => {
                        setStatusFilter('all');
                        setPaymentStatusFilter('all');
                        setSearchTerm('');
                        setCurrentPage(1);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.userName}</div>
                        <div className="text-sm text-muted-foreground">{order.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatEuro(parseFloat(order.total))}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{t('orders.orderDetails')} - {order.orderNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Customer</label>
                                  <p>{order.userName}</p>
                                  <p className="text-sm text-muted-foreground">{order.userEmail}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">{t('orders.orderDate')}</label>
                                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">{t('orders.orderStatus')}</label>
                                  <p>
                                    <Badge variant={getStatusBadgeVariant(order.status)}>
                                      {order.status}
                                    </Badge>
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">{t('orders.paymentStatus')}</label>
                                  <p>
                                    <Badge variant={getStatusBadgeVariant(order.paymentStatus)}>
                                      {order.paymentStatus}
                                    </Badge>
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">{t('orders.orderTotal')}</label>
                                  <p className="text-lg font-bold">{formatEuro(parseFloat(order.total))}</p>
                                </div>
                              </div>

                              {/* Shipping Address */}
                              {order.shippingAddress && (
                                <div>
                                  <label className="text-sm font-medium">{t('orders.shippingAddress')}</label>
                                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                    <p>{order.shippingAddress.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {order.shippingAddress.address?.line1}
                                      {order.shippingAddress.address?.line2 && <br />}
                                      {order.shippingAddress.address?.line2}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {order.shippingAddress.address?.city}, {order.shippingAddress.address?.postal_code}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {order.shippingAddress.address?.country}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Order Items */}
                              {order.orderItems && order.orderItems.length > 0 && (
                                <div>
                                  <label className="text-sm font-medium">{t('orders.orderItems')}</label>
                                  <div className="mt-2 space-y-2">
                                    {order.orderItems.map((item: any, index: number) => (
                                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{item.productName}</p>
                                          <p className="text-xs text-muted-foreground">{item.productSize}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm">{t('orders.quantity')}: {item.quantity}</p>
                                          <p className="text-sm font-medium">€{parseFloat(item.totalPrice).toFixed(2)}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Tracking Number */}
                              {order.trackingNumber && (
                                <div>
                                  <label className="text-sm font-medium">{t('orders.trackingNumber')}</label>
                                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{order.trackingNumber}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.currentPage - 1) * pagination.ordersPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.ordersPerPage, pagination.totalOrders)} of{' '}
            {pagination.totalOrders} orders
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <span className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('orders.orderStatus')}</label>
                <div className="flex gap-2 mt-2">
                  {statusOptions.slice(1).map((status) => (
                    <Button
                      key={status.value}
                      variant={selectedOrder.status === status.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateOrder(status.value)}
                      disabled={updateOrderMutation.isPending}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Payment Status</label>
                <div className="flex gap-2 mt-2">
                  {paymentStatusOptions.slice(1).map((status) => (
                    <Button
                      key={status.value}
                      variant={selectedOrder.paymentStatus === status.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateOrder(selectedOrder.status, status.value)}
                      disabled={updateOrderMutation.isPending}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
