"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderDisplayId: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  inTransitAt: string | null;
  deliveredAt: string | null;
  confirmationMessage: string | null;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/user-login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              quantity,
              price,
              products (
                name,
                image_url
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedOrders = data?.map((o: any) => ({
          id: o.id,
          orderDisplayId: o.order_display_id || '',
          totalAmount: parseFloat(o.total_amount),
          status: o.status || 'pending',
          shippingAddress: o.shipping_address,
          createdAt: new Date(o.created_at).toLocaleDateString(),
          confirmedAt: o.confirmed_at ? new Date(o.confirmed_at).toLocaleString() : null,
          shippedAt: o.shipped_at ? new Date(o.shipped_at).toLocaleString() : null,
          inTransitAt: o.in_transit_at ? new Date(o.in_transit_at).toLocaleString() : null,
          deliveredAt: o.delivered_at ? new Date(o.delivered_at).toLocaleString() : null,
          confirmationMessage: o.confirmation_message || null,
          items: o.order_items?.map((item: any) => ({
            id: item.id,
            productName: item.products?.name || 'Unknown Product',
            productImage: item.products?.image_url || '',
            quantity: item.quantity,
            price: parseFloat(item.price),
          })) || [],
        })) || [];

        setOrders(formattedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, supabase]);

  const getStatusSteps = (status: string) => {
    const steps = [
      { key: 'order_confirmed', label: 'Order Confirmed', icon: 'CheckCircleIcon' },
      { key: 'shipped', label: 'Shipped', icon: 'TruckIcon' },
      { key: 'in_transit', label: 'In Transit', icon: 'MapPinIcon' },
      { key: 'delivered', label: 'Delivered', icon: 'HomeIcon' },
    ];

    const statusOrder = ['pending', 'order_confirmed', 'shipped', 'in_transit', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      active: statusOrder[currentIndex] === step.key,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-amber-600 bg-amber-50';
      case 'order_confirmed':
        return 'text-blue-600 bg-blue-50';
      case 'shipped':
        return 'text-purple-600 bg-purple-50';
      case 'in_transit':
        return 'text-indigo-600 bg-indigo-50';
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-error bg-red-50';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Confirmation';
      case 'order_confirmed':
        return 'Order Confirmed';
      case 'shipped':
        return 'Shipped';
      case 'in_transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 bg-background min-h-screen">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground font-serif mb-3">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>

          {loadingOrders ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <Icon name="ShoppingBagIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
              <button
                onClick={() => router.push('/categories')}
                className="btn btn-primary"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-muted p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-mono font-bold text-primary">#{order.orderDisplayId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Order Date</p>
                        <p className="font-medium text-foreground">{order.createdAt}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-bold text-foreground">₹{order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Confirmation Message */}
                  {order.status === 'order_confirmed' && order.confirmationMessage && (
                    <div className="bg-success/10 border-l-4 border-success p-4 mx-4 mt-4">
                      <div className="flex items-start gap-3">
                        <Icon name="CheckCircleIcon" size={20} className="text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-success mb-1">Order Confirmed!</p>
                          <p className="text-sm text-foreground">{order.confirmationMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="p-4 border-b border-border">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <AppImage
                            src={item.productImage}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Tracking */}
                  {order.status !== 'cancelled' && order.status !== 'pending' && (
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-foreground mb-4">Order Tracking</h3>
                      <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
                        <div
                          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                          style={{
                            width: `${(getStatusSteps(order.status).filter(s => s.completed).length / 4) * 100}%`,
                          }}
                        />

                        {/* Steps */}
                        <div className="relative flex justify-between">
                          {getStatusSteps(order.status).map((step, index) => (
                            <div key={step.key} className="flex flex-col items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                  step.completed || step.active
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : 'bg-card border-border text-muted-foreground'
                                }`}
                              >
                                <Icon name={step.icon as any} size={20} />
                              </div>
                              <p
                                className={`text-xs mt-2 text-center max-w-[80px] ${
                                  step.completed || step.active ? 'text-foreground font-semibold' : 'text-muted-foreground'
                                }`}
                              >
                                {step.label}
                              </p>
                              {step.active && order.status === 'order_confirmed' && order.confirmedAt && (
                                <p className="text-xs text-muted-foreground mt-1">{order.confirmedAt}</p>
                              )}
                              {step.active && order.status === 'shipped' && order.shippedAt && (
                                <p className="text-xs text-muted-foreground mt-1">{order.shippedAt}</p>
                              )}
                              {step.active && order.status === 'in_transit' && order.inTransitAt && (
                                <p className="text-xs text-muted-foreground mt-1">{order.inTransitAt}</p>
                              )}
                              {step.completed && order.status === 'delivered' && order.deliveredAt && index === 3 && (
                                <p className="text-xs text-muted-foreground mt-1">{order.deliveredAt}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  <div className="p-4 bg-muted">
                    <p className="text-sm font-semibold text-foreground mb-1">Shipping Address</p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}