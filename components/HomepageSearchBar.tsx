'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, ChevronDown, X, Check, Globe, Sparkles } from 'lucide-react';
import {
  COUNTRIES,
  CITIES,
  CATEGORIES,
  Country,
  City,
  CategoryDef,
  getLocalizedCountryName,
  getLocalizedCityName,
  getCategoryName,
} from '@/lib/db';
import {
  filterLocationsSmart,
  searchCategoriesSmart,
  findBestCategoryMatch,
} from '@/lib/smart-search';
import CategoryIcon from '@/components/CategoryIcon';

interface Props {
  lang: string;
  defaultLocation?: string;
}

export interface SelectedCity {
  slug: string;
  name: string;
  countryCode: string;
}

const CITY_LOCALIZED_NAMES: Record<string, { ur: string; ar: string }> = {
  // Pakistan (Top 30 Cities)
  karachi: { ur: 'کراچی', ar: 'كراتشي' },
  lahore: { ur: 'لاہور', ar: 'لاهور' },
  faisalabad: { ur: 'فیصل آباد', ar: 'فيصل آباد' },
  rawalpindi: { ur: 'راولپنڈی', ar: 'راولبندي' },
  gujranwala: { ur: 'گوجرانوالہ', ar: 'غوجرانوالا' },
  peshawar: { ur: 'پشاور', ar: 'بيشاور' },
  multan: { ur: 'ملتان', ar: 'ملتان' },
  hyderabad: { ur: 'حیدرآباد', ar: 'حيدر أباد' },
  islamabad: { ur: 'اسلام آباد', ar: 'إسلام آباد' },
  quetta: { ur: 'کوئٹہ', ar: 'كويتا' },
  bahawalpur: { ur: 'بہاولپور', ar: 'بهاولبور' },
  sargodha: { ur: 'سرگودھا', ar: 'سرغودها' },
  sialkot: { ur: 'سیالکوٹ', ar: 'سيالكوت' },
  sukkur: { ur: 'سکھر', ar: 'سكر' },
  larkana: { ur: 'لاڑکانہ', ar: 'لاركانا' },
  sheikhupura: { ur: 'شیخوپورہ', ar: 'شيخوبورا' },
  'rahim-yar-khan': { ur: 'رحیم یار خان', ar: 'رحيم يار خان' },
  jhang: { ur: 'جھنگ', ar: 'جهانغ' },
  'dera-ghazi-khan': { ur: 'ڈیرہ غازی خان', ar: 'ديرا غازي خان' },
  gujrat: { ur: 'گجرات', ar: 'غوجرات' },
  sahiwal: { ur: 'ساہیوال', ar: 'ساهيوال' },
  'wah-cantonment': { ur: 'واہ کینٹ', ar: 'واه كانتونمنت' },
  mardan: { ur: 'مردان', ar: 'مردان' },
  kasur: { ur: 'قصور', ar: 'قصور' },
  okara: { ur: 'اوکاڑہ', ar: 'أوكارا' },
  mingora: { ur: 'مینگورہ', ar: 'مينغورا' },
  nawabshah: { ur: 'نواب شاہ', ar: 'نواب شاه' },
  chiniot: { ur: 'چنیوٹ', ar: 'شينيوت' },
  kotri: { ur: 'کوٹری', ar: 'كوتري' },
  kamoke: { ur: 'کامونکے', ar: 'كاموكي' },

  // International
  dubai: { ur: 'دبئی', ar: 'دبي' },
  sharjah: { ur: 'شارجہ', ar: 'الشارقة' },
  'abu-dhabi': { ur: 'ابوظہبی', ar: 'أبو ظبي' },
  ajman: { ur: 'عجمان', ar: 'عجمان' },
  riyadh: { ur: 'ریاض', ar: 'الرياض' },
  jeddah: { ur: 'جدہ', ar: 'جدة' },
  dammam: { ur: 'دمام', ar: 'الدمام' },
  doha: { ur: 'دوحہ', ar: 'الدوحة' },
  kuwait: { ur: 'کویت سٹی', ar: 'مدينة الكويت' },
  manama: { ur: 'منامہ', ar: 'المنامة' },
  muscat: { ur: 'مسقط', ar: 'مسقط' },
  london: { ur: 'لندن', ar: 'لندن' },
  manchester: { ur: 'مانچسٹر', ar: 'مانشستر' },
  birmingham: { ur: 'برمنگھم', ar: 'برمنغهام' },
  'new-york': { ur: 'نیویارک', ar: 'نيويورك' },
  houston: { ur: 'ہیوسٹن', ar: 'هيوستن' },
  chicago: { ur: 'شکاگو', ar: 'شيكاغو' },
  'los-angeles': { ur: 'لاس اینجلس', ar: 'لوس أنجلوس' },
  toronto: { ur: 'ٹورنٹو', ar: 'تورونتو' },
  vancouver: { ur: 'وینکوور', ar: 'فانكوفر' },
};

