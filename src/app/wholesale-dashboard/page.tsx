"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface WholesaleOrder {
  id: string;
  total_amount: number;
  discount_percentage: number;
  status: string;
  shipping_address: string;
  notes: string;
  created_at: string;
}

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  averageDiscount: number;
  pendingOrders: number;
}

export default function WholesaleDashboardPage() {
  const router = useRouter();
  const { user, userProfile, signOut, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    averageDiscount: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<WholesaleOrder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'wholesale')) {
      router.push('/wholesale-login');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    if (user && userProfile?.role === 'wholesale') {
      fetchDashboardData();
    }
  }, [user, userProfile]);

  const fetchDashboardData = async () => {
    try {
      setIsLoadingData(true);

      // Fetch wholesale orders
      const { data: orders, error } = await supabase
        .from('wholesale_orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (orders) {
        setRecentOrders(orders);

        // Calculate stats
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0);
        const averageDiscount = orders.length > 0
          ? orders.reduce((sum, order) => sum + parseFloat(order.discount_percentage.toString()), 0) / orders.length
          : 0;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;

        setStats({
          totalOrders,
          totalSpent,
          averageDiscount,
          pendingOrders
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/wholesale-login');
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      id: 'total_orders',
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: 'ShoppingBagIcon',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'total_spent',
      title: 'Total Spent',
      value: `$${stats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: 'CurrencyDollarIcon',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'avg_discount',
      title: 'Average Discount',
      value: `${stats.averageDiscount.toFixed(1)}%`,
      icon: 'TagIcon',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 'pending_orders',
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: 'ClockIcon',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-amber-500/10 text-amber-700 border-amber-500/20', label: 'Pending' },
      order_confirmed: { color: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20', label: 'Order Confirmed' },
      shipped: { color: 'bg-purple-500/10 text-purple-700 border-purple-500/20', label: 'Shipped' },
      in_transit: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/20', label: 'In Transit' },
      delivered: { color: 'bg-green-500/10 text-green-700 border-green-500/20', label: 'Delivered' },
      cancelled: { color: 'bg-red-500/10 text-red-700 border-red-500/20', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="BuildingStorefrontIcon" size={32} className="text-primary" variant="solid" />
              <div>
                <h1 className="text-2xl font-bold text-foreground font-serif">Wholesale Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {userProfile?.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/homepage" className="btn btn-secondary">
                <Icon name="HomeIcon" size={18} />
                Home
              </Link>
              <button onClick={handleSignOut} className="btn btn-secondary">
                <Icon name="ArrowRightOnRectangleIcon" size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards?.map((stat) => (
            <div key={stat?.id} className="bg-card rounded-xl border border-border p-6 premium-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat?.bgColor}`}>
                  <Icon name={stat?.icon as any} size={24} className={stat?.color} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">{stat?.title}</h3>
              <p className="text-3xl font-bold text-foreground">{stat?.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-xl border border-border premium-shadow">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground font-serif">Recent Wholesale Orders</h2>
                <p className="text-sm text-muted-foreground mt-1">Your latest bulk orders and their status</p>
              </div>
              <Link href="/categories" className="btn btn-primary">
                <Icon name="PlusIcon" size={18} />
                New Order
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center">
                <Icon name="ShoppingBagIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">Start placing bulk orders to see them here</p>
                <Link href="/categories" className="btn btn-primary">
                  Browse Products
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Order ID</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Date</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Discount</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Shipping Address</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders?.map((order) => (
                    <tr key={order?.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <span className="text-sm font-mono text-muted-foreground">
                          {order?.id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground">
                          {new Date(order?.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold text-foreground">
                          ${parseFloat(order?.total_amount.toString()).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-green-600 font-semibold">
                          {order?.discount_percentage}% off
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(order?.status)}</td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground line-clamp-1">
                          {order?.shipping_address}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Wholesale Benefits */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 premium-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon name="TagIcon" size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Exclusive Pricing</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Enjoy up to 20% discount on bulk orders with tiered pricing based on order volume.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 premium-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Icon name="TruckIcon" size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Free Shipping</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Free shipping on all wholesale orders over $500. Fast and reliable delivery nationwide.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 premium-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Icon name="UserGroupIcon" size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Dedicated Support</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Priority customer support with a dedicated account manager for your business needs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}