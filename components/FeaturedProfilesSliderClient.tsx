'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Star,
  BadgeCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/Icons';
import { Provider, getLocalizedCityName, getCategoryBySlug, getCategoryName } from '@/lib/db';
import { formatVisitingPrice } from '@/lib/currencies';
import { getCleanWhatsAppUrl } from '@/lib/phone';
import LeadTrackButton from '@/components/LeadTrackButton';

export interface FeaturedProfilesSliderClientProps {
  items: Provider[];
  title: string;
  subtitle?: string;
  lang: string;
  country: string;
  city: string;
  category: string;
}

export default function FeaturedProfilesSliderClient({
  items,
  title,
  subtitle,
  lang,
  country,
  city,
  category,
}: FeaturedProfilesSliderClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRTL = lang === 'ur' || lang === 'ar';
  const isUrdu = lang === 'ur';

  if (!items || items.length === 0) {
    return null;
  }

  const scroll = (direction: 'prev' | 'next') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    const factor = direction === 'next' ? 1 : -1;
    const delta = isRTL ? -factor * scrollAmount : factor * scrollAmount;
    scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const localizedCity = getLocalizedCityName(city, lang);
  const catObj = getCategoryBySlug(category);
  const localizedCat = catObj ? getCategoryName(catObj, lang) : category;

  return (
    <section className="w-full my-8 sm:my-10 overflow-hidden">
      {/* Header with Title and Scroll Controls */}
      <div className="flex items-end justify-between gap-4 mb-4 sm:mb-5">
        <div className="overflow-visible max-w-2xl">
          {/* Badge Visual Cue */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span className="uppercase tracking-wider">
              {isUrdu
                ? 'نمایاں و اسپانسرڈ ماہرین'
                : lang === 'ar'
                ? 'فنيون مميزون ومعتمدون'
                : 'Featured & Sponsored'}
            </span>
          </div>

          <h2
            className={`text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 leading-snug overflow-visible ${
              isUrdu ? 'font-urdu leading-[2.3]' : ''
            }`}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              className={`text-xs sm:text-sm text-gray-600 mt-1 line-clamp-1 overflow-visible ${
                isUrdu ? 'font-urdu leading-[2.1]' : ''
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Scroll Arrow Buttons for Desktop */}
        {items.length > 2 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll('prev')}
              className="p-2 sm:p-2.5 rounded-full border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-900 transition-colors shadow-2xs cursor-pointer active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              onClick={() => scroll('next')}
              className="p-2 sm:p-2.5 rounded-full border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-900 transition-colors shadow-2xs cursor-pointer active:scale-95"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* Snap Scrollable Horizontal Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 hide-scrollbar scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
      >
        {items.map((pro, idx) => {
          const proSlug = pro.slug || '';
          const targetCity = (city || pro.city_slug || 'karachi').toLowerCase();
          const targetCat = (category || pro.category_id || 'electrician').toLowerCase();
          const proHref = `/${lang}/${country.toLowerCase()}/${targetCity}/${targetCat}/${proSlug}`;

          const whatsAppUrl = getCleanWhatsAppUrl(
            pro.whatsapp_number,
            lang === 'ur'
              ? `السلام علیکم! میں نے بصیرہ پر آپ کا نمایاں پروفائل دیکھا ہے اور مجھے ${pro.trade_title || localizedCat} کے حوالے سے سروس درکار ہے۔`
              : lang === 'ar'
              ? `مرحباً، لقد وجدت ملفك المميز على دليل بصيرة وأحتاج إلى خدمة ${pro.trade_title || localizedCat}.`
              : `Hello, I saw your featured profile on Baseera directory and would like to inquire about your ${pro.trade_title || localizedCat} services.`
          );

          return (
            <div
              key={pro.id || proSlug || idx}
              className="snap-start shrink-0 w-[290px] sm:w-[320px] bg-gradient-to-b from-amber-50/40 via-white to-white rounded-2xl border-2 border-amber-300 hover:border-amber-400 p-3.5 sm:p-4 hover:shadow-md transition-all flex flex-col justify-between group shadow-xs relative ring-1 ring-amber-400/20"
            >
              <div>
                {/* Distinct Top Featured Cue Bar */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                    <span>{isUrdu ? 'خصوصی پیشکش' : lang === 'ar' ? 'مميز' : 'Featured'}</span>
                  </div>

                  <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md">
                    <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
                    <span>{isUrdu ? 'فوری رسپانس' : lang === 'ar' ? 'رد فوري' : 'Fast Response'}</span>
                  </div>
                </div>

                {/* Photo & Rating Banner */}
                <Link
                  href={proHref}
                  className="block relative w-full h-32 rounded-xl overflow-hidden mb-3 bg-gray-100 border border-amber-200/60 shadow-2xs"
                >
                  <img
                    src={pro.avatar_url}
                    alt={pro.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs border border-gray-100">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span className="text-xs font-bold text-gray-900">
                      {pro.rating?.toFixed(1) || '4.9'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-normal">
                      ({pro.review_count || 10})
                    </span>
                  </div>
                  {pro.is_verified && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-700 text-white px-2 py-0.5 rounded-md text-[10px] font-semibold shadow-xs">
                      <BadgeCheck className="w-3 h-3 text-white" />
                      <span>{isUrdu ? 'تصدیق شدہ' : lang === 'ar' ? 'معتمد' : 'Verified'}</span>
                    </div>
                  )}
                </Link>

                {/* Name & Trade Title */}
                <Link href={proHref} className="block">
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                    {pro.name}
                  </h3>
                  <p
                    className={`text-xs text-amber-900 font-semibold truncate mt-0.5 ${
                      isUrdu ? 'font-urdu leading-[2.1]' : ''
                    }`}
                  >
                    {pro.trade_title || localizedCat}
                  </p>
                </Link>

                {/* Location */}
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1.5 truncate">
                  <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">
                    {pro.district
                      ? `${pro.district}, ${localizedCity || pro.city_slug}`
                      : localizedCity || pro.city_slug}
                  </span>
                </div>
              </div>

              {/* Bottom Action Area (Price + Direct Contact + Profile) */}
              <div className="mt-3.5 pt-2.5 border-t border-amber-200/60 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block leading-none">
                    {isUrdu ? 'وزٹ چارجز' : lang === 'ar' ? 'الكشفية' : 'Visit Fee'}
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {formatVisitingPrice(pro.starting_price, pro.country_code || country)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* WhatsApp Quick Lead Action */}
                  <LeadTrackButton
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    providerId={pro.id}
                    categoryId={category}
                    cityId={city}
                    clickType="whatsapp"
                    className="bg-[#059669] hover:bg-[#047857] text-white p-2 rounded-lg transition-colors inline-flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
                    title={isUrdu ? 'واٹس ایپ پر رابطہ کریں' : lang === 'ar' ? 'محادثة واتساب' : 'Chat on WhatsApp'}
                    ariaLabel="Chat on WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                  </LeadTrackButton>

                  {/* Profile Link */}
                  <Link
                    href={proHref}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors border border-amber-200/80 shadow-2xs"
                  >
                    <span>{isUrdu ? 'پروفائل' : lang === 'ar' ? 'الملف' : 'View'}</span>
                    <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
