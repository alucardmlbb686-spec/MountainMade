"use client";

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface ProductTabsProps {
  farmerStory: {
    name: string;
    location: string;
    image: string;
    alt: string;
    story: string;
    farmingSince: number;
  };
  nutrition: Array<{ id: string; label: string; value: string }>;
  reviews: Array<{
    id: string;
    name: string;
    rating: number;
    date: string;
    comment: string;
    verified: boolean;
  }>;
}

export default function ProductTabs({ farmerStory, nutrition, reviews }: ProductTabsProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'nutrition' | 'reviews'>('story');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const tabs = [
    { id: 'story' as const, label: 'Farmer Story', icon: 'UserIcon' },
    { id: 'nutrition' as const, label: 'Nutrition', icon: 'DocumentTextIcon' },
    { id: 'reviews' as const, label: `Reviews (${reviews.length})`, icon: 'ChatBubbleLeftIcon' },
  ];

  return (
    <div className={`${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary font-semibold' :'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab.icon as any} size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Farmer Story Tab */}
        {activeTab === 'story' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative rounded-xl-organic overflow-hidden premium-shadow">
              <AppImage
                src={farmerStory.image}
                alt={farmerStory.alt}
                className="w-full aspect-portrait object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground font-serif mb-2">
                Meet {farmerStory.name}
              </h3>
              <p className="text-muted-foreground mb-4">
                <Icon name="MapPinIcon" size={16} className="inline mr-1" />
                {farmerStory.location}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {farmerStory.story}
              </p>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
                <Icon name="CalendarIcon" size={20} />
                <span className="font-semibold">Farming since {farmerStory.farmingSince}</span>
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Tab */}
        {activeTab === 'nutrition' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nutrition.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="text-foreground font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{review.name}</span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                          <Icon name="CheckBadgeIcon" size={12} variant="solid" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{review.date}</p></div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={`review_star_${review.id}_${i}`}
                        name="StarIcon"
                        size={16}
                        className={i < review.rating ? 'text-accent' : 'text-muted'}
                        variant={i < review.rating ? 'solid' : 'outline'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}