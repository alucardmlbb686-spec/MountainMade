"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface Order {
  id: string;
  orderDisplayId: string;
  userId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  inTransitAt: string | null;
  deliveredAt: string | null;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

export default function AdminCustomerOrdersPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<{ [key: string]: string }>({});
  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'admin')) {
      router.push('/admin-login');
    }
  }, [user, userProfile, loading, router]);

  const fetchOrders = async () => {
    try {
      // First, get orders with order_items
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_display_id,
          user_id,
          status,
          total_amount,
          shipping_address,
          confirmed_at,
          shipped_at,
          in_transit_at,
          delivered_at,
          created_at,
          order_items (
            id,
            quantity,
            price,
            products (
              name
            )
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles separately for users in this order batch
      const userIds = [...new Set((data || []).map((o: any) => o.user_id))];
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (usersError) throw usersError;

      const usersMap = (usersData || []).reduce((acc: any, u: any) => {
        acc[u.id] = u;
        return acc;
      }, {});

      const formattedOrders = (data || []).map((o: any) => {
        const userProfile = usersMap[o.user_id] || {};
        return {
          id: o.id,
          orderDisplayId: o.order_display_id || '',
          userId: o.user_id,
          userName: userProfile.full_name || 'Unknown',
          userEmail: userProfile.email || 'N/A',
          totalAmount: parseFloat(o.total_amount),
          status: o.status || 'pending',
          shippingAddress: o.shipping_address,
          createdAt: new Date(o.created_at).toLocaleString(),
          confirmedAt: o.confirmed_at ? new Date(o.confirmed_at).toLocaleString() : null,
          shippedAt: o.shipped_at ? new Date(o.shipped_at).toLocaleString() : null,
          inTransitAt: o.in_transit_at ? new Date(o.in_transit_at).toLocaleString() : null,
          deliveredAt: o.delivered_at ? new Date(o.delivered_at).toLocaleString() : null,
          items: (o.order_items || []).map((item: any) => ({
            id: item.id,
            productName: item.products?.name || 'Unknown Product',
            quantity: item.quantity,
            price: parseFloat(item.price),
          })) || [],
        };
      });

      setOrders(formattedOrders);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch orders';
      console.error('Error fetching orders:', errorMessage);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user && userProfile?.role === 'admin') {
      fetchOrders();
      
      // Auto-refresh orders every 5 seconds
      const interval = setInterval(() => {
        fetchOrders();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [user, userProfile, supabase]);

  const handleConfirmOrder = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'order_confirmed',
          confirmed_by: user?.id,
          confirmation_message: confirmationMessage[orderId] || 'Your order has been confirmed and is being prepared for shipment.'
        })
        .eq('id', orderId);

      if (error) throw error;

      // Save confirmation message to order_confirmations table
      const confirmResult = await supabase.from('order_confirmations').insert({
        order_id: orderId,
        confirmed_by: user?.id,
        confirmation_message: confirmationMessage[orderId] || 'Your order has been confirmed and is being prepared for shipment.',
      });

      if (confirmResult.error) {
        console.warn('Warning: Could not save confirmation message:', confirmResult.error?.message);
      }

      // Log activity
      const activityResult = await supabase.from('user_activity').insert({
        user_id: user?.id,
        action_type: 'order_update',
        description: `Confirmed order ${orderId.substring(0, 8)} - order confirmed`,
        metadata: { order_id: orderId, new_status: 'order_confirmed' },
      });

      if (activityResult.error) {
        console.warn('Warning: Could not log activity:', activityResult.error?.message);
      }

      setConfirmationMessage({ ...confirmationMessage, [orderId]: '' });
      await fetchOrders();
    } catch (error: any) {
      const errorMessage = error?.message || JSON.stringify(error) || 'Failed to confirm order';
      console.error('Error confirming order:', errorMessage);
      
      // Provide more specific error messaging
      let userMessage = 'Failed to confirm order';
      if (errorMessage.includes('row-level security')) {
        userMessage = 'Permission denied. Please contact your administrator to enable order confirmation permissions.';
      } else if (errorMessage.includes('violates')) {
        userMessage = 'Database policy violation. Please try again or contact support.';
      } else {
        userMessage = errorMessage;
      }
      
      alert(userMessage);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this order? This action cannot be undone.')) {
      return;
    }

    setProcessingOrderId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      // Log activity
      const activityResult = await supabase.from('user_activity').insert({
        user_id: user?.id,
        action_type: 'order_update',
        description: `Rejected order ${orderId.substring(0, 8)} - moved to cancelled`,
        metadata: { order_id: orderId, new_status: 'cancelled' },
      });

      if (activityResult.error) {
        console.warn('Warning: Could not log activity:', activityResult.error?.message);
      }

      await fetchOrders();
    } catch (error: any) {
      const errorMessage = error?.message || JSON.stringify(error) || 'Failed to reject order';
      console.error('Error rejecting order:', errorMessage);
      
      let userMessage = 'Failed to reject order';
      if (errorMessage.includes('row-level security')) {
        userMessage = 'Permission denied. Please contact your administrator.';
      } else if (errorMessage.includes('violates')) {
        userMessage = 'Database policy violation. Please try again or contact support.';
      } else {
        userMessage = errorMessage;
      }
      
      alert(userMessage);
    } finally {
      setProcessingOrderId(null);
    }
  };

  if (loading || !user || userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin-dashboard" className="text-muted-foreground hover:text-foreground">
                <Icon name="ArrowLeftIcon" size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-serif">Customer Orders</h1>
                <p className="text-sm text-muted-foreground">{orders.length} pending orders</p>
              </div>
            </div>
            <button
              onClick={() => fetchOrders()}
              disabled={loadingOrders}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon 
                name="ArrowPathIcon" 
                size={20} 
                className={loadingOrders ? 'animate-spin' : ''} 
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Orders Table */}
        {loadingOrders ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Icon name="ShoppingBagIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No pending orders</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Order ID</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Customer</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Items</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Shipping Address</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Date</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Confirmation Message</th>
                    <th className="text-center p-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order.id} className={index !== orders.length - 1 ? 'border-b border-border' : ''}>
                      <td className="p-4">
                        <div>
                          <span className="font-mono text-sm font-bold text-primary">
                            #{order.orderDisplayId}
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5">{order.id.substring(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{order.userName}</p>
                          <p className="text-sm text-muted-foreground">{order.userEmail}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="text-sm">
                              <span className="text-foreground">{item.productName}</span>
                              <span className="text-muted-foreground"> x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-foreground">₹{order.totalAmount.toFixed(2)}</span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground max-w-xs">{order.shippingAddress}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">{order.createdAt}</span>
                      </td>
                      <td className="p-4">
                        <textarea
                          value={confirmationMessage[order.id] || ''}
                          onChange={(e) => setConfirmationMessage({ ...confirmationMessage, [order.id]: e.target.value })}
                          placeholder="Enter confirmation message..."
                          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20"
                          disabled={processingOrderId === order.id}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleConfirmOrder(order.id)}
                            disabled={processingOrderId === order.id}
                            className="btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                          >
                            {processingOrderId === order.id ? (
                              <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                            ) : (
                              <Icon name="CheckIcon" size={16} />
                            )}
                            Confirm
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order.id)}
                            disabled={processingOrderId === order.id}
                            className="btn bg-error hover:bg-error/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                          >
                            {processingOrderId === order.id ? (
                              <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                            ) : (
                              <Icon name="XMarkIcon" size={16} />
                            )}
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}