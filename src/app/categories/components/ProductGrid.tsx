"use client";

import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
  is_active: boolean;
  description: string | null;
}

interface ProductGridProps {
  filters: any;
  searchTerm: string;
}

export default function ProductGrid({ filters, searchTerm }: ProductGridProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }

    // Price filter
    const price = Number(product.price);
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return Number(a.price) - Number(b.price);
      case 'price-high':
        return Number(b.price) - Number(a.price);
      case 'new': case'popularity':
      default:
        return 0;
    }
  });

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image_url || '/assets/images/no_image.png',
      alt: product.name,
      price: Number(product.price),
      quantity: 1,
      weight: '1 unit',
      origin: product.category
    });

    const confirmGoToCart = confirm(`Added ${product.name} to cart!\n\nGo to cart now?`);
    if (confirmGoToCart) {
      router.push('/cart');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  if (sortedProducts.length === 0) {
    return (
      <div className="text-center py-20">
        <Icon name="ShoppingBagIcon" size={64} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
        <p className="text-muted-foreground">
          {searchTerm 
            ? `No products match "${searchTerm}". Try a different search term or adjust filters.`
            : 'Try adjusting your filters'
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{sortedProducts.length}</span> products
            {searchTerm && <span className="text-foreground font-semibold"> for "{searchTerm}"</span>}
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {sortedProducts.map((product, index) => (
          <Link
            key={product.id}
            href={`/product-details?id=${product.id}`}
            className={`group bg-card rounded-xl-organic border border-border hover-lift overflow-hidden ${
              isHydrated ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-muted">
              <AppImage
                src={product.image_url || '/assets/images/no_image.png'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Quick Add */}
              <button 
                onClick={(e) => handleQuickAdd(e, product)}
                className="absolute bottom-3 right-3 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon name="ShoppingCartIcon" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2 min-h-[2.5rem]">
                {product.name}
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-foreground">₹{Number(product.price).toFixed(2)}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                <span className="inline-block px-2 py-1 bg-muted rounded">{product.category}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}