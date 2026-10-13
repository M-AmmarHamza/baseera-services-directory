'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, ChevronDown, Check, Globe, Search, X } from 'lucide-react';
import { COUNTRIES, CITIES, Country } from '@/lib/db';

interface CitySelectorProps {
  lang: string;
}

export default function CitySelector({ lang }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState<string>('All');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Detect current city and country from pathname
  // Format: /[lang]/[country]/[city]/...
  const segments = pathname.split('/').filter(Boolean);
  const currentCountryCode = segments[1]?.toLowerCase();
  const currentCitySlug = segments[2]?.toLowerCase();

  const currentCountry = COUNTRIES.find((c) => c.code === currentCountryCode);
  const currentCity = CITIES.find((c) => c.slug === currentCitySlug && c.countryCode === currentCountryCode);

  let activeLabel = 'Global Directory';
  let activeFlag = '🌍';

  if (currentCity && currentCountry) {
    activeLabel = `${currentCity.name}, ${currentCountry.code.toUpperCase()}`;
    activeFlag = currentCountry.flag;
  } else if (currentCountry) {
    activeLabel = `${currentCountry.name}`;
    activeFlag = currentCountry.flag;
  }

  // Filter countries and cities based on search and region
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    return COUNTRIES.filter((country) => {
      const matchesRegion = activeRegion === 'All' || country.region === activeRegion;
      if (!matchesRegion) return false;
      if (!q) return true;
      const countryMatches = country.name.toLowerCase().includes(q) || country.code.toLowerCase().includes(q);
      const cityMatches = CITIES.some(
        (c) => c.countryCode === country.code && c.name.toLowerCase().includes(q)
      );
      return countryMatches || cityMatches;
    });
  }, [search, activeRegion]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const regions = ['All', 'Middle East', 'Asia', 'Americas', 'Europe', 'Africa', 'Oceania'];

  return (
    <div className="relative inline-block text-start" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-800 text-xs font-bold transition-colors border border-slate-200/70 shadow-2xs"
        aria-expanded={isOpen}
      >
        <span className="text-sm">{activeFlag}</span>
        <span className="truncate max-w-[130px] sm:max-w-none">{activeLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute start-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
          
          {/* Header & Global link */}
          <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 tracking-tight">Worldwide Locations</span>
            <Link
              href={`/${lang}`}
              onClick={() => setIsOpen(false)}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              Global Hub
            </Link>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:bg-white transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 me-2 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or city (e.g. Dubai, London)..."
                className="w-full bg-transparent focus:outline-none placeholder-slate-400"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* Region Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2">
              {regions.map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setActiveRegion(reg)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                    activeRegion === reg
                      ? 'bg-[#006948] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Countries & Cities List */}
          <div className="max-h-72 overflow-y-auto py-2 divide-y divide-slate-100">
            {filteredData.length > 0 ? (
              filteredData.map((country) => {
                const countryCities = CITIES.filter((c) => c.countryCode === country.code);
                return (
                  <div key={country.code} className="py-2.5 px-3">
                    <div className="flex items-center justify-between px-2 py-0.5 mb-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{country.region}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-1">
                      {countryCities.length > 0 ? (
                        countryCities.map((city) => {
                          const isSelected = currentCountryCode === country.code && currentCitySlug === city.slug;
                          return (
                            <Link
                              key={city.slug}
                              href={`/${lang}/${country.code}/${city.slug}`}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                                isSelected
                                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                              }`}
                            >
                              <span className="truncate">{city.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </Link>
                          );
                        })
                      ) : (
                        <Link
                          href={`/${lang}/${country.code}/${country.defaultCity}`}
                          onClick={() => setIsOpen(false)}
                          className="px-2.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-medium col-span-2"
                        >
                          Explore {country.name}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No country or city matching &ldquo;{search}&rdquo;
              </div>
            )}
          </div>

          <div className="px-4 pt-2.5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <p className="text-[11px] text-slate-500 font-medium">
              🌍 Baseera operates globally with zero commissions across all countries.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
