'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, ChevronDown, Check, Sparkles, Filter, HelpCircle } from 'lucide-react';

export interface FaqAccordionItem {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  label: string;
  icon?: string;
}

interface FaqAccordionProps {
  items: FaqAccordionItem[];
  categories: FaqCategory[];
  lang?: string;
  searchPlaceholder?: string;
  noResultsTitle?: string;
  noResultsDesc?: string;
  clearSearchText?: string;
  expandAllText?: string;
  collapseAllText?: string;
}

export default function FaqAccordion({
  items,
  categories,
  lang = 'en',
  searchPlaceholder = 'Search questions, policies, or topics...',
  noResultsTitle = 'No matching questions found',
  noResultsDesc = 'Try searching with different keywords or browse all categories.',
  clearSearchText = 'Reset Search',
  expandAllText = 'Expand All',
  collapseAllText = 'Collapse All',
}: FaqAccordionProps) {
  const isUrdu = lang === 'ur';
  const isArabic = lang === 'ar';
  const isRTL = isUrdu || isArabic;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    // Default open the first two items
    const initial: Record<string, boolean> = {};
    if (items.length > 0) initial[items[0].id] = true;
    if (items.length > 1) initial[items[1].id] = true;
    return initial;
  });

  // Handle URL hash on initial load (e.g., #zero-commission)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const targetId = window.location.hash.replace('#', '');
      const matched = items.find((i) => i.id === targetId);
      if (matched) {
        setOpenItems((prev) => ({ ...prev, [matched.id]: true }));
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [items]);

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!query) return true;

      return (
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query)
      );
    });
  }, [items, selectedCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      // Optional: sync hash in address bar without scrolling
      if (updated[id] && typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${id}`);
      }
      return updated;
    });
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    filteredItems.forEach((item) => {
      allOpen[item.id] = true;
    });
    setOpenItems(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenItems({});
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Search Box */}
      <div className="relative max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <Search
            className={`w-5 h-5 text-gray-400 absolute ${
              isRTL ? 'right-4' : 'left-4'
            } pointer-events-none`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className={`w-full bg-white border border-gray-200 rounded-2xl py-3.5 sm:py-4 ${
              isRTL ? 'pr-12 pl-12 font-urdu' : 'pl-12 pr-12 font-sans'
            } text-sm sm:text-base text-gray-900 placeholder:text-gray-400 shadow-2xs focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute ${
                isRTL ? 'left-4' : 'right-4'
              } text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors`}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 px-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
              } ${isUrdu ? 'font-urdu leading-[2.0]' : ''}`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 3. Toolbar (Count & Expand/Collapse) */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 max-w-4xl mx-auto px-1">
        <span className={isUrdu ? 'font-urdu leading-[2.0]' : ''}>
          {isUrdu
            ? `${filteredItems.length} سوالات دستیاب ہیں`
            : isArabic
            ? `${filteredItems.length} سؤال متاح`
            : `Showing ${filteredItems.length} of ${items.length} questions`}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExpandAll}
            className="hover:text-emerald-700 font-medium transition-colors cursor-pointer"
          >
            {expandAllText}
          </button>
          <span className="text-gray-300">•</span>
          <button
            onClick={handleCollapseAll}
            className="hover:text-emerald-700 font-medium transition-colors cursor-pointer"
          >
            {collapseAllText}
          </button>
        </div>
      </div>

      {/* 4. Accordion List */}
      <div className="max-w-4xl mx-auto space-y-3.5">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isOpen = Boolean(openItems[item.id]);

            return (
              <div
                key={item.id}
                id={item.id}
                className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden shadow-2xs ${
                  isOpen
                    ? 'border-emerald-500/60 ring-1 ring-emerald-500/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full p-4 sm:p-5 text-start flex items-start justify-between gap-3 sm:gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 mb-1.5">
                      {item.categoryLabel}
                    </span>
                    <h3
                      className={`text-base sm:text-lg font-bold text-gray-900 leading-snug ${
                        isOpen ? 'text-emerald-700' : ''
                      } ${isUrdu ? 'font-urdu leading-[2.2]' : ''}`}
                    >
                      {item.question}
                    </h3>
                  </div>

                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-emerald-50 text-emerald-600 rotate-180'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-sm sm:text-base text-gray-600 border-t border-gray-100 leading-relaxed animate-in fade-in-50 duration-150">
                    <p className={`pt-3 ${isUrdu ? 'font-urdu leading-[2.4]' : ''}`}>
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Empty Search State */
          <div className="p-8 sm:p-12 text-center bg-white border border-gray-200 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {noResultsTitle}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              {noResultsDesc}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <span>{clearSearchText}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
