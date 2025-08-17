import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await apiClient.get('/orders', undefined, token);
        setOrders(res.orders || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">{order.status}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Placed: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</div>
                  <div className="text-sm text-muted-foreground">Total: <span className="font-semibold">€{order.total}</span></div>
                  <Button variant="outline" size="sm" className="mt-2">View Details</Button>
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
