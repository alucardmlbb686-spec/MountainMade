"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  alt: string;
  quantity: number;
  price: number;
}

interface TrackingUpdate {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  location: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'order_confirmed' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  trackingNumber: string;
  estimatedDelivery: string;
  orderDate: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  trackingUpdates: TrackingUpdate[];
  currentLocation: string;
}

export default function OrderTrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  // Fetch orders from database
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let query = supabase
          .from('orders')
          .select(`
            id,
            order_display_id,
            status,
            total_amount,
            shipping_address,
            tracking_number,
            current_location,
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
                name,
                image_url
              )
            )
          `)
          .order('created_at', { ascending: false });

        // If user is logged in, show only their orders. Otherwise, don't fetch personal orders
        if (user) {
          query = query.eq('user_id', user.id);
        } else {
          query = query.limit(10);
        }

        const { data, error } = await query;

        if (error) throw error;

        const formattedOrders: Order[] = (data || []).map((o: any) => {
          const trackingUpdates: TrackingUpdate[] = [];

          // Build tracking updates based on status transitions
          if (o.confirmed_at) {
            trackingUpdates.push({
              id: `update_${o.id}_1`,
              status: 'Order Confirmed',
              description: 'Your order has been confirmed and is being prepared',
              timestamp: new Date(o.confirmed_at).toLocaleString('en-IN'),
              location: 'Mountain Mart Warehouse',
            });
          }

          if (o.shipped_at) {
            trackingUpdates.push({
              id: `update_${o.id}_2`,
              status: 'Shipped',
              description: 'Your order has been shipped from our warehouse',
              timestamp: new Date(o.shipped_at).toLocaleString('en-IN'),
              location: 'Mountain Mart Warehouse, Delhi',
            });
          }

          if (o.in_transit_at) {
            trackingUpdates.push({
              id: `update_${o.id}_3`,
              status: 'In Transit',
              description: 'Package has reached the destination city',
              timestamp: new Date(o.in_transit_at).toLocaleString('en-IN'),
              location: 'Dehradun Sorting Center',
            });
          }

          if (o.delivered_at) {
            trackingUpdates.push({
              id: `update_${o.id}_4`,
              status: 'Delivered',
              description: 'Your order has been delivered successfully',
              timestamp: new Date(o.delivered_at).toLocaleString('en-IN'),
              location: 'Delivered to Customer',
            });
          }

          // If no timestamps but has status, create default update
          if (trackingUpdates.length === 0) {
            trackingUpdates.push({
              id: `update_${o.id}_default`,
              status: 'Pending',
              description: 'Your order is being processed',
              timestamp: new Date(o.created_at).toLocaleString('en-IN'),
              location: 'Mountain Mart Warehouse',
            });
          }

          // Reverse to show latest first (but order by created_at for display)
          trackingUpdates.reverse();

          return {
            id: o.id,
            orderNumber: o.order_display_id || `MM${o.id.slice(0, 8)}`,
            status: o.status || 'pending',
            trackingNumber: o.tracking_number || 'PENDING',
            estimatedDelivery: new Date(new Date(o.created_at).getTime() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            orderDate: new Date(o.created_at).toISOString().split('T')[0],
            totalAmount: parseFloat(o.total_amount),
            shippingAddress: o.shipping_address || 'Address not provided',
            currentLocation: o.current_location || 'Processing',
            items: (o.order_items || []).map((item: any) => ({
              id: item.id,
              name: item.products?.name || 'Unknown Product',
              image: item.products?.image_url || 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1',
              alt: item.products?.name || 'Product',
              quantity: item.quantity,
              price: parseFloat(item.price),
            })),
            trackingUpdates: trackingUpdates,
          };
        });

        setOrders(formattedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, supabase]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearched(false);
      setSearchResults([]);
      return;
    }

    const results = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results);
    setSearched(true);

    if (results.length === 1) {
      setSelectedOrder(results[0]);
    }
  };

  const displayOrders = searched ? searchResults : orders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-success';
      case 'in_transit':
        return 'text-blue-600';
      case 'shipped':
        return 'text-primary';
      case 'order_confirmed':
        return 'text-indigo-600';
      case 'pending':
        return 'text-amber-600';
      case 'cancelled':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'CheckCircleIcon';
      case 'in_transit':
        return 'TruckIcon';
      case 'shipped':
        return 'TruckIcon';
      case 'order_confirmed':
        return 'CheckIcon';
      case 'pending':
        return 'ClockIcon';
      case 'cancelled':
        return 'XCircleIcon';
      default:
        return 'ClockIcon';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'in_transit':
        return 'In Transit';
      case 'shipped':
        return 'Shipped';
      case 'order_confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 bg-background min-h-screen">
          <div className="container mx-auto">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }


  return (
    <>
      <Header />
      <main className="pt-24 pb-16 bg-background min-h-screen">
        <div className="container mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground font-serif mb-3">
              Track Your Order
            </h1>
            <p className="text-muted-foreground">
              Enter your order number or tracking number to get real-time updates
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-card rounded-xl-organic border border-border p-6 mb-8">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter Order Number or Tracking Number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                
                <Icon name="MagnifyingGlassIcon" size={20} variant="outline" />
                Track Order
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          {!selectedOrder && (
            <div className="mb-8">
              {displayOrders.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {searched ? 'Search Results' : 'Your Recent Orders'}
                  </h2>
                  <div className="grid gap-4">
                    {displayOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="bg-card rounded-xl-organic border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                            <p className="text-lg font-bold text-foreground">{order.orderNumber}</p>
                          </div>
                          <div className={`flex items-center gap-2 ${getStatusColor(order.status)} font-semibold capitalize`}>
                            <Icon name={getStatusIcon(order.status)} size={20} variant="solid" />
                            {getStatusLabel(order.status)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Order Date:{' '}
                            {new Date(order.orderDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span>•</span>
                          <span>Items: {order.items.length}</span>
                          <span>•</span>
                          <span className="text-primary font-semibold">₹{order.totalAmount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-card rounded-xl-organic border border-border p-12 text-center">
                  <Icon name="ShoppingBagIcon" size={48} variant="outline" className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    {searched
                      ? 'No orders found matching your search.'
                      : 'You haven\'t placed any orders yet. Start shopping to see them here!'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Order Details */}
          {selectedOrder && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Tracking Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Back Button */}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex items-center gap-2 text-primary hover:underline mb-4">
                  <Icon name="ArrowLeftIcon" size={20} variant="outline" />
                  Back to Orders
                </button>

                {/* Order Status Card */}
                <div className="bg-card rounded-xl-organic border border-border p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        Order #{selectedOrder.orderNumber}
                      </h2>
                      <p className="text-muted-foreground">
                        Placed on{' '}
                        {new Date(selectedOrder.orderDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 ${getStatusColor(selectedOrder.status)} font-bold text-lg capitalize`}>
                      <Icon name={getStatusIcon(selectedOrder.status)} size={24} variant="solid" />
                      {getStatusLabel(selectedOrder.status)}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                      <p className="font-semibold text-foreground">{selectedOrder.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Location</p>
                      <p className="font-semibold text-primary">{selectedOrder.currentLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div className="bg-card rounded-xl-organic border border-border p-6">
                  <h3 className="text-xl font-bold text-foreground mb-6">Shipment Updates</h3>
                  <div className="space-y-6">
                    {selectedOrder.trackingUpdates.length > 0 ? (
                      selectedOrder.trackingUpdates.map((update, index) => (
                        <div key={update.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              }`}>
                              <Icon name="CheckIcon" size={20} variant="solid" />
                            </div>
                            {index < selectedOrder.trackingUpdates.length - 1 && <div className="w-0.5 h-16 bg-border mt-2" />}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className={`font-bold ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                                {update.status}
                              </h4>
                              <span className="text-sm text-muted-foreground">{update.timestamp}</span>
                            </div>
                            <p className="text-muted-foreground mb-1">{update.description}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Icon name="MapPinIcon" size={14} variant="solid" />
                              {update.location}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Order is being processed...</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-card rounded-xl-organic border border-border p-6">
                  <h3 className="text-xl font-bold text-foreground mb-6">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <AppImage src={item.image} alt={item.alt} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{item.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">Quantity: {item.quantity}</p>
                          <p className="text-lg font-bold text-primary">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-border">
                    <span className="text-lg font-bold text-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card rounded-xl-organic border border-border p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">Shipping Address</h3>
                  <p className="text-muted-foreground flex items-start gap-2">
                    <Icon name="MapPinIcon" size={20} variant="solid" className="text-primary mt-1" />
                    {selectedOrder.shippingAddress}
                  </p>
                </div>
              </div>

              {/* Right Column - Customer Support */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl-organic border border-border p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-foreground mb-6">Need Help?</h3>

                  <div className="space-y-6">
                    {/* Customer Support */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="PhoneIcon" size={20} variant="solid" className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Call Us</p>
                          <p className="font-semibold text-foreground">1800-123-4567</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-13">Mon-Sat: 9 AM - 6 PM</p>
                    </div>

                    {/* Email Support */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="EnvelopeIcon" size={20} variant="solid" className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email Us</p>
                          <p className="font-semibold text-foreground text-sm">support@mountainmart.com</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-13">We'll respond within 24 hours</p>
                    </div>

                    {/* WhatsApp Support */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="ChatBubbleLeftRightIcon" size={20} variant="solid" className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">WhatsApp</p>
                          <p className="font-semibold text-foreground">+91 98765-43210</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-13">Quick support via chat</p>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                        <Icon name="ChatBubbleLeftRightIcon" size={20} variant="solid" />
                        Start Live Chat
                      </button>
                    </div>

                    {/* FAQ Link */}
                    <div className="pt-4 border-t border-border">
                      <h4 className="font-semibold text-foreground mb-3">Common Questions</h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <a href="#" className="text-primary hover:underline flex items-center gap-1">
                            <Icon name="QuestionMarkCircleIcon" size={16} variant="outline" />
                            How to modify my order?
                          </a>
                        </li>
                        <li>
                          <a href="#" className="text-primary hover:underline flex items-center gap-1">
                            <Icon name="QuestionMarkCircleIcon" size={16} variant="outline" />
                            Return & Refund Policy
                          </a>
                        </li>
                        <li>
                          <a href="#" className="text-primary hover:underline flex items-center gap-1">
                            <Icon name="QuestionMarkCircleIcon" size={16} variant="outline" />
                            Shipping Information
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}