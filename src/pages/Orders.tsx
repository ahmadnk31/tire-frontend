import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { ordersApi } from '@/lib/api';

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await ordersApi.getAll();
        setOrders(res.orders || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background">
      <Card className="w-full max-w-2xl shadow-xl border border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Orders</CardTitle>
          <CardDescription className="text-base text-muted-foreground">Your order history</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-primary animate-pulse">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No orders found.</div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div key={order.id} className="border rounded-lg p-4 bg-primary/5">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-primary">Order #{order.orderNumber}</div>
                    <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">Placed: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</div>
                  <div className="text-sm text-muted-foreground">Total: <span className="font-semibold">€{order.total}</span></div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Order Date</label>
                            <p>{new Date(order.createdAt).toLocaleString()}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <p>
                              <Badge variant={getStatusBadgeVariant(order.status)}>
                                {order.status}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Payment Status</label>
                            <p>
                              <Badge variant={getStatusBadgeVariant(order.paymentStatus)}>
                                {order.paymentStatus}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Total</label>
                            <p className="text-lg font-bold">{formatEuro(parseFloat(order.total))}</p>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div>
                            <label className="text-sm font-medium">Shipping Address</label>
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
                        {order.cart && order.cart.length > 0 && (
                          <div>
                            <label className="text-sm font-medium">Order Items</label>
                            <div className="mt-2 space-y-2">
                              {order.cart.map((item: any, index: number) => (
                                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                                  {item.imageUrl && (
                                    <img 
                                      src={item.imageUrl} 
                                      alt={item.name}
                                      className="w-8 h-8 object-cover rounded border"
                                      onError={(e) => {
                                        e.currentTarget.src = '/placeholder-tire.png';
                                      }}
                                    />
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.size}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm">Qty: {item.quantity}</p>
                                    <p className="text-sm font-medium">€{(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tracking Number */}
                        {order.trackingNumber && (
                          <div>
                            <label className="text-sm font-medium">Tracking Number</label>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded">{order.trackingNumber}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
