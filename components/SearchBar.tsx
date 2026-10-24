'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  BadgeCheck,
  Star,
  MapPin,
  Sparkles,
  ArrowRight,
  Loader2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { CategoryIcon } from '@/components/Icons';

interface SearchCategorySuggestion {
  id: string;
  name: string;
  icon: string;
  url: string;
}

interface SearchProviderSuggestion {
  id: string;
  name: string;
  slug: string;
  trade_title: string;
  category_id: string;
  category_name: string;
  city_slug: string;
  city_name: string;
  avatar_url?: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_premium: boolean;
  target_areas?: string[];
  url: string;
}

interface SearchBarProps {
  lang: string;
  country: string;
  city: string;
  defaultValue?: string;
  placeholder?: string;
  searchButtonText?: string;
  className?: string;
}

export default function SearchBar({
  lang,
  country,
  city,
  defaultValue = '',
  placeholder,
  searchButtonText,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [categories, setCategories] = useState<SearchCategorySuggestion[]>([]);
  const [providers, setProviders] = useState<SearchProviderSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isRTL = lang === 'ur' || lang === 'ar';

  const effectivePlaceholder =
    placeholder ||
    (lang === 'ur'
      ? 'الیکٹریشن، پلمبر، اے سی سروس، ہوم شیف تلاش کریں...'
      : lang === 'ar'
      ? 'ابحث عن فني كهرباء، سباكة، تكييف...'
      : 'Search plumber, electrician, ac repair, home chef...');

  const effectiveButtonText =
    searchButtonText || (lang === 'ur' ? 'تلاش کریں' : lang === 'ar' ? 'بحث' : 'Search');

  // Debounced API query for Typeahead / Auto-suggest (Requirements: debounced API calls after 3 characters)
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 3) {
      setCategories([]);
      setProviders([]);
      setIsLoading(false);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const params = new URLSearchParams({
          q: trimmed,
          city: city || 'karachi',
          country: country || 'pk',
          lang: lang || 'en',
          limit: '5',
        });

        const res = await fetch(`/api/search?${params.toString()}`, {
          signal: abortControllerRef.current.signal,
        });

        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          setProviders(data.providers || []);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Typeahead search note:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 260);

    return () => {
      clearTimeout(timer);
    };
  }, [query, city, country, lang]);

  // Click outside to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Form submission: navigates to full search page
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    router.push(
      `/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/search?q=${encodeURIComponent(trimmed)}`
    );
  };

  // Quick filter chip clicks
  const handleQuickFilter = (text: string) => {
    setQuery(text);
    setIsOpen(false);
    router.push(
      `/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/search?q=${encodeURIComponent(text)}`
    );
  };

  // Combined clickable items for keyboard arrow navigation
  const allItems: Array<{ type: 'category' | 'provider'; url: string; label: string }> = [
    ...categories.map((c) => ({ type: 'category' as const, url: c.url, label: c.name })),
    ...providers.map((p) => ({ type: 'provider' as const, url: p.url, label: p.name })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || allItems.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < allItems.length) {
        e.preventDefault();
        setIsOpen(false);
        router.push(allItems[selectedIndex].url);
      } else {
        handleSearch(e);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const hasSuggestions = categories.length > 0 || providers.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full flex flex-col gap-2.5 ${className}`}>
      {/* Search Input Form */}
      <form
        onSubmit={handleSearch}
        className="relative flex items-center bg-white rounded-2xl p-2 shadow-lg border border-gray-100 text-gray-900 focus-within:ring-2 focus-within:ring-[#006948] focus-within:border-[#006948] transition-all z-20"
      >
        <Search className="w-5 h-5 text-gray-400 ms-3 me-2 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => {
            if (query.trim().length >= 3 && hasSuggestions) {
              setIsOpen(true);
            }
          }}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={effectivePlaceholder}
          aria-label={effectivePlaceholder}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
          className="w-full bg-transparent text-sm focus:outline-none placeholder-gray-400 font-medium py-1"
        />

        {/* Loading Spinner during Debounced API Fetch */}
        {isLoading && (
          <div className="me-2 text-[#006948] animate-spin shrink-0">
            <Loader2 className="w-4 h-4" />
          </div>
        )}

        {/* Clear Button */}
        {query && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              setCategories([]);
              setProviders([]);
              inputRef.current?.focus();
            }}
            className="text-gray-400 hover:text-gray-600 me-2 text-xs font-bold px-1.5 py-0.5 rounded-full hover:bg-gray-100"
            title="Clear search"
          >
            ✕
          </button>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-[#006948] hover:bg-[#00855d] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors shrink-0 shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>{effectiveButtonText}</span>
        </button>
      </form>

      {/* Auto-suggest Typeahead Dropdown Panel (Requirement 1) */}
      {isOpen && (
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200/90 overflow-hidden z-50 divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* 1. CATEGORY SUGGESTIONS */}
          {categories.length > 0 && (
            <div className="p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1 mb-1">
                {lang === 'ur' ? 'شعبہ جات' : lang === 'ar' ? 'الفئات المطابقة' : 'Suggested Categories'}
              </div>
              <div className="space-y-1">
                {categories.map((cat, idx) => {
                  const isHighlighted = selectedIndex === idx;
                  return (
                    <Link
                      key={cat.id}
                      href={cat.url}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                        isHighlighted
                          ? 'bg-emerald-50 text-[#006948]'
                          : 'text-gray-800 hover:bg-gray-50 hover:text-[#006948]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-emerald-100/70 text-[#006948] flex items-center justify-center shrink-0">
                          <CategoryIcon icon={cat.icon} id={cat.id} className="w-4 h-4" />
                        </span>
                        <span>{cat.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 rtl:rotate-180" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. MATCHED PROVIDERS (Simultaneous check: fullName, trade_title, categoryName, target_areas & typo tolerance) */}
          {providers.length > 0 && (
            <div className="p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1 mb-1 flex items-center justify-between">
                <span>
                  {lang === 'ur'
                    ? 'ماہرین و سروس پرووائیڈرز'
                    : lang === 'ar'
                    ? 'المتخصصون المعتمدون'
                    : 'Verified Specialists'}
                </span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {providers.length} {lang === 'ur' ? 'دستیاب' : lang === 'ar' ? 'متاح' : 'found'}
                </span>
              </div>
              <div className="space-y-1.5">
                {providers.map((p, idx) => {
                  const globalIdx = categories.length + idx;
                  const isHighlighted = selectedIndex === globalIdx;
                  return (
                    <Link
                      key={p.id}
                      href={p.url}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                        isHighlighted
                          ? 'bg-emerald-50/80 ring-1 ring-[#006948]'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        {p.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.avatar_url}
                            alt={p.name}
                            className="w-10 h-10 rounded-full object-cover border border-emerald-100 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                              {p.name}
                            </span>
                            {p.is_verified && (
                              <span title="Verified Specialist" className="inline-flex shrink-0">
                                <BadgeCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                              </span>
                            )}
                            {p.is_premium && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">
                                PRO
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 truncate font-medium">
                            {p.trade_title}
                          </p>

                          {/* Target Areas & City Match */}
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span>{p.city_name}</span>
                            </span>
                            {p.target_areas && p.target_areas.length > 0 && (
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] font-medium truncate max-w-[130px]">
                                {p.target_areas[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="text-right shrink-0 ps-2">
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{p.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">({p.review_count})</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. EMPTY STATE WITH TYPO ADVISORY */}
          {!isLoading && !hasSuggestions && (
            <div className="p-6 text-center">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                {lang === 'ur'
                  ? `"${query}" کے لیے فوری نتیجہ نہیں ملا۔`
                  : lang === 'ar'
                  ? `لم نجد نتائج فورية لـ "${query}".`
                  : `No instant matches found for "${query}".`}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {lang === 'ur'
                  ? 'مکمل سرچ چلانے کے لیے نیچے دیے گئے بٹن پر کلک کریں۔'
                  : lang === 'ar'
                  ? 'اضغط أدناه للبحث في كافة الخدمات والأحياء.'
                  : 'Press the search button or explore all available directory services.'}
              </p>
            </div>
          )}

          {/* 4. FOOTER: VIEW ALL MATCHING SEARCH RESULTS */}
          <div className="bg-gray-50 p-2.5 sm:p-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-xs font-bold text-[#006948] border border-gray-200 hover:border-[#006948] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>
                {lang === 'ur'
                  ? `"${query}" کے تمام نتائج دیکھیں`
                  : lang === 'ar'
                  ? `عرض كافة النتائج لـ "${query}"`
                  : `View all results for "${query}"`}
              </span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* Popular quick searches */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-emerald-100/90 font-medium">
        <span className="text-xs text-emerald-200 font-semibold">
          {lang === 'ur' ? 'مقبول:' : lang === 'ar' ? 'الأكثر طلباً:' : 'Popular:'}
        </span>
        <button
          type="button"
          onClick={() => handleQuickFilter(lang === 'ur' ? 'پلمبر' : lang === 'ar' ? 'سباك' : 'plumber in orangi')}
          className="bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          {lang === 'ur' ? 'پلمبر' : lang === 'ar' ? 'سباك' : 'Plumber in Orangi'}
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter(lang === 'ur' ? 'الیکٹریشن' : lang === 'ar' ? 'كهربائي' : 'electrician in pechs')}
          className="bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          {lang === 'ur' ? 'الیکٹریشن' : lang === 'ar' ? 'كهربائي' : 'Electrician in PECHS'}
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter(lang === 'ur' ? 'اے سی ریپئر' : lang === 'ar' ? 'تصليح تكييف' : 'ac repair gulshan')}
          className="bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          {lang === 'ur' ? 'اے سی ریپئر' : lang === 'ar' ? 'تصليح تكييف' : 'AC in Gulshan'}
        </button>
      </div>
    </div>
  );
}
