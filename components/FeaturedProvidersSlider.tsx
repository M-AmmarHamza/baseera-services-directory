'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Provider, getCategoryBySlug, getCategoryName, getLocalizedCityName } from '@/lib/db';
import { formatVisitingPrice } from '@/lib/currencies';
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
  title?: string;
  badge?: string;
  subtitle?: string;
}

export default function FeaturedProvidersSlider({ providers, lang, title, badge, subtitle }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const isRTL = lang === 'ur' || lang === 'ar';

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
        const halfWidth = el.scrollWidth / 2;
        if (isRTL) {
          el.scrollLeft -= 0.75;
          if (halfWidth > 0 && Math.abs(el.scrollLeft) >= halfWidth) {
            el.scrollLeft += halfWidth;
          }
        } else {
          el.scrollLeft += 0.75;
          if (halfWidth > 0 && el.scrollLeft >= halfWidth) {
            el.scrollLeft -= halfWidth;
          }
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
  }, [displayProviders.length, isRTL]);

  const handleManualScroll = (direction: 'prev' | 'next') => {
    if (!scrollRef.current) return;
    let offset = direction === 'next' ? 340 : -340;
    if (isRTL) {
      offset = -offset;
    }
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full">
      {/* Unified Section Header + Navigation Arrows (In-Flow Flex Container to prevent overlap) */}
      {title ? (
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="min-w-0 overflow-visible">
            <div className="inline-flex items-center gap-2.5 flex-wrap">
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mb-0 ${lang === 'ur' ? 'font-urdu leading-[2.2]' : 'leading-snug'}`}>
                {title}
              </h2>
              {badge && (
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 shrink-0">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className={`text-sm text-gray-500 mt-1.5 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Manual Sliding Navigation Arrows */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleManualScroll('prev')}
              aria-label="Previous slide"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-[#059669] shadow-2xs transition-all cursor-pointer"
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => handleManualScroll('next')}
              aria-label="Next slide"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-[#059669] shadow-2xs transition-all cursor-pointer"
            >
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end mb-4 gap-2">
          <button
            type="button"
            onClick={() => handleManualScroll('prev')}
            aria-label="Previous slide"
            className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-[#059669] shadow-2xs transition-all cursor-pointer"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => handleManualScroll('next')}
            aria-label="Next slide"
            className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-[#059669] shadow-2xs transition-all cursor-pointer"
          >
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      )}

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
            lang === 'ur'
              ? `السلام علیکم ${provider.name}، میں نے بصیرہ ڈائریکٹری پر آپ کا تصدیق شدہ پروفائل دیکھا ہے۔ مجھے سروس درکار ہے۔`
              : lang === 'ar'
              ? `مرحباً ${provider.name}، شاهدت ملفك الموثق على منصة بصيرة. أود الاستفسار عن خدماتك.`
              : `Salam ${provider.name}, saw your verified profile on Baseera directory. I need service assistance.`
          )}`;

          const cityDisplay = getLocalizedCityName(provider.city_slug, lang);

          const catObj = getCategoryBySlug(provider.category_id);
          const categoryName = catObj ? getCategoryName(catObj, lang) : provider.category_id;

          return (
            <Link
              key={`${provider.id}-${index}`}
              href={profileUrl}
              className="bg-white border border-gray-200 hover:border-[#006948] rounded-2xl p-4 sm:p-5 w-[285px] xs:w-[305px] sm:w-[325px] shrink-0 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group duration-200 min-h-[310px]"
            >
              <div>
                {/* Header: Avatar, Name, Verified Badge & Primary Category */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 group-hover:ring-2 group-hover:ring-[#006948] transition-all">
                    <img
                      src={provider.avatar_url}
                      alt={provider.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0 overflow-visible text-start">
                    <div className="flex items-center gap-1.5 overflow-visible">
                      <h3
                        dir="auto"
                        className={`text-base sm:text-lg font-semibold text-neutral-900 group-hover:text-[#006948] transition-colors truncate mb-0 ${lang === 'ur' ? 'font-urdu leading-[2.0]' : 'leading-snug'}`}
                      >
                        {provider.name}
                      </h3>
                      {provider.is_verified && (
                        <span title="Verified by Baseera" className="text-[#059669] shrink-0">
                          <BadgeCheck className="w-4 h-4 text-[#059669]" />
                        </span>
                      )}
                    </div>
                    {/* Primary Category (Full, clearly visible, never truncated description) */}
                    <p className={`text-xs sm:text-sm font-bold text-[#006948] truncate mt-0.5 mb-0 ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
                      {categoryName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-amber-600 font-semibold" dir="ltr">
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

                {/* Short Bio Snippet (Strictly clamped to 2 lines with ellipsis, natural text flow) */}
                <p
                  dir="auto"
                  className={`text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 min-h-[38px] sm:min-h-[40px] text-start ${lang === 'ur' ? 'font-urdu leading-[2.0] min-h-[44px]' : 'leading-relaxed'}`}
                >
                  {provider.short_bio}
                </p>
              </div>

              {/* Action Footer: Visiting Charges & Direct WhatsApp CTA */}
              <div className="pt-3.5 mt-auto border-t border-gray-100 flex items-center justify-between gap-2.5 overflow-visible">
                <div className="min-w-0 overflow-visible text-start">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block truncate leading-tight">
                    {lang === 'ur' ? 'وزٹ چارجز' : lang === 'ar' ? 'رسوم الزيارة' : 'Visiting Charges'}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-neutral-900 block mt-0.5 whitespace-nowrap overflow-visible leading-tight">
                    {formatVisitingPrice(provider.starting_price, provider.country_code)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
                  }}
                  className="bg-[#059669] hover:bg-[#047857] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer min-h-[36px] leading-normal"
                  title={`Chat directly with ${provider.name} on WhatsApp`}
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                  <span className="whitespace-nowrap">{lang === 'ur' ? 'واٹس ایپ' : lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
