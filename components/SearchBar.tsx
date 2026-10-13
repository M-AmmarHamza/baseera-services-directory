'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from '@/components/Icons';

interface SearchBarProps {
  lang: string;
  country: string;
  city: string;
  defaultValue?: string;
  placeholder?: string;
  searchButtonText?: string;
}

export default function SearchBar({
  lang,
  country,
  city,
  defaultValue = '',
  placeholder = 'Search plumber in orangi, electrician, ac repair...',
  searchButtonText = 'Search',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/${lang}/${country}/${city}/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleQuickFilter = (text: string) => {
    setQuery(text);
    router.push(`/${lang}/${country}/${city}/search?q=${encodeURIComponent(text)}`);
  };

  return (
    <div className="w-full flex flex-col gap-2.5">
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-white rounded-2xl p-2 shadow-lg border border-gray-100 text-gray-900 focus-within:ring-2 focus-within:ring-emerald-500 transition-all"
      >
        <Search className="w-5 h-5 text-gray-400 ms-3 me-2 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm focus:outline-none placeholder-gray-400 font-medium py-1"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-gray-400 hover:text-gray-600 me-2 text-xs font-bold px-1.5 py-0.5 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className="bg-[#006948] hover:bg-[#00855d] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors shrink-0 shadow-xs"
        >
          {searchButtonText}
        </button>
      </form>

      {/* Popular quick searches */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-emerald-100/90 font-medium">
        <span className="text-[11px] text-emerald-200">Popular:</span>
        <button
          type="button"
          onClick={() => handleQuickFilter('plumber in orangi')}
          className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg text-[11px] transition-colors"
        >
          Plumber in Orangi
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter('electrician in pechs')}
          className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg text-[11px] transition-colors"
        >
          Electrician in PECHS
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter('ac repair gulshan')}
          className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg text-[11px] transition-colors"
        >
          AC in Gulshan
        </button>
      </div>
    </div>
  );
}
