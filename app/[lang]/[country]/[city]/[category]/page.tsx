import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Star,
  BadgeCheck,
  MapPin,
  MessageCircle,
  ChevronRight,
  ArrowRight,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import {
  getProviders,
  getCategoryBySlug,
  getCategoryName,
  getCountryByCode,
  getLocalizedCountryName,
  getLocalizedCityName,
  toTitleCase,
} from '@/lib/db';
import { formatVisitingPrice } from '@/lib/currencies';
import RelatedSlider from '@/components/RelatedSlider';
import QuickFacts from '@/components/QuickFacts';
import CategoryFaqSection from '@/components/CategoryFaqSection';

interface CategoryPageProps {
  params: Promise<{
    lang: string;
    country: string;
    city: string;
    category: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

// 1. PROGRAMMATIC SEO META TAGS
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { lang, country, city, category } = await params;
  const catObj = getCategoryBySlug(category);
  const categoryName = getCategoryName(catObj, lang);
  const cityName = getLocalizedCityName(city, lang);
  const countryObj = getCountryByCode(country);
  const countryName = getLocalizedCountryName(countryObj, lang);

  const title =
    lang === 'ur'
      ? `${cityName} میں بہترین تصدیق شدہ ${categoryName} | بصیرہ`
      : lang === 'ar'
      ? `أفضل ${categoryName} في ${cityName}، ${countryName} | ملفات معتمدة`
      : `Best ${categoryName} in ${cityName}, ${countryName} | Top Rated Profiles`;

  const description =
    lang === 'ur'
      ? `کیا آپ ${cityName} میں قابل اعتماد ${categoryName} تلاش کر رہے ہیں؟ تصدیق شدہ پروفائلز دیکھیں، ریٹنگز جانچیں اور بغیر کسی کمیشن کے براہِ راست واٹس ایپ پر رابطہ کریں۔`
      : lang === 'ar'
      ? `هل تبحث عن ${categoryName} موثوق في ${cityName}؟ تصفح الملفات المعتمدة، واطلع على التقييمات، وتواصل مباشرة عبر واتساب بدون وسيط!`
      : `Looking for a reliable ${categoryName} in ${cityName}? Browse verified profiles, check ratings, view portfolios, and chat directly on WhatsApp. No middlemen!`;

  const canonicalUrl = `${DOMAIN}/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${DOMAIN}/en/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}`,
        ur: `${DOMAIN}/ur/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}`,
        ar: `${DOMAIN}/ar/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}`,
        'x-default': `${DOMAIN}/en/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}`,
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

export default async function CategoryListingPage({ params }: CategoryPageProps) {
  const { lang, country, city, category } = await params;
  const providers = await getProviders(city, category);
  const catObj = getCategoryBySlug(category);
  const categoryName = getCategoryName(catObj, lang);
  const cityName = getLocalizedCityName(city, lang);
  const countryObj = getCountryByCode(country);
  const countryName = getLocalizedCountryName(countryObj, lang);
  const commaSeparator = lang === 'ur' || lang === 'ar' ? '، ' : ', ';
  const canonicalUrl = `${DOMAIN}/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}`;

  // Programmatic BreadcrumbList Schema
  const breadcrumbJsonLd = {
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
        item: `${DOMAIN}/${lang}/${country.toLowerCase()}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: cityName,
        item: `${DOMAIN}/${lang}/${country.toLowerCase()}/${city.toLowerCase()}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: categoryName,
        item: canonicalUrl,
      },
    ],
  };

