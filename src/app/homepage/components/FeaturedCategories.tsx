"use client";

import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export default function FeaturedCategories() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();
  const { authReady } = useAuth();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    let retryAttempted = false;
    setLoading(true);

    const fetchCategories = async () => {
      try {
        console.log('🔍 FeaturedCategories: Starting fetch (no auth wait)...');
        
        // Add a timeout to prevent infinite hangs
        const timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('⏱️ FeaturedCategories: Request timeout after 10s');
            abortController.abort();
          }
        }, 10000);

        const { data, error } = await supabase
          .from('products')
          .select('category, image_url')
          .eq('is_active', true);

        clearTimeout(timeoutId);

        if (abortController.signal.aborted) {
          console.debug('🛑 FeaturedCategories: Request was aborted (timeout)');
          return;
        }

        // Check for AbortError in both message and details
        if (error) {
          const isAbortError = 
            error?.message?.includes('AbortError') ||
            error?.details?.includes('AbortError');
          
          if (isAbortError) {
            console.debug('🛑 FeaturedCategories: Fetch aborted');
            return;
          }
          
          console.error('❌ FeaturedCategories: Query error:', error.message);

          // Retry once on transient errors
          if (!retryAttempted && isMounted) {
            retryAttempted = true;
            console.log('🔁 FeaturedCategories: Retrying fetch in 1s...');
            setTimeout(fetchCategories, 1000);
            return;
          }

          throw error;
        }

        if (!isMounted) {
          console.log('🛑 FeaturedCategories: Component unmounted, ignoring results');
          return;
        }
        
        console.log('✅ FeaturedCategories: Success, got', data?.length || 0, 'products');

        // Group products by category and count them
        const categoryMap = new Map<string, { count: number; image: string | null }>();
        
        data?.forEach((product) => {
          if (product.category) {
            const existing = categoryMap.get(product.category);
            if (existing) {
              existing.count++;
            } else {
              categoryMap.set(product.category, { count: 1, image: product.image_url });
            }
          }
        });

        // Convert to array format
        const categoriesArray: Category[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          image: data.image || '/assets/images/no_image.png',
          productCount: data.count,
        }));

        if (isMounted) {
          setCategories(categoriesArray);
          setLoading(false);
        }
      } catch (error: any) {
        if (isMounted && !abortController.signal.aborted) {
          console.error('❌ FeaturedCategories: Caught exception:', error?.message);
          setCategories([]);
          setLoading(false);
        }
      }
    };

    // Start fetch immediately to avoid blocking the UI; effect will re-run on authReady changes
    fetchCategories();

    if (!authReady) {
      console.log('⏳ FeaturedCategories: Auth not ready; performed public fetch — will re-fetch when auth is ready');
    } else {
      console.log('🔍 FeaturedCategories: Auth ready on mount.');
    }

    return () => {
      console.log('🛑 FeaturedCategories: Cleaning up...');
      isMounted = false;
      abortController.abort();
    };
  }, [authReady, supabase]);

  // Always render the section - only hide if truly no data after loading
  const hasCategories = categories.length > 0;

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className={`text-display font-serif text-foreground mb-4 ${
              isHydrated ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            Explore Pure Categories
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed ${
              isHydrated ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.1s' }}
          >
            Each product tells a story of mountain heritage, sustainable farming, and uncompromising quality.
          </p>
        </div>

        {/* Responsive Grid: 3 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {hasCategories ? categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/categories?category=${category.slug}`}
              className={`group relative overflow-hidden rounded-xl md:rounded-2xl bg-card border border-border hover-lift shadow-lg ${
                isHydrated ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              {/* Image */}
              <div className="aspect-[1/1] w-full h-auto max-h-28 md:max-h-none overflow-hidden">
                <AppImage
                  src={category.image}
                  alt={`${category.name} category`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3 md:p-6">
                <h3 className="text-xs md:text-2xl font-bold text-white mb-1 md:mb-2 font-serif tracking-tight line-clamp-1 md:line-clamp-none">
                  {category.name}
                </h3>
                <div className="flex items-center justify-between text-white/90 text-[10px] md:text-sm font-medium">
                  <span>{category.productCount} Products</span>
                  <Icon
                    name="ArrowRightIcon"
                    size={16}
                    className="group-hover:translate-x-2 transition-transform duration-300"
                  />
                </div>
              </div>
            </Link>
          )) : loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          ) : null}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 md:mt-14">
          <Link href="/categories" className="btn btn-secondary px-8 py-3.5 text-base">
            View All Categories
            <Icon name="ArrowRightIcon" size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}