"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
}

export default function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const shipping = subtotal >= 999 ? 0 : 80;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  return (
    <div className={`bg-card rounded-xl-organic border border-border p-6 sticky top-24 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`}>
      <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

      {/* Price Breakdown */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal ({itemCount} items)</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className={shipping === 0 ? 'text-success font-semibold' : ''}>
            {shipping === 0 ? 'FREE' : `₹${shipping}`}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax (5%)</span>
          <span>₹{tax}</span>
        </div>

        {/* Free Shipping Progress */}
        {shipping > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">
              Add ₹{999 - subtotal} more for FREE shipping
            </p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min((subtotal / 999) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between text-lg font-bold text-foreground pb-6 border-b border-border mb-6">
        <span>Total</span>
        <span>₹{total}</span>
      </div>

      {/* Checkout Button */}
      <Link href="/checkout" className="btn btn-primary w-full justify-center text-lg py-3 mb-4">
        Proceed to Checkout
        <Icon name="ArrowRightIcon" size={20} />
      </Link>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Icon name="LockClosedIcon" size={14} />
        Secure Checkout
      </div>
    </div>
  );
}