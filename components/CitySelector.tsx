'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, ChevronDown, Check, Globe } from 'lucide-react';

interface CitySelectorProps {
  lang: string;
}

const REGIONS = [
  {
    country: 'Pakistan',
    code: 'pk',
    flag: '🇵🇰',
    cities: [
      { slug: 'karachi', name: 'Karachi' },
      { slug: 'lahore', name: 'Lahore' },
      { slug: 'islamabad', name: 'Islamabad' },
    ],
  },
  {
    country: 'United Arab Emirates',
    code: 'ae',
    flag: '🇦🇪',
    cities: [
      { slug: 'dubai', name: 'Dubai' },
      { slug: 'sharjah', name: 'Sharjah' },
      { slug: 'abu-dhabi', name: 'Abu Dhabi' },
    ],
  },
  {
    country: 'Saudi Arabia',
    code: 'sa',
    flag: '🇸🇦',
    cities: [
      { slug: 'riyadh', name: 'Riyadh' },
      { slug: 'jeddah', name: 'Jeddah' },
    ],
  },
];

export default function CitySelector({ lang }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Detect current city and country from pathname
  // Path format: /[lang]/[country]/[city]/...
  const segments = pathname.split('/').filter(Boolean);
  const currentCountry = segments[1]?.toLowerCase();
  const currentCity = segments[2]?.toLowerCase();

  let activeLabel = 'Global Directory';
  let activeFlag = '🌍';

  for (const reg of REGIONS) {
    if (reg.code === currentCountry) {
      const cityObj = reg.cities.find((c) => c.slug === currentCity);
      if (cityObj) {
        activeLabel = `${cityObj.name}, ${reg.code.toUpperCase()}`;
        activeFlag = reg.flag;
        break;
      }
    }
  }

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

  return (
    <div className="relative inline-block text-start" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-colors border border-slate-200/60 shadow-2xs"
        aria-expanded={isOpen}
      >
        <span className="text-sm">{activeFlag}</span>
        <span className="truncate max-w-[120px] sm:max-w-none">{activeLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute start-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Location</span>
            <Link
              href={`/${lang}`}
              onClick={() => setIsOpen(false)}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              All Countries
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto py-2 divide-y divide-slate-100">
            {REGIONS.map((region) => (
              <div key={region.code} className="py-2 px-3">
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-extrabold text-slate-900">
                  <span>{region.flag}</span>
                  <span>{region.country}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-1">
                  {region.cities.map((city) => {
                    const isSelected = currentCountry === region.code && currentCity === city.slug;
                    return (
                      <Link
                        key={city.slug}
                        href={`/${lang}/${region.code}/${city.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate">{city.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <p className="text-[11px] text-slate-500">
              ⚡ Direct WhatsApp leads with zero commission in all listed cities.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
