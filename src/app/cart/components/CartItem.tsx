"use client";

import { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    image: string;
    alt: string;
    price: number;
    quantity: number;
    weight: string;
    origin: string;
  };
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    onQuantityChange(item.id, newQuantity);
  };

  return (
    <div className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors">
      {/* Image */}
      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <AppImage
          src={item.image || '/assets/images/no_image.png'}
          alt={item.alt || item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
          {item.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Icon name="MapPinIcon" size={14} />
          {item.origin}
          <span className="text-muted">•</span>
          <span>{item.weight}</span>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-8 h-8 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
            >
              <Icon name="MinusIcon" size={16} className="text-foreground" />
            </button>
            <span className="text-foreground font-semibold w-8 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-8 h-8 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
            >
              <Icon name="PlusIcon" size={16} className="text-foreground" />
            </button>
          </div>

          {/* Price & Remove */}
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-primary">
              ₹{item.price * item.quantity}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Icon name="TrashIcon" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}