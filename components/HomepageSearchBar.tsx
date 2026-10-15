'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, ChevronDown, X, Check, Globe } from 'lucide-react';
import { COUNTRIES, CITIES, Country, City, getLocalizedCountryName, getLocalizedCityName } from '@/lib/db';

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

export default function HomepageSearchBar({ lang, defaultLocation = 'Karachi, PK' }: Props) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Default active city based on language context
  const defaultCity: SelectedCity = useMemo(() => {
    if (lang === 'ar') {
      return { slug: 'dubai', name: 'Dubai', countryCode: 'ae' };
    }
    return { slug: 'karachi', name: 'Karachi', countryCode: 'pk' };
  }, [lang]);

  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<SelectedCity>(defaultCity);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<'all' | string>('all');
  const [isMounted, setIsMounted] = useState(false);

  const isRTL = lang === 'ur' || lang === 'ar';

  // Restore saved city from localStorage if available
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('baseera_selected_city');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.slug && parsed?.countryCode && parsed?.name) {
          setSelectedCity(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
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
  const getCityDisplayName = (city: SelectedCity): string => {
    const locCity = getLocalizedCityName(city.slug, lang);
    return `${locCity}، ${city.countryCode.toUpperCase()}`;
  };

  const getCityNameOnly = (city: SelectedCity): string => {
    return getLocalizedCityName(city.slug, lang);
  };

  // Filtered and grouped cities for selection modal
  const groupedCities = useMemo(() => {
    const q = citySearch.toLowerCase().trim();
    const activeCountries = countryFilter === 'all'
      ? COUNTRIES
      : COUNTRIES.filter((c) => c.code.toLowerCase() === countryFilter.toLowerCase());

    return activeCountries
      .map((country) => {
        const locCountry = getLocalizedCountryName(country.code, lang).toLowerCase();
        const countryCities = CITIES.filter((city) => {
          if (city.countryCode.toLowerCase() !== country.code.toLowerCase()) return false;
          if (!q) return true;
          const locCity = getLocalizedCityName(city.slug, lang).toLowerCase();
          const matchesName = city.name.toLowerCase().includes(q);
          const matchesSlug = city.slug.toLowerCase().includes(q);
          const matchesCountry = country.name.toLowerCase().includes(q) || locCountry.includes(q);
          const matchesLoc = locCity.includes(q);
          return matchesName || matchesSlug || matchesCountry || matchesLoc;
        });

        return {
          country,
          cities: countryCities,
        };
      })
      .filter((group) => group.cities.length > 0);
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
  };

  // Perform search directed to the selected city route
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const clean = query.trim().toLowerCase();
    const matchedCategory = t.popularSearches.find(
      (item) => item.category.includes(clean) || item.title.toLowerCase().includes(clean)
    );

    const countryCode = selectedCity.countryCode.toLowerCase();
    const citySlug = selectedCity.slug.toLowerCase();

    if (matchedCategory) {
      router.push(`/${lang}/${countryCode}/${citySlug}/${matchedCategory.category}`);
    } else {
      router.push(`/${lang}/${countryCode}/${citySlug}/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Quick chip click directed to selected city
  const handleChipClick = (categorySlug: string) => {
    const countryCode = selectedCity.countryCode.toLowerCase();
    const citySlug = selectedCity.slug.toLowerCase();
    router.push(`/${lang}/${countryCode}/${citySlug}/${categorySlug}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main Search Bar Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-gray-200 rounded-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-2xs hover:border-gray-300 transition-colors"
      >
        {/* 1. INTERACTIVE LOCATION CHIP BUTTON */}
        <button
          type="button"
          onClick={() => setIsCityModalOpen(true)}
          className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 min-h-[44px] bg-gray-50 hover:bg-gray-100 active:bg-gray-200/80 border border-gray-200 hover:border-emerald-600/70 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 transition-all shrink-0 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#006948]/20 overflow-visible"
          title={t.changeCityTooltip}
          aria-haspopup="dialog"
          aria-expanded={isCityModalOpen}
        >
          <div className="flex items-center gap-1.5 min-w-0 overflow-visible">
            <MapPin className="w-4 h-4 text-[#059669] shrink-0 group-hover:scale-110 transition-transform" />
            <span className={`font-semibold text-neutral-900 text-xs sm:text-sm overflow-visible whitespace-nowrap ${
              lang === 'ur' ? 'font-urdu leading-[2.2] pt-1 pb-0.5' : 'truncate'
            }`}>
              {isMounted ? getCityDisplayName(selectedCity) : defaultLocation}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0" />
        </button>

        {/* Search Input */}
        <div className="relative flex-1 flex items-center min-w-0 bg-gray-50/50 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-0 border-gray-100 overflow-visible">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute start-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            className={`w-full ps-9 sm:ps-10 pe-4 py-2.5 sm:py-3 bg-transparent text-xs sm:text-sm text-neutral-900 placeholder:text-gray-400 focus:outline-none min-h-[44px] ${
              lang === 'ur' ? 'font-urdu leading-[2.2]' : ''
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
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

      {/* Quick Category Search Chips (Auto-directed to the selected city) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3.5 justify-center text-xs text-gray-500 overflow-visible">
        <span className={`font-medium text-gray-400 ${lang === 'ur' ? 'font-urdu text-sm' : ''}`}>{t.popular}</span>
        {t.popularSearches.map((item) => {
          const countryCode = (selectedCity?.countryCode || 'pk').toLowerCase();
          const citySlug = (selectedCity?.slug || 'karachi').toLowerCase();
          const href = `/${lang}/${countryCode}/${citySlug}/${item.category}`;

          return (
            <Link
              key={item.category}
              href={href}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-[#006948] hover:border-emerald-200 border border-gray-200 text-gray-700 text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center overflow-visible ${
                lang === 'ur'
                  ? 'font-urdu leading-[2.3] min-h-[40px] pt-1.5 pb-1'
                  : 'min-h-[32px]'
              }`}
            >
              <span className={lang === 'ur' ? 'font-urdu leading-[2.3] overflow-visible inline-block' : ''}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>

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
                        const isSelected =
                          selectedCity.slug.toLowerCase() === c.slug.toLowerCase() &&
                          selectedCity.countryCode.toLowerCase() === c.countryCode.toLowerCase();

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

            {/* Modal Footer with Direct Link Option */}
            <div className={`px-5 py-3 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between text-xs overflow-visible ${
              lang === 'ur' ? 'font-urdu leading-[2.2]' : ''
            }`}>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
