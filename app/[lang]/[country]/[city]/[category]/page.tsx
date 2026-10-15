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
  toTitleCase,
} from '@/lib/db';
import { formatVisitingPrice } from '@/lib/currencies';

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
  const categoryName = catObj ? catObj.name : toTitleCase(category);
  const cityName = toTitleCase(city);
  const countryObj = getCountryByCode(country);
  const countryName = countryObj.name;

  const title = `Best ${categoryName} in ${cityName}, ${countryName} | Top Rated Profiles`;
  const description = `Looking for a reliable ${categoryName} in ${cityName}? Browse verified profiles, check ratings, view portfolios, and chat directly on WhatsApp. No middlemen!`;
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

export default async function CategoryListingPage({ params }: CategoryPageProps) {
  const { lang, country, city, category } = await params;
  const providers = await getProviders(city, category);
  const catObj = getCategoryBySlug(category);
  const categoryName = catObj ? catObj.name : toTitleCase(category);
  const cityName = toTitleCase(city);
  const countryObj = getCountryByCode(country);
  const countryName = countryObj.name;
  const canonicalUrl = `${DOMAIN}/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}`;

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

  return (
    <div className={`min-h-screen bg-white text-neutral-900 pb-24 md:pb-16 ${lang === 'ur' ? 'font-urdu' : 'font-sans'}`}>
      {/* Dynamic ItemList JSON-LD Injection */}
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
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link href={`/${lang}/${country.toLowerCase()}`} className="hover:text-[#059669] transition-colors">
              {countryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link href={`/${lang}/${country.toLowerCase()}/${city.toLowerCase()}`} className="hover:text-[#059669] transition-colors">
              {cityName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
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
                <span>{providers.length} Verified Specialists Available</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-6 pt-2' : 'leading-tight'}`}>
                Top-Rated {categoryName} in {cityName}
              </h1>
              <p className={`text-base text-gray-600 max-w-2xl overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5]' : 'mt-1 leading-relaxed'}`}>
                Compare verified specialist profiles, ratings, service areas, and connect directly on WhatsApp with zero middlemen commission.
              </p>
            </div>

            {/* List Your Business Button */}
            <Link
              href={`/${lang}/list-service?country=${country}&city=${city}&category=${category}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-[#059669] hover:text-[#059669] text-sm font-semibold text-neutral-900 transition-colors shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-[#059669]" />
              <span>List Your Service in {cityName}</span>
            </Link>
          </div>
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
              We are launching {categoryName} services in {cityName} soon!
            </h2>

            <p className={`text-base text-gray-600 max-w-md mx-auto overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-8' : 'leading-relaxed mb-6'}`}>
              Be among the first verified {categoryName.toLowerCase()} in {cityName}. Gain direct client inquiries straight to your WhatsApp with zero platform commission.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/${lang}/list-service?country=${country}&city=${city}&category=${category}`}
                className="w-full sm:w-auto bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Register Your Business</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/${lang}`}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-200 text-neutral-900 text-sm font-semibold px-5 py-3 rounded-xl transition-colors inline-flex items-center justify-center"
              >
                Browse All Services
              </Link>
            </div>
          </div>
        ) : (
          /* 2. FLAT PROVIDER CARDS LIST */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((provider) => {
              const cleanPhone = provider.whatsapp_number.replace(/[^0-9]/g, '');
              const whatsappMessage = encodeURIComponent(
                `Hello ${provider.name}, I saw your verified profile on Baseera in ${cityName}. I would like to inquire about your ${categoryName} services.`
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
                              title="Verified Specialist"
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
                            ({provider.review_count} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location & Coverage */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">
                        {provider.district}, {cityName}
                      </span>
                    </div>

                    {/* Short Description */}
                    <p className="text-base text-gray-600 line-clamp-2 sm:line-clamp-3 leading-relaxed mb-4">
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
                          +{provider.service_area.length - 3} more
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
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
