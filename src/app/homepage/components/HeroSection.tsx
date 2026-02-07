"use client";

import { useEffect, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
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

export default function HeroSection() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();
  const { authReady } = useAuth();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image_url, category, stock')
          .eq('is_active', true)
          .gt('stock', 0)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          const isAbortError = 
            error?.message?.includes('AbortError') ||
            error?.details?.includes('AbortError');
          
          if (isAbortError) return;
          throw error;
        }
        
        if (!isMounted) return;
        setProducts(data || []);
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching products:', error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => { isMounted = false; };
  }, [authReady, supabase]);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (products.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [products.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index % products.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  if (loading || products.length === 0) {
    return (
      <section className="relative h-96 md:h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
        <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin" />
      </section>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <section className="relative h-96 md:h-screen flex items-center justify-center overflow-hidden group">
      {/* Background Product Image */}
      <div className="absolute inset-0 -z-10">
        <AppImage
          src={currentProduct.image_url || '/assets/images/no_image.png'}
          alt={currentProduct.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Product Info */}
          <div className={`text-white ${ isHydrated ? 'animate-fade-in-up' : 'opacity-0' }`}>
            <span className="inline-block text-orange-400 text-sm font-bold uppercase tracking-widest mb-4">
              New Arrival
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-4 leading-tight">
              {currentProduct.name}
            </h1>
            <p className="text-orange-300 text-lg font-medium mb-4">{currentProduct.category}</p>
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-5xl md:text-6xl font-bold">₹{currentProduct.price}</span>
              <span className="text-white/70 text-lg">In Stock: {currentProduct.stock}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/product-details?id=${currentProduct.id}`}
                className="btn btn-primary text-base px-8 py-3 shadow-xl"
              >
                View Product
                <Icon name="ArrowRightIcon" size={20} />
              </Link>
              <Link
                href="/categories"
                className="btn bg-white/20 backdrop-blur-premium border border-white/40 text-white hover:bg-white/30 text-base px-8 py-3"
              >
                Shop All
              </Link>
            </div>
          </div>

          {/* Right: Product Image (Mobile/Desktop fallback) */}
          <div className="hidden md:flex justify-end">
            <div className="relative w-full max-w-sm">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                <AppImage
                  src={currentProduct.image_url || '/assets/images/no_image.png'}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-premium text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous product"
      >
        <Icon name="ChevronLeftIcon" size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-premium text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next product"
      >
        <Icon name="ChevronRightIcon" size={24} />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              index === currentIndex
                ? 'bg-orange-500 w-8 h-2'
                : 'bg-white/50 hover:bg-white/70 w-2 h-2'
            }`}
            aria-label={`Go to product ${index + 1}`}
          />
        ))}
      </div>

      {/* Trust Badges */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-premium px-4 py-2 rounded-full shadow-lg border border-white/20">
          <Icon name="CheckBadgeIcon" size={16} variant="solid" className="text-green-600" />
          <span className="text-xs font-semibold text-gray-900">USDA Certified</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-premium px-4 py-2 rounded-full shadow-lg border border-white/20">
          <Icon name="StarIcon" size={16} variant="solid" className="text-amber-500" />
          <span className="text-xs font-semibold text-gray-900">4.9/5 Reviews</span>
        </div>
      </div>
    </section>
  );
}