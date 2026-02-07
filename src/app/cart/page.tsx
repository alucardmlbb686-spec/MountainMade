"use client";

import { useCart } from '@/contexts/CartContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import CartItem from './components/CartItem';
import CartSummary from './components/CartSummary';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, itemCount, subtotal, isLoading } = useCart();

  const handleQuantityChange = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const handleRemove = (id: string) => {
    if (confirm('Remove this item from cart?')) {
      removeFromCart(id);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 bg-background min-h-screen">
          <div className="container mx-auto">
            <div className="flex items-center justify-center py-20">
              <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin" />
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
              Your Cart
            </h1>
            <p className="text-muted-foreground">
              Review your mountain treasures before checkout
            </p>
          </div>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}

                {/* Continue Shopping */}
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mt-4"
                >
                  <Icon name="ArrowLeftIcon" size={20} />
                  Continue Shopping
                </Link>
              </div>

              {/* Summary */}
              <div>
                <CartSummary subtotal={subtotal} itemCount={itemCount} />
              </div>
            </div>
          ) : (
            /* Empty Cart */
            <div className="text-center py-16 bg-card rounded-xl-organic border border-border">
              <Icon name="ShoppingCartIcon" size={64} className="text-muted mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Discover our pure mountain products and start your journey
              </p>
              <Link href="/categories" className="btn btn-primary">
                <Icon name="ArrowRightIcon" size={20} />
                Explore Products
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}