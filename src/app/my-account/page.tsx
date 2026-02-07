'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import Icon from '@/components/ui/AppIcon';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    image_url: string;
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function MyAccountPage() {
  const router = useRouter();
  const { user, userProfile, loading, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const supabase = useSupabaseClient();

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
              product_id,
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
        setOrders(data || []);
      } catch (error: any) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (!errorMsg?.includes('AbortError') && !error?.details?.includes('AbortError')) {
          console.error('Error fetching orders:', error);
        }
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, supabase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'order_confirmed':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'in_transit':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'order_confirmed': 'Order Confirmed',
      'shipped': 'Shipped',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="ArrowPathIcon" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-32 pb-16">
        <div className="container mx-auto px-4 w-full max-w-full overflow-x-hidden">
          {/* Account Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {userProfile?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground font-serif">My Account</h1>
                  <p className="text-muted-foreground">{userProfile?.email}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={20} />
                Log Out
              </button>
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Icon name="ShoppingBagIcon" size={28} className="text-primary" />
                <h2 className="text-2xl font-bold text-foreground font-serif">My Orders</h2>
              </div>
              <Link href="/my-orders" className="text-sm text-primary hover:text-primary/80 font-semibold flex items-center gap-1">
                View All Orders
                <Icon name="ArrowRightIcon" size={16} />
              </Link>
            </div>

            {loadingOrders ? (
              <div className="text-center py-12">
                <Icon name="ArrowPathIcon" size={40} className="animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="ShoppingBagIcon" size={64} className="text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
                <Link href="/categories" className="btn btn-primary inline-flex items-center gap-2">
                  <Icon name="ShoppingCartIcon" size={20} />
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Order Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Order ID:</span>
                          <span className="text-sm font-mono text-foreground">{order.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon name="CalendarIcon" size={16} />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground mb-2">
                          ₹{order.total_amount.toFixed(2)}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {item.products?.image_url ? (
                              <img
                                src={item.products.image_url}
                                alt={item.products?.name || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon name="PhotoIcon" size={24} className="text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{item.products?.name || 'Product'}</h4>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">₹{item.price.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">each</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Icon name="MapPinIcon" size={18} className="text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Shipping Address</p>
                          <p className="text-sm text-foreground">{order.shipping_address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Addresses Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Icon name="MapPinIcon" size={28} className="text-primary" />
                <h2 className="text-2xl font-bold text-foreground font-serif">Delivery Addresses</h2>
              </div>
              <Link
                href="/my-account/addresses"
                className="btn btn-primary flex items-center gap-2"
              >
                <Icon name="PencilIcon" size={18} />
                Manage Addresses
              </Link>
            </div>
            <p className="text-muted-foreground">
              View and manage your saved delivery addresses for faster checkout.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}