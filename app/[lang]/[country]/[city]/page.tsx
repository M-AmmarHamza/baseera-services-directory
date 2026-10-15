import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  getProviders,
  CATEGORIES,
  getCountryByCode,
  getAllProviders,
  getCategoryName,
  getCategoryBySlug,
  getLocalizedCountryName,
  getLocalizedCityName,
  getCityDistricts,
} from '@/lib/db';
import SearchBar from '@/components/SearchBar';
import RelatedSlider from '@/components/RelatedSlider';
import {
  CategoryIcon,
  MapPin,
  WhatsAppIcon,
  Star,
  BadgeCheck,
  ShieldCheck,
  Globe,
  Clock,
} from '@/components/Icons';

const PROVIDER_PHOTOS: Record<string, string> = {
  'tariq-mahmood': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK9qWTJzXQzuvOCxeaY9oaT5QnMSIE_WRvPrYq3ndOxqfGwgRJiuusiLQI6ptKnL9aXydagk97uFwsxC7j-gxTH2VH5N_HAJpsT3T0CG_IE0OBqsRNY1C_6XY0VC8sNDh1YBotW-weRk3E7XwleN6ZT1cvkRynmWL_e-anI_it8xQNPs3oqJRRO7Xrk7PfW-P6i2RwcClJxEboVmdY8ZF6bL0HcCJgGu5qW0x9sje5DlC6qn7x4H7V',
  'kashif-ali': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrVEOf4Kmm3ZmFg2SVyQFHc7CD8jvopigKY9y06BL7csj1WLTVWDmQqVt9BLA-VImJWY1FnjTlOTMBdLORMVFgTEdwQKPPqGcSnJWhS5AriQLENY6vHirxqBOzQHMWyqZjRyr6tgRG-1ieePqu9nM2GIZj-GUmMil3H8fWsOahBKbVJj1EXc7oGAdad_P_Cb1e1CbAKo9FYlkkU-0dpz0biB1i9POZASr1lFg6dTIGFODNEO_8u9eb',
  'farzana-kitchen': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZZ3jFfYAUp1f6ZwaA3bw9DUYqcbD067tf2DiX2SWLVRwTUhafGFCOzOzsUTICpmDPFe91mBv1GRm3r-qyUJZbnBeN57VtXsCuKHMVsXx1aioXkyo3Sw6_yQg78DkkPYzj3soUYY7YS49NK-hbHVquzL-bkNCxoWMINuv2OS5c5kG0a8JFOI5irxZcGHL_fDVrQ4YMj7ltf8FV7Xr-DHs1rDSBoxy0sTlo2SIaOGOn_DXV-DBQ1RiE',
  'saleem-master-plumber': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh_sRw3hmV3-7S4eNUd-jVO6bSyp0hVjmvJnXG1oQgcAzN4VP_eIJmZkl_MPu4cn6bdK2L8vqRh-o3t5WJiZO5TxWY_sqrtZ3IEN0Z--_cgbhxjNDSjvWO-GU0eiTs0MbgHl_RKimCrBYqcVeAFD5itfUXN0BPc3h_RqJ7QxAG6T4a8tmK_zj2jjST6iDrmQLd7bRv5r8IvN6HyGLW7O7OZgikD5SLl5PGm5qg8hoKu1pyQ2C9_2vX',
  'rashid-al-nuaimi': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2l4P0wqkni4JXap4ad5Xf4HBbfy1jyDHX3FUdMUrFo0396vlt_xfNg48P99hWFZE-TfWOW8xbOZ9wTZBmkBIz6h6b3dlmcr_B_dxRSiddrF71x29Ia7h2L7mo-1vBv2CzpQwSr_h5VXoM-AFpvpuUudH-fkzbk01Jf_tEy8wB3_C_mYqB23LbrEJlKaJ_qIeVMnySPeESilDDoyKX3XwKFzWuhJSG2QGH2NRvAqye0WBFQ9LEBL63',
  'asif-electric-works': 'https://lh3.googleusercontent.com/aida-public/AB6AXuACSlVNm3bhLWBv4knbPMshpC0z6XDbCFHO9owIwla9r13zDyShNaVeE-6_SV5oOIus3Cv-E8e4_PrNq7vOIzw5rUB0yeL5janUJd5hf3iFGQRMuB87CEt72e-FOdn_hVetda96_-HFtpknnr2Yh5m7-rlh9txcmU0X8cZjac4KfWkX0iTyq-5PMDqRBsFBGaEWN-UO3g3JU71qGhooDGtBY6u8-NHtsoNyy7x53jqBr-HLdaitF7Jv',
};

