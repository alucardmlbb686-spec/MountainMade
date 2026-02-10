"use client";

import React, { useState, useEffect } from 'react';
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

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();
  const { authReady } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    let retryAttempted = false;

    // Ensure we show a loading state while fetching
    setLoading(true);

    const fetchBestSellers = async () => {
      try {
        console.log('🔍 BestSellers: Starting fetch (no auth wait)...');
        
        // Add a timeout to prevent infinite hangs
        const timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('⏱️ BestSellers: Request timeout after 10s');
            abortController.abort();
          }
        }, 10000);
        
        const { data, error: queryError } = await supabase
          .from('products')
          .select('id, name, price, image_url, category, stock')
          .eq('is_active', true)
          .gt('stock', 0)
          .order('created_at', { ascending: false })
          .limit(8);
        
        clearTimeout(timeoutId);
        console.log('🔍 BestSellers: Got response');

        if (abortController.signal.aborted) {
          console.debug('🛑 BestSellers: Request was aborted (timeout)');
          return;
        }
        
        if (queryError) {
          const isAbortError = 
            queryError?.message?.includes('AbortError') ||
            queryError?.details?.includes('AbortError');
          
          if (isAbortError) {
            console.debug('🛑 BestSellers: Fetch aborted');
            return;
          }
          
          console.error('❌ BestSellers: Query error:', queryError.message);

          if (!retryAttempted && isMounted) {
            retryAttempted = true;
            console.log('🔁 BestSellers: Retrying fetch in 1s...');
            setTimeout(fetchBestSellers, 1000);
            return;
          }

          if (isMounted) {
            setError(queryError.message);
            setProducts([]);
            setLoading(false);
          }
        } else {
          console.log('✅ BestSellers: Success, got', data?.length || 0, 'products');
          if (isMounted) {
            setProducts(data || []);
            setError(null);
            setLoading(false);
          }
        }
      } catch (err: any) {
        if (isMounted && !abortController.signal.aborted) {
          console.error('❌ BestSellers: Caught exception:', err?.message);
          if (!retryAttempted) {
            retryAttempted = true;
            console.log('🔁 BestSellers: Retrying after exception in 1s...');
            setTimeout(fetchBestSellers, 1000);
            return;
          }
          setError(err?.message || 'Unknown error');
          setProducts([]);
          setLoading(false);
        }
      }
    };

    // Start initial fetch immediately (public reads should work using anon key)
    fetchBestSellers();

    if (!authReady) {
      console.log('⏳ BestSellers: Auth not ready; performed public fetch — will re-fetch when auth is ready');
    } else {
      console.log('🔍 BestSellers: Auth ready on mount.');
    }

    return () => {
      console.log('🛑 BestSellers: Cleaning up...');
      isMounted = false;
      abortController.abort();
    };
  }, [authReady, supabase]);

  return (
    <section className="py-12 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"></div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">
              Best Sellers 2026
            </h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-transparent rounded-full"></div>
          </div>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
            Top trending organic products loved by thousands of customers. Don't miss out on these bestselling essentials from the Himalayas.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length > 0 ? products.map((product: Product, index: number) => (
            <Link
              key={product.id}
              href={`/product-details?id=${product.id}`}
              className="group bg-card border border-border rounded-xl overflow-hidden hover-lift shadow-md transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              {/* Badge */}
              <div className="absolute top-3 right-3 z-10">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Icon name="StarIcon" size={14} variant="solid" />
                  Best Seller
                </div>
              </div>

              {/* Product Image */}
              <div className="aspect-square overflow-hidden bg-slate-100 relative">
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
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                    <Icon
                      name="ArrowRightIcon"
                      size={20}
                      className="text-orange-600 group-hover:text-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            </Link>
            )) : loading ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Loading best sellers...</p>
              </div>
            ) : null}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-4 min-w-min">
            {products.length > 0 ? products.map((product: Product, index: number) => (
              <Link
                key={product.id}
                href={`/product-details?id=${product.id}`}
                className="group flex-shrink-0 w-48 bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                {/* Product Image */}
                <div className="w-full h-40 overflow-hidden bg-slate-100 relative">
                  <AppImage
                    src={product.image_url || '/assets/images/no_image.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                    {product.category}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground mt-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-end justify-between mt-3">
                    <div>
                      <span className="text-xl font-bold text-foreground">₹{product.price}</span>
                      <p className="text-xs text-muted-foreground">{product.stock} left</p>
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
            )) : loading ? (
              <div className="text-center py-12 w-full">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
