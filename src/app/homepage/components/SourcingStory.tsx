"use client";

import { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function SourcingStory() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <section id="sustainability" className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className={`relative ${isHydrated ? 'animate-fade-in-slide' : 'opacity-0'}`}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_1e662dba5-1765086358509.png"
                alt="Mountain farmer in traditional clothing harvesting organic crops in terraced fields, Himalayan peaks in background"
                className="w-full aspect-portrait object-cover" />
              
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl p-8 shadow-2xl border border-border">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Icon name="MapPinIcon" size={32} className="text-primary" variant="solid" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground tracking-tight">3000m</p>
                  <p className="text-sm text-muted-foreground font-semibold">Elevation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className={`${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-amber-700 px-5 py-2.5 rounded-full mb-6 border border-amber-200 font-semibold text-sm">
              <Icon name="HeartIcon" size={18} variant="solid" className="text-amber-600" />
              Farmer Story
            </div>

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 tracking-tight leading-tight">
              Meet Rajesh from Uttarakhand
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Rajesh's family has been cultivating organic crops in the Himalayan foothills for three generations. At 3000 meters elevation, his farm produces some of the purest grains and herbs in the region.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              "We don't use any chemicals. The mountain soil, pure glacier water, and traditional farming methods passed down from my grandfather—that's our secret to quality," says Rajesh.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="border-l-4 border-primary pl-6">
                <p className="text-4xl font-bold text-foreground tracking-tight">1960</p>
                <p className="text-sm text-muted-foreground font-semibold mt-1">Family Farm Since</p>
              </div>
              <div className="border-l-4 border-amber-500 pl-6">
                <p className="text-4xl font-bold text-foreground tracking-tight">100%</p>
                <p className="text-sm text-muted-foreground font-semibold mt-1">Organic Certified</p>
              </div>
            </div>

            <button className="btn btn-primary px-8 py-3.5 text-base">
              <Icon name="BookOpenIcon" size={20} />
              Read Full Story
            </button>
          </div>
        </div>
      </div>
    </section>);

}