interface PageProps {
  params: Promise<{
    lang: string;
    country: string;
    city: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, country, city } = await params;
  const cityName = getLocalizedCityName(city, lang);
  const countryObj = getCountryByCode(country);
  const countryName = getLocalizedCountryName(countryObj, lang);

  const title =
    lang === 'ur'
      ? `${cityName} میں تصدیق شدہ کاریگر اور لوکل سروسز | بصیرہ`
      : lang === 'ar'
      ? `أفضل الخدمات والفنيين المعتمدين في ${cityName}، ${countryName} | بصيرة`
      : `Baseera ${cityName}, ${countryName} - Direct Local Services Directory`;

  const description =
    lang === 'ur'
      ? `${cityName}، ${countryName} میں تصدیق شدہ الیکٹریشن، پلمبر، اے سی اور دیگر ماہرین سے بغیر کسی مڈل مین یا کمیشن کے براہِ راست رابطہ کریں۔`
      : lang === 'ar'
      ? `تواصل مباشرة مع فنيين معتمدين في ${cityName}، ${countryName} بدون وسطاء أو عمولات.`
      : `Connect directly with verified local specialists across ${cityName}, ${countryName} without intermediaries, commissions, or delay.`;

  const canonicalUrl = `${DOMAIN}/${lang}/${country.toLowerCase()}/${city.toLowerCase()}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-PK': `${DOMAIN}/en/pk/${city}`,
        'ur-PK': `${DOMAIN}/ur/pk/${city}`,
        'ar-AE': `${DOMAIN}/ar/ae/${city}`,
        'en-AE': `${DOMAIN}/en/ae/${city}`,
        'x-default': `${DOMAIN}/en/pk/karachi`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: lang === 'ur' ? 'بصیرہ ڈائریکٹری' : lang === 'ar' ? 'دليل بصيرة' : 'Baseera',
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'website',
    },
  };
}

export default async function CityHomePage({ params }: PageProps) {
  const { lang, country, city } = await params;
  const providers = await getProviders(city);
  const districts = await getCityDistricts(city);
  const countryObj = getCountryByCode(country);
  const countryName = getLocalizedCountryName(countryObj, lang);
  const cityName = getLocalizedCityName(city, lang);
  const countryCode = country.toUpperCase();
  const commaSeparator = lang === 'ur' || lang === 'ar' ? '، ' : ', ';

  // Structured Data: BreadcrumbList Schema
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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className={`bg-[#f9f9ff] min-h-screen text-[#141b2b] ${lang === 'ur' ? 'font-urdu' : lang === 'ar' ? 'font-tajawal' : 'font-sans'}`}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 md:pb-16 flex flex-col gap-10">
          
          {/* Centered Hero Section */}
          <section className="flex flex-col items-center text-center pt-4 md:pt-8 pb-4 max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006948] text-xs font-semibold border border-emerald-100">
                <MapPin className="w-3.5 h-3.5 text-[#006948]" />
                {cityName}{commaSeparator}{countryCode}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
                {lang === 'ur' ? 'براہِ راست واٹس ایپ رابطہ' : lang === 'ar' ? 'محادثات واتساب مباشرة' : 'Direct WhatsApp Inquiries'}
              </span>
            </div>

            <h1 className={`text-2xl sm:text-3xl text-gray-950 tracking-tight font-bold overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-6 pt-2' : 'leading-tight mt-1 mb-3'}`}>
              {lang === 'ur'
                ? `${cityName} میں قابل اعتماد لوکل سروسز تلاش کریں`
                : lang === 'ar'
                ? `اعثر على خدمات موثوقة في ${cityName}`
                : `Find Trusted Local Services in ${cityName}`}
            </h1>
            <p className={`text-base text-gray-600 max-w-2xl overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-8' : 'leading-relaxed mb-6'}`}>
              {lang === 'ur'
                ? `${cityName} میں تصدیق شدہ کاریگروں سے بغیر کسی مڈل مین، کمیشن یا تاخیر کے براہِ راست رابطہ کریں۔`
                : lang === 'ar'
                ? `تواصل مباشرة مع فنيين معتمدين في ${cityName} بدون وسطاء أو عمولات وبكل سهولة.`
                : `Connect directly with verified local specialists across ${cityName} without intermediaries, commissions, or delay.`}
            </p>

            {/* Centered Search Bar */}
            <div className="w-full max-w-2xl">
              <SearchBar
                lang={lang}
                country={country}
                city={city}
                placeholder={lang === 'ur' ? 'الیکٹریشن، پلمبر، اے سی سروس، ہوم شیف تلاش کریں...' : lang === 'ar' ? 'ابحث عن كهربائي، سباك، تصليح تكييف...' : 'Search electrician, plumber, AC repair, home chef...'}
                searchButtonText={lang === 'ur' ? 'تلاش کریں' : lang === 'ar' ? 'بحث' : 'Search'}
              />
            </div>

            {/* Quick District Filter Chips (Strictly Dynamic & City-Scoped) */}
            {districts.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                <Link
                  href={`/${lang}/${country.toLowerCase()}/${city.toLowerCase()}`}
                  className="px-3.5 py-1.5 rounded-full bg-[#006948] text-white text-xs font-semibold shadow-xs"
                >
                  {lang === 'ur' ? 'تمام علاقے' : lang === 'ar' ? 'جميع المناطق' : 'All Districts'}
                </Link>
                {districts.map((district) => (
                  <Link
                    key={district}
                    href={`/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/search?q=${encodeURIComponent(district)}`}
                    className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors"
                  >
                    {district}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Popular Services Slider */}
          <RelatedSlider
            type="categories"
            title={
              lang === 'ur'
                ? `${cityName} میں مقبول ترین سروسز`
                : lang === 'ar'
                ? `الخدمات الشائعة في ${cityName}`
                : `Popular Services in ${cityName}`
            }
            subtitle={
              lang === 'ur'
                ? 'دنیا بھر کے تصدیق شدہ کمیونٹی ٹیکنیشنز اور ماہر کاریگر'
                : lang === 'ar'
                ? 'فنيون محترفون ومعتمدون في منطقتك'
                : `Verified community specialists & technicians across ${cityName}`
            }
            items={CATEGORIES}
            lang={lang}
            country={country}
            city={city}
          />

          {/* Verified Specialists Section */}
          {providers.length > 0 ? (
            <section className="flex flex-col gap-4 overflow-visible">
              <div className="flex items-center justify-between">
                <div className="overflow-visible">
                  <h2 className={`text-xl sm:text-2xl font-semibold text-gray-950 tracking-tight overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.3] mb-2 pt-1' : 'leading-snug'}`}>
                    {lang === 'ur' ? 'نمایاں تصدیق شدہ ماہرین' : lang === 'ar' ? 'فنيون متميزون معتمدون' : 'Featured Verified Specialists'}
                  </h2>
                  <p className={`text-sm text-gray-500 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
                    {lang === 'ur'
                      ? `${cityName} میں بغیر کسی مڈل مین کمیشن کے براہِ راست رابطہ`
                      : lang === 'ar'
                      ? `تواصل مباشر بدون عمولة وسيط في ${cityName}`
                      : `Direct connection with zero intermediary commissions in ${cityName}`}
                  </p>
                </div>
                <Link
                  href={`/${lang}/list-service?country=${country}&city=${city}`}
                  className="text-sm text-[#006948] font-bold hover:underline"
                >
                  {lang === 'ur' ? '+ بطور کاریگر شامل ہوں' : lang === 'ar' ? '+ انضم كمهني' : '+ Join as Vendor'}
                </Link>
              </div>

              {/* Cards: Horizontal Scroll on Mobile, 3-Col Grid on Desktop */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pt-0.5 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible">
                {providers.map((pro) => {
                  const coverImg =
                    PROVIDER_PHOTOS[pro.slug] ||
                    pro.avatar_url ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBK9qWTJzXQzuvOCxeaY9oaT5QnMSIE_WRvPrYq3ndOxqfGwgRJiuusiLQI6ptKnL9aXydagk97uFwsxC7j-gxTH2VH5N_HAJpsT3T0CG_IE0OBqsRNY1C_6XY0VC8sNDh1YBotW-weRk3E7XwleN6ZT1cvkRynmWL_e-anI_it8xQNPs3oqJRRO7Xrk7PfW-P6i2RwcClJxEboVmdY8ZF6bL0HcCJgGu5qW0x9sje5DlC6qn7x4H7V';

                  const profileLink = `/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${pro.category_id}/${pro.slug}`;
                  const catObj = getCategoryBySlug(pro.category_id);
                  const categoryName = getCategoryName(catObj, lang);
                  const defaultTags =
                    pro.service_area && pro.service_area.length > 0
                      ? pro.service_area.slice(0, 3)
                      : [
                          lang === 'ur' ? 'فوری جواب' : lang === 'ar' ? 'رد سريع' : 'Quick Response',
                          lang === 'ur' ? 'کام کی گارنٹی' : lang === 'ar' ? 'ضمان الخدمة' : 'Work Guarantee',
                          lang === 'ur' ? 'تصدیق شدہ' : lang === 'ar' ? 'معتمد' : 'Verified',
                        ];

                  const directWhatsAppUrl = `https://wa.me/${pro.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(
                    lang === 'ur'
                      ? `السلام علیکم ${pro.name}، میں نے بصیرہ پر آپ کا پروفائل دیکھا ہے۔ مجھے ${cityName} میں آپ کی سروسز درکار ہیں۔`
                      : lang === 'ar'
                      ? `مرحباً ${pro.name}، شاهدت ملفك على بصيرة في ${cityName}. أود الاستفسار عن خدماتك.`
                      : `Salam ${pro.name}, saw your profile on Baseera in ${cityName}.`
                  )}`;

                  return (
                    <div
                      key={pro.id}
                      className="flex flex-col w-[290px] shrink-0 md:w-auto md:shrink bg-[#f1f3ff]/60 rounded-2xl p-4 shadow-2xs justify-between hover:shadow-md transition-all border border-gray-200/70"
                    >
                      <div>
                        {/* Cover photo with rating and verified badge */}
                        <Link
                          href={profileLink}
                          className="block relative w-full h-36 rounded-xl overflow-hidden mb-3 bg-gray-200 group"
                        >
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            alt={pro.name}
                            src={coverImg}
                          />
                          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span className="text-xs font-bold text-gray-900">{pro.rating}</span>
                            <span className="text-xs text-gray-500">({pro.review_count})</span>
                          </div>
                          {pro.is_verified && (
                            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-[#006948] text-white px-2 py-0.5 rounded-md text-xs font-medium shadow-xs">
                              <BadgeCheck className="w-3.5 h-3.5 text-white" />
                              <span>{lang === 'ur' ? 'تصدیق شدہ' : lang === 'ar' ? 'معتمد' : 'Verified Pro'}</span>
                            </div>
                          )}
                        </Link>

                        {/* Details */}
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-gray-950 truncate hover:text-[#006948] transition-colors leading-snug">
                              <Link href={profileLink}>
                                {pro.name}
                              </Link>
                            </h3>
                            <span className="text-xs text-[#006948] font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              {pro.is_available
                                ? lang === 'ur'
                                  ? 'آج دستیاب'
                                  : lang === 'ar'
                                  ? 'متاح اليوم'
                                  : 'Available'
                                : lang === 'ur'
                                ? 'فوری جواب'
                                : lang === 'ar'
                                ? 'رد سريع'
                                : 'Quick Reply'}
                            </span>
                          </div>
                          <p className={`text-xs sm:text-sm text-[#006948] font-bold mt-0.5 truncate ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
                            {categoryName}
                          </p>
                          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{pro.district ? `${pro.district}${commaSeparator}${cityName}` : cityName}</span>
                          </div>

                          {/* Chips */}
                          <div className="flex flex-wrap gap-1 mt-2.5 mb-3.5">
                            {defaultTags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md bg-white border border-gray-200/70 text-gray-700 text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Direct Action Button */}
                      <a
                        className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#006948] text-white text-sm font-semibold active:opacity-90 transition-all hover:bg-[#00855d] shadow-2xs"
                        href={directWhatsAppUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <WhatsAppIcon className="w-4 h-4 text-white fill-current" />
                        <span>{lang === 'ur' ? 'واٹس ایپ پر رابطہ کریں' : lang === 'ar' ? 'محادثة واتساب' : 'Chat on WhatsApp'}</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            /* Clean Empty State: Invite local vendors to register */
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-2xs text-center flex flex-col items-center max-w-2xl mx-auto gap-5 my-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center text-3xl">
                {countryObj.flag}
              </div>
              <div>
                <span className="text-xs bg-emerald-50 text-[#006948] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                  {lang === 'ur' ? `${cityName} کے لیے ڈائریکٹری فعال ہے` : lang === 'ar' ? `الدليل متاح في ${cityName}` : `Directory Open for ${cityName}`}
                </span>
                <h2 className={`text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight mt-2 ${lang === 'ur' ? 'font-urdu leading-[2.3]' : ''}`}>
                  {lang === 'ur'
                    ? `${cityName} میں پہلے تصدیق شدہ ماہر بنیں!`
                    : lang === 'ar'
                    ? `كن أول فني معتمد في ${cityName}!`
                    : `Be the First Verified Specialist in ${cityName}!`}
                </h2>
                <p className={`text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-2 leading-relaxed ${lang === 'ur' ? 'font-urdu leading-[2.5]' : ''}`}>
                  {lang === 'ur'
                    ? `کیا آپ ${cityName}، ${countryName} میں الیکٹریشن، پلمبر، اے سی ٹیکنیشن یا ماہر کاریگر ہیں؟ بغیر کسی فیس یا کمیشن کے کسٹمرز حاصل کرنے کے لیے اپنا پروفائل درج کریں۔`
                    : lang === 'ar'
                    ? `هل أنت كهربائي أو سباك أو فني تكييف في ${cityName}، ${countryName}؟ سجل حسابك للحصول على طلبات العملاء عبر واتساب مباشرة بدون عمولة.`
                    : `Are you an electrician, plumber, AC technician, or specialist in ${cityName}, ${countryName}? Register your profile to receive direct customer leads on WhatsApp with zero commission.`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/${lang}/list-service?country=${country}&city=${city}`}
                  className="px-6 py-3 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
                >
                  <span>
                    {lang === 'ur'
                      ? `بطور ${cityName} کاریگر رجسٹر ہوں (مفت)`
                      : lang === 'ar'
                      ? `سجل كمهني في ${cityName} (مجاناً)`
                      : `Register as ${cityName} Specialist (Free)`}
                  </span>
                  <span className="rtl:rotate-180">→</span>
                </Link>
                <Link
                  href={`/${lang}`}
                  className="px-5 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200 transition-colors"
                >
                  {lang === 'ur' ? 'عالمی ڈائریکٹری دیکھیں' : lang === 'ar' ? 'تصفح الدليل العام' : 'Browse Global Directory'}
                </Link>
              </div>
            </section>
          )}

          {/* Trust & Resource Banners */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 flex items-start gap-4 border border-gray-200/80 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#006948]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-gray-950">
                  {lang === 'ur' ? 'زیرو کمیشن، براہِ راست رابطہ' : lang === 'ar' ? 'بدون عمولة، اتصال مباشر' : 'Zero Commission, Direct Contact'}
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {lang === 'ur'
                    ? `بصیرہ کوئی کمیشن چارج نہیں کرتا۔ ${cityName} میں کاریگروں سے کام کی تفصیل، وقت اور ریٹس براہِ راست واٹس ایپ پر طے کریں۔`
                    : lang === 'ar'
                    ? `بصيرة لا تتقاضى أي عمولة وساطة. تواصل مباشرة مع الفنيين في ${cityName} وناقش الأسعار عبر واتساب.`
                    : `Baseera does not charge middlemen fees. Discuss requirements, timing, and rates directly with technicians in ${cityName} over WhatsApp.`}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 flex items-start gap-4 border border-gray-200/80 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-100/50 text-[#006948] flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6 text-[#006948]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-gray-950">
                  {lang === 'ur' ? `${cityName} رہائشی گائیڈز` : lang === 'ar' ? `دليل سكان ${cityName}` : `${cityName} Resident Guides`}
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {lang === 'ur'
                    ? `${cityName} کے رہائشیوں کے لیے ایمرجنسی ہیلپ لائنز، بجلی کے شیڈولز اور گھریلو دیکھ بھال کے مفید مشورے۔`
                    : lang === 'ar'
                    ? `أرقام الطوارئ وجداول الصيانة المنزلية المعتمدة لسكان ${cityName}.`
                    : `Verified emergency helplines, load shedding schedules, and home maintenance tips for residents in ${cityName}.`}
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  );
}