  // Programmatic JSON-LD Schema (ItemList for Category Pages)
  const jsonLdItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${categoryName} in ${cityName}, ${countryName}`,
    description: `Looking for a reliable ${categoryName} in ${cityName}? Browse verified profiles, check ratings, view portfolios, and chat directly on WhatsApp. No middlemen!`,
    url: canonicalUrl,
    numberOfItems: providers.length,
    itemListElement: providers.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'LocalBusiness',
        name: p.name,
        url: `${DOMAIN}/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}/${p.slug}`,
        image: p.avatar_url,
        telephone: p.whatsapp_number,
        priceRange: formatVisitingPrice(p.starting_price, p.country_code || country),
        address: {
          '@type': 'PostalAddress',
          addressLocality: cityName,
          addressCountry: countryObj.code.toUpperCase(),
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: p.rating.toFixed(1),
          reviewCount: p.review_count.toString(),
        },
      },
    })),
  };

  const categoryFacts = [
    {
      label: lang === 'ur' ? 'دستیاب ماہرین' : lang === 'ar' ? 'الفنيون المتاحون' : 'Verified Specialists',
      value: `${providers.length} ${lang === 'ur' ? 'کاریگر دستیاب' : lang === 'ar' ? 'فني معتمد' : 'Verified in ' + cityName}`,
      highlight: true,
      icon: 'verified' as const,
    },
    {
      label: lang === 'ur' ? 'پلیٹ فارم فیس' : lang === 'ar' ? 'رسوم المنصة' : 'Platform Fee',
      value: lang === 'ur' ? '0% بغیر کسی کمیشن کے' : lang === 'ar' ? '0% بدون أي عمولة' : '0% Zero Commission',
      highlight: true,
      icon: 'fee' as const,
    },
    {
      label: lang === 'ur' ? 'رابطہ کا ذریعہ' : lang === 'ar' ? 'طريقة الحجز' : 'Booking Mode',
      value: lang === 'ur' ? 'براہِ راست واٹس ایپ' : lang === 'ar' ? 'واتساب مباشر فوري' : 'Direct WhatsApp Chat',
      icon: 'contact' as const,
    },
    {
      label: lang === 'ur' ? 'ابتدائی وزٹ فیس' : lang === 'ar' ? 'رسوم الزيارة' : 'Visiting Charges',
      value: providers[0]?.starting_price
        ? `From ${formatVisitingPrice(providers[0].starting_price, providers[0].country_code || country)}`
        : 'Transparent Quotes',
      icon: 'price' as const,
    },
    {
      label: lang === 'ur' ? 'شہری کوریج' : lang === 'ar' ? 'نطاق التغطية' : 'Coverage',
      value: `${cityName}, ${countryName}`,
      icon: 'location' as const,
    },
    {
      label: lang === 'ur' ? 'اوسط جوابی وقت' : lang === 'ar' ? 'متوسط وقت الرد' : 'Avg Response Time',
      value: '< 15 Minutes',
      icon: 'time' as const,
    },
  ];

  return (
    <div className={`min-h-screen bg-white text-neutral-900 pb-24 md:pb-16 ${lang === 'ur' ? 'font-urdu' : lang === 'ar' ? 'font-tajawal' : 'font-sans'}`}>
      {/* Programmatic BreadcrumbList & ItemList JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
      />

      {/* Breadcrumbs Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href={`/${lang}`} className="hover:text-[#059669] transition-colors">
              {lang === 'ur' ? 'مرکزی صفحہ' : lang === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <Link href={`/${lang}/${country.toLowerCase()}`} className="hover:text-[#059669] transition-colors">
              {countryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <Link href={`/${lang}/${country.toLowerCase()}/${city.toLowerCase()}`} className="hover:text-[#059669] transition-colors">
              {cityName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <span className="text-neutral-900 font-semibold">{categoryName}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <section className="border-b border-gray-200 bg-white py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="overflow-visible">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <span>
                  {lang === 'ur'
                    ? `${providers.length} تصدیق شدہ کاریگر دستیاب`
                    : lang === 'ar'
                    ? `${providers.length} فني معتمد متاح`
                    : `${providers.length} Verified Specialists Available`}
                </span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-6 pt-2' : 'leading-tight'}`}>
                {lang === 'ur'
                  ? `${cityName} میں بہترین تصدیق شدہ ${categoryName}`
                  : lang === 'ar'
                  ? `أفضل ${categoryName} معتمدين في ${cityName}`
                  : `Top-Rated ${categoryName} in ${cityName}`}
              </h1>
              <p className={`text-base text-gray-600 max-w-2xl overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5]' : 'mt-1 leading-relaxed'}`}>
                {lang === 'ur'
                  ? 'تصدیق شدہ کاریگروں کے پروفائلز، ریٹنگز، سروس کے علاقے دیکھیں اور بغیر کسی مڈل مین کمیشن کے براہِ راست واٹس ایپ پر رابطہ کریں۔'
                  : lang === 'ar'
                  ? 'قارن بين ملفات الفنيين المعتمدين، والتقييمات، ومناطق الخدمة، وتواصل مباشرة عبر واتساب بدون أي عمولة وسيط.'
                  : 'Compare verified specialist profiles, ratings, service areas, and connect directly on WhatsApp with zero middlemen commission.'}
              </p>
            </div>

            {/* List Your Business Button */}
            <Link
              href={`/${lang}/list-service?country=${country}&city=${city}&category=${category}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-[#059669] hover:text-[#059669] text-sm font-semibold text-neutral-900 transition-colors shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-[#059669]" />
              <span>
                {lang === 'ur'
                  ? `${cityName} میں اپنی سروس درج کریں`
                  : lang === 'ar'
                  ? `أضف خدمتك في ${cityName}`
                  : `List Your Service in ${cityName}`}
              </span>
            </Link>
          </div>

          {/* GEO Quick Facts */}
          <QuickFacts
            facts={categoryFacts}
            lang={lang}
            className="mt-6 w-full text-start"
          />
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {providers.length === 0 ? (
          /* 3. EMPTY STATE COMPONENT (FOR LEAD CAPTURING) */
          <div className="max-w-xl mx-auto text-center py-12 px-6 bg-white border border-gray-200 rounded-2xl my-8 overflow-visible">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] mx-auto mb-4">
              <Sparkles className="w-7 h-7" />
            </div>

            <h2 className={`text-xl sm:text-2xl font-semibold text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.3] mb-4 pt-1.5' : 'leading-snug mb-2'}`}>
              {lang === 'ur'
                ? `ہم بہت جلد ${cityName} میں ${categoryName} کی سروسز شروع کر رہے ہیں!`
                : lang === 'ar'
                ? `سنقوم بإطلاق خدمات ${categoryName} في ${cityName} قريباً!`
                : `We are launching ${categoryName} services in ${cityName} soon!`}
            </h2>

            <p className={`text-base text-gray-600 max-w-md mx-auto overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-8' : 'leading-relaxed mb-6'}`}>
              {lang === 'ur'
                ? `${cityName} میں سب سے پہلے تصدیق شدہ ${categoryName} بنیں۔ بغیر کسی فیس یا کمیشن کے براہِ راست اپنے واٹس ایپ پر کسٹمرز حاصل کریں۔`
                : lang === 'ar'
                ? `كن من أوائل فنيي ${categoryName} المعتمدين في ${cityName}. احصل على طلبات العملاء مباشرة على واتساب بدون عمولة.`
                : `Be among the first verified ${categoryName.toLowerCase()} in ${cityName}. Gain direct client inquiries straight to your WhatsApp with zero platform commission.`}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/${lang}/list-service?country=${country}&city=${city}&category=${category}`}
                className="w-full sm:w-auto bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>
                  {lang === 'ur' ? 'بطور کاریگر رجسٹر ہوں' : lang === 'ar' ? 'سجل كمهني' : 'Register Your Business'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
              <Link
                href={`/${lang}`}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-200 text-neutral-900 text-sm font-semibold px-5 py-3 rounded-xl transition-colors inline-flex items-center justify-center"
              >
                {lang === 'ur' ? 'تمام سروسز دیکھیں' : lang === 'ar' ? 'تصفح جميع الخدمات' : 'Browse All Services'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 1. TOP-RATED SPECIALISTS HORIZONTAL SLIDER */}
            <RelatedSlider
              type="providers"
              title={
                lang === 'ur'
                  ? `${cityName} میں ٹاپ ریٹڈ ${categoryName}`
                  : lang === 'ar'
                  ? `أفضل ${categoryName} في ${cityName}`
                  : `Top-Rated ${categoryName} in ${cityName}`
              }
              subtitle={
                lang === 'ur'
                  ? 'اعلیٰ ترین ریٹنگز اور تصدیق شدہ تجربے کے حامل لوکل ماہرین'
                  : lang === 'ar'
                  ? 'فنيون معتمدون حاصلون على أعلى تقييمات العملاء'
                  : `Swipe to view top verified ${categoryName.toLowerCase()} profiles in ${cityName}`
              }
              items={providers}
              lang={lang}
              country={country}
              city={city}
              category={category}
            />

            {/* 2. ALL PROVIDERS LIST */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg sm:text-xl font-bold text-neutral-900 ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
                  {lang === 'ur' ? 'تمام دستیاب کاریگر' : lang === 'ar' ? 'جميع الفنيين المتاحين' : 'All Available Profiles'}
                </h3>
                <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2.5 py-1 rounded-full">
                  {providers.length} {lang === 'ur' ? 'پروفائلز' : lang === 'ar' ? 'ملف' : 'Profiles'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((provider) => {
              const cleanPhone = provider.whatsapp_number.replace(/[^0-9]/g, '');
              const whatsappMessage = encodeURIComponent(
                lang === 'ur'
                  ? `السلام علیکم ${provider.name}، میں نے بصیرہ پر آپ کا تصدیق شدہ پروفائل دیکھا ہے۔ مجھے ${cityName} میں آپ کی ${categoryName} سروسز کے لیے معلومات درکار ہیں۔`
                  : lang === 'ar'
                  ? `مرحباً ${provider.name}، لقد شاهدت ملفك الموثق على منصة بصيرة في ${cityName}. أود الاستفسار عن خدمات ${categoryName}.`
                  : `Hello ${provider.name}, I saw your verified profile on Baseera in ${cityName}. I would like to inquire about your ${categoryName} services.`
              );
              const directWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;
              const profileHref = `/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}/${provider.slug}`;

              return (
                <div
                  key={provider.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-gray-300 transition-colors flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    {/* Top Row: Avatar, Name, Verified Badge, Rating */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <Link href={profileHref} className="shrink-0">
                        <img
                          src={provider.avatar_url}
                          alt={provider.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-gray-200"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-lg text-neutral-900 hover:text-[#059669] transition-colors truncate leading-snug">
                            <Link href={profileHref}>
                              {provider.name}
                            </Link>
                          </h3>
                          {/* Green "Verified" Badge */}
                          {provider.is_verified && (
                            <span
                              title={lang === 'ur' ? 'تصدیق شدہ کاریگر' : lang === 'ar' ? 'فني معتمد' : 'Verified Specialist'}
                              className="inline-flex items-center text-[#059669] shrink-0"
                            >
                              <BadgeCheck className="w-4 h-4 fill-emerald-50 text-[#059669]" />
                            </span>
                          )}
                        </div>

                        {/* Primary Category */}
                        <p className={`text-xs sm:text-sm font-bold text-[#059669] truncate mt-0.5 ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
                          {categoryName}
                        </p>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 text-sm">
                          <div className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{provider.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-400 font-normal">
                            ({provider.review_count} {lang === 'ur' ? 'تبصرے' : lang === 'ar' ? 'تقييم' : 'reviews'})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location & Coverage */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">
                        {provider.district ? `${provider.district}${commaSeparator}${cityName}` : cityName}
                      </span>
                    </div>

                    {/* Short Description */}
                    <p className={`text-base text-gray-600 line-clamp-2 sm:line-clamp-3 leading-relaxed mb-4 ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
                      {provider.short_bio}
                    </p>

                    {/* Coverage Area Chips */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {provider.service_area.slice(0, 3).map((area, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 rounded text-xs font-medium"
                        >
                          {area}
                        </span>
                      ))}
                      {provider.service_area.length > 3 && (
                        <span className="px-1.5 py-0.5 text-gray-400 text-xs font-medium">
                          +{provider.service_area.length - 3} {lang === 'ur' ? 'مزید' : lang === 'ar' ? 'إضافي' : 'more'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Area */}
                  <div className="pt-3.5 sm:pt-4 border-t border-gray-100 flex items-center justify-between gap-2.5">
                    <div>
                      <span className="text-xs uppercase font-bold text-gray-400 block">
                        {lang === 'ur' ? 'وزٹ چارجز' : lang === 'ar' ? 'رسوم الزيارة' : 'Visiting Charges'}
                      </span>
                      <span className="text-sm font-bold text-neutral-900">
                        {formatVisitingPrice(provider.starting_price, provider.country_code || country)}
                      </span>
                    </div>

                    {/* Solid Emerald Green "Chat on WhatsApp" Button */}
                    <a
                      href={directWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>{lang === 'ur' ? 'واٹس ایپ پر رابطہ کریں' : lang === 'ar' ? 'محادثة واتساب' : 'Chat on WhatsApp'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Category FAQ & FAQPage Schema */}
        <CategoryFaqSection
          categoryName={categoryName}
          cityName={cityName}
          countryName={countryName}
          startingPrice={providers[0]?.starting_price ? formatVisitingPrice(providers[0].starting_price, providers[0].country_code || country) : undefined}
          lang={lang}
        />
      </main>
    </div>
  );
}
