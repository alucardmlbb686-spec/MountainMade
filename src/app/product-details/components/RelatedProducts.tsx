"use client";

import { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  alt: string;
  rating: number;
  origin: string;
}

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto">
        <h2 className={`text-3xl font-bold text-foreground font-serif mb-8 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`}>
          You Might Also Like
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/product-details?id=${product.slug}`}
              className={`group bg-card rounded-xl-organic border border-border hover-lift overflow-hidden ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <AppImage
                  src={product.image}
                  alt={product.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
                  <Icon name="MapPinIcon" size={12} />
                  {product.origin}
                </div>
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">₹{product.price}</span>
                  <div className="flex items-center gap-1">
                    <Icon name="StarIcon" size={14} className="text-accent" variant="solid" />
                    <span className="text-sm text-muted-foreground">{product.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}