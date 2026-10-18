import React from 'react';
import Link from 'next/link';
import {
  Clock,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
  MessageCircle,
  HelpCircle,
  AlertCircle,
  UserCheck,
  Home,
} from 'lucide-react';
import { Provider, getLocalizedCityName, getCategoryBySlug, getCategoryName } from '@/lib/db';

interface ProfileUnderReviewProps {
  provider: Provider;
  lang: string;
  country: string;
  city: string;
  category: string;
}

export default function ProfileUnderReview({
  provider,
  lang,
  country,
  city,
  category,
}: ProfileUnderReviewProps) {
  const isUrdu = lang === 'ur';
  const isArabic = lang === 'ar';
  const isRTL = isUrdu || isArabic;

  const cityName = getLocalizedCityName(city, lang);
  const catObj = getCategoryBySlug(category);
  const categoryName = catObj ? getCategoryName(catObj, lang) : category;

  const status = provider.status || 'pending';

  const statusLabel =
    status === 'suspended'
      ? isUrdu
        ? 'لسٹنگ معطل'
        : isArabic
        ? 'تم تعليق الحساب'
        : 'Listing Suspended'
      : status === 'rejected'
      ? isUrdu
        ? 'درخواست مسترد'
        : isArabic
        ? 'الطلب غير معتمد'
        : 'Registration Declined'
      : isUrdu
      ? 'پروفائل زیرِ جائزہ ہے'
      : isArabic
      ? 'الملف قيد المراجعة'
      : 'Profile Under Review';

  const heading =
    status === 'suspended'
      ? isUrdu
        ? 'یہ لسٹنگ فی الحال معطل ہے'
        : isArabic
        ? 'هذا الملف معلق مؤقتاً'
        : 'This Listing is Temporarily Suspended'
      : status === 'rejected'
      ? isUrdu
        ? 'یہ پروفائل فعال نہیں ہے'
        : isArabic
        ? 'هذا الملف غير نشط'
        : 'This Profile is Inactive'
      : isUrdu
      ? 'یہ کاریگر پروفائل تصدیق کے عمل میں ہے'
      : isArabic
      ? 'هذا الملف يخضع حالياً لتدقيق الجودة'
      : 'This Specialist Profile is Under Review';

  const description =
    status === 'suspended'
      ? isUrdu
        ? 'یہ پروفائل کوالٹی یا پالیسی شکایات کی بناء پر عارضی طور پر غیر فعال کیا گیا ہے۔'
        : isArabic
        ? 'تم إيقاف ظهور هذا الحساب مؤقتاً لمراجعة معايير الجودة والسياسات.'
        : 'This specialist profile has been temporarily suspended pending quality compliance review.'
      : isUrdu
      ? 'بصیرہ پلیٹ فارم پر معیار، شفافیت اور صارفین کے تحفظ کو یقینی بنانے کے لیے تمام نئے کاریگروں کے واٹس ایپ نمبر اور اسناد کی تصدیق کی جاتی ہے۔ یہ لسٹنگ جائزہ مکمل ہونے کے بعد خودکار طور پر ڈائریکٹری میں فعال ہو جائے گی۔'
      : isArabic
      ? 'لضمان جودة الخدمات وسلامة المستهلكين على دليل بصيرة، تخضع جميع الملفات الجديدة لمراجعة وتدقيق أرقام التواصل وسجل الأعمال قبل النشر العام.'
      : 'To guarantee directory quality and client safety on Baseera, all newly registered service specialists undergo identity and contact verification before being published in public listings.';

  return (
    <div
      className={`min-h-screen bg-[#f9f9ff] text-neutral-900 pb-20 ${
        isUrdu ? 'font-urdu' : isArabic ? 'font-tajawal' : 'font-sans'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. FORCEFUL SEO GUARD: Strictly prohibit indexing and link following */}
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
      </head>

      {/* 2. Breadcrumb Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href={`/${lang}`} className="hover:text-emerald-700 transition-colors">
              {isUrdu ? 'مرکزی صفحہ' : isArabic ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <Link
              href={`/${lang}/${country.toLowerCase()}/${city.toLowerCase()}`}
              className="hover:text-emerald-700 transition-colors"
            >
              {cityName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <Link
              href={`/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}`}
              className="hover:text-emerald-700 transition-colors"
            >
              {categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <span className="text-amber-800 font-semibold">{statusLabel}</span>
          </nav>
        </div>
      </div>

      {/* 3. Main Under Review Hero Card */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white border-2 border-amber-200/90 rounded-3xl p-6 sm:p-10 shadow-sm text-center relative overflow-hidden">
          {/* Top amber accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400" />

          {/* Status Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-2xs">
            {status === 'suspended' || status === 'rejected' ? (
              <ShieldAlert className="w-8 h-8" />
            ) : (
              <Clock className="w-8 h-8 animate-pulse" />
            )}
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100/90 text-amber-900 border border-amber-300 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>{statusLabel}</span>
          </div>

          {/* Heading */}
          <h1
            className={`text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3 ${
              isUrdu ? 'font-urdu leading-[2.4]' : ''
            }`}
          >
            {heading}
          </h1>

          <p
            className={`text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed mb-8 ${
              isUrdu ? 'font-urdu leading-[2.3]' : ''
            }`}
          >
            {description}
          </p>

          {/* Submitted Profile Details Box */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 mb-8 text-start max-w-lg mx-auto">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-amber-800 mb-3 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-700" />
              <span>
                {isUrdu ? 'جمع کرائی گئی معلومات' : isArabic ? 'بيانات التسجيل' : 'Registered Submission Preview'}
              </span>
            </h3>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-amber-200/40 pb-1.5">
                <span className="text-gray-500">{isUrdu ? 'نام:' : isArabic ? 'الاسم:' : 'Name:'}</span>
                <span className="font-bold text-gray-900">{provider.name}</span>
              </div>
              <div className="flex justify-between border-b border-amber-200/40 pb-1.5">
                <span className="text-gray-500">{isUrdu ? 'سروس:' : isArabic ? 'المهنة:' : 'Trade:'}</span>
                <span className="font-semibold text-gray-800">{provider.trade_title || categoryName}</span>
              </div>
              <div className="flex justify-between border-b border-amber-200/40 pb-1.5">
                <span className="text-gray-500">{isUrdu ? 'علاقہ:' : isArabic ? 'المدينة:' : 'Location:'}</span>
                <span className="font-semibold text-gray-800">
                  {provider.district ? `${provider.district}, ${cityName}` : cityName}
                </span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-gray-500">{isUrdu ? 'اسٹیٹس:' : isArabic ? 'الحالة:' : 'Queue Status:'}</span>
                <span className="font-bold text-amber-700 uppercase text-xs">
                  {status === 'pending' ? 'Pending Admin Review' : status}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-2xs"
            >
              <span>
                {isUrdu
                  ? `${cityName} میں منظور شدہ ${categoryName} دیکھیں`
                  : isArabic
                  ? `تصفح فنيي ${categoryName} المعتمدين`
                  : `Browse Approved ${categoryName}s`}
              </span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>

            <Link
              href={`/${lang}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              <Home className="w-4 h-4 text-gray-500" />
              <span>{isUrdu ? 'ہوم پیج' : isArabic ? 'الرئيسية' : 'Back to Home'}</span>
            </Link>
          </div>

          {/* Notice to the Provider */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
            <HelpCircle className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              {isUrdu
                ? 'کیا یہ آپ کا پروفائل ہے؟ منظوری کے بعد آپ کو واٹس ایپ پر مطلع کر دیا جائے گا۔'
                : isArabic
                ? 'هل هذا حسابك؟ سيتم إشعارك عبر واتساب بمجرد اعتماد الملف.'
                : 'Are you the service provider? You will receive confirmation on WhatsApp once approved.'}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
