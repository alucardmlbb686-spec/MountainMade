"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSharedSupabaseClient } from '@/hooks/useSupabaseClient';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  itemCount: number;
}

export default function AdminOrderHistoryPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = getSharedSupabaseClient();

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'admin')) {
      router.push('/admin-login');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let query = supabase
          .from('orders')
          .select(`
            id,
            user_id,
            total_amount,
            status,
            shipping_address,
            created_at,
            user_profiles!user_id (
              full_name,
              email
            ),
            order_items (
              id
            )
          `)
          .in('status', ['order_confirmed', 'shipped', 'in_transit', 'delivered', 'cancelled'])
          .order('created_at', { ascending: false });

        // Apply date filter
        if (dateFilter !== 'all') {
          const now = new Date();
          let startDate = new Date();
          
          switch (dateFilter) {
            case 'today':
              startDate.setHours(0, 0, 0, 0);
              break;
            case 'week':
              startDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              startDate.setMonth(now.getMonth() - 1);
              break;
            case 'year':
              startDate.setFullYear(now.getFullYear() - 1);
              break;
          }
          
          query = query.gte('created_at', startDate.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          const errorMsg = error?.message || JSON.stringify(error) || 'Unknown error';
          throw new Error(errorMsg);
        }

        const formattedOrders = data?.map((o: any) => ({
          id: o.id,
          userId: o.user_id,
          userName: o.user_profiles?.full_name || 'Unknown',
          userEmail: o.user_profiles?.email || 'N/A',
          totalAmount: parseFloat(o.total_amount),
          status: o.status || 'pending',
          shippingAddress: o.shipping_address,
          createdAt: new Date(o.created_at).toLocaleString(),
          itemCount: o.order_items?.length || 0,
        })) || [];

        setOrders(formattedOrders);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Error fetching orders:', errorMsg);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user && userProfile?.role === 'admin') {
      fetchOrders();
    }
  }, [user, userProfile, supabase, dateFilter]);

  const statuses = ['all', 'order_confirmed', 'shipped', 'in_transit', 'delivered', 'cancelled'];

  const filteredOrders = orders.filter(
    (o) =>
      (filterStatus === 'all' || o.status === filterStatus) &&
      (o.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-600';
      case 'order_confirmed':
        return 'bg-cyan-500/10 text-cyan-600';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-600';
      case 'in_transit':
        return 'bg-indigo-500/10 text-indigo-600';
      case 'delivered':
        return 'bg-green-500/10 text-green-600';
      case 'cancelled':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

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
                <h1 className="text-2xl font-bold text-foreground font-serif">Order History</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredOrders.length} orders • ₹{totalRevenue.toFixed(2)} total revenue
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by customer name, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-base w-full sm:w-48"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-base w-full sm:w-48"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {loadingOrders ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Icon name="ClockIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders found</p>
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
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr key={order.id} className={index !== filteredOrders.length - 1 ? 'border-b border-border' : ''}>
                      <td className="p-4">
                        <span className="font-mono text-sm text-muted-foreground">
                          {order.id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{order.userName}</p>
                          <p className="text-sm text-muted-foreground">{order.userEmail}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-muted-foreground">{order.itemCount} items</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-foreground">₹{order.totalAmount.toFixed(2)}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{order.createdAt}</td>
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