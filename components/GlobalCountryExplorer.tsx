'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { COUNTRIES, CITIES, Country } from '@/lib/db';
import { MapPin, ChevronRight, Search, Globe } from '@/components/Icons';

interface Props {
  lang: string;
}

const REGIONS = ['All', 'Middle East', 'Asia', 'Americas', 'Europe', 'Africa', 'Oceania'] as const;

export default function GlobalCountryExplorer({ lang }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter((c) => {
      const matchRegion = selectedRegion === 'All' || c.region === selectedRegion;
      const matchSearch =
        search.trim() === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        CITIES.some(
          (city) =>
            city.countryCode === c.code &&
            city.name.toLowerCase().includes(search.toLowerCase())
        );
      return matchRegion && matchSearch;
    });
  }, [selectedRegion, search]);

  return (
    <section className="flex flex-col gap-6 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#006948] font-bold text-xs uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Worldwide Coverage (Every Country Supported)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
            Explore Global Directories
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Select your country and city to connect directly with screened local specialists over WhatsApp.
          </p>
        </div>

        {/* Search input for country or city */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country or city..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:ring-1 focus:ring-[#006948] shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Region Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-gray-200/80">
        {REGIONS.map((region) => {
          const count =
            region === 'All'
              ? COUNTRIES.length
              : COUNTRIES.filter((c) => c.region === region).length;
          return (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedRegion === region
                  ? 'bg-[#006948] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/70'
              }`}
            >
              <span>{region}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedRegion === region
                    ? 'bg-emerald-800 text-emerald-100'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Country Cards Grid */}
      {filteredCountries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCountries.map((country) => {
            const countryCities = CITIES.filter(
              (c) => c.countryCode.toLowerCase() === country.code.toLowerCase()
            );

            return (
              <div
                key={country.code}
                className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs hover:border-[#006948] hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl shrink-0">{country.flag}</span>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-[#006948] transition-colors truncate">
                          {country.name}
                        </h3>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {country.region}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">
                      {country.code}
                    </span>
                  </div>

                  {/* Cities Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                    {countryCities.length > 0 ? (
                      countryCities.slice(0, 4).map((city) => (
                        <Link
                          key={city.slug}
                          href={`/${lang}/${country.code}/${city.slug}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-50 hover:bg-emerald-50 hover:text-[#006948] px-2.5 py-1 rounded-lg border border-gray-200/60 transition-colors"
                        >
                          <MapPin className="w-3 h-3 text-[#006948] shrink-0" />
                          <span>{city.name}</span>
                        </Link>
                      ))
                    ) : (
                      <Link
                        href={`/${lang}/${country.code}/${country.defaultCity}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-50 hover:bg-emerald-50 hover:text-[#006948] px-2.5 py-1 rounded-lg border border-gray-200/60 transition-colors"
                      >
                        <MapPin className="w-3 h-3 text-[#006948] shrink-0" />
                        <span className="capitalize">{country.defaultCity}</span>
                      </Link>
                    )}
                  </div>
                </div>

                <Link
                  href={`/${lang}/${country.code}/${country.defaultCity}`}
                  className="w-full mt-1 py-2 px-3 rounded-xl bg-gray-50 group-hover:bg-[#006948] group-hover:text-white text-gray-700 text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
                >
                  <span>Open {country.name}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
          <Globe className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-800">
            No pre-indexed country found for &ldquo;{search}&rdquo;
          </p>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Baseera dynamically supports every country in the world. You can navigate directly to any country using its 2-letter ISO code.
          </p>
        </div>
      )}

      {/* Universal Coverage Assurance */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌍</span>
          <div>
            <span className="font-bold">Every Country & City Supported Globally:</span>{' '}
            <span className="text-emerald-900">
              Baseera dynamically generates local verified service directories for any ISO country code worldwide with zero commission.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
