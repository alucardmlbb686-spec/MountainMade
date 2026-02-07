"use client";

import { useState, useEffect, useMemo } from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
}

export default function FeaturedProducts() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const supabase = useSupabaseClient();
  const { authReady } = useAuth();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!authReady) return; // Wait for auth to be ready
    
    let isMounted = true;

    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image_url, category, stock')
          .eq('is_active', true)
          .gt('stock', 0)
          .order('created_at', { ascending: false })
          .limit(12);

        // Check for AbortError in both message and details
        if (error) {
          const isAbortError = 
            error?.message?.includes('AbortError') ||
            error?.details?.includes('AbortError');
          
          if (isAbortError) {
            // Silently ignore abort errors - expected during auth init
            return;
          }
          
          throw error;
        }
        
        if (!isMounted) return;

        setProducts(data || []);
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching featured products:', error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeaturedProducts();

    return () => {
      isMounted = false;
    };
  }, [authReady, supabase]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  if (loading) {
    return (
      <section className="py-12 md:py-24 bg-gray-50 md:bg-white">
        <div className="w-full">
          <div className="flex items-center justify-center py-20">
            <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 md:bg-white md:py-24 py-8">
      {/* Desktop & Tablet Layout */}
      <div className="hidden md:block container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            className={`text-display font-serif text-foreground mb-4 ${
              isHydrated ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            Featured Products
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed ${
              isHydrated ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.1s' }}
          >
            Handpicked selections from our finest organic collection, sourced directly from Himalayan farmers.
          </p>
        </div>

        {/* Products Grid - Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 8).map((product, index) => (
            <Link
              key={product.id}
              href={`/product-details?id=${product.id}`}
              className={`group bg-card border border-border rounded-xl overflow-hidden hover-lift shadow-md ${
                isHydrated ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${0.2 + index * 0.05}s` }}
            >
              {/* Product Image */}
              <div className="aspect-square overflow-hidden bg-slate-100">
                <AppImage
                  src={product.image_url || '/assets/images/no_image.png'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="mb-2">
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">₹{product.price}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {product.stock} in stock
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Icon
                      name="ArrowRightIcon"
                      size={20}
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link href="/categories" className="btn btn-primary px-8 py-3.5 text-base">
            View All Products
            <Icon name="ArrowRightIcon" size={20} />
          </Link>
        </div>
      </div>

      {/* Mobile Layout - Quick Picks 3 Column Grid */}
      <div className="md:hidden">
        <div className="px-3 mb-3 mt-2">
          <h2 className="text-xl font-bold text-foreground mb-2">Quick Picks</h2>
        </div>
        <div className="px-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {filteredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/product-details?id=${product.id}`}
                  className={`group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col ${
                    isHydrated ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${0.1 + index * 0.03}s` }}
                >
                  {/* Product Image */}
                  <div className="w-full aspect-square bg-slate-100 overflow-hidden">
                    <AppImage
                      src={product.image_url || '/assets/images/no_image.png'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-2 flex flex-col flex-1">
                    <span className="text-xs font-medium text-orange-600 uppercase tracking-wide line-clamp-1">
                      {product.category}
                    </span>
                    <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 mt-1 flex-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                        <Icon
                          name="ArrowRightIcon"
                          size={14}
                          className="text-orange-600"
                        />
                      </div>
                    </div>
                    {product.stock <= 5 && (
                      <p className="text-xs text-red-600 font-medium mt-1">Only {product.stock}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="MagnifyingGlassIcon" size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">No products found</p>
            </div>
          )}
        </div>
        {/* Mobile View All CTA */}
        {filteredProducts.length > 0 && (
          <div className="px-3 pt-3 pb-4">
            <Link href="/categories" className="w-full block text-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold transition-colors text-sm">
              View All Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}