import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLocale } from '@/lib/routing/validate-route';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Globe,
  ArrowRight,
} from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import HomepageCategoryGrid from '@/components/HomepageCategoryGrid';
import HomepageCityCategoryMatrix from '@/components/HomepageCityCategoryMatrix';
import HomepageSearchBar from '@/components/HomepageSearchBar';
import FeaturedProvidersSlider from '@/components/FeaturedProvidersSlider';
import { getAllProviders, CATEGORIES, getCategoryName } from '@/lib/db';
import { getCategories, getCities } from '@/lib/taxonomy-db';
import { getDictionary } from '@/lib/get-dictionary';
import JsonLd from '@/components/JsonLd';
import { getSiteUrl } from '@/lib/site-url';
import { buildLanguageAlternates } from '@/lib/seo/alternates';

export const revalidate = 3600; // 1 hour ISR CDN caching

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

const DOMAIN = getSiteUrl();

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const title =
    lang === 'ur'
      ? 'اپنے قریب قابل اعتماد کاریگر اور سروسز تلاش کریں | بصیرہ'
      : lang === 'ar'
      ? 'اعثر على خدمات وفنيين موثوقين حول العالم | بصيرة'
      : 'Find Trusted Local Services & Technicians Worldwide | Baseera';

  const description =
    lang === 'ur'
      ? 'اپنے شہر میں تصدیق شدہ الیکٹریشن، پلمبر، انٹیریئر ڈیزائنر اور 20+ دیگر ماہرین سے براہِ راست رابطہ کریں۔ زیرو کمیشن، فوری واٹس ایپ چیٹ۔'
      : lang === 'ar'
      ? 'تواصل مباشرة مع فنيي الكهرباء، السباكة، مصممي الديكور، وأكثر من 20 تخصصاً معتمداً في مدينتك. بدون عمولة، محادثة واتساب مباشرة.'
      : 'Connect directly with verified electricians, plumbers, interior designers, and 20+ other specialists in your city. Zero commission, direct WhatsApp chat.';

  return {
    title,
    description,
    alternates: buildLanguageAlternates('', lang),
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/${lang}`,
      siteName: 'Baseera Local Services Directory',
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'website',
    },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const providers = await getAllProviders();
  const [categories, cities] = await Promise.all([
    getCategories({ activeOnly: true }),
    getCities({ activeOnly: true }),
  ]);

  const defaultCity = {
    slug: 'karachi',
    name: 'Karachi',
    countryCode: 'pk',
    name_ur: 'کراچی',
    name_ar: 'كراتشي',
  };

  const defaultLocation = lang === 'ur' ? 'عالمی مرکز' : lang === 'ar' ? 'الدليل العام' : 'Global Hub';

  const h1Text =
    lang === 'ur'
      ? 'اپنے قریب قابل اعتماد لوکل سروسز تلاش کریں'
      : lang === 'ar'
      ? 'اعثر على خدمات وفنيين محليين موثوقين بالقرب منك'
      : 'Find Trusted Local Services Near You';

  const h2Text =
    lang === 'ur'
      ? '24+ تصدیق شدہ کیٹیگریز دیکھیں'
      : lang === 'ar'
      ? 'تصفح أكثر من 24 تخصصاً موثقاً'
      : 'Browse 24+ Verified Specialties';

  // Dynamic JSON-LD WebSite & ItemList Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Baseera',
    url: `${DOMAIN}/${lang}`,
    description:
      'Connect directly with verified electricians, plumbers, interior designers, and 20+ other specialists in your city. Zero commission, direct WhatsApp chat.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${DOMAIN}/${lang}/pk/karachi/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const categoriesItemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: h2Text,
    url: `${DOMAIN}/${lang}`,
    numberOfItems: categories.length,
    itemListElement: categories.map((cat, idx) => {
      const catSlug = lang === 'ur' ? cat.slug_ur || cat.slug_en : cat.slug_en;
      const catName = lang === 'ur' ? cat.name_ur : lang === 'ar' ? cat.name_ar || cat.name_en : cat.name_en;
      return {
        '@type': 'ListItem',
        position: idx + 1,
        name: catName,
        url: `${DOMAIN}/${lang}/pk/karachi/${catSlug}`,
      };
    }),
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20 md:pb-12">
      {/* Programmatic JSON-LD Schema */}
      <JsonLd data={[websiteSchema, categoriesItemListSchema]} />

      {/* 1. HERO SECTION */}
      <section className="border-b border-gray-200 bg-white pt-10 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <span>{dict.home?.badge || 'Direct Karigar & Specialist Directory'}</span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-6 sm:mb-8 pt-2' : 'leading-tight mb-4'}`}>
            {h1Text}
          </h1>

          <p className={`text-base text-gray-600 max-w-2xl mx-auto overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-10' : 'leading-relaxed mb-8'}`}>
            {dict.home?.heroSubtitle || 'Connect directly with verified specialists in your area. Zero booking fees, direct WhatsApp communication, and verified ratings.'}
          </p>

          {/* Large Search Bar with Fuzzy Concept & Location Chip */}
          <HomepageSearchBar lang={lang} defaultLocation={defaultLocation} />
        </div>
      </section>

      {/* 2. BROWSE BY SPECIALTY (DYNAMIC BY SELECTED CITY) */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 overflow-hidden scroll-mt-20">
        <HomepageCategoryGrid
          lang={lang}
          categories={categories}
          cities={cities}
          defaultCity={defaultCity}
          title={h2Text}
          subtitle={dict.home?.specialtySubtitle || 'Verified community technicians & specialists worldwide'}
          activeCountText={dict.home?.activeCount}
          categoriesCountText={dict.home?.categoriesCount}
        />
      </section>

      {/* 2b. SERVER-RENDERED REGIONAL CITY × CATEGORY MATRIX */}
      <HomepageCityCategoryMatrix lang={lang} />

      {/* 2b. EXPLORE COUNTRY HUBS */}
      <section className="border-t border-gray-200 bg-gray-50/50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                <Globe className="w-3.5 h-3.5 text-[#059669]" />
                <span>{lang === 'ur' ? 'ملک گیر حبس' : lang === 'ar' ? 'المراكز الإقليمية' : 'Country Hubs'}</span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold text-gray-900 ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
                {lang === 'ur'
                  ? 'ملک کے لحاظ سے تصدیق شدہ سروسز دیکھیں'
                  : lang === 'ar'
                  ? 'استكشف الخدمات حسب الدولة'
                  : 'Explore Verified Services by Country'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                code: 'pk',
                flag: '🇵🇰',
                name_en: 'Pakistan',
                name_ur: 'پاکستان',
                name_ar: 'باكستان',
                cities_en: 'Karachi, Lahore, Islamabad, Rawalpindi...',
                cities_ur: 'کراچی، لاہور، اسلام آباد، راولپنڈی...',
                cities_ar: 'كراتشي، لاهور، إسلام آباد...',
              },
              {
                code: 'ae',
                flag: '🇦🇪',
                name_en: 'United Arab Emirates',
                name_ur: 'متحدہ عرب امارات',
                name_ar: 'الإمارات العربية المتحدة',
                cities_en: 'Dubai, Abu Dhabi, Sharjah...',
                cities_ur: 'دبئی، ابوظہبی، شارجہ...',
                cities_ar: 'دبي، أبوظبي، الشارقة...',
              },
              {
                code: 'sa',
                flag: '🇸🇦',
                name_en: 'Saudi Arabia',
                name_ur: 'سعودی عرب',
                name_ar: 'المملكة العربية السعودية',
                cities_en: 'Riyadh, Jeddah, Dammam...',
                cities_ur: 'ریاض، جدہ، دمام...',
                cities_ar: 'الرياض، جدة، الدمام...',
              },
            ].map((hub) => {
              const countryName = lang === 'ur' ? hub.name_ur : lang === 'ar' ? hub.name_ar : hub.name_en;
              const citiesSummary = lang === 'ur' ? hub.cities_ur : lang === 'ar' ? hub.cities_ar : hub.cities_en;
              return (
                <Link
                  key={hub.code}
                  href={`/${lang}/${hub.code}`}
                  className="group p-5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{hub.flag}</span>
                      <span className="text-xs font-semibold text-emerald-700 group-hover:underline flex items-center gap-1">
                        {lang === 'ur' ? 'پورٹل دیکھیں' : lang === 'ar' ? 'دخول الدليل' : 'View Hub'}
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </span>
                    </div>
                    <h3 className={`text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
                      {countryName}
                    </h3>
                    <p className={`text-xs text-gray-500 mt-1 line-clamp-1 ${lang === 'ur' ? 'font-urdu leading-[1.8]' : ''}`}>
                      {citiesSummary}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span className="font-semibold text-emerald-700">100% Direct WhatsApp</span>
                    <span className="uppercase">{hub.code}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CONTINUOUS SLIDING 20 FEATURED PROVIDERS */}
      <section className="border-t border-gray-200 bg-white py-10 sm:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Smooth Auto-Sliding Infinite Carousel with Unified Header & Navigation */}
          <FeaturedProvidersSlider
            providers={providers}
            lang={lang}
            title={dict.home?.featuredProviders || 'Featured Providers'}
            badge={dict.home?.verified || 'Verified (20 Specialists)'}
            subtitle={dict.home?.featuredSubtitle || 'Top-rated specialists ready for immediate direct booking'}
          />
        </div>
      </section>

      {/* 4. FLAT VALUE PROPOSITION */}
      <section className="border-t border-gray-200 bg-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 border border-gray-200 rounded-xl bg-white overflow-visible">
              <ShieldCheck className="w-6 h-6 text-[#059669] mb-3" />
              <h3 className={`text-lg font-semibold text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.2] mb-3 pt-1' : 'leading-snug mb-1.5'}`}>{dict.home?.valProp1Title || 'Direct Verified Karigars'}</h3>
              <p className={`text-base text-gray-600 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5]' : 'leading-relaxed'}`}>
                {dict.home?.valProp1Desc || 'Verified via active WhatsApp connectivity and genuine community feedback.'}
              </p>
            </div>

            <div className="p-4 sm:p-5 border border-gray-200 rounded-xl bg-white overflow-visible">
              <CheckCircle2 className="w-6 h-6 text-[#059669] mb-3" />
              <h3 className={`text-lg font-semibold text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.2] mb-3 pt-1' : 'leading-snug mb-1.5'}`}>{dict.home?.valProp2Title || 'Zero Platform Commission'}</h3>
              <p className={`text-base text-gray-600 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5]' : 'leading-relaxed'}`}>
                {dict.home?.valProp2Desc || 'No middleman fee or surcharge. 100% of your payment goes directly to the service specialist upon completion.'}
              </p>
            </div>

            <div className="p-4 sm:p-5 border border-gray-200 rounded-xl bg-white overflow-visible">
              <Clock className="w-6 h-6 text-[#059669] mb-3" />
              <h3 className={`text-lg font-semibold text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.2] mb-3 pt-1' : 'leading-snug mb-1.5'}`}>{dict.home?.valProp3Title || 'Instant WhatsApp Connection'}</h3>
              <p className={`text-base text-gray-600 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5]' : 'leading-relaxed'}`}>
                {dict.home?.valProp3Desc || 'Chat or call specialists directly to discuss fault descriptions, share photos, and agree on timing.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
