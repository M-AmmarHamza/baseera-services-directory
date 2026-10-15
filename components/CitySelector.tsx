'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Check, Globe, Search, X, MapPin } from 'lucide-react';
import { COUNTRIES, CITIES, Country, City, getLocalizedCountryName, getLocalizedCityName } from '@/lib/db';
import { filterLocationsSmart } from '@/lib/smart-search';

export interface LocationCity {
  id?: string | number;
  slug: string;
  name: string;
  countryCode: string;
}

export interface LocationCountry {
  id?: string | number;
  code: string;
  name: string;
  flag: string;
  region?: string;
  cities: LocationCity[];
}

/**
 * Builds the initial grouped & sorted location list from local database seed data.
 * All countries and cities are sorted alphabetically with 0 fetch latency on initial render.
 */
function getInitialLocations(): LocationCountry[] {
  const countryMap = new Map<string, LocationCountry>();

  COUNTRIES.forEach((c) => {
    const code = c.code.toLowerCase();
    if (code === 'uk') return; // Canonical ISO code for UK is 'gb'

    countryMap.set(code, {
      code,
      name: c.name,
      flag: c.flag,
      region: c.region,
      cities: [],
    });
  });

  CITIES.forEach((city) => {
    const code = city.countryCode.toLowerCase();
    const countryCode = code === 'uk' ? 'gb' : code;
    const country = countryMap.get(countryCode);
    if (country) {
      if (!country.cities.some((existing) => existing.slug.toLowerCase() === city.slug.toLowerCase())) {
        country.cities.push({
          slug: city.slug,
          name: city.name,
          countryCode,
        });
      }
    }
  });

  return Array.from(countryMap.values())
    .filter((c) => c.cities.length > 0)
    .map((c) => ({
      ...c,
      cities: c.cities.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

interface CitySelectorProps {
  lang: string;
}

export default function CitySelector({ lang }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [locations, setLocations] = useState<LocationCountry[]>(getInitialLocations);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Detect window width for mobile bottom-sheet vs desktop dropdown
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  // Fetch dynamic locations from /api/locations without limits to sync with live Supabase database
  useEffect(() => {
    let isMounted = true;
    fetch('/api/locations')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setLocations(json.data);
        }
      })
      .catch((err) => {
        console.warn('Locations API sync note:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Detect current city and country from pathname
  const segments = pathname.split('/').filter(Boolean);
  const currentCountryCode = segments[1]?.toLowerCase();
  const currentCitySlug = segments[2]?.toLowerCase();

  const currentCountry = COUNTRIES.find((c) => c.code.toLowerCase() === currentCountryCode);
  const currentCity = CITIES.find(
    (c) => c.slug.toLowerCase() === currentCitySlug && c.countryCode.toLowerCase() === currentCountryCode
  );

  let activeLabel = lang === 'ur' ? 'عالمی مرکز' : lang === 'ar' ? 'الدليل العام' : 'Global Hub';

  if (currentCity && currentCountry) {
    const locCity = getLocalizedCityName(currentCity.slug, lang);
    const separator = lang === 'ur' || lang === 'ar' ? '، ' : ', ';
    activeLabel = `${locCity}${separator}${currentCountry.code.toUpperCase()}`;
  } else if (currentCountry) {
    activeLabel = getLocalizedCountryName(currentCountry.code, lang);
  }

  // Multi-field, alias-expanded, and typo-tolerant smart location search
  const filteredData = useMemo(() => {
    return filterLocationsSmart(
      locations,
      search,
      (code) => getLocalizedCountryName(code, lang),
      (slug) => getLocalizedCityName(slug, lang)
    );
  }, [locations, search, lang]);

  const totalFilteredCities = useMemo(() => {
    return filteredData.reduce((sum, c) => sum + c.cities.length, 0);
  }, [filteredData]);

  // Close when clicking outside on desktop
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!isMobile && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  return (
    <div className="relative inline-block text-start" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-semibold transition-all border border-gray-200 hover:border-emerald-600 cursor-pointer shadow-2xs group shrink-0 min-h-[34px]"
        aria-expanded={isOpen}
      >
        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 group-hover:scale-110 transition-transform" />
        <span
          className={`font-medium text-gray-900 text-xs max-w-[85px] xs:max-w-[110px] sm:max-w-[150px] truncate overflow-visible ${
            lang === 'ur' ? 'font-urdu leading-none pt-0.5' : ''
          }`}
        >
          {activeLabel}
        </span>
        <ChevronDown className="w-3 h-3 text-gray-400 shrink-0 group-hover:text-emerald-700 transition-colors" />
      </button>

      {/* 1. DESKTOP COMPACT DROPDOWN (md+) */}
      {!isMobile && isOpen && (
        <div className="absolute start-0 mt-2 w-88 sm:w-96 md:w-[420px] bg-white rounded-2xl border border-gray-200 shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Header & Global link */}
          <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold text-neutral-900 ${lang === 'ur' ? 'font-urdu leading-[1.8] text-sm' : ''}`}>
                {lang === 'ur' ? 'شہر منتخب کریں' : lang === 'ar' ? 'اختر المدينة' : 'Select City'}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {totalFilteredCities} {lang === 'ur' ? 'شہر' : lang === 'ar' ? 'مدينة' : 'cities'}
              </span>
            </div>
            <Link
              href={`/${lang}`}
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#059669] font-semibold hover:underline flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className={lang === 'ur' ? 'font-urdu leading-none' : ''}>
                {lang === 'ur' ? 'عالمی مرکز' : lang === 'ar' ? 'الدليل العام' : 'Global Hub'}
              </span>
            </Link>
          </div>

          {/* Search Box */}
          <div className="p-2.5 border-b border-gray-100 shrink-0">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-neutral-900 focus-within:border-[#059669] focus-within:bg-white transition-all">
              <Search className="w-3.5 h-3.5 text-gray-400 me-2 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  lang === 'ur'
                    ? 'شہر یا ملک تلاش کریں (مثلاً کراچی، لندن، سڈنی)...'
                    : lang === 'ar'
                    ? 'ابحث عن مدينة أو دولة (مثل دبي، لندن، سيدني)...'
                    : 'Search city or country (e.g. Sydney, Berlin, Dubai)...'
                }
                className="w-full bg-transparent focus:outline-none placeholder-gray-400 text-xs"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Container with CSS max-h-[60vh] overflow-y-auto */}
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain py-1 divide-y divide-gray-100 scroll-smooth">
            {filteredData.length > 0 ? (
              filteredData.map((country) => (
                <div key={country.code} className="py-2.5 px-3.5">
                  {/* Country Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base leading-none shrink-0">{country.flag}</span>
                      <span className={`font-bold text-gray-800 ${lang === 'ur' ? 'font-urdu leading-[1.8] text-sm' : 'text-xs truncate'}`}>
                        {getLocalizedCountryName(country.code, lang)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ms-2">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {country.cities.length}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {country.code.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Cities 2-Column Grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {country.cities.map((city) => {
                      const isSelected =
                        currentCountryCode === country.code.toLowerCase() &&
                        currentCitySlug === city.slug.toLowerCase();

                      return (
                        <Link
                          key={city.slug}
                          href={`/${lang}/${country.code}/${city.slug}`}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs transition-colors overflow-hidden group ${
                            isSelected
                              ? 'bg-emerald-50 text-[#059669] font-bold ring-1 ring-emerald-300'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-[#059669]'
                          }`}
                        >
                          <span
                            className={`truncate overflow-hidden text-ellipsis whitespace-nowrap block ${
                              lang === 'ur' ? 'font-urdu leading-[1.9] text-[13px] pt-0.5' : ''
                            }`}
                          >
                            {getLocalizedCityName(city.slug, lang)}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#059669] shrink-0 ml-2 ms-2" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">
                {lang === 'ur' ? 'کوئی شہر نہیں ملا' : lang === 'ar' ? 'لم يتم العثور على أي مدينة' : 'No matching location found'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MOBILE SMOOTH BOTTOM-SHEET MODAL (< md) */}
      {isMobile && isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl border-t border-gray-200 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Sheet Drag Handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto my-2.5 shrink-0" />

            {/* Sheet Header */}
            <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-neutral-900 ${lang === 'ur' ? 'font-urdu leading-[1.9] text-base' : 'text-sm'}`}>
                    {lang === 'ur' ? 'شہر منتخب کریں' : lang === 'ar' ? 'اختر المدينة' : 'Select Operating City'}
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    {totalFilteredCities} {lang === 'ur' ? 'شہر' : lang === 'ar' ? 'مدينة' : 'cities'}
                  </span>
                </div>
                <p className={`text-xs text-gray-500 ${lang === 'ur' ? 'font-urdu leading-[1.8]' : ''}`}>
                  {lang === 'ur' ? 'اپنے علاقے کے لحاظ سے سروسز تلاش کریں' : lang === 'ar' ? 'تصفية الخدمات حسب منطقتك' : 'Filter services by your local region'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search Bar */}
            <div className="p-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus-within:border-[#059669] focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-gray-400 me-2 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    lang === 'ur'
                      ? 'شہر یا ملک تلاش کریں (مثلاً کراچی، لندن، سڈنی)...'
                      : lang === 'ar'
                      ? 'ابحث عن مدينة أو دولة (مثل دبي، لندن، سيدني)...'
                      : 'Search city or country (e.g. Sydney, Berlin, Dubai)...'
                  }
                  className="w-full bg-transparent focus:outline-none placeholder-gray-400 text-xs"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')}>
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Cities Scroll Area with CSS max-h-[60vh] overflow-y-auto */}
            <div className="overflow-y-auto overscroll-contain flex-1 max-h-[60vh] p-3 divide-y divide-gray-100">
              {/* Quick Global Hub Link */}
              <div className="pb-2.5">
                <Link
                  href={`/${lang}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#059669]"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className={lang === 'ur' ? 'font-urdu leading-none' : ''}>
                      {lang === 'ur' ? 'عالمی مرکز' : lang === 'ar' ? 'الدليل العام' : 'Global Directory Hub'}
                    </span>
                  </div>
                  <span className={`text-[11px] font-medium uppercase ${lang === 'ur' ? 'font-urdu leading-none' : ''}`}>
                    {lang === 'ur' ? 'دنیا بھر میں' : lang === 'ar' ? 'عالمي' : 'Worldwide'}
                  </span>
                </Link>
              </div>

              {filteredData.length > 0 ? (
                filteredData.map((country) => (
                  <div key={country.code} className="py-3">
                    {/* Country Header */}
                    <div className="flex items-center justify-between mb-2 px-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0 leading-none">{country.flag}</span>
                        <span className={`font-bold text-gray-800 ${lang === 'ur' ? 'font-urdu leading-[1.8] text-sm' : 'text-xs truncate'}`}>
                          {getLocalizedCountryName(country.code, lang)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ms-2">
                        <span className="text-[10px] text-gray-400 font-medium">
                          {country.cities.length}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {country.code.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Cities Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {country.cities.map((city) => {
                        const isSelected =
                          currentCountryCode === country.code.toLowerCase() &&
                          currentCitySlug === city.slug.toLowerCase();

                        return (
                          <Link
                            key={city.slug}
                            href={`/${lang}/${country.code}/${city.slug}`}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs transition-colors overflow-hidden ${
                              isSelected
                                ? 'bg-emerald-50 text-[#059669] font-bold border border-emerald-300 ring-1 ring-emerald-200'
                                : 'bg-gray-50 text-neutral-800 hover:bg-gray-100 font-medium'
                            }`}
                          >
                            <span
                              className={`truncate overflow-hidden text-ellipsis whitespace-nowrap block ${
                                lang === 'ur' ? 'font-urdu leading-[1.9] text-[13px] pt-0.5' : ''
                              }`}
                            >
                              {getLocalizedCityName(city.slug, lang)}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#059669] shrink-0 ml-2 ms-2" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  {lang === 'ur' ? 'کوئی شہر نہیں ملا' : lang === 'ar' ? 'لم يتم العثور على أي مدينة' : 'No matching location found'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
