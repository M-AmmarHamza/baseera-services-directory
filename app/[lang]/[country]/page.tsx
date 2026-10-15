import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  MapPin,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Wrench,
  Zap,
  BatteryCharging,
  Sun,
  Power,
  Gauge,
  Layers,
  Waves,
  Wind,
  Snowflake,
  RotateCw,
  Flame,
  Hammer,
  Paintbrush,
  Frame,
  Boxes,
  Bug,
  Armchair,
  Camera,
  Key,
  Utensils,
  PaintRoller,
  Sofa,
  Truck,
} from 'lucide-react';
import {
  getCountryByCode,
  getCitiesByCountry,
  CATEGORIES,
  getCategoryName,
  toTitleCase,
} from '@/lib/db';

interface CountryPageProps {
  params: Promise<{
    lang: string;
    country: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  BatteryCharging,
  Sun,
  Power,
  Wrench,
  Gauge,
  Layers,
  Waves,
  Wind,
  Snowflake,
  RotateCw,
  Flame,
  Hammer,
  Paintbrush,
  Frame,
  Boxes,
  Bug,
  Armchair,
  Camera,
  Key,
  Utensils,
  PaintRoller,
  Sofa,
  Truck,
};

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { lang, country } = await params;
  const countryObj = getCountryByCode(country);
  const countryName = countryObj.name;

  const title = `Top Local Services & Verified Technicians in ${countryName} | Baseera`;
  const description = `Hire the best verified professionals in ${countryName}. From expert AC repair to creative interior designers, connect directly via WhatsApp with zero booking fees.`;
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
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Baseera Local Services Directory',
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'website',
    },
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { lang, country } = await params;
  const countryObj = getCountryByCode(country);
  const countryName = countryObj.name;
  const cities = getCitiesByCountry(country);
  const defaultCitySlug = countryObj.defaultCity || cities[0]?.slug || 'capital';
  const canonicalUrl = `${DOMAIN}/${lang}/${country.toLowerCase()}`;

  const jsonLdItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Verified Local Professionals & Cities in ${countryName}`,
    description: `Hire the best verified professionals in ${countryName}. From expert AC repair to creative interior designers, connect directly via WhatsApp with zero booking fees.`,
    url: canonicalUrl,
    numberOfItems: cities.length,
    itemListElement: cities.map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `${c.name}, ${countryName}`,
      url: `${DOMAIN}/${lang}/${country.toLowerCase()}/${c.slug}`,
    })),
  };

  return (
    <div className={`min-h-screen bg-white text-neutral-900 pb-20 ${lang === 'ur' ? 'font-urdu' : 'font-sans'}`}>
      {/* Programmatic JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
      />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href={`/${lang}`} className="hover:text-[#059669] transition-colors">
              {lang === 'ur' ? 'مرکزی صفحہ' : lang === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-neutral-900 font-semibold">{countryName}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-white py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-4">
            <span className="text-base">{countryObj.flag}</span>
            <span>{lang === 'ur' ? 'ملک گیر تصدیق شدہ نیٹ ورک' : `${countryName} Verified Specialist Hub`}</span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-6 pt-2' : 'leading-tight mb-4'}`}>
            Verified Local Professionals in {countryName}
          </h1>

          <p className={`text-base text-gray-600 max-w-2xl mx-auto overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-8' : 'leading-relaxed mb-8'}`}>
            Hire the best verified professionals in {countryName}. From expert AC repair to creative interior designers, connect directly via WhatsApp with zero booking fees.
          </p>
        </div>
      </section>

      {/* Section 1: Popular Cities in Country */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="overflow-visible">
            <h2 className={`text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.3] mb-2 pt-1' : 'leading-snug'}`}>
              Popular Cities in {countryName}
            </h2>
            <p className={`text-sm text-gray-500 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
              Select your city to connect with nearby verified technicians
            </p>
          </div>
          <span className="text-xs font-semibold text-[#006948] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {cities.length} {cities.length === 1 ? 'City' : 'Cities'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/${lang}/${country.toLowerCase()}/${city.slug}`}
              className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#006948] hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0 group-hover:bg-[#006948] group-hover:text-white transition-all">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#006948] transition-colors">
                    {city.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    Explore Specialists →
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#006948] group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* Section 2: 24+ Verified Specialties */}
      <section className="border-t border-gray-200 bg-gray-50/50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className={`text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.3] mb-2 pt-1' : 'leading-snug'}`}>
              Browse 24+ Verified Specialties in {countryName}
            </h2>
            <p className={`text-sm text-gray-500 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
              Direct WhatsApp booking with zero platform commission
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => {
              const IconComp = CATEGORY_ICON_MAP[cat.icon] || Wrench;
              return (
                <Link
                  key={cat.id}
                  href={`/${lang}/${country.toLowerCase()}/${defaultCitySlug}/${cat.slug}`}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-200 hover:border-[#006948] hover:shadow-xs transition-all text-center group"
                >
                  <div className="w-11 h-11 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-[#006948] group-hover:text-white transition-all">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-900 group-hover:text-[#006948] line-clamp-2 leading-tight">
                    {getCategoryName(cat, lang)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
