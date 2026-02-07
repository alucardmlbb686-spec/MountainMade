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

  // Auto-rotate carousel every 5 seconds (mobile only)
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
      <section className="relative h-96 md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
        <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin" />
      </section>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <>
      {/* MOBILE VIEW - PRODUCT CAROUSEL */}
      <section className="md:hidden relative h-96 flex items-center justify-center overflow-hidden bg-black">
        {/* Hot Badge - Top Center (only, removed old badge elsewhere) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex justify-center w-full">
          <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Icon name="StarIcon" size={16} variant="solid" />
            Hot
          </div>
        </div>

        {/* Sliding Background */}
        <div className="absolute inset-0 w-full h-full">
          <div
            key={currentIndex}
            className="absolute inset-0 animate-fade-in"
          >
            <AppImage
              src={currentProduct.image_url || '/assets/images/no_image.png'}
              alt={currentProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          </div>
        </div>

        {/* Sliding Content */}
        <div className="absolute inset-0 flex flex-col justify-end z-10 p-4">
          <div
            key={`text-${currentIndex}`}
            className="animate-fade-in"
          >
            <span className="text-orange-400 text-xs font-bold uppercase tracking-widest block mb-2">
              {currentProduct.category}
            </span>
            <h2 className="text-2xl font-serif font-bold text-white mb-2 line-clamp-2">
              {currentProduct.name}
            </h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-orange-400">₹{currentProduct.price}</span>
              <span className="text-white/80 text-sm">{currentProduct.stock} in stock</span>
            </div>
            <Link
              href={`/product-details?id=${currentProduct.id}`}
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              View Product
            </Link>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-all backdrop-blur-sm"
          aria-label="Previous"
        >
          <Icon name="ChevronLeftIcon" size={20} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-all backdrop-blur-sm"
          aria-label="Next"
        >
          <Icon name="ChevronRightIcon" size={20} />
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'bg-orange-500 w-6 h-2'
                  : 'bg-white/40 hover:bg-white/60 w-2 h-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* DESKTOP VIEW - STATIC HERO */}
      <section className="hidden md:flex relative min-h-screen items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <AppImage
            src="https://images.unsplash.com/photo-1590782936229-89dd6c88d5cf"
            alt="Majestic mountain landscape with snow-capped peaks at sunrise"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto pt-32 pb-20 text-center relative z-10">
          {/* Social Proof Banner */}
          <div className={`flex flex-wrap items-center justify-center gap-3 mb-8 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-premium px-5 py-2.5 rounded-full shadow-lg border border-white/20">
              <Icon name="CheckBadgeIcon" size={18} variant="solid" className="text-green-600" />
              <span className="text-sm font-semibold text-gray-900">USDA Organic Certified</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-premium px-5 py-2.5 rounded-full shadow-lg border border-white/20">
              <Icon name="StarIcon" size={18} variant="solid" className="text-amber-500" />
              <span className="text-sm font-semibold text-gray-900">4.9/5 from 12,000+ reviews</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className={`text-6xl md:text-7xl lg:text-8xl text-white font-serif font-bold mb-6 leading-[1.1] tracking-tight ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Himalayan Purity,<br />
            <span className="text-gradient bg-gradient-to-r from-green-400 to-amber-400 bg-clip-text text-transparent">Delivered to Your Doorstep</span>
          </h1>

          {/* Subheadline */}
          <p className={`text-xl md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed mb-10 font-light ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            Join 50,000+ families enjoying 100% traceable, organic foods sourced directly from 500+ verified mountain farmers.
          </p>

          {/* Trust Metrics */}
          <div className={`flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-12 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
            <div className="text-white">
              <p className="text-4xl md:text-5xl font-bold mb-1">50K+</p>
              <p className="text-sm text-white/80 font-medium">Happy Customers</p>
            </div>
            <div className="w-px h-16 bg-white/30"></div>
            <div className="text-white">
              <p className="text-4xl md:text-5xl font-bold mb-1">500+</p>
              <p className="text-sm text-white/80 font-medium">Partner Farmers</p>
            </div>
            <div className="w-px h-16 bg-white/30"></div>
            <div className="text-white">
              <p className="text-4xl md:text-5xl font-bold mb-1">100%</p>
              <p className="text-sm text-white/80 font-medium">Traceable Origin</p>
            </div>
          </div>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <Link href="/categories" className="btn btn-primary text-base px-10 py-4 shadow-xl">
              Shop Premium Foods
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
            <Link href="/homepage#about" className="btn btn-secondary text-base px-10 py-4 bg-white/15 backdrop-blur-premium border-white/40 text-white hover:bg-white/25">
              See Our Impact
            </Link>
          </div>

          {/* Trust Badges Row */}
          <div className={`flex flex-wrap items-center justify-center gap-8 mt-12 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.7s' }}>
            <div className="flex items-center gap-2.5 text-white/90 text-sm font-medium">
              <Icon name="TruckIcon" size={20} />
              <span>Free Shipping ₹999+</span>
            </div>
            <div className="flex items-center gap-2.5 text-white/90 text-sm font-medium">
              <Icon name="ShieldCheckIcon" size={20} />
              <span>100% Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2.5 text-white/90 text-sm font-medium">
              <Icon name="ClockIcon" size={20} />
              <span>Delivered in 2-3 Days</span>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
            <span className="text-xs uppercase tracking-widest font-medium">Scroll</span>
            <Icon name="ChevronDownIcon" size={24} className="animate-bounce" />
          </div>
        </div>
      </section>
    </>
  );
}