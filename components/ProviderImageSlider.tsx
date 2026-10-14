'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  images: string[];
  providerName: string;
}

export default function ProviderImageSlider({ images, providerName }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const fallbackImages = [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  ];

  const slideImages = images && images.length > 0 ? images : fallbackImages;

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slideImages.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slideImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
      {/* Current Slide using Next.js Image with unoptimized={true} */}
      <Image
        src={slideImages[currentIndex]}
        alt={`${providerName} Portfolio image ${currentIndex + 1}`}
        fill
        unoptimized={true}
        className="object-cover"
        priority
      />

      {/* Slide Navigation Controls */}
      {slideImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Image"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-neutral-800 hover:bg-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Image"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-neutral-800 hover:bg-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none">
            {slideImages.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-4' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
