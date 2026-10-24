import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  MapPin,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import {
  getCountryByCode,
  getCitiesByCountry,
  CATEGORIES,
  getCategoryName,
  getLocalizedCountryName,
  getLocalizedCityName,
  toTitleCase,
} from '@/lib/db';
import RelatedSlider from '@/components/RelatedSlider';
import CategoryGrid from '@/components/CategoryGrid';
import QuickFacts from '@/components/QuickFacts';
import JsonLd from '@/components/JsonLd';
import { getSiteUrl } from '@/lib/site-url';

interface CountryPageProps {
  params: Promise<{
    lang: string;
    country: string;
  }>;
}

const DOMAIN = getSiteUrl();

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { lang, country } = await params;
  const countryObj = getCountryByCode(country);
  const countryName = getLocalizedCountryName(countryObj, lang);

  const title =
    lang === 'ur'
      ? `${countryName} میں تصدیق شدہ کاریگر اور لوکل سروسز | بصیرہ`
      : lang === 'ar'
      ? `أفضل الخدمات والفنيين المعتمدين في ${countryName} | بصيرة`
      : `Top Local Services & Verified Technicians in ${countryName} | Baseera`;

  const description =
    lang === 'ur'
      ? `${countryName} میں بہترین تصدیق شدہ ماہرین کی خدمات حاصل کریں۔ اے سی ریپئر سے لے کر انٹیریئر ڈیزائنرز تک، زیرو بکنگ فیس کے ساتھ براہِ راست واٹس ایپ پر رابطہ کریں۔`
      : lang === 'ar'
      ? `استعن بأفضل المهنيين المعتمدين في ${countryName}. من تصليح المكيفات إلى مصممي الديكور، تواصل مباشرة عبر واتساب بدون رسوم حجز.`
      : `Hire the best verified professionals in ${countryName}. From expert AC repair to creative interior designers, connect directly via WhatsApp with zero booking fees.`;

  const canonicalUrl = `${DOMAIN}/${lang}/${country.toLowerCase()}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${DOMAIN}/en/${country.toLowerCase()}`,
        ur: `${DOMAIN}/ur/${country.toLowerCase()}`,
        ar: `${DOMAIN}/ar/${country.toLowerCase()}`,
        'x-default': `${DOMAIN}/en/${country.toLowerCase()}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
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
  const countryObj = getCountryByCode(country);
  const countryName = getLocalizedCountryName(countryObj, lang);
  const cities = getCitiesByCountry(country);
  const defaultCitySlug = countryObj.defaultCity || cities[0]?.slug || 'capital';
  const canonicalUrl = `${DOMAIN}/${lang}/${country.toLowerCase()}`;

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

  const countryCollectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Verified Local Services & Cities in ${countryName}`,
    description: `Hire the best verified professionals in ${countryName}. From expert AC repair to creative interior designers, connect directly via WhatsApp with zero booking fees.`,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      name: `Active Cities in ${countryName}`,
      numberOfItems: cities.length,
      itemListElement: cities.map((c, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: `${c.name}, ${countryName}`,
        url: `${DOMAIN}/${lang}/${country.toLowerCase()}/${c.slug}`,
      })),
    },
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
      value: `${cities.length} Cities in ${countryName}`,
      icon: 'location' as const,
    },
    {
      label: lang === 'ur' ? 'دستیاب کیٹیگریز' : lang === 'ar' ? 'التخصصات المتاحة' : 'Specialties',
      value: `${CATEGORIES.length}+ Verified Trades`,
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
      {/* Programmatic BreadcrumbList & CollectionPage JSON-LD Schema */}
      <JsonLd data={[breadcrumbSchema, countryCollectionSchema]} />

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-4">
            <span className="text-base">{countryObj.flag}</span>
            <span>
              {lang === 'ur'
                ? 'ملک گیر تصدیق شدہ نیٹ ورک'
                : lang === 'ar'
                ? 'شبكة موثقة على مستوى الدولة'
                : `${countryName} Verified Specialist Hub`}
            </span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-6 pt-2' : 'leading-tight mb-4'}`}>
            {lang === 'ur'
              ? `${countryName} میں تصدیق شدہ لوکل سروسز اور کاریگر`
              : lang === 'ar'
              ? `فنيون وخدمات محلية موثقة في ${countryName}`
              : `Verified Local Professionals in ${countryName}`}
          </h1>

          <p className={`text-base text-gray-600 max-w-2xl mx-auto overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-8' : 'leading-relaxed mb-8'}`}>
            {lang === 'ur'
              ? `${countryName} میں بہترین تصدیق شدہ ماہرین کی خدمات حاصل کریں۔ اے سی ریپئر سے لے کر انٹیریئر ڈیزائنرز تک، زیرو بکنگ فیس کے ساتھ براہِ راست واٹس ایپ پر رابطہ کریں۔`
              : lang === 'ar'
              ? `استعن بأفضل المهنيين المعتمدين في ${countryName}. من تصليح المكيفات إلى مصممي الديكور، تواصل مباشرة عبر واتساب بدون رسوم حجز.`
              : `Hire the best verified professionals in ${countryName}. From expert AC repair to creative interior designers, connect directly via WhatsApp with zero booking fees.`}
          </p>

          {/* GEO Quick Facts High-Density Overview */}
          <QuickFacts facts={countryFacts} lang={lang} className="mt-6 max-w-4xl mx-auto text-start" />
        </div>
      </section>

      {/* Section 1: Popular Cities in Country Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <RelatedSlider
          type="cities"
          title={
            lang === 'ur'
              ? `${countryName} کے مشہور شہر`
              : lang === 'ar'
              ? `أهم المدن في ${countryName}`
              : `Top Cities in ${countryName}`
          }
          subtitle={
            lang === 'ur'
              ? 'قریبی تصدیق شدہ کاریگروں سے رابطے کے لیے اپنا شہر منتخب کریں'
              : lang === 'ar'
              ? 'اختر مدينتك للتواصل مع الفنيين المعتمدين بالقرب منك'
              : `Select your city to connect with nearby verified technicians across ${countryName}`
          }
          items={cities}
          lang={lang}
          country={country}
        />
      </section>

      {/* Section 2: 24+ Verified Specialties Responsive Grid */}
      <section className="border-t border-gray-200 bg-gray-50/50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryGrid
            lang={lang}
            country={country}
            city={defaultCitySlug}
            title={
              lang === 'ur'
                ? `${countryName} میں 24+ تصدیق شدہ شعبہ جات دیکھیں`
                : lang === 'ar'
                ? `تصفح أكثر من 24 تخصصاً معتمداً في ${countryName}`
                : `Browse 24+ Verified Specialties in ${countryName}`
            }
            subtitle={
              lang === 'ur'
                ? 'زیرو کمیشن اور براہِ راست واٹس ایپ رابطہ'
                : lang === 'ar'
                ? 'حجز مباشر عبر واتساب بدون أي عمولة'
                : 'Direct WhatsApp booking with zero platform commission'
            }
          />
        </div>
      </section>
    </div>
  );
}
