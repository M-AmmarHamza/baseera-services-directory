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
  getLocalizedCountryName,
  getLocalizedCityName,
  toTitleCase,
} from '@/lib/db';
import RelatedSlider from '@/components/RelatedSlider';

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
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: lang === 'ur' ? 'بصیرہ ڈائریکٹری' : lang === 'ar' ? 'دليل بصيرة' : 'Baseera Local Services Directory',
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'website',
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
    <div className={`min-h-screen bg-white text-neutral-900 pb-20 ${lang === 'ur' ? 'font-urdu' : lang === 'ar' ? 'font-tajawal' : 'font-sans'}`}>
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

      {/* Section 2: 24+ Verified Specialties */}
      <section className="border-t border-gray-200 bg-gray-50/50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className={`text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.3] mb-2 pt-1' : 'leading-snug'}`}>
              {lang === 'ur'
                ? `${countryName} میں 24+ تصدیق شدہ شعبہ جات دیکھیں`
                : lang === 'ar'
                ? `تصفح أكثر من 24 تخصصاً معتمداً في ${countryName}`
                : `Browse 24+ Verified Specialties in ${countryName}`}
            </h2>
            <p className={`text-sm text-gray-500 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
              {lang === 'ur'
                ? 'زیرو کمیشن اور براہِ راست واٹس ایپ رابطہ'
                : lang === 'ar'
                ? 'حجز مباشر عبر واتساب بدون أي عمولة'
                : 'Direct WhatsApp booking with zero platform commission'}
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
                  <span className={`text-xs font-bold text-gray-900 group-hover:text-[#006948] line-clamp-2 leading-tight ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
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
