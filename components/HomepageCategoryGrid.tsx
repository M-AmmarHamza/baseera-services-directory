'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Search, X, Check, ChevronDown, Sparkles } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import type { CategoryItem, CityItem } from '@/lib/taxonomy-db';

export interface SelectedCityPayload {
  slug: string;
  name: string;
  countryCode: string;
  name_ur?: string;
  name_ar?: string;
}

export interface HomepageCategoryGridProps {
  lang: string;
  categories: CategoryItem[];
  cities: CityItem[];
  defaultCity: SelectedCityPayload;
  title?: string;
  subtitle?: string;
  activeCountText?: string;
  categoriesCountText?: string;
  className?: string;
}

const POPULAR_CITIES = [
  { slug: 'karachi', name: 'Karachi', countryCode: 'pk' },
  { slug: 'lahore', name: 'Lahore', countryCode: 'pk' },
  { slug: 'islamabad', name: 'Islamabad', countryCode: 'pk' },
  { slug: 'rawalpindi', name: 'Rawalpindi', countryCode: 'pk' },
  { slug: 'faisalabad', name: 'Faisalabad', countryCode: 'pk' },
  { slug: 'dubai', name: 'Dubai', countryCode: 'ae' },
  { slug: 'abu-dhabi', name: 'Abu Dhabi', countryCode: 'ae' },
  { slug: 'riyadh', name: 'Riyadh', countryCode: 'sa' },
  { slug: 'jeddah', name: 'Jeddah', countryCode: 'sa' },
];

