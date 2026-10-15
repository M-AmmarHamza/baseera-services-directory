'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Provider } from '@/lib/db';
import {
  Star,
  BadgeCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  WhatsAppIcon,
} from '@/components/Icons';

interface Props {
  providers: Provider[];
  lang: string;
}

export default function FeaturedProvidersSlider({ providers, lang }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Take up to 20 providers
  const displayProviders = providers.slice(0, 20);

  // Duplicate for seamless infinite loop
  const loopList = [...displayProviders, ...displayProviders];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let pausedByHover = false;

    const onMouseEnter = () => {
      pausedByHover = true;
      setIsPaused(true);
    };
    const onMouseLeave = () => {
      pausedByHover = false;
      setIsPaused(false);
    };
    const onTouchStart = () => {
      pausedByHover = true;
      setIsPaused(true);
    };
    const onTouchEnd = () => {
      setTimeout(() => {
        pausedByHover = false;
        setIsPaused(false);
      }, 1500);
    };

    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    const step = () => {
      if (!pausedByHover && el) {
        el.scrollLeft += 0.75; // Smooth, readable ~45px/second speed

        // Seamless wrap when first batch has completely scrolled
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0 && el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [displayProviders.length]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -340 : 340;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full">
      {/* Manual Sliding Navigation Arrows */}
      <div className="flex items-center gap-2 absolute -top-12 right-0 sm:right-0 z-10">
        <button
          type="button"
          onClick={() => handleManualScroll('left')}
          aria-label="Previous slide"
          className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-[#059669] shadow-2xs transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleManualScroll('right')}
          aria-label="Next slide"
          className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-[#059669] shadow-2xs transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Infinite Smooth Sliding Carousel Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar select-none cursor-grab active:cursor-grabbing"
        style={{ scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        {loopList.map((provider, index) => {
          const profileUrl = `/${lang}/${provider.country_code}/${provider.city_slug}/${provider.category_id}/${provider.slug}`;
          const cleanPhone = provider.whatsapp_number.replace(/[^0-9]/g, '');
          const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Salam ${provider.name}, saw your verified profile on Baseera directory. I need service assistance.`
          )}`;

          const cityDisplay = provider.city_slug
            ? provider.city_slug.charAt(0).toUpperCase() + provider.city_slug.slice(1)
            : 'Karachi';

          return (
            <Link
              key={`${provider.id}-${index}`}
              href={profileUrl}
              className="bg-white border border-gray-200 hover:border-[#006948] rounded-2xl p-4 sm:p-5 w-[280px] xs:w-[300px] sm:w-[320px] shrink-0 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group duration-200"
            >
              <div>
                {/* Header: Avatar, Name, Verified Badge & Trade */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 group-hover:ring-2 group-hover:ring-[#006948] transition-all">
                    <img
                      src={provider.avatar_url}
                      alt={provider.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0 overflow-visible">
                    <div className="flex items-center gap-1.5 overflow-visible">
                      <h3 className={`text-lg font-semibold text-neutral-900 group-hover:text-[#006948] transition-colors truncate ${lang === 'ur' ? 'font-urdu leading-[2.2] py-0.5' : 'leading-snug'}`}>
                        {provider.name}
                      </h3>
                      {provider.is_verified && (
                        <span title="Verified by Baseera" className="text-[#059669] shrink-0">
                          <BadgeCheck className="w-4 h-4 text-[#059669]" />
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-semibold text-[#006948] truncate mt-0.5 ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
                      {provider.trade_title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-amber-600 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                      <span>{provider.rating.toFixed(1)}</span>
                      <span className="text-gray-400 font-normal">({provider.review_count})</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3 overflow-visible">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">
                    {provider.district}, {cityDisplay}
                  </span>
                </div>

                {/* Short Bio Snippet */}
                <p className={`text-sm text-gray-600 mb-4 line-clamp-2 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5]' : 'leading-relaxed'}`}>
                  {provider.short_bio}
                </p>
              </div>

              {/* Action Footer: Visiting Charges & Direct WhatsApp CTA */}
              <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs uppercase font-bold text-gray-400 block">
                    Visiting
                  </span>
                  <span className="text-sm font-bold text-neutral-900">
                    {provider.country_code === 'ae' ? `AED ${provider.starting_price}` : `Rs. ${provider.starting_price}`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
                  }}
                  className="bg-[#059669] hover:bg-[#047857] active:scale-[0.98] text-white text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
                  title={`Chat directly with ${provider.name} on WhatsApp`}
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
