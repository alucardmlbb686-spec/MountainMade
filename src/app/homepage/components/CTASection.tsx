"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function CTASection() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <AppImage
          src="https://images.unsplash.com/photo-1689600399249-732b2a19d261"
          alt="Mountain valley with green meadows and snow peaks at golden hour"
          className="w-full h-full object-cover" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40"></div>
      </div>

      <div className="container mx-auto text-center relative z-10">
        {/* Limited Time Offer Badge */}
        <div className={`inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 backdrop-blur-md text-white px-6 py-3 rounded-full mb-8 shadow-xl ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <Icon name="SparklesIcon" size={18} variant="solid" />
          <span className="text-sm font-bold">New Customer Offer: 15% OFF + Free Shipping</span>
        </div>

        <h2 className={`text-5xl md:text-6xl lg:text-7xl text-white font-serif font-bold mb-8 tracking-tight leading-tight ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`}>
          Experience Himalayan Purity Today
        </h2>
        <p className={`text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-12 leading-relaxed font-light ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          Join 50,000+ families who've made the switch to 100% traceable, organic foods. Your first order ships within 24 hours.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-5 mb-10 ${isHydrated ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <Link
            href="/categories"
            className="btn btn-primary text-lg px-12 py-5 shadow-2xl">
            Shop Now & Save 15%
            <Icon name="ArrowRightIcon" size={24} />
          </Link>
          <Link
            href="/homepage#sustainability"
            className="btn btn-secondary text-lg px-12 py-5 bg-white/15 backdrop-blur-premium border-white/40 text-white hover:bg-white/25">
            Learn Our Story
          </Link>
        </div>

        {/* Trust Signals */}
        <div className={`flex flex-wrap items-center justify-center gap-8 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2.5 text-white/90 text-sm font-medium">
            <Icon name="TruckIcon" size={20} />
            <span>Ships in 24 Hours</span>
          </div>
          <div className="flex items-center gap-2.5 text-white/90 text-sm font-medium">
            <Icon name="ShieldCheckIcon" size={20} />
            <span>30-Day Money-Back</span>
          </div>
          <div className="flex items-center gap-2.5 text-white/90 text-sm font-medium">
            <Icon name="StarIcon" size={20} variant="solid" />
            <span>4.9/5 from 12K+ Reviews</span>
          </div>
        </div>

        {/* Urgency Element */}
        <p className={`text-white/80 text-sm mt-8 font-medium ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          ⏰ Limited time offer ends soon. Use code <span className="font-bold text-white bg-white/20 px-3 py-1 rounded-lg">MOUNTAIN15</span> at checkout.
        </p>
      </div>
    </section>);

}