"use client";

import { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';

interface ProductGalleryProps {
  images: Array<{ id: string; url: string; alt: string }>;
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div className={`${isHydrated ? 'animate-fade-in-slide' : 'opacity-0'}`}>
      {/* Main Image */}
      <div className="relative aspect-square rounded-xl-organic overflow-hidden bg-muted mb-4 premium-shadow">
        <AppImage
          src={images[selectedImage].url}
          alt={images[selectedImage].alt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(index)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === index ? 'border-primary' : 'border-border hover:border-primary/50'
            }`}
          >
            <AppImage
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}