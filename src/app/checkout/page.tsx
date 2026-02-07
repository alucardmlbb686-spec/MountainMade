"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ShippingForm from './components/ShippingForm';
import PaymentForm from './components/PaymentForm';
import OrderSummary from './components/OrderSummary';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, clearCart, subtotal } = useCart();
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [shippingData, setShippingData] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/user-login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    // Redirect to cart if no items
    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }
  }, [cartItems, router]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) {
        setLoadingAddresses(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('delivery_addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSavedAddresses(data || []);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    if (user) {
      fetchAddresses();
    }
  }, [user, supabase]);

  const shipping = subtotal >= 999 ? 0 : 80;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const handleShippingSubmit = (data: any) => {
    setShippingData(data);
    setStep('payment');
  };

  const handlePaymentSubmit = async (data: any) => {
    if (!user || cartItems.length === 0) {
      alert('Error: User not found or cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate order number
      const orderNumber = `MM${Date.now()}`;

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            order_display_id: orderNumber,
            total_amount: total,
            status: 'pending',
            shipping_address: shippingData.address,
          },
        ])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      if (!orderData) {
        throw new Error('No order data returned from server');
      }

      // Create order items
      const orderItems = await Promise.all(
        cartItems.map(async (cartItem) => {
          // Get product_id from product name
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('id')
            .eq('name', cartItem.name)
            .single();

          if (productError) {
            console.error('Product lookup error:', productError);
            throw new Error(`Product not found: ${cartItem.name}`);
          }

          return {
            order_id: orderData.id,
            product_id: productData.id,
            quantity: cartItem.quantity,
            price: cartItem.price,
          };
        })
      );

      // Insert order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw new Error(`Failed to add items: ${itemsError.message}`);
      }

      // Clear the cart from database
      await clearCart();

      // Show success message
      alert(
        `Order placed successfully! Order #${orderNumber}\n\nA confirmation email has been sent to ${shippingData.email}`
      );
      router.push('/my-orders');
    } catch (err: any) {
      console.error('Error placing order:', err);
      alert(`Failed to place order: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || cartItems.length === 0) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 bg-background min-h-screen">
        <div className="container mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground font-serif mb-3">
              Secure Checkout
            </h1>
            <p className="text-muted-foreground">
              Your information is protected with 256-bit encryption
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'shipping'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-success text-success-foreground'
                }`}
              >
                {step === 'shipping' ? '1' : <Icon name="CheckIcon" size={16} />}
              </div>
              <span
                className={`text-sm font-medium ${
                  step === 'shipping' ? 'text-foreground' : 'text-success'
                }`}
              >
                Shipping
              </span>
            </div>
            <div className="w-16 h-0.5 bg-border"></div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'payment'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                2
              </div>
              <span
                className={`text-sm font-medium ${
                  step === 'payment' ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Payment
              </span>
            </div>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Forms */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl-organic border border-border p-8">
                {step === 'shipping' && (
                  <ShippingForm
                    onSubmit={handleShippingSubmit}
                    savedAddresses={savedAddresses}
                    loadingAddresses={loadingAddresses}
                    userId={user?.id}
                  />
                )}
                {step === 'payment' && (
                  <PaymentForm
                    onSubmit={handlePaymentSubmit}
                    onBack={() => setStep('shipping')}
                    isSubmitting={isSubmitting}
                  />
                )}
              </div>
            </div>

            {/* Summary */}
            <div>
              <OrderSummary
                items={cartItems}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
