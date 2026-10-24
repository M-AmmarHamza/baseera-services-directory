import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import HomepageSearchBar from '@/components/HomepageSearchBar';
import FeaturedProvidersSlider from '@/components/FeaturedProvidersSlider';
import { getAllProviders, CATEGORIES, getCategoryName } from '@/lib/db';
import { getDictionary } from '@/lib/get-dictionary';
import JsonLd from '@/components/JsonLd';
import { getSiteUrl } from '@/lib/site-url';

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

const DOMAIN = getSiteUrl();

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
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
    alternates: {
      canonical: `${DOMAIN}/${lang}`,
      languages: {
        en: `${DOMAIN}/en`,
        ur: `${DOMAIN}/ur`,
        ar: `${DOMAIN}/ar`,
        'x-default': `${DOMAIN}/en`,
      },
    },
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
  const dict = await getDictionary(lang);
  const providers = await getAllProviders();
  const defaultLocation = lang === 'ur' ? 'عالمی مرکز' : lang === 'ar' ? 'الدليل العام' : 'Global Hub';

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
    name: 'Browse 24+ Verified Specialties',
    url: `${DOMAIN}/${lang}`,
    numberOfItems: CATEGORIES.length,
    itemListElement: CATEGORIES.map((cat, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: cat.name,
      url: `${DOMAIN}/${lang}/pk/karachi/${cat.slug}`,
    })),
  };

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

      {/* 2. BROWSE BY SPECIALTY (RESPONSIVE NON-OVERFLOWING GRID) */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 overflow-hidden scroll-mt-20">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-5 sm:mb-6">
          <div>
            <h2 className={`text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-2 pt-2' : 'leading-snug'}`}>
              {h2Text}
            </h2>
            <p className={`text-sm text-gray-500 mt-1 ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
              {dict.home?.specialtySubtitle || 'Verified community technicians & specialists worldwide'}
            </p>
          </div>
          <div className={`text-sm font-semibold text-emerald-700 whitespace-nowrap shrink-0 ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
            {CATEGORIES.length} {dict.home?.categoriesCount || 'Categories'}
          </div>
        </div>

        {/* Responsive Categories Grid (2 cols on iPhone SE/mobile, 3 on sm, 4 on md, 6 on lg) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full max-w-full overflow-hidden">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/${lang}/pk/karachi/${cat.slug}`}
              className={`w-full min-w-0 max-w-full flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl bg-white hover:border-[#006948] border border-gray-200/80 shadow-2xs hover:shadow-sm transition-all text-center group cursor-pointer overflow-hidden box-border ${
                lang === 'ur' ? 'min-h-[160px] sm:min-h-[170px]' : 'min-h-[130px] sm:min-h-[140px]'
              }`}
            >
              {/* Soft circular background behind icon */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center mb-1.5 shrink-0 group-hover:scale-105 group-hover:bg-[#006948] group-hover:text-white transition-all">
                <CategoryIcon slug={cat.slug} id={cat.id} name={cat.name} icon={cat.icon} className="w-5 h-5" />
              </div>

              {/* Title Container - Zero clipping, natural line height, break-words for narrow screens */}
              <div className="flex-1 flex items-center justify-center w-full min-w-0 my-auto py-1 px-0.5 overflow-hidden">
                <span
                  className={`font-bold text-gray-900 group-hover:text-[#006948] transition-colors text-center break-words ${
                    lang === 'ur'
                      ? 'font-urdu text-xs sm:text-sm leading-[2.3] py-0.5 tracking-normal'
                      : 'text-xs line-clamp-2 leading-tight flex items-center justify-center'
                  }`}
                >
                  {getCategoryName(cat, lang)}
                </span>
              </div>

              {/* Active provider count Subtext */}
              <span
                dir="auto"
                className={`text-[10px] sm:text-xs text-gray-500 font-medium shrink-0 mt-1 truncate ${
                  lang === 'ur' ? 'font-urdu leading-[1.8] pt-0.5' : ''
                }`}
              >
                {cat.count}+ {dict.home?.activeCount || 'Active'}
              </span>
            </Link>
          ))}
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
