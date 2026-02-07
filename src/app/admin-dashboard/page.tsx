"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'admin')) {
      router.push('/admin-login');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total_amount'),
        ]);

        const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0) || 0;

        setStats({
          totalUsers: usersRes.count || 0,
          totalProducts: productsRes.count || 0,
          totalOrders: ordersRes.data?.length || 0,
          totalRevenue,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user && userProfile?.role === 'admin') {
      fetchStats();
    }
  }, [user, userProfile, supabase]);

  if (loading || !user || userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: 'UsersIcon',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      link: '/admin-dashboard/users',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: 'CubeIcon',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      link: '/admin-dashboard/products',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: 'ShoppingBagIcon',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      link: '/admin-dashboard/orders',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: 'CurrencyDollarIcon',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      link: '/admin-dashboard/orders',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: 'UsersIcon',
      link: '/admin-dashboard/users',
      color: 'text-blue-500',
    },
    {
      title: 'User Activity',
      description: 'Track user actions and behavior',
      icon: 'ChartBarIcon',
      link: '/admin-dashboard/activity',
      color: 'text-indigo-500',
    },
    {
      title: 'Manage Products',
      description: 'Add, edit, or remove products',
      icon: 'CubeIcon',
      link: '/admin-dashboard/products',
      color: 'text-green-500',
    },
    {
      title: 'Upload Food Items',
      description: 'Add new food products with images',
      icon: 'CloudArrowUpIcon',
      link: '/admin-dashboard/upload',
      color: 'text-teal-500',
    },
    {
      title: 'Order History',
      description: 'View all past orders',
      icon: 'ClockIcon',
      link: '/admin-dashboard/order-history',
      color: 'text-orange-500',
    },
    {
      title: 'Customer Orders',
      description: 'Process and track customer orders',
      icon: 'ShoppingBagIcon',
      link: '/admin-dashboard/customer-orders',
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="ShieldCheckIcon" size={32} className="text-primary" variant="solid" />
              <div>
                <h1 className="text-2xl font-bold text-foreground font-serif">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {userProfile?.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/homepage" className="btn btn-secondary">
                <Icon name="HomeIcon" size={20} />
                View Store
              </Link>
              <button onClick={signOut} className="btn btn-secondary">
                <Icon name="ArrowRightOnRectangleIcon" size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-serif">Overview</h2>
          {loadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                  <div className="h-12 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <Link
                  key={index}
                  href={stat.link}
                  className="bg-card rounded-xl border border-border p-6 hover:border-primary transition-all premium-shadow group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon name={stat.icon as any} size={24} className={stat.color} />
                    </div>
                    <Icon name="ArrowRightIcon" size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-sm text-muted-foreground mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 font-serif">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.link}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary transition-all premium-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-muted p-3 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <Icon name={action.icon as any} size={28} className={`${action.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                    <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                      <span>Go to {action.title}</span>
                      <Icon name="ArrowRightIcon" size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}