"use client";

import { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  image: string;
  alt: string;
  rating: number;
  text: string;
  product: string;
  verified: boolean;
  date: string;
}

export default function Testimonials() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const testimonials: Testimonial[] = [
  {
    id: 'test_1',
    name: 'Priya Mehta',
    location: 'Mumbai',
    image: "https://images.unsplash.com/photo-1620280518494-2b2a293b3af0",
    alt: 'Portrait of smiling woman with long dark hair in casual clothing',
    rating: 5,
    text: "Switched to MountainMade 6 months ago and haven't looked back. The honey is incredible - you can taste the difference. Love that I can scan the QR code and see exactly which farm it came from!",
    product: 'Himalayan Wild Honey',
    verified: true,
    date: 'Jan 2026'
  },
  {
    id: 'test_2',
    name: 'Arjun Kapoor',
    location: 'Delhi',
    image: "https://images.unsplash.com/photo-1500732618685-061065d66160",
    alt: 'Portrait of young man with short beard wearing blue shirt outdoors',
    rating: 5,
    text: 'As someone who cares about sustainability, I appreciate the transparency. The farmer profiles are a game-changer. Quality is consistently excellent, and delivery is always on time.',
    product: 'Mountain Basmati Rice',
    verified: true,
    date: 'Dec 2025'
  },
  {
    id: 'test_3',
    name: 'Sneha Desai',
    location: 'Bangalore',
    image: "https://images.unsplash.com/photo-1505499663565-1ec2a8397f5b",
    alt: 'Portrait of woman with glasses and curly hair smiling warmly',
    rating: 5,
    text: 'Finally found a brand that delivers on its promises. The herbs are so fresh and aromatic. Customer service is top-notch - they genuinely care about their customers and farmers.',
    product: 'Alpine Herb Mix',
    verified: true,
    date: 'Jan 2026'
  }];


  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-amber-500/10 text-primary px-5 py-2.5 rounded-full mb-6 border border-primary/20 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <Icon name="StarIcon" size={18} variant="solid" className="text-amber-500" />
            <span className="text-sm font-bold">Rated 4.9/5 from 12,000+ Reviews</span>
          </div>
          <h2 className={`text-display font-serif text-foreground mb-5 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            Trusted by Health-Conscious Families
          </h2>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Real stories from real customers who've experienced the MountainMade difference.
          </p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) =>
          <div
            key={testimonial.id}
            className={`bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 border border-border hover-lift relative shadow-lg ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
            
              {/* Verified Badge */}
              {testimonial.verified && (
                <div className="absolute top-6 right-6 bg-gradient-to-r from-green-100 to-green-50 text-green-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-200 shadow-sm">
                  <Icon name="CheckBadgeIcon" size={16} variant="solid" />
                  <span className="text-xs font-bold">Verified</span>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-1 mb-5">
                {[...Array(testimonial.rating)].map((_, i) =>
              <Icon key={`star_${testimonial.id}_${i}`} name="StarIcon" size={20} className="text-amber-500" variant="solid" />
              )}
              </div>

              {/* Text */}
              <p className="text-muted-foreground leading-relaxed mb-6 text-base">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-5 border-t border-border">
                <AppImage
                src={testimonial.image}
                alt={testimonial.alt}
                className="w-14 h-14 rounded-full object-cover shadow-md" />
              
                <div className="flex-1">
                  <p className="font-bold text-foreground tracking-tight">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground font-medium">{testimonial.location} • {testimonial.date}</p>
                </div>
              </div>

              {/* Product Tag */}
              <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-4 py-2 rounded-full font-semibold border border-primary/20">
                <Icon name="ShoppingBagIcon" size={14} />
                {testimonial.product}
              </div>
            </div>
          )}
        </div>

        {/* Social Proof Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 p-10 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-border shadow-lg">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2 tracking-tight">12,000+</p>
            <p className="text-sm text-muted-foreground font-semibold">5-Star Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2 tracking-tight">98%</p>
            <p className="text-sm text-muted-foreground font-semibold">Repeat Customers</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2 tracking-tight">50K+</p>
            <p className="text-sm text-muted-foreground font-semibold">Active Members</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2 tracking-tight">4.9/5</p>
            <p className="text-sm text-muted-foreground font-semibold">Average Rating</p>
          </div>
        </div>
      </div>
    </section>);

}