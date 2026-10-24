'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Home,
  PlusCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Wrench,
  Zap,
  Droplet,
  Utensils,
  Hammer,
  Paintbrush,
  Sun,
  ShieldAlert,
} from 'lucide-react';

interface NotFoundViewProps {
  lang?: string;
  country?: string;
  city?: string;
}

const POPULAR_CATEGORIES = [
  { slug: 'electrician', icon: Zap, en: 'Electrician', ur: 'الیکٹریشن', ar: 'كهربائي' },
  { slug: 'ac-technician', icon: Wrench, en: 'AC & Cooling', ur: 'اے سی ٹیکنیشن', ar: 'فني تكييف' },
  { slug: 'plumber', icon: Droplet, en: 'Plumber', ur: 'پلمبر و سینیٹری', ar: 'سباك' },
  { slug: 'home-chef', icon: Utensils, en: 'Home Chef & Tiffin', ur: 'ہوم شیف کھانا', ar: 'طاهي منزلي' },
  { slug: 'carpenter', icon: Hammer, en: 'Carpenter & Woodwork', ur: 'کارپینٹر و لکڑی', ar: 'نجار' },
  { slug: 'painter', icon: Paintbrush, en: 'Painter & Coating', ur: 'پینٹر و رنگ روغن', ar: 'دهان ومظهر' },
  { slug: 'solar-installer', icon: Sun, en: 'Solar & Inverter', ur: 'سولر پینل انسٹالر', ar: 'طاقة شمسية' },
  { slug: 'washing-machine-technician', icon: Sparkles, en: 'Appliance Repair', ur: 'واشنگ مشین ریپئر', ar: 'تصليح أجهزة' },
];

export default function NotFoundView({
  lang = 'en',
  country = 'pk',
  city = 'karachi',
}: NotFoundViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const isRTL = lang === 'ur' || lang === 'ar';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 sm:py-16 bg-[#f9f9ff] text-neutral-900"
    >
      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Visual 404 Badge */}
        <div className="relative inline-flex flex-col items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] shadow-sm mb-3">
            <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-[#059669]" />
          </div>
          <span className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#059669] to-[#047857] bg-clip-text text-transparent">
            404
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {lang === 'ur'
              ? 'معذرت! یہ صفحہ موجود نہیں ہے'
              : lang === 'ar'
              ? 'عذراً! الصفحة غير موجودة'
              : 'Page Not Found'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto leading-relaxed">
            {lang === 'ur'
              ? 'آپ جس کاریگر کے پروفائل یا سروس کی تلاش میں ہیں، ہو سکتا ہے اس کا پتہ تبدیل ہو چکا ہو یا وہ ہٹا دیا گیا ہو۔'
              : lang === 'ar'
              ? 'الصفحة أو ملف الفني الذي تبحث عنه قد تم نقله أو لم يعد متاحاً.'
              : "The specialist profile or service page you are looking for might have been moved, renamed, or is currently unavailable."}
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="max-w-lg mx-auto w-full">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white rounded-2xl p-1.5 shadow-md border border-gray-200 text-gray-900 focus-within:border-[#059669] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
          >
            <div className="ps-3 pe-2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'ur'
                  ? 'الیکٹریشن، پلمبر، اے سی سروس تلاش کریں...'
                  : lang === 'ar'
                  ? 'ابحث عن فني كهرباء، سباكة، تكييف...'
                  : 'Search electrician, plumber, AC repair...'
              }
              className="w-full bg-transparent text-sm py-2 px-1 text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              {lang === 'ur' ? 'تلاش کریں' : lang === 'ar' ? 'بحث' : 'Search'}
            </button>
          </form>
        </div>

        {/* Quick Links: Popular Categories */}
        <div className="pt-2">
          <div className="flex items-center justify-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
            <span>
              {lang === 'ur'
                ? 'مقبول سروسز کی فوری تلاش'
                : lang === 'ar'
                ? 'الخدمات الأكثر طلباً'
                : 'Explore Popular Services'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto">
            {POPULAR_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const catTitle = lang === 'ur' ? cat.ur : lang === 'ar' ? cat.ar : cat.en;
              return (
                <Link
                  key={cat.slug}
                  href={`/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-3 bg-white hover:bg-emerald-50/50 border border-gray-200 hover:border-emerald-300 rounded-xl transition-all text-center group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-emerald-100 flex items-center justify-center text-[#059669] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800 group-hover:text-emerald-900 line-clamp-1">
                    {catTitle}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-gray-200/80">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-all shadow-2xs"
          >
            <Home className="w-4 h-4" />
            <span>
              {lang === 'ur' ? 'مرکزی صفحہ پر جائیں' : lang === 'ar' ? 'العودة للرئيسية' : 'Go to Homepage'}
            </span>
          </Link>

          <Link
            href={`/${lang}/list-service`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 hover:border-[#059669] hover:text-[#059669] bg-white text-gray-700 text-xs font-semibold transition-all shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-[#059669]" />
            <span>
              {lang === 'ur' ? 'اپنی سروس درج کریں' : lang === 'ar' ? 'أضف خدمتك' : 'List Your Service'}
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}