export default function HomepageCategoryGrid({
  lang,
  categories,
  cities,
  defaultCity,
  title,
  subtitle,
  activeCountText,
  categoriesCountText,
  className = '',
}: HomepageCategoryGridProps) {
  const isUrdu = lang === 'ur';
  const isArabic = lang === 'ar';

  // Hydration safety: Start with defaultCity from server (Karachi)
  const [selectedCity, setSelectedCity] = useState<SelectedCityPayload>(defaultCity);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync with localStorage post-hydration and listen for app-wide city changes
  useEffect(() => {
    setIsMounted(true);

    try {
      const saved = localStorage.getItem('baseera_selected_city');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.slug && parsed?.countryCode) {
          const match = cities.find(
            (c) =>
              c.slug.toLowerCase() === parsed.slug.toLowerCase() &&
              c.countryCode.toLowerCase() === parsed.countryCode.toLowerCase()
          );
          if (match) {
            setSelectedCity({
              slug: match.slug,
              name: match.name_en,
              countryCode: match.countryCode,
              name_ur: match.name_ur,
              name_ar: match.name_ar,
            });
          } else {
            setSelectedCity({
              slug: parsed.slug,
              name: parsed.name || parsed.slug,
              countryCode: parsed.countryCode,
              name_ur: parsed.name_ur,
              name_ar: parsed.name_ar,
            });
          }
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    const handleCityChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent?.detail) {
        const { slug, citySlug, countryCode, countrySlug, name, name_ur, name_ar } = customEvent.detail;
        const targetSlug = slug || citySlug;
        const targetCountry = countryCode || countrySlug;
        if (targetSlug && targetCountry) {
          const match = cities.find(
            (c) =>
              c.slug.toLowerCase() === targetSlug.toLowerCase() &&
              c.countryCode.toLowerCase() === targetCountry.toLowerCase()
          );
          if (match) {
            setSelectedCity({
              slug: match.slug,
              name: match.name_en,
              countryCode: match.countryCode,
              name_ur: match.name_ur,
              name_ar: match.name_ar,
            });
          } else {
            setSelectedCity({
              slug: targetSlug,
              name: name || targetSlug,
              countryCode: targetCountry,
              name_ur,
              name_ar,
            });
          }
        }
      }
    };

    window.addEventListener('baseera:city-changed', handleCityChanged);
    return () => {
      window.removeEventListener('baseera:city-changed', handleCityChanged);
    };
  }, [cities]);

  // Modal keyboard & body scroll management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
      setCitySearch('');
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleSelectCity = (city: CityItem | { slug: string; name: string; countryCode: string; name_ur?: string; name_ar?: string }) => {
    const payload: SelectedCityPayload = {
      slug: city.slug,
      name: 'name_en' in city ? city.name_en : city.name,
      countryCode: city.countryCode,
      name_ur: 'name_ur' in city ? city.name_ur : undefined,
      name_ar: 'name_ar' in city ? city.name_ar : undefined,
    };

    setSelectedCity(payload);
    setIsModalOpen(false);

    try {
      const storageData = {
        slug: payload.slug,
        citySlug: payload.slug,
        countryCode: payload.countryCode,
        countrySlug: payload.countryCode,
        name: payload.name,
        name_ur: payload.name_ur,
        name_ar: payload.name_ar,
      };
      localStorage.setItem('baseera_selected_city', JSON.stringify(storageData));
      window.dispatchEvent(new CustomEvent('baseera:city-changed', { detail: storageData }));
    } catch {
      // Ignore localStorage failure
    }
  };

  // Filter cities for search modal
  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return cities;

    return cities.filter((c) => {
      return (
        c.name_en.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.name_ur && c.name_ur.includes(q)) ||
        (c.name_ar && c.name_ar.includes(q)) ||
        c.countryCode.toLowerCase().includes(q)
      );
    });
  }, [cities, citySearch]);

  const defaultTitle = isUrdu
    ? '24+ تصدیق شدہ کیٹیگریز دیکھیں'
    : isArabic
    ? 'تصفح أكثر من 24 تخصصاً موثقاً'
    : 'Browse 24+ Verified Specialties';

  const defaultSubtitle = isUrdu
    ? 'دنیا بھر کے تصدیق شدہ کمیونٹی ٹیکنیشنز اور ماہر کاریگر'
    : isArabic
    ? 'فنيون محترفون ومعتمدون في منطقتك بدون وسيط'
    : 'Verified community specialists & technicians with direct WhatsApp booking';

  const defaultActiveText = activeCountText || (isUrdu ? 'فعال' : isArabic ? 'متاح' : 'Active');
  const defaultCategoriesCountText = categoriesCountText || (isUrdu ? 'کیٹیگریز' : isArabic ? 'تخصصات' : 'Categories');

  // Localized city display name
  const localizedCityName =
    isUrdu && selectedCity.name_ur
      ? selectedCity.name_ur
      : isArabic && selectedCity.name_ar
      ? selectedCity.name_ar
      : selectedCity.name;

  const currentCountryCode = selectedCity.countryCode.toLowerCase();
  const currentCitySlug = selectedCity.slug.toLowerCase();

  return (
    <section className={`w-full max-w-7xl mx-auto overflow-hidden ${className}`}>
      {/* Header with City Selector Pill */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h2
              className={`text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 ${
                isUrdu ? 'font-urdu leading-[2.5] pt-1' : 'leading-snug'
              }`}
            >
              {title || defaultTitle}
            </h2>
            <span
              className={`text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
                isUrdu ? 'font-urdu' : ''
              }`}
            >
              {categories.length} {defaultCategoriesCountText}
            </span>
          </div>
          <p className={`text-sm text-gray-500 ${isUrdu ? 'font-urdu leading-[2.2]' : ''}`}>
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* Dynamic City Switcher Pill */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
            aria-label={isUrdu ? 'شہر تبدیل کریں' : isArabic ? 'تغيير المدينة' : 'Change City'}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform shrink-0" />
            <span className={`text-xs text-emerald-800 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'شہر:' : isArabic ? 'المدينة:' : 'Browsing in'}
            </span>
            <span className={`text-xs font-bold text-emerald-950 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
              {localizedCityName}
              {!isUrdu && !isArabic && `, ${selectedCity.countryCode.toUpperCase()}`}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-white/80 border border-emerald-200 px-2 py-0.5 rounded-full hover:bg-white transition-colors">
              {isUrdu ? 'تبدیل کریں' : isArabic ? 'تغيير' : 'Change'}
            </span>
            <ChevronDown className="w-3 h-3 text-emerald-600 group-hover:translate-y-0.5 transition-transform shrink-0" />
          </button>
        </div>
      </div>

      {/* Responsive Categories Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full max-w-full overflow-hidden">
        {categories.map((cat) => {
          // Dynamic category slug based on language
          const catSlug = isUrdu ? cat.slug_ur || cat.slug_en : cat.slug_en;
          const href = `/${lang}/${currentCountryCode}/${currentCitySlug}/${catSlug}`;

          const categoryName =
            isUrdu ? cat.name_ur : isArabic ? cat.name_ar || cat.name_en : cat.name_en;

          return (
            <Link
              key={cat.id}
              href={href}
              className={`w-full min-w-0 max-w-full flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl bg-white hover:border-[#006948] border border-gray-200/80 shadow-2xs hover:shadow-sm transition-all text-center group cursor-pointer overflow-hidden box-border ${
                isUrdu ? 'min-h-[160px] sm:min-h-[170px]' : 'min-h-[130px] sm:min-h-[140px]'
              }`}
            >
              {/* Circular icon container */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center mb-1.5 shrink-0 group-hover:scale-105 group-hover:bg-[#006948] group-hover:text-white transition-all">
                <CategoryIcon
                  slug={cat.slug_en}
                  id={cat.id}
                  name={cat.name_en}
                  icon={cat.icon}
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              </div>

              {/* Category Name */}
              <h3
                className={`w-full font-semibold text-gray-900 group-hover:text-[#006948] transition-colors leading-snug line-clamp-2 px-0.5 ${
                  isUrdu ? 'font-urdu text-[15px] sm:text-base leading-[2.1] pt-1' : 'text-xs sm:text-sm'
                }`}
              >
                {categoryName}
              </h3>

              {/* Active count badge */}
              <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006948] shrink-0" />
                <span className={isUrdu ? 'font-urdu' : ''}>
                  {cat.activeCount || 25} {defaultActiveText}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Accessible City Switcher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className={`font-bold text-gray-900 text-base ${isUrdu ? 'font-urdu leading-[1.8] text-lg' : ''}`}>
                    {isUrdu ? 'شہر منتخب کریں' : isArabic ? 'اختر المدينة' : 'Select Your City'}
                  </h3>
                  <p className={`text-xs text-gray-500 ${isUrdu ? 'font-urdu' : ''}`}>
                    {isUrdu
                      ? 'اپنے مطلوبہ شہر میں سروسز اور کاریگر دریافت کریں'
                      : isArabic
                      ? 'حدد مدينتك لاستعراض الفنيين والخدمات المحلية'
                      : 'Switch directory focus to explore verified trades in your city'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder={
                    isUrdu
                      ? 'شہر کا نام تلاش کریں (کراچی، لاہور...)'
                      : isArabic
                      ? 'ابحث عن اسم المدينة...'
                      : 'Search city name (Karachi, Lahore, Dubai...)'
                  }
                  className={`w-full ps-9 pe-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-900 placeholder-gray-400 ${
                    isUrdu ? 'font-urdu' : ''
                  }`}
                />
                {citySearch && (
                  <button
                    type="button"
                    onClick={() => setCitySearch('')}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Popular City Shortcuts */}
              {!citySearch && (
                <div className="mt-3">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{isUrdu ? 'مقبول ترین شہر:' : isArabic ? 'المدن الأكثر طلباً:' : 'Popular Cities:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_CITIES.map((pop) => {
                      const isCurrent =
                        pop.slug === selectedCity.slug.toLowerCase() &&
                        pop.countryCode === selectedCity.countryCode.toLowerCase();
                      return (
                        <button
                          key={`${pop.countryCode}-${pop.slug}`}
                          type="button"
                          onClick={() => handleSelectCity(pop)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                              : 'bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border-gray-200'
                          }`}
                        >
                          {pop.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* City List */}
            <div className="overflow-y-auto max-h-[50vh] p-2 divide-y divide-gray-100">
              {filteredCities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2">
                  {filteredCities.map((c) => {
                    const isSelected =
                      c.slug.toLowerCase() === selectedCity.slug.toLowerCase() &&
                      c.countryCode.toLowerCase() === selectedCity.countryCode.toLowerCase();

                    const cityNameDisplay =
                      isUrdu && c.name_ur
                        ? c.name_ur
                        : isArabic && c.name_ar
                        ? c.name_ar
                        : c.name_en;

                    return (
                      <button
                        key={`${c.countryCode}-${c.slug}`}
                        type="button"
                        onClick={() => handleSelectCity(c)}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-start cursor-pointer group ${
                          isSelected
                            ? 'border-[#006948] bg-emerald-50/70 text-[#006948] ring-1 ring-[#006948]'
                            : 'border-gray-200 bg-white hover:border-[#006948]/60 hover:bg-gray-50 text-gray-800'
                        } ${isUrdu ? 'min-h-[48px]' : ''}`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className={`block truncate ${isUrdu ? 'font-urdu leading-[1.8] text-sm' : ''}`}>
                            {cityNameDisplay}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-normal">
                            {c.countryCode}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#006948] shrink-0 ms-2" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-gray-400">
                  {isUrdu ? 'کوئی شہر نہیں ملا' : isArabic ? 'لم يتم العثور على نتائج' : 'No matching city found'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
