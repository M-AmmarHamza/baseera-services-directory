import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  isValidLocale,
  resolveCountry,
  getResolvedCountryName,
} from '@/lib/routing/resolve-entities';
import {
  MapPin,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Building2,
  PhoneCall,
  Zap,
} from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import {
  getCountryByCode,
  getCitiesByCountry,
  CATEGORIES,
  getCategoryName,
  getLocalizedCountryName,
  getLocalizedCityName,
  getPublishedProvidersByCountry,
  Provider,
} from '@/lib/db';
import { getCities, getCategories, getFaqs, CityItem, CategoryItem } from '@/lib/taxonomy-db';
import { getGlobalAllowIndexing } from '@/lib/settings-db';
import RelatedSlider from '@/components/RelatedSlider';
import CategoryGrid from '@/components/CategoryGrid';
import QuickFacts from '@/components/QuickFacts';
import JsonLd from '@/components/JsonLd';
import { getSiteUrl } from '@/lib/site-url';
import { buildLanguageAlternates } from '@/lib/seo/alternates';

export const revalidate = 3600; // 1 hour ISR CDN caching

export async function generateStaticParams() {
  return [
    { country: 'pk' },
    { country: 'ae' },
    { country: 'sa' },
  ];
}

interface CountryPageProps {
  params: Promise<{
    lang: string;
    country: string;
  }>;
}

