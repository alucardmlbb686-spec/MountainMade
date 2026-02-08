"use client";

import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';

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

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('category, image_url')
          .eq('is_active', true);

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

        // Group products by category and count them
        const categoryMap = new Map<string, { count: number; image: string | null }>();
        
        data?.forEach((product) => {
          const existing = categoryMap.get(product.category);
          if (existing) {
            existing.count++;
          } else {
            categoryMap.set(product.category, { count: 1, image: product.image_url });
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
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching categories:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setIsHydrated(true);
    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [authReady]);

  if (loading) {
    return null;
  }

  if (categories.length === 0) {
    return null;
  }

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
          {categories.map((category, index) => (
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
          ))}
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