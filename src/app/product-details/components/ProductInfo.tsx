"use client";

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

interface ProductInfoProps {
  product: {
    name: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    origin: string;
    description: string;
    weights: Array<{ id: string; value: string; price: number }>;
    inStock: boolean;
    organic: boolean;
  };
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(product.weights[0].id);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const selectedWeightData = product.weights.find(w => w.id === selectedWeight);

  const handleAddToCart = () => {
    if (!isHydrated) return;
    
    addToCart({
      productId: product.name,
      name: product.name,
      image: '/assets/images/no_image.png',
      alt: product.name,
      price: selectedWeightData?.price || product.price,
      quantity: quantity,
      weight: selectedWeightData?.value || '1 unit',
      origin: product.origin
    });

    // Show success feedback and redirect to cart
    const confirmGoToCart = confirm(`Added ${quantity}x ${product.name} to cart!\n\nGo to cart now?`);
    if (confirmGoToCart) {
      router.push('/cart');
    }
  };

  return (
    <div className={`${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
      {/* Origin Badge */}
      <div className="inline-flex items-center gap-2 badge badge-accent mb-3">
        <Icon name="MapPinIcon" size={14} variant="solid" />
        {product.origin}
      </div>

      {/* Product Name */}
      <h1 className="text-4xl font-bold text-foreground font-serif mb-3">
        {product.name}
      </h1>

      {/* Rating & Reviews */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Icon
              key={`rating_star_${i}`}
              name="StarIcon"
              size={18}
              className={i < product.rating ? 'text-accent' : 'text-muted'}
              variant={i < product.rating ? 'solid' : 'outline'}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {product.rating} ({product.reviewCount} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-4xl font-bold text-primary">
          ₹{selectedWeightData?.price}
        </span>
        {product.originalPrice && (
          <span className="text-xl text-muted-foreground line-through">
            ₹{product.originalPrice}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed mb-8">
        {product.description}
      </p>

      {/* Weight Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-3">
          Select Weight
        </label>
        <div className="grid grid-cols-3 gap-3">
          {product.weights.map((weight) => (
            <button
              key={weight.id}
              onClick={() => setSelectedWeight(weight.id)}
              className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                selectedWeight === weight.id
                  ? 'border-primary bg-primary/5 text-primary' :'border-border text-foreground hover:border-primary/50'
              }`}
            >
              {weight.value}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-foreground mb-3">
          Quantity
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
          >
            <Icon name="MinusIcon" size={20} className="text-foreground" />
          </button>
          <span className="text-xl font-semibold text-foreground w-12 text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
          >
            <Icon name="PlusIcon" size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        disabled={!product.inStock}
        className="btn btn-primary w-full text-lg py-4 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon name="ShoppingCartIcon" size={24} />
        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>

      {/* Features */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
        {product.organic && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="CheckBadgeIcon" size={20} className="text-success" variant="solid" />
            100% Organic
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="TruckIcon" size={20} className="text-primary" />
          Free Shipping
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="ShieldCheckIcon" size={20} className="text-primary" />
          Quality Assured
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="ArrowPathIcon" size={20} className="text-primary" />
          Easy Returns
        </div>
      </div>
    </div>
  );
}