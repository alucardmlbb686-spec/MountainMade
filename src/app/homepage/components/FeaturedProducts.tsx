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
      {/* Mobile Search Bar (Amazon Style) */}
      <div className="md:hidden sticky top-0 bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-3 z-20 shadow-md">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Icon
              name="MagnifyingGlassIcon"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
          <button 
            onClick={() => setSearchTerm('')}
            className="p-2 hover:bg-orange-600 rounded-full transition-colors"
            title="Clear search"
          >
            <Icon name="XMarkIcon" size={18} className="text-white" />
          </button>
        </div>
      </div>

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

      {/* Mobile Layout - Amazon Style */}
      <div className="md:hidden">
        {/* Category Filter - Horizontal Scroll */}
        {categories.length > 0 && (
          <div className="px-4 pb-3 overflow-x-auto">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === null
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products - Mobile Stack */}
        <div className="px-4 space-y-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/product-details?id=${product.id}`}
                className={`group flex gap-3 bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all ${
                  isHydrated ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${0.1 + index * 0.03}s` }}
              >
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-slate-100 overflow-hidden">
                  <AppImage
                    src={product.image_url || '/assets/images/no_image.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mt-1">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <div>
                      <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                      {product.stock <= 5 && (
                        <p className="text-xs text-red-600 font-medium">Only {product.stock} left</p>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Icon
                        name="ArrowRightIcon"
                        size={16}
                        className="text-orange-600"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <Icon name="MagnifyingGlassIcon" size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No products found</p>
            </div>
          )}
        </div>

        {/* Mobile View All CTA */}
        {filteredProducts.length > 0 && (
          <div className="px-4 pt-4 pb-6">
            <Link href="/categories" className="w-full block text-center bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors">
              View All Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}