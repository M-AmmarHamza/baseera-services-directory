'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  BadgeCheck,
  Sparkles,
} from 'lucide-react';
import { CategoryIcon } from '@/components/Icons';
import {
  getLocalizedCityName,
  getLocalizedCountryName,
  getCategoryName,
  getCategoryBySlug,
  getCountryByCode,
  Provider,
  Category,
  City,
} from '@/lib/db';
import { formatVisitingPrice } from '@/lib/currencies';

export interface RelatedSliderProps {
  type: 'cities' | 'categories' | 'providers';
  title: string;
  subtitle?: string;
  items: Array<City | Category | Provider | any>;
  currentSlug?: string;
  lang: string;
  country: string;
  city?: string;
  category?: string;
  viewAllHref?: string;
}

export default function RelatedSlider({
  type,
  title,
  subtitle,
  items,
  currentSlug,
  lang,
  country,
  city,
  category,
  viewAllHref,
}: RelatedSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRTL = lang === 'ur' || lang === 'ar';

  // Strictly exclude the currently viewed item if currentSlug is provided
  const filteredItems = (items || []).filter((item) => {
    if (!currentSlug) return true;
    const slug = (item.slug || item.id || '').toLowerCase();
    return slug !== currentSlug.toLowerCase();
  });

  if (filteredItems.length === 0) {
    return null;
  }

  const scroll = (direction: 'prev' | 'next') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    const factor = direction === 'next' ? 1 : -1;
    const delta = isRTL ? -factor * scrollAmount : factor * scrollAmount;
    scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const cityName = city ? getLocalizedCityName(city, lang) : '';
  const countryObj = getCountryByCode(country);
  const countryName = getLocalizedCountryName(countryObj, lang);

  return (
    <section className="w-full my-8 sm:my-12 overflow-hidden">
      {/* Header with Title and Scroll Controls */}
      <div className="flex items-end justify-between gap-4 mb-4 sm:mb-6">
        <div className="overflow-visible max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#006948]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#006948]">
              {type === 'cities'
                ? lang === 'ur'
                  ? 'شہری نیٹ ورک'
                  : lang === 'ar'
                  ? 'شبكة المدن'
                  : 'City Network'
                : type === 'categories'
                ? lang === 'ur'
                  ? 'مشہور سروسز'
                  : lang === 'ar'
                  ? 'خدمات مميزة'
                  : 'Popular Services'
                : lang === 'ur'
                ? 'تصدیق شدہ کاریگر'
                : lang === 'ar'
                ? 'فنيون معتمدون'
                : 'Verified Experts'}
            </span>
          </div>
          <h2
            className={`text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 overflow-visible ${
              lang === 'ur' ? 'font-urdu leading-[2.4] pt-1' : 'leading-snug'
            }`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`text-xs sm:text-sm text-gray-500 overflow-visible mt-0.5 ${
                lang === 'ur' ? 'font-urdu leading-[2.2]' : ''
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop Navigation Chevrons */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs sm:text-sm font-semibold text-[#006948] hover:underline mr-2"
            >
              {lang === 'ur' ? 'سب دیکھیں' : lang === 'ar' ? 'عرض الكل' : 'View All'}
            </Link>
          )}
          <button
            onClick={() => scroll('prev')}
            aria-label="Previous"
            className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-colors shadow-2xs hover:border-gray-300"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <button
            onClick={() => scroll('next')}
            aria-label="Next"
            className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-colors shadow-2xs hover:border-gray-300"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Row (Native Tailwind overflow-x-auto & snap-x) */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 hide-scrollbar scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
      >
        {filteredItems.map((item, idx) => {
          // Responsive Card Sizing with snap-start and minimum width to prevent overflow
          const cardWidthClasses =
            'snap-start min-w-[150px] sm:min-w-[180px] md:min-w-[200px] shrink-0';

          if (type === 'cities') {
            const cityItem = item as City;
            const citySlug = cityItem.slug || '';
            const localizedCity = getLocalizedCityName(citySlug, lang);
            const cityHref = `/${lang}/${country.toLowerCase()}/${citySlug}`;

            return (
              <Link
                key={citySlug || idx}
                href={cityHref}
                className={`${cardWidthClasses} bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 hover:border-[#006948] hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-[#006948] group-hover:text-white transition-all">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-[#006948] transition-colors truncate">
                    {localizedCity}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{countryName}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#006948]">
                  <span>
                    {lang === 'ur'
                      ? 'سروسز دیکھیں'
                      : lang === 'ar'
                      ? 'استكشف الخدمات'
                      : 'Explore'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                </div>
              </Link>
            );
          }

          if (type === 'categories') {
            const catItem = item as Category;
            const catSlug = catItem.slug || catItem.id;
            const localizedCatName = getCategoryName(catItem, lang);
            const targetCity = (city || 'karachi').toLowerCase();
            const catHref = `/${lang}/${country.toLowerCase()}/${targetCity}/${catSlug}`;

            return (
              <Link
                key={catSlug || idx}
                href={catHref}
                className={`${cardWidthClasses} bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 hover:border-[#006948] hover:shadow-md transition-all flex flex-col items-center text-center justify-between group shadow-2xs`}
              >
                <div className="flex flex-col items-center w-full">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-[#006948] group-hover:text-white transition-all">
                    <CategoryIcon slug={catItem.slug || catSlug} id={catItem.id} name={catItem.name} icon={catItem.icon} className="w-6 h-6" />
                  </div>
                  <h3
                    className={`font-bold text-sm text-gray-900 group-hover:text-[#006948] transition-colors text-center line-clamp-2 ${
                      lang === 'ur' ? 'font-urdu leading-[2.2]' : 'leading-snug'
                    }`}
                  >
                    {localizedCatName}
                  </h3>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100 w-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#006948] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {catItem.count || '20'}+{' '}
                    {lang === 'ur' ? 'دستیاب' : lang === 'ar' ? 'متاح' : 'Active'}
                  </span>
                </div>
              </Link>
            );
          }

          // Type: 'providers'
          const pro = item as Provider;
          const proSlug = pro.slug || '';
          const targetCity = (city || pro.city_slug || 'karachi').toLowerCase();
          const targetCat = (category || pro.category_id || 'electrician').toLowerCase();
          const proHref = `/${lang}/${country.toLowerCase()}/${targetCity}/${targetCat}/${proSlug}`;

          const catObj = getCategoryBySlug(pro.category_id);
          const localizedCat = catObj ? getCategoryName(catObj, lang) : pro.trade_title;

          return (
            <div
              key={pro.id || proSlug || idx}
              className={`${cardWidthClasses} bg-white rounded-2xl border border-gray-200/80 p-3 sm:p-4 hover:border-[#006948] hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs`}
            >
              <div>
                {/* Photo & Rating Header */}
                <Link href={proHref} className="block relative w-full h-32 rounded-xl overflow-hidden mb-3 bg-gray-100">
                  <img
                    src={pro.avatar_url}
                    alt={pro.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span className="text-xs font-bold text-gray-900">{pro.rating?.toFixed(1) || '4.9'}</span>
                  </div>
                  {pro.is_verified && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-[#006948] text-white px-2 py-0.5 rounded-md text-[10px] font-semibold shadow-xs">
                      <BadgeCheck className="w-3 h-3 text-white" />
                      <span>{lang === 'ur' ? 'تصدیق شدہ' : lang === 'ar' ? 'معتمد' : 'Verified'}</span>
                    </div>
                  )}
                </Link>

                {/* Name & Specialty */}
                <Link href={proHref} className="block">
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#006948] transition-colors truncate">
                    {pro.name}
                  </h3>
                  <p className={`text-xs text-[#006948] font-semibold truncate mt-0.5 ${lang === 'ur' ? 'font-urdu leading-[2.1]' : ''}`}>
                    {localizedCat}
                  </p>
                </Link>

                {/* Location */}
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1.5 truncate">
                  <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">
                    {pro.district ? `${pro.district}, ${cityName || pro.city_slug}` : cityName || pro.city_slug}
                  </span>
                </div>
              </div>

              {/* Bottom Price & Link */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block leading-none">
                    {lang === 'ur' ? 'وزٹ چارجز' : lang === 'ar' ? 'الكشفية' : 'Visit Fee'}
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {formatVisitingPrice(pro.starting_price, pro.country_code || country)}
                  </span>
                </div>

                <Link
                  href={proHref}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#006948] bg-emerald-50 hover:bg-[#006948] hover:text-white px-2.5 py-1 rounded-lg transition-colors"
                >
                  <span>{lang === 'ur' ? 'پروفائل' : lang === 'ar' ? 'الملف' : 'View'}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
