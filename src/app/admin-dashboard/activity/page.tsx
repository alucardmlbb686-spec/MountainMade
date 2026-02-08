"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  actionType: string;
  description: string;
  metadata: any;
  createdAt: string;
}

export default function AdminActivityPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'admin')) {
      router.push('/admin-login');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('user_activity')
          .select(`
            *,
            user_profiles (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        const formattedActivities = data?.map((a: any) => ({
          id: a.id,
          userId: a.user_id,
          userName: a.user_profiles?.full_name || 'Unknown',
          userEmail: a.user_profiles?.email || 'N/A',
          actionType: a.action_type,
          description: a.description,
          metadata: a.metadata,
          createdAt: new Date(a.created_at).toLocaleString(),
        })) || [];

        setActivities(formattedActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };

    if (user && userProfile?.role === 'admin') {
      fetchActivities();
    }
  }, [user, userProfile, supabase]);

  const actionTypes = ['all', ...Array.from(new Set(activities.map((a) => a.actionType)))];

  const filteredActivities = activities.filter(
    (a) =>
      (filterType === 'all' || a.actionType === filterType) &&
      (a.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'login':
        return 'ArrowRightOnRectangleIcon';
      case 'logout':
        return 'ArrowLeftOnRectangleIcon';
      case 'order_create': case'order_update':
        return 'ShoppingBagIcon';
      case 'product_create': case'product_update':
        return 'CubeIcon';
      case 'profile_update':
        return 'UserIcon';
      default:
        return 'BellIcon';
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'login':
        return 'bg-green-500/10 text-green-600';
      case 'logout':
        return 'bg-gray-500/10 text-gray-600';
      case 'order_create': case'order_update':
        return 'bg-purple-500/10 text-purple-600';
      case 'product_create': case'product_update':
        return 'bg-blue-500/10 text-blue-600';
      case 'profile_update':
        return 'bg-amber-500/10 text-amber-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!user || userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting...</p>
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
                <h1 className="text-2xl font-bold text-foreground font-serif">User Activity</h1>
                <p className="text-sm text-muted-foreground">{activities.length} total activities</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-base pl-10 w-full"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-base w-full sm:w-64"
          >
            {actionTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Activities' : type.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Activities Feed */}
        {loadingActivities ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Icon name="ChartBarIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No activities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="bg-card rounded-xl border border-border p-4 hover:border-primary transition-all premium-shadow">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getActionColor(activity.actionType)}`}>
                    <Icon name={getActionIcon(activity.actionType)} size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{activity.userName}</h3>
                        <p className="text-sm text-muted-foreground">{activity.userEmail}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.createdAt}</span>
                    </div>
                    <p className="text-foreground mb-2">{activity.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(activity.actionType)}`}>
                        {activity.actionType.replace('_', ' ')}
                      </span>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {Object.keys(activity.metadata).length} metadata fields
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}