export default function HomepageSearchBar({ lang, defaultLocation }: Props) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  // 1. Generic Global Hub default state (null = no city selected yet, prompting explicit user selection)
  const [selectedCity, setSelectedCity] = useState<SelectedCity | null>(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<'all' | string>('all');
  const [isMounted, setIsMounted] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Pending user intent if they searched or clicked a category while on Global Hub
  const [pendingAction, setPendingAction] = useState<{
    categorySlug?: string;
    searchQuery?: string;
  } | null>(null);

  // Optional lightweight Geo-IP detected location
  const [detectedGeo, setDetectedGeo] = useState<{
    countryCode: string;
    countryName: string;
    citySlug: string;
    cityName: string;
    flag?: string;
  } | null>(null);

  // Compute live smart category suggestions as user types
  const suggestedCategories = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return searchCategoriesSmart(trimmed, CATEGORIES, lang, 5);
  }, [query, lang]);

  // Click outside to close category suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsSuggestionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isRTL = lang === 'ur' || lang === 'ar';

  // Restore saved city from localStorage or check lightweight Geo-IP
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('baseera_selected_city');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if user explicitly selected a valid city previously
        if (parsed?.slug && parsed?.countryCode && parsed?.name) {
          setSelectedCity(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    // Lightweight Geo-IP lookup (via /api/geo)
    fetch('/api/geo')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.detected && data?.countryCode && data?.citySlug) {
          setDetectedGeo(data);
        }
      })
      .catch(() => {});
  }, []);

  // Lock body scroll and handle Escape key on modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCityModalOpen(false);
      }
    };
    if (isCityModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCityModalOpen]);

  const translations = {
    ur: {
      placeholder: 'الیکٹریشن، پلمبر، اے سی ٹیکنیشن تلاش کریں...',
      btnText: 'سروسز تلاش کریں',
      popular: 'مقبول سروسز:',
      changeCityTooltip: 'شہر تبدیل کریں',
      modalTitle: 'شہر منتخب کریں',
      modalSubtitle: 'اپنے شہر کے تصدیق شدہ ماہرین تلاش کرنے کے لیے شہر منتخب کریں',
      searchCityPlaceholder: 'شہر یا ملک کا نام تلاش کریں...',
      allCountries: 'تمام ممالک',
      noCitiesFound: 'کوئی شہر نہیں ملا',
      browseCityDirectly: 'کے تمام کاریگر اور سروسز دیکھیں',
      popularSearches: [
        { title: 'اے سی ٹیکنیشن', category: 'ac-technician' },
        { title: 'الیکٹریشن', category: 'electrician' },
        { title: 'پلمبر', category: 'plumber' },
        { title: 'بڑھئی / کارپینٹر', category: 'carpenter' },
        { title: 'پینٹر', category: 'painter' },
        { title: 'ہوم شیف', category: 'home-chef' },
      ],
    },
    ar: {
      placeholder: 'ابحث عن كهربائي، سباك، فني تكييف...',
      btnText: 'بحث عن خدمة',
      popular: 'الأكثر طلباً:',
      changeCityTooltip: 'تغيير المدينة',
      modalTitle: 'اختر مدينتك',
      modalSubtitle: 'اختر المدينة للوصول إلى أمهر الفنيين والخدمات المحلية المعتمدة',
      searchCityPlaceholder: 'ابحث عن اسم المدينة أو الدولة...',
      allCountries: 'جميع الدول',
      noCitiesFound: 'لم يتم العثور على أي مدينة مطابقة',
      browseCityDirectly: 'تصفح كافة خدمات',
      popularSearches: [
        { title: 'فني تكييف', category: 'ac-technician' },
        { title: 'كهربائي', category: 'electrician' },
        { title: 'سباك', category: 'plumber' },
        { title: 'نجار', category: 'carpenter' },
        { title: 'دهان', category: 'painter' },
        { title: 'طاهي منزلي', category: 'home-chef' },
      ],
    },
    en: {
      placeholder: 'Search electrician, plumber, AC specialist...',
      btnText: 'Find Services',
      popular: 'Popular:',
      changeCityTooltip: 'Change City',
      modalTitle: 'Select Your City',
      modalSubtitle: 'Choose your city to discover verified local technicians and specialists',
      searchCityPlaceholder: 'Search city or country name...',
      allCountries: 'All Countries',
      noCitiesFound: 'No cities found matching your search',
      browseCityDirectly: 'Explore all services in',
      popularSearches: [
        { title: 'AC Technician', category: 'ac-technician' },
        { title: 'Electrician', category: 'electrician' },
        { title: 'Plumber', category: 'plumber' },
        { title: 'Carpenter', category: 'carpenter' },
        { title: 'Painter', category: 'painter' },
        { title: 'Home Chef', category: 'home-chef' },
      ],
    },
  };

  const t = translations[lang as 'ur' | 'ar'] || translations.en;

  // Format localized display name for city chip
  const getCityDisplayName = (city: SelectedCity | null): string => {
    if (!city) {
      return lang === 'ur' ? 'عالمی مرکز' : lang === 'ar' ? 'الدليل العام' : 'Global Hub';
    }
    const locCity = getLocalizedCityName(city.slug, lang);
    const separator = lang === 'ur' || lang === 'ar' ? '، ' : ', ';
    return `${locCity}${separator}${city.countryCode.toUpperCase()}`;
  };

  const getCityNameOnly = (city: SelectedCity | null): string => {
    if (!city) {
      return lang === 'ur' ? 'عالمی مرکز' : lang === 'ar' ? 'الدليل العام' : 'Global Hub';
    }
    return getLocalizedCityName(city.slug, lang);
  };

  // Filtered and grouped cities for selection modal using Smart Multi-field & Typo Search
  const groupedCities = useMemo(() => {
    const activeCountries =
      countryFilter === 'all'
        ? COUNTRIES
        : COUNTRIES.filter((c) => c.code.toLowerCase() === countryFilter.toLowerCase());

    const formatted = activeCountries.map((c) => ({
      code: c.code,
      name: c.name,
      flag: c.flag,
      region: c.region,
      country: c,
      cities: CITIES.filter((city) => city.countryCode.toLowerCase() === c.code.toLowerCase()),
    }));

    const filtered = filterLocationsSmart(
      formatted,
      citySearch,
      (code) => getLocalizedCountryName(code, lang),
      (slug) => getLocalizedCityName(slug, lang)
    );

    return filtered.map((f) => ({
      country: f.country,
      cities: f.cities,
    }));
  }, [citySearch, countryFilter, lang]);

  // Handle City Selection
  const handleSelectCity = (city: City) => {
    const newSelected: SelectedCity = {
      slug: city.slug,
      name: city.name,
      countryCode: city.countryCode,
    };
    setSelectedCity(newSelected);
    setIsCityModalOpen(false);
    setCitySearch('');

    try {
      localStorage.setItem('baseera_selected_city', JSON.stringify(newSelected));
    } catch {
      // Ignore localStorage failure
    }

    if (pendingAction) {
      const countryCode = newSelected.countryCode.toLowerCase();
      const citySlug = newSelected.slug.toLowerCase();

      if (pendingAction.categorySlug) {
        router.push(`/${lang}/${countryCode}/${citySlug}/${pendingAction.categorySlug}`);
      } else if (pendingAction.searchQuery) {
        const trimmed = pendingAction.searchQuery.trim();
        const matched = findBestCategoryMatch(trimmed, CATEGORIES, lang);
        if (matched) {
          router.push(`/${lang}/${countryCode}/${citySlug}/${matched.slug}`);
        } else {
          router.push(`/${lang}/${countryCode}/${citySlug}/search?q=${encodeURIComponent(trimmed)}`);
        }
      }
      setPendingAction(null);
    }
  };

  // Select category directly from live smart suggestions
  const handleSelectCategory = (categorySlug: string) => {
    setIsSuggestionsOpen(false);
    if (!selectedCity) {
      setPendingAction({ categorySlug });
      setIsCityModalOpen(true);
      return;
    }
    const countryCode = selectedCity.countryCode.toLowerCase();
    const citySlug = selectedCity.slug.toLowerCase();
    router.push(`/${lang}/${countryCode}/${citySlug}/${categorySlug}`);
  };

  // Perform search directed to the selected city route with smart category detection
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSuggestionsOpen(false);

    if (!selectedCity) {
      setPendingAction({ searchQuery: trimmed });
      setIsCityModalOpen(true);
      return;
    }

    // 1. Try finding best category match using alias mapping + fuzzy match
    const matchedCategory = findBestCategoryMatch(trimmed, CATEGORIES, lang);
    const countryCode = selectedCity.countryCode.toLowerCase();
    const citySlug = selectedCity.slug.toLowerCase();

    if (matchedCategory) {
      router.push(`/${lang}/${countryCode}/${citySlug}/${matchedCategory.slug}`);
    } else {
      router.push(`/${lang}/${countryCode}/${citySlug}/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  // Quick chip click directed to selected city or triggers city modal
  const handleChipClick = (categorySlug: string) => {
    if (!selectedCity) {
      setPendingAction({ categorySlug });
      setIsCityModalOpen(true);
      return;
    }
    const countryCode = selectedCity.countryCode.toLowerCase();
    const citySlug = selectedCity.slug.toLowerCase();
    router.push(`/${lang}/${countryCode}/${citySlug}/${categorySlug}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main Search Bar Form with Floating Category Suggestions */}
      <div className="relative">
        <form
          onSubmit={handleSearch}
          className="bg-white border border-gray-200 rounded-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-2xs hover:border-gray-300 transition-colors"
        >
          {/* 1. INTERACTIVE LOCATION CHIP BUTTON */}
          <button
            type="button"
            onClick={() => {
              setPendingAction(null);
              setIsCityModalOpen(true);
            }}
            className={`flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#006948]/20 overflow-visible ${
              !selectedCity
                ? 'bg-emerald-50/90 hover:bg-emerald-100/80 border border-emerald-200 hover:border-emerald-500/70 text-emerald-900'
                : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200/80 border border-gray-200 hover:border-emerald-600/70 text-gray-800'
            }`}
            title={t.changeCityTooltip}
            aria-haspopup="dialog"
            aria-expanded={isCityModalOpen}
          >
            <div className="flex items-center gap-1.5 min-w-0 overflow-visible">
              {!selectedCity ? (
                <Globe className="w-4 h-4 text-[#006948] shrink-0 group-hover:scale-110 transition-transform" />
              ) : (
                <MapPin className="w-4 h-4 text-[#059669] shrink-0 group-hover:scale-110 transition-transform" />
              )}
              <span className={`font-semibold text-xs sm:text-sm overflow-visible whitespace-nowrap ${
                !selectedCity ? 'text-[#006948]' : 'text-neutral-900'
              } ${lang === 'ur' ? 'font-urdu leading-[2.2] pt-1 pb-0.5' : 'truncate'}`}>
                {isMounted ? getCityDisplayName(selectedCity) : defaultLocation || 'Global Hub'}
              </span>
              {!selectedCity && (
                <span className="hidden xs:inline-flex items-center text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded bg-emerald-600 text-white leading-none">
                  {lang === 'ur' ? 'شہر منتخب کریں' : lang === 'ar' ? 'اختر المدينة' : 'Select City'}
                </span>
              )}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-colors shrink-0 ${
              !selectedCity ? 'text-emerald-700 group-hover:text-emerald-900' : 'text-gray-400 group-hover:text-gray-700'
            }`} />
          </button>

          {/* Search Input */}
          <div className="relative flex-1 flex items-center min-w-0 bg-gray-50/50 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-0 border-gray-100 overflow-visible">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute start-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onFocus={() => {
                if (query.trim()) setIsSuggestionsOpen(true);
              }}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsSuggestionsOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsSuggestionsOpen(false);
                }
              }}
              placeholder={t.placeholder}
              className={`w-full ps-9 sm:ps-10 pe-4 py-2.5 sm:py-3 bg-transparent text-xs sm:text-sm text-neutral-900 placeholder:text-gray-400 focus:outline-none min-h-[44px] ${
                lang === 'ur' ? 'font-urdu leading-[2.2]' : ''
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setIsSuggestionsOpen(false);
                }}
                className="absolute end-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Submit Action Button */}
          <button
            type="submit"
            className={`bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-2xs active:scale-98 overflow-visible ${
              lang === 'ur' ? 'font-urdu leading-[2.2]' : ''
            }`}
          >
            <span className={lang === 'ur' ? 'font-urdu leading-[2.2] pt-0.5' : ''}>{t.btnText}</span>
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </form>

        {/* Smart Category Suggestions Floating Dropdown */}
        {isSuggestionsOpen && query.trim() && suggestedCategories.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full start-0 end-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl z-30 overflow-hidden text-start animate-in fade-in zoom-in-95 duration-150 divide-y divide-gray-100"
          >
            <div className="px-4 py-2 bg-gray-50/70 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {lang === 'ur' ? 'تجویز کردہ سروسز' : lang === 'ar' ? 'الخدمات المقترحة' : 'Suggested Services'}
              </span>
              <span className="text-[10px] text-gray-400">
                {lang === 'ur' ? 'فوری انتخاب' : lang === 'ar' ? 'تطابق فوري' : 'Direct Match'}
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
              {suggestedCategories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50/60 transition-colors cursor-pointer group text-start"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <CategoryIcon slug={cat.slug} icon={cat.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-gray-900 text-xs sm:text-sm group-hover:text-[#006948] transition-colors truncate ${
                          lang === 'ur' ? 'font-urdu text-sm' : ''
                        }`}>
                          {getCategoryName(cat, lang)}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-sm shrink-0">
                          {cat.slug}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 block truncate">
                        {cat.group} {selectedCity ? `• ${getCityNameOnly(selectedCity)}` : ''}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-gray-300 group-hover:text-[#006948] group-hover:translate-x-0.5 transition-all shrink-0 ${
                    isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : ''
                  }`} />
                </button>
              ))}
            </div>

            {/* Direct Query Search Link */}
            <button
              type="button"
              onClick={() => handleSearch()}
              className="w-full px-4 py-2.5 bg-gray-50/80 hover:bg-gray-100 flex items-center justify-between text-xs text-gray-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">
                  {lang === 'ur' ? (
                    <>تمام ماہرین برائے &quot;<strong className="text-gray-900">{query.trim()}</strong>&quot; {selectedCity ? `(${getCityNameOnly(selectedCity)})` : ''}</>
                  ) : lang === 'ar' ? (
                    <>بحث شامل عن &quot;<strong className="text-gray-900">{query.trim()}</strong>&quot; {selectedCity ? `في ${getCityNameOnly(selectedCity)}` : ''}</>
                  ) : (
                    <>Search all providers for &quot;<strong className="text-gray-900">{query.trim()}</strong>&quot; {selectedCity ? <>in <strong className="text-gray-900">{getCityNameOnly(selectedCity)}</strong></> : '• Select City'}</>
                  )}
                </span>
              </div>
              <span className={`text-[11px] font-semibold text-[#006948] shrink-0 ms-2 ${
                lang === 'ur' ? 'font-urdu' : ''
              }`}>
                {lang === 'ur' ? 'تلاش کے نتائج ←' : lang === 'ar' ? 'نتائج البحث ←' : 'Search Results →'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Category Search Chips (Auto-directed to the selected city or opens city modal) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3.5 justify-center text-xs text-gray-500 overflow-visible">
        <span className={`font-medium text-gray-400 ${lang === 'ur' ? 'font-urdu text-sm' : ''}`}>{t.popular}</span>
        {t.popularSearches.map((item) => (
          <button
            key={item.category}
            type="button"
            onClick={() => handleChipClick(item.category)}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-[#006948] hover:border-emerald-200 border border-gray-200 text-gray-700 text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center overflow-visible ${
              lang === 'ur'
                ? 'font-urdu leading-[2.3] min-h-[40px] pt-1.5 pb-1'
                : 'min-h-[32px]'
            }`}
          >
            <span className={lang === 'ur' ? 'font-urdu leading-[2.3] overflow-visible inline-block' : ''}>
              {item.title}
            </span>
          </button>
        ))}
      </div>

      {/* Geo-IP Auto-Detection 1-Click Pill (Displayed if detected and city not explicitly set yet) */}
      {detectedGeo && !selectedCity && isMounted && (
        <div className="mt-3 flex items-center justify-center animate-in fade-in slide-in-from-top-1 duration-200">
          <button
            type="button"
            onClick={() => {
              const newSelected: SelectedCity = {
                slug: detectedGeo.citySlug,
                name: detectedGeo.cityName,
                countryCode: detectedGeo.countryCode,
              };
              setSelectedCity(newSelected);
              try {
                localStorage.setItem('baseera_selected_city', JSON.stringify(newSelected));
              } catch {}
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs group cursor-pointer transition-all"
          >
            <span className="text-sm">{detectedGeo.flag || '📍'}</span>
            <span>
              {lang === 'ur'
                ? `آپ کا مقام: ${detectedGeo.cityName} (${detectedGeo.countryCode.toUpperCase()}) — بطور میرا شہر سیٹ کریں؟`
                : lang === 'ar'
                ? `الموقع المقترح: ${detectedGeo.cityName} (${detectedGeo.countryCode.toUpperCase()}) — تعيين كمدينتي؟`
                : `Detected location: ${detectedGeo.cityName}, ${detectedGeo.countryCode.toUpperCase()} — Set as my city?`}
            </span>
            <Check className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* 2. MINIMALIST FLAT CITY SELECTION MODAL */}
      {isCityModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsCityModalOpen(false)}
        >
          <div
            className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 text-start"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="city-modal-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="city-modal-title" className={`text-base sm:text-lg font-bold text-gray-900 ${
                    lang === 'ur' ? 'font-urdu leading-[2.2] pt-0.5' : 'leading-tight'
                  }`}>
                    {t.modalTitle}
                  </h3>
                  <p className={`text-xs text-gray-500 mt-0.5 hidden xs:block ${
                    lang === 'ur' ? 'font-urdu leading-[2.2]' : ''
                  }`}>
                    {t.modalSubtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCityModalOpen(false)}
                className="w-8 h-8 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Context Awareness Banner if User was trying to search/browse */}
            {pendingAction && (
              <div className="px-5 pt-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className={lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}>
                    {lang === 'ur'
                      ? 'براہ کرم نتائج دیکھنے کے لیے پہلے اپنا شہر منتخب کریں۔'
                      : lang === 'ar'
                      ? 'يرجى تحديد مدينتك أولاً لعرض الخدمات المتوفرة بالقرب منك.'
                      : 'Please select your city first to discover verified specialists near you.'}
                  </span>
                </div>
              </div>
            )}

            {/* City Search Input */}
            <div className="px-5 pt-4 pb-2 bg-white">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-gray-400 absolute start-3 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder={t.searchCityPlaceholder}
                  className={`w-full ps-9 pe-8 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#006948] rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all ${
                    lang === 'ur' ? 'font-urdu leading-[2.2]' : ''
                  }`}
                />
                {citySearch && (
                  <button
                    type="button"
                    onClick={() => setCitySearch('')}
                    className="absolute end-2.5 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Country Filter Tabs */}
            <div className="px-5 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-gray-100 overflow-visible">
              <button
                type="button"
                onClick={() => setCountryFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer overflow-visible ${
                  countryFilter === 'all'
                    ? 'bg-[#006948] text-white shadow-2xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } ${lang === 'ur' ? 'font-urdu leading-[2.2] min-h-[36px]' : ''}`}
              >
                {t.allCountries}
              </button>
              {COUNTRIES.slice(0, 6).map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCountryFilter(c.code)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 overflow-visible ${
                    countryFilter === c.code
                      ? 'bg-[#006948] text-white shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  } ${lang === 'ur' ? 'font-urdu leading-[2.2] min-h-[36px]' : ''}`}
                >
                  <span>{c.flag}</span>
                  <span className={lang === 'ur' ? 'font-urdu leading-none' : ''}>
                    {getLocalizedCountryName(c.code, lang)}
                  </span>
                </button>
              ))}
            </div>

            {/* Categorized Cities List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 divide-y divide-gray-100">
              {groupedCities.length === 0 ? (
                <div className="py-10 text-center">
                  <Globe className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">{t.noCitiesFound}</p>
                  <p className="text-xs text-gray-400 mt-1">Try typing another city name or country</p>
                </div>
              ) : (
                groupedCities.map((group) => (
                  <div key={group.country.code} className="pt-3 first:pt-0">
                    {/* Country Header */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-base">{group.country.flag}</span>
                      <span className={`text-xs font-bold uppercase tracking-wider text-gray-700 ${lang === 'ur' ? 'font-urdu text-sm' : ''}`}>
                        {getLocalizedCountryName(group.country.code, lang)}
                      </span>
                    </div>

                    {/* Cities Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {group.cities.map((c) => {
                        const isSelected = selectedCity
                          ? selectedCity.slug.toLowerCase() === c.slug.toLowerCase() &&
                            selectedCity.countryCode.toLowerCase() === c.countryCode.toLowerCase()
                          : false;

                        const displayTitle = getLocalizedCityName(c.slug, lang);

                        return (
                          <button
                            key={`${c.countryCode}-${c.slug}`}
                            type="button"
                            onClick={() => handleSelectCity(c)}
                            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-start cursor-pointer group min-w-0 ${
                              isSelected
                                ? 'border-[#006948] bg-emerald-50/60 text-[#006948] ring-1 ring-[#006948]'
                                : 'border-gray-200 bg-white hover:border-[#006948]/60 hover:bg-gray-50 text-gray-800'
                            } ${lang === 'ur' ? 'min-h-[52px]' : ''}`}
                          >
                            <div className="min-w-0 flex-1">
                              <span
                                title={displayTitle}
                                className={`block font-bold text-gray-900 group-hover:text-[#006948] transition-colors truncate overflow-hidden text-ellipsis whitespace-nowrap ${
                                  lang === 'ur' ? 'font-urdu leading-[2.2] text-sm pt-0.5' : ''
                                }`}
                              >
                                {displayTitle}
                              </span>
                              <span className="block text-[11px] text-gray-400 font-normal truncate overflow-hidden text-ellipsis whitespace-nowrap mt-0.5">
                                {c.name !== displayTitle ? `${c.name} • ` : ''}
                                {c.countryCode.toUpperCase()}
                              </span>
                            </div>

                            {isSelected && (
                              <Check className="w-4 h-4 text-[#006948] flex-shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer with Direct Link Option or Guidance Message */}
            <div className={`px-5 py-3 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between text-xs overflow-visible ${
              lang === 'ur' ? 'font-urdu leading-[2.2]' : ''
            }`}>
              {selectedCity ? (
                <>
                  <span className={`text-gray-500 overflow-visible ${lang === 'ur' ? '' : 'truncate'}`}>
                    {t.browseCityDirectly} <strong className="text-gray-900">{getCityNameOnly(selectedCity)}</strong>:
                  </span>
                  <Link
                    href={`/${lang}/${selectedCity.countryCode.toLowerCase()}/${selectedCity.slug.toLowerCase()}`}
                    onClick={() => setIsCityModalOpen(false)}
                    className={`font-bold text-[#006948] hover:underline flex items-center gap-1 shrink-0 ${
                      lang === 'ur' ? 'font-urdu pt-0.5' : ''
                    }`}
                  >
                    <span>{getCityNameOnly(selectedCity)} Hub</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </Link>
                </>
              ) : (
                <div className="w-full flex items-center justify-between text-gray-500">
                  <span className={lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}>
                    {lang === 'ur'
                      ? 'مقامی سروسز دیکھنے کے لیے اوپر سے کسی بھی شہر کا انتخاب کریں۔'
                      : lang === 'ar'
                      ? 'اختر أي مدينة من القائمة أعلاه لاستكشاف دليل الخدمات المحلي.'
                      : 'Select any city above to explore verified local specialists.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
