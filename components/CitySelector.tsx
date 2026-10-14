'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Check, Globe, Search, X, MapPin } from 'lucide-react';
import { COUNTRIES, CITIES, Country } from '@/lib/db';

interface CitySelectorProps {
  lang: string;
}

export default function CitySelector({ lang }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);
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

  // Detect current city and country from pathname
  const segments = pathname.split('/').filter(Boolean);
  const currentCountryCode = segments[1]?.toLowerCase();
  const currentCitySlug = segments[2]?.toLowerCase();

  const currentCountry = COUNTRIES.find((c) => c.code === currentCountryCode);
  const currentCity = CITIES.find((c) => c.slug === currentCitySlug && c.countryCode === currentCountryCode);

  let activeLabel = 'Global Hub';
  let activeFlag = '🌍';

  if (currentCity && currentCountry) {
    activeLabel = `${currentCity.name}, ${currentCountry.code.toUpperCase()}`;
    activeFlag = currentCountry.flag;
  } else if (currentCountry) {
    activeLabel = `${currentCountry.name}`;
    activeFlag = currentCountry.flag;
  }

  // Filter countries and cities based on search
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      // Prioritize primary countries (PK, AE, SA, US, GB) for clean compact UX
      return COUNTRIES.filter((c) => ['pk', 'ae', 'sa', 'us', 'gb', 'ca'].includes(c.code));
    }
    return COUNTRIES.filter((country) => {
      const countryMatches = country.name.toLowerCase().includes(q) || country.code.toLowerCase().includes(q);
      const cityMatches = CITIES.some(
        (c) => c.countryCode === country.code && c.name.toLowerCase().includes(q)
      );
      return countryMatches || cityMatches;
    });
  }, [search]);

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
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gray-50/90 hover:bg-gray-100 text-gray-800 text-xs font-semibold transition-all border border-gray-200 hover:border-emerald-600 cursor-pointer shadow-2xs group"
        aria-expanded={isOpen}
      >
        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 group-hover:scale-110 transition-transform" />
        <span className="truncate max-w-[90px] sm:max-w-[130px] font-medium text-gray-900">
          {activeLabel}
        </span>
        <ChevronDown className="w-3 h-3 text-gray-400 shrink-0 group-hover:text-emerald-700 transition-colors" />
      </button>

      {/* 1. DESKTOP COMPACT DROPDOWN (md+) */}
      {!isMobile && isOpen && (
        <div className="absolute start-0 mt-2 w-72 bg-white rounded-xl border border-gray-200 py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Header & Global link */}
          <div className="px-3 pb-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-900">Select City</span>
            <Link
              href={`/${lang}`}
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-[#059669] font-semibold hover:underline flex items-center gap-1"
            >
              <Globe className="w-3 h-3" />
              Global Hub
            </Link>
          </div>

          {/* Search Box */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900">
              <Search className="w-3.5 h-3.5 text-gray-400 me-2 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city (e.g. Dubai, Karachi)..."
                className="w-full bg-transparent focus:outline-none placeholder-gray-400 text-xs"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Compact City & Country List */}
          <div className="max-h-60 overflow-y-auto py-1 divide-y divide-gray-50">
            {filteredData.length > 0 ? (
              filteredData.map((country) => {
                const countryCities = CITIES.filter((c) => c.countryCode === country.code);
                return (
                  <div key={country.code} className="py-1.5 px-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mb-1">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      {countryCities.map((city) => {
                        const isSelected = currentCountryCode === country.code && currentCitySlug === city.slug;
                        return (
                          <Link
                            key={city.slug}
                            href={`/${lang}/${country.code}/${city.slug}`}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                              isSelected
                                ? 'bg-emerald-50 text-[#059669] font-bold'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="truncate">{city.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-[#059669] shrink-0" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-gray-400">
                No matching location found
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
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl border-t border-gray-200 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Sheet Drag Handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto my-2.5 shrink-0" />

            {/* Sheet Header */}
            <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Select Operating City</h3>
                <p className="text-[11px] text-gray-500">Filter services by your local region</p>
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
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-neutral-900">
                <Search className="w-4 h-4 text-gray-400 me-2 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search city (e.g. Karachi, Dubai, Riyadh)..."
                  className="w-full bg-transparent focus:outline-none placeholder-gray-400 text-xs"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')}>
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Cities Scroll Area */}
            <div className="overflow-y-auto flex-1 p-3 divide-y divide-gray-100">
              {/* Quick Global Hub Link */}
              <div className="pb-2">
                <Link
                  href={`/${lang}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#059669]"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>Global Directory Hub</span>
                  </div>
                  <span className="text-[10px] font-normal uppercase">Worldwide</span>
                </Link>
              </div>

              {filteredData.map((country) => {
                const countryCities = CITIES.filter((c) => c.countryCode === country.code);
                return (
                  <div key={country.code} className="py-3">
                    <div className="flex items-center gap-2 px-1 mb-2 text-xs font-bold text-gray-700">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {countryCities.map((city) => {
                        const isSelected = currentCountryCode === country.code && currentCitySlug === city.slug;
                        return (
                          <Link
                            key={city.slug}
                            href={`/${lang}/${country.code}/${city.slug}`}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                              isSelected
                                ? 'bg-emerald-50 text-[#059669] font-bold border border-emerald-200'
                                : 'bg-gray-50/70 text-neutral-800 hover:bg-gray-100 font-medium'
                            }`}
                          >
                            <span className="truncate">{city.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
