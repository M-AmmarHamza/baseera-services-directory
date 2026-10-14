'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight } from 'lucide-react';

interface Props {
  lang: string;
  defaultLocation?: string;
}

export default function HomepageSearchBar({ lang, defaultLocation = 'Karachi, PK' }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [isFocused, setIsFocused] = useState(false);

  const popularSearches = [
    { title: 'AC Technician', category: 'ac-technician' },
    { title: 'Electrician', category: 'electrician' },
    { title: 'Plumber', category: 'plumber' },
    { title: 'Carpenter', category: 'carpenter' },
    { title: 'Painter', category: 'painter' },
    { title: 'Home Chef', category: 'home-chef' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Fuzzy matching or direct search redirect
    const clean = query.trim().toLowerCase();
    const matchedCategory = popularSearches.find(
      (item) => item.category.includes(clean) || item.title.toLowerCase().includes(clean)
    );

    if (matchedCategory) {
      router.push(`/${lang}/pk/karachi/${matchedCategory.category}`);
    } else {
      router.push(`/${lang}/vendors?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form
        onSubmit={handleSearch}
        className="bg-white border border-gray-200 rounded-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
      >
        {/* Location Chip */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 shrink-0">
          <MapPin className="w-4 h-4 text-[#059669]" />
          <span>{location}</span>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 flex items-center min-w-0">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search electrician, plumber, AC specialist..."
            className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-neutral-900 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Find Services</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Search Chips */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 justify-center text-xs text-gray-500">
        <span className="font-medium text-gray-400">Popular:</span>
        {popularSearches.map((item) => (
          <button
            key={item.category}
            type="button"
            onClick={() => router.push(`/${lang}/pk/karachi/${item.category}`)}
            className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs transition-colors cursor-pointer"
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}