const DOMAIN = getSiteUrl();

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { lang, country } = await params;
  if (!isValidLocale(lang)) notFound();
  const validCountry = await resolveCountry(country);
  if (!validCountry) notFound();

  const countryName = getResolvedCountryName(validCountry, lang);
  if (!countryName || !countryName.trim()) {
    notFound();
  }

  const [providers, allowGlobalIndexing] = await Promise.all([
    getPublishedProvidersByCountry(validCountry.code),
    getGlobalAllowIndexing(),
  ]);

  const hasPublishedProviders = providers.length > 0;
  // Thin-content indexing guard:
  // If 0 published providers exist, noindex, follow
  // If global indexing is disabled, noindex, nofollow
  // If published providers > 0 and global indexing is allowed, index, follow
  const robots = !allowGlobalIndexing
    ? { index: false, follow: false }
    : !hasPublishedProviders
    ? { index: false, follow: true }
    : { index: true, follow: true };

  const title =
    lang === 'ur'
      ? `${countryName} میں تصدیق شدہ کاریگر اور لوکل سروسز | بصیرہ`
      : lang === 'ar'
      ? `أفضل الخدمات والفنيين المعتمدين في ${countryName} | بصيرة`
      : `Verified Local Services & Technicians in ${countryName} | Baseera`;

  const description =
    lang === 'ur'
      ? `${countryName} میں بہترین تصدیق شدہ کاریگر تلاش کریں۔ الیکٹریشن، پلمبر، اے سی اور دیگر ماہرین سے بغیر کسی کمیشن کے براہِ راست واٹس ایپ پر رابطہ کریں۔`
      : lang === 'ar'
      ? `استعن بأفضل المهنيين المعتمدين في ${countryName}. من تصليح المكيفات إلى السباكين، تواصل مباشرة عبر واتساب بدون رسوم حجز على دليل بصيرة.`
      : `Find verified local home service specialists across ${countryName}. Connect directly with certified electricians, plumbers, AC technicians, and tradespeople via WhatsApp with zero commission on Baseera.`;

  const alternates = buildLanguageAlternates(`/${validCountry.code.toLowerCase()}`, lang);

  return {
    title,
    description,
    robots,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: lang === 'ur' ? 'بصیرہ ڈائریکٹری' : lang === 'ar' ? 'دليل بصيرة' : 'Baseera Local Services Directory',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
          width: 1200,
          height: 630,
          alt: `${countryName} Local Services Directory - Baseera`,
        },
      ],
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'],
    },
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { lang, country } = await params;
  if (!isValidLocale(lang)) notFound();
  const validCountry = await resolveCountry(country);
  if (!validCountry) notFound();

  const countryName = getResolvedCountryName(validCountry, lang);
  if (!countryName || !countryName.trim()) {
    notFound();
  }

  // 1. Fetch active cities for this country from taxonomy DB with seed fallback
  let activeCities: CityItem[] = [];
  try {
    activeCities = await getCities({ countryCode: validCountry.code, activeOnly: true });
  } catch {
    activeCities = [];
  }
  if (activeCities.length === 0) {
    const seedCities = getCitiesByCountry(validCountry.code);
    activeCities = seedCities.map((c, idx) => ({
      id: idx + 1,
      countryCode: validCountry.code,
      name_en: c.name,
      name_ur: c.slug === 'karachi' ? 'کراچی' : c.slug === 'lahore' ? 'لاہور' : c.slug === 'islamabad' ? 'اسلام آباد' : c.name,
      slug: c.slug,
      targetAreas: ['City Center', 'Saddar'],
      isActive: true,
    }));
  }

  // 2. Fetch active categories from taxonomy DB with seed fallback
  let activeCategories: CategoryItem[] = [];
  try {
    activeCategories = await getCategories({ activeOnly: true });
  } catch {
    activeCategories = [];
  }
  if (activeCategories.length === 0) {
    activeCategories = CATEGORIES.map((c, idx) => ({
      id: c.id,
      name_en: c.name,
      name_ur: c.nameUr || c.name,
      slug_en: c.slug,
      slug_ur: `${c.slug}-mistri`,
      icon: c.icon || 'Wrench',
      sortOrder: idx + 1,
      isActive: true,
    }));
  }

  // Curated Matrix Selection: Top 5-6 cities × Top 6-7 categories (capped at 30-48 links)
  const matrixCities = activeCities.slice(0, 6);
  const coreCategorySlugs = [
    'electrician',
    'plumber',
    'ac-technician',
    'carpenter',
    'painter',
    'cctv-installer',
    'car-mechanic',
  ];
  const matrixCategoriesFiltered = activeCategories.filter(
    (cat) => coreCategorySlugs.includes(cat.slug_en) || coreCategorySlugs.includes(cat.id)
  );
  const matrixCategories = (
    matrixCategoriesFiltered.length >= 5
      ? matrixCategoriesFiltered
      : activeCategories.slice(0, 7)
  ).slice(0, 7);

  // 3. Fetch global/country FAQs
  let faqs: Array<{ question: string; answer: string }> = [];
  try {
    const rawFaqs = await getFaqs({ scope: 'GLOBAL', activeOnly: true });
    if (rawFaqs && rawFaqs.length > 0) {
      faqs = rawFaqs.map((f) => ({
        question: lang === 'ur' && f.question_ur ? f.question_ur : f.question_en,
        answer: lang === 'ur' && f.answer_ur ? f.answer_ur : f.answer_en,
      }));
    }
  } catch (err) {
    console.warn('Country faqs fetch note:', err);
  }

  if (faqs.length === 0) {
    faqs = lang === 'ur' ? [
      {
        question: `${countryName} میں بصیرہ ڈائریکٹری کس طرح کام کرتی ہے؟`,
        answer: `بصیرہ ${countryName} میں گھریلو اور کمرشل سروسز کے لیے ایک 100% زیرو کمیشن اوپن ڈائریکٹری ہے۔ ہم صارفین کو تصدیق شدہ کاریگروں سے بغیر کسی مڈل مین کے براہِ راست واٹس ایپ پر جوڑتے ہیں۔`,
      },
      {
        question: `کیا بصیرہ پر کاریگر سے رابطے کی کوئی فیس ہے؟`,
        answer: `جی نہیں، بصیرہ استعمال کرنا صارفین اور کاریگروں دونوں کے لیے بالکل مفت ہے۔ کام کی تکمیل پر تمام اجرت براہِ راست کاریگر کو ادا کی جاتی ہے۔`,
      },
      {
        question: `${countryName} میں کاریگروں کی تصدیق کیسے کی جاتی ہے؟`,
        answer: `ہمارے پاس تمام کاریگروں کے واٹس ایپ، فون نمبر، اور متعلقہ شعبے کے تجربے کی کڑی تصدیق کی جاتی ہے۔`,
      },
      {
        question: `${countryName} کے کن شہروں میں سروسز دستیاب ہیں؟`,
        answer: `بصیرہ ${countryName} کے تمام بڑے شہروں بشمول ${matrixCities.map((c) => c.name_ur || c.name_en).join('، ')} میں فعال ہے۔`,
      },
    ] : lang === 'ar' ? [
      {
        question: `كيف يعمل دليل بصيرة في ${countryName}؟`,
        answer: `بصيرة هي منصة مفتوحة بدون أي عمولة (0%) تربط العملاء في ${countryName} بأفضل الفنيين المعتمدين مباشرة عبر واتساب بدون وسطاء.`,
      },
      {
        question: `هل توجد أي رسوم حجز على منصة بصيرة؟`,
        answer: `لا، بصيرة مجانية تماماً للمستخدمين والفنيين. يتم دفع قيمة الخدمة بالكامل للفني مباشرة بعد انتهاء العمل ورضا العميل.`,
      },
      {
        question: `كيف يتم التحقق من الفنيين في ${countryName}؟`,
        answer: `يتم التحقق من بيانات الاتصال المباشرة وسجل الخبرة المهنية لكل فني قبل نشر ملفه على المنصة.`,
      },
    ] : [
      {
        question: `How does the Baseera directory work in ${countryName}?`,
        answer: `Baseera is a 100% zero-commission local service discovery directory in ${countryName}. We connect households and businesses directly with verified technicians and tradespeople over WhatsApp with zero booking fees.`,
      },
      {
        question: `Are there any platform booking fees or middleman charges?`,
        answer: `No. Baseera is completely free to use. 100% of the agreed service payment goes directly to the specialist upon satisfactory completion of the job.`,
      },
      {
        question: `How are service specialists verified in ${countryName}?`,
        answer: `Specialists undergo active phone and WhatsApp verification, trade credential assessment, and local community review checks before profile publication.`,
      },
      {
        question: `Which cities in ${countryName} are currently active on Baseera?`,
        answer: `Baseera actively lists verified specialists across major cities in ${countryName}, including ${matrixCities.map((c) => c.name_en).join(', ')}.`,
      },
    ];
  }

  const defaultCitySlug = activeCities[0]?.slug || 'karachi';
  const canonicalUrl = `${DOMAIN}/${lang}/${validCountry.code.toLowerCase()}`;

  // Structured Data: BreadcrumbList (Home -> [Country])
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: lang === 'ur' ? 'مرکزی صفحہ' : lang === 'ar' ? 'الرئيسية' : 'Home',
        item: `${DOMAIN}/${lang}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: countryName,
        item: canonicalUrl,
      },
    ],
  };

  // Structured Data: CollectionPage
  const countryCollectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Verified Local Services & Technicians in ${countryName}`,
    description: `Hire the best verified professionals in ${countryName}. Connect directly via WhatsApp with zero booking fees.`,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      name: `Active Cities in ${countryName}`,
      numberOfItems: activeCities.length,
      itemListElement: activeCities.map((c, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: `${c.name_en}, ${countryName}`,
        url: `${DOMAIN}/${lang}/${validCountry.code.toLowerCase()}/${c.slug}`,
      })),
    },
  };

  // Structured Data: FAQPage Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  const countryFacts = [
    {
      label: lang === 'ur' ? 'تصدیق کا معیار' : lang === 'ar' ? 'حالة التوثيق' : 'Verified Status',
      value: lang === 'ur' ? 'ہاں (100% تصدیق شدہ)' : lang === 'ar' ? 'نعم (موثق 100%)' : 'Yes (100% Verified)',
      highlight: true,
      badge: 'Verified',
      icon: 'verified' as const,
    },
    {
      label: lang === 'ur' ? 'پلیٹ فارم فیس' : lang === 'ar' ? 'رسوم المنصة' : 'Booking Fee',
      value: lang === 'ur' ? 'زیرو (0% کمیشن)' : lang === 'ar' ? 'صفر (بدون عمولة)' : 'Zero (0% Commission)',
      highlight: true,
      icon: 'fee' as const,
    },
    {
      label: lang === 'ur' ? 'رابطہ کا ذریعہ' : lang === 'ar' ? 'قناة التواصل' : 'Contact Channel',
      value: lang === 'ur' ? 'براہِ راست واٹس ایپ' : lang === 'ar' ? 'واتساب مباشر' : 'Direct WhatsApp',
      icon: 'contact' as const,
    },
    {
      label: lang === 'ur' ? 'فعال شہر' : lang === 'ar' ? 'المدن النشطة' : 'Active Cities',
      value: `${activeCities.length} Cities in ${countryName}`,
      icon: 'location' as const,
    },
    {
      label: lang === 'ur' ? 'دستیاب کیٹیگریز' : lang === 'ar' ? 'التخصصات المتاحة' : 'Specialties',
      value: `${activeCategories.length}+ Verified Trades`,
      icon: 'experience' as const,
    },
    {
      label: lang === 'ur' ? 'اوسط جوابی وقت' : lang === 'ar' ? 'متوسط وقت الرد' : 'Response Time',
      value: '< 15 Minutes',
      icon: 'time' as const,
    },
  ];

  return (
    <div className={`min-h-screen bg-white text-neutral-900 pb-20 ${lang === 'ur' ? 'font-urdu' : lang === 'ar' ? 'font-tajawal' : 'font-sans'}`}>
      {/* Programmatic JSON-LD Schemas: BreadcrumbList + CollectionPage + FAQPage */}
      <JsonLd data={[breadcrumbSchema, countryCollectionSchema, faqSchema]} />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href={`/${lang}`} className="hover:text-[#059669] transition-colors">
              {lang === 'ur' ? 'مرکزی صفحہ' : lang === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <span className="text-neutral-900 font-semibold">{countryName}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-white py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-4">
            <span className="text-base">{validCountry.flag}</span>
            <span>
              {lang === 'ur'
                ? `${countryName} ملک گیر تصدیق شدہ نیٹ ورک`
                : lang === 'ar'
                ? `شبكة موثقة على مستوى ${countryName}`
                : `${countryName} Verified Specialist Hub`}
            </span>
          </div>

          <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-6 pt-2' : 'leading-tight mb-4'}`}>
            {lang === 'ur'
              ? `${countryName} میں تصدیق شدہ لوکل سروسز اور کاریگر`
              : lang === 'ar'
              ? `فنيون وخدمات محلية موثقة في ${countryName}`
              : `Verified Local Services & Technicians in ${countryName}`}
          </h1>

          <p className={`text-base sm:text-lg text-gray-600 max-w-2xl mx-auto overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-8' : 'leading-relaxed mb-8'}`}>
            {lang === 'ur'
              ? `${countryName} میں بہترین تصدیق شدہ کاریگر تلاش کریں۔ الیکٹریشن، پلمبر، اے سی اور دیگر ماہرین سے بغیر کسی کمیشن کے براہِ راست واٹس ایپ پر رابطہ کریں۔`
              : lang === 'ar'
              ? `استعن بأفضل المهنيين المعتمدين في ${countryName}. من تصليح المكيفات إلى السباكين، تواصل مباشرة عبر واتساب بدون رسوم حجز على دليل بصيرة.`
              : `Find verified local home service specialists across ${countryName}. Connect directly with certified electricians, plumbers, AC technicians, and tradespeople via WhatsApp with zero commission on Baseera.`}
          </p>

          {/* GEO Quick Facts High-Density Overview */}
          <QuickFacts facts={countryFacts} lang={lang} className="mt-6 max-w-4xl mx-auto text-start" />
        </div>
      </section>

      {/* Section 2: Browse by City Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <Building2 className="w-3.5 h-3.5 text-[#059669]" />
              <span>{lang === 'ur' ? 'علاقائی مراکز' : lang === 'ar' ? 'المراكز الحضرية' : 'Urban Hubs'}</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold text-gray-900 ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
              {lang === 'ur'
                ? `${countryName} کے تمام فعال شہر`
                : lang === 'ar'
                ? `المدن النشطة في ${countryName}`
                : `Browse by City in ${countryName}`}
            </h2>
            <p className={`text-sm text-gray-500 mt-1 ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
              {lang === 'ur'
                ? 'اپنے شہر میں تصدیق شدہ ماہرین کی فہرست دیکھنے کے لیے شہر پر کلک کریں'
                : lang === 'ar'
                ? 'اختر مدينتك لعرض الفنيين المعتمدين والتواصل المباشر'
                : `Select your city to browse verified local specialists and direct contact profiles`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {activeCities.map((city) => {
            const cityNameDisplay = lang === 'ur' && city.name_ur ? city.name_ur : city.name_en;
            return (
              <Link
                key={city.slug}
                href={`/${lang}/${validCountry.code.toLowerCase()}/${city.slug}`}
                className="group p-5 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                      <MapPin className="w-4 h-4 text-[#059669]" />
                    </span>
                    <span className="text-xs font-medium text-gray-400 group-hover:text-emerald-700 flex items-center gap-1 transition-colors">
                      {lang === 'ur' ? 'شہر دیکھیں' : lang === 'ar' ? 'عرض المدينة' : 'View City'}
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </span>
                  </div>
                  <h3 className={`text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
                    {cityNameDisplay}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {city.targetAreas && city.targetAreas.length > 0
                      ? `${city.targetAreas.length}+ ${lang === 'ur' ? 'علاقے اور سیکٹرز' : lang === 'ar' ? 'مناطق وأحياء' : 'Service Areas'}`
                      : `${countryName}`}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {lang === 'ur' ? 'براہِ راست واٹس ایپ' : lang === 'ar' ? 'واتساب مباشر' : 'Direct WhatsApp'}
                  </span>
                  <span>{validCountry.code.toUpperCase()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Section 3: Curated City × Category Matrix */}
      <section className="border-t border-gray-200 bg-gray-50/60 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5 text-[#059669]" />
              <span>{lang === 'ur' ? 'مقبول ترین سروسز کا میٹرکس' : lang === 'ar' ? 'دليل الخدمات السريع' : 'High-Demand Service Matrix'}</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold text-gray-900 ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
              {lang === 'ur'
                ? `${countryName} کے بڑے شہروں میں اہم کاریگر سروسز`
                : lang === 'ar'
                ? `أشهر خدمات الصيانة في المدن الرئيسية بـ ${countryName}`
                : `Top Services in Key Cities Across ${countryName}`}
            </h2>
            <p className={`text-sm text-gray-600 mt-1 ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
              {lang === 'ur'
                ? 'اپنے شہر اور مطلوبہ شعبے کے مطابق فوری تصدیق شدہ کاریگر تلاش کریں'
                : lang === 'ar'
                ? 'روابط مباشرة لأهم الحرف والخدمات الأكثر طلباً في مدنك المحلية'
                : `Instant direct-access links to the most requested trade specialists in your locality`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matrixCities.map((city) => {
              const cityNameDisplay = lang === 'ur' && city.name_ur ? city.name_ur : city.name_en;
              return (
                <div
                  key={city.slug}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#059669]" />
                        <h3 className={`text-base font-bold text-gray-900 ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
                          {cityNameDisplay}
                        </h3>
                      </div>
                      <Link
                        href={`/${lang}/${validCountry.code.toLowerCase()}/${city.slug}`}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                      >
                        {lang === 'ur' ? 'تمام سروسز' : lang === 'ar' ? 'كل الخدمات' : 'All Trades'} →
                      </Link>
                    </div>

                    <ul className="space-y-2">
                      {matrixCategories.map((cat) => {
                        const localizedCatSlug =
                          lang === 'ur' && cat.slug_ur ? cat.slug_ur : cat.slug_en;
                        const categoryNameDisplay =
                          lang === 'ur' && cat.name_ur ? cat.name_ur : cat.name_en;
                        const linkAnchor =
                          lang === 'ur'
                            ? `${cityNameDisplay} میں ${categoryNameDisplay}`
                            : `${categoryNameDisplay} in ${cityNameDisplay}`;
                        const href = `/${lang}/${validCountry.code.toLowerCase()}/${city.slug.toLowerCase()}/${localizedCatSlug}`;

                        return (
                          <li key={cat.slug_en}>
                            <Link
                              href={href}
                              className="group/item flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm text-gray-700 hover:text-emerald-800 hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-all"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-gray-100 group-hover/item:bg-white text-gray-600 group-hover/item:text-[#059669] flex items-center justify-center shrink-0 transition-colors">
                                  <CategoryIcon slug={cat.slug_en} icon={cat.icon} className="w-3 h-3" />
                                </span>
                                <span className={`truncate font-medium ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
                                  {linkAnchor}
                                </span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover/item:text-emerald-600 shrink-0 rtl:rotate-180 transition-colors" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 text-center">
                    <Link
                      href={`/${lang}/${validCountry.code.toLowerCase()}/${city.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-emerald-700 transition-colors"
                    >
                      <span>
                        {lang === 'ur'
                          ? `${cityNameDisplay} میں تمام تصدیق شدہ ماہرین دیکھیں`
                          : lang === 'ar'
                          ? `عرض كافة الفنيين في ${cityNameDisplay}`
                          : `Browse all verified services in ${cityNameDisplay}`}
                      </span>
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 4: All Services Directory Grid */}
      <section className="border-t border-gray-200 bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryGrid
            lang={lang}
            country={validCountry.code.toLowerCase()}
            city={defaultCitySlug}
            title={
              lang === 'ur'
                ? `${countryName} میں تمام 24+ تصدیق شدہ شعبہ جات`
                : lang === 'ar'
                ? `تصفح أكثر من 24 تخصصاً معتمداً في ${countryName}`
                : `Browse All 24+ Verified Trades in ${countryName}`
            }
            subtitle={
              lang === 'ur'
                ? 'زیرو کمیشن اور براہِ راست واٹس ایپ رابطہ'
                : lang === 'ar'
                ? 'حجز مباشر عبر واتساب بدون أي عمولة'
                : 'Direct WhatsApp connection with zero platform markup'
            }
          />
        </div>
      </section>

      {/* Section 5: Country & Global FAQs with FAQPage Schema */}
      <section className="border-t border-gray-200 bg-gray-50/50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-[#059669]" />
              <span>{lang === 'ur' ? 'عام سوالات و جوابات' : lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</span>
            </div>
            <h2 className={`text-xl sm:text-3xl font-bold text-gray-900 ${lang === 'ur' ? 'font-urdu leading-[2.3]' : ''}`}>
              {lang === 'ur'
                ? `${countryName} میں بصیرہ کے بارے میں اہم سوالات`
                : lang === 'ar'
                ? `الأسئلة الشائعة حول خدمات بصيرة في ${countryName}`
                : `Frequently Asked Questions About Baseera in ${countryName}`}
            </h2>
            <p className={`text-sm text-gray-500 mt-2 ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
              {lang === 'ur'
                ? 'پلیٹ فارم کے استعمال، فیس اور کاریگروں کی تصدیق سے متعلق واضح معلومات'
                : lang === 'ar'
                ? 'كل ما تحتاج لمعرفته حول توظيف الفنيين والأسعار وبدون عمولات'
                : `Everything you need to know about direct booking, safety, and zero commissions`}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-5 sm:p-6 rounded-2xl border border-gray-200 bg-white shadow-2xs hover:border-gray-300 transition-colors"
              >
                <h3 className={`text-base sm:text-lg font-bold text-gray-900 flex items-start gap-2.5 ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
                  <span className="text-[#059669] font-black shrink-0">Q.</span>
                  <span>{faq.question}</span>
                </h3>
                <p className={`text-sm sm:text-base text-gray-600 mt-2 sm:mt-3 ps-5 sm:ps-6 leading-relaxed ${lang === 'ur' ? 'font-urdu leading-[2.4]' : ''}`}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
