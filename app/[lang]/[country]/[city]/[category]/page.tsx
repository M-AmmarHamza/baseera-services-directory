import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';
import { getProviders, getCategoryBySlug, CATEGORIES } from '@/lib/db';

interface CategoryPageProps {
  params: Promise<{
    lang: string;
    country: string;
    city: string;
    category: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { lang, country, city, category } = await params;
  const catObj = getCategoryBySlug(category);
  const categoryName = catObj ? catObj.name : category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const countryCode = country.toUpperCase();
  const countryName = countryCode === 'PK' ? 'Pakistan' : countryCode === 'AE' ? 'United Arab Emirates' : countryCode;

  const providers = await getProviders(city, category);
  const count = providers.length;

  const title = count > 0
    ? `Top ${count} Verified ${categoryName} in ${cityName}, ${countryName} | Baseera`
    : `Verified ${categoryName} in ${cityName}, ${countryName} | Direct Contact | Baseera`;

  const description = `Connect directly with verified ${categoryName} in ${cityName}, ${countryName}. Zero commission, direct WhatsApp chat, verified credentials, and customer reviews.`;
  const canonicalUrl = `${DOMAIN}/${lang}/${country}/${city}/${category}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-PK': `${DOMAIN}/en/pk/${city}/${category}`,
        'ur-PK': `${DOMAIN}/ur/pk/${city}/${category}`,
        'ar-AE': `${DOMAIN}/ar/ae/${city}/${category}`,
        'en-AE': `${DOMAIN}/en/ae/${city}/${category}`,
        'x-default': `${DOMAIN}/en/pk/${city}/${category}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Baseera',
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${DOMAIN}/api/og?title=${encodeURIComponent(categoryName)}&subtitle=${encodeURIComponent(`${cityName}, ${countryName}`)}`,
          width: 1200,
          height: 630,
          alt: `${categoryName} in ${cityName}`,
        },
      ],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { lang, country, city, category } = await params;
  const dict = await getDictionary(lang);
  const providers = await getProviders(city, category);
  const catObj = getCategoryBySlug(category);
  const categoryName = catObj ? catObj.name : category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const countryName = country.toUpperCase() === 'PK' ? 'Pakistan' : country.toUpperCase() === 'AE' ? 'UAE' : country.toUpperCase();

  // Structured Data: BreadcrumbList Schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${DOMAIN}/${lang}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: countryName,
        item: `${DOMAIN}/${lang}/${country}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: cityName,
        item: `${DOMAIN}/${lang}/${country}/${city}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: categoryName,
        item: `${DOMAIN}/${lang}/${country}/${city}/${category}`,
      },
    ],
  };

  // Structured Data: ItemList Schema (for Google Search Results Carousel)
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryName} in ${cityName}`,
    description: `Verified ${categoryName} available in ${cityName}, ${countryName}`,
    numberOfItems: providers.length,
    itemListElement: providers.map((pro, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        name: pro.name,
        image: pro.avatar_url,
        telephone: pro.whatsapp_number,
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressLocality: cityName,
          addressRegion: pro.district,
          addressCountry: country.toUpperCase(),
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: pro.rating,
          reviewCount: pro.review_count,
        },
        url: `${DOMAIN}/${lang}/${country}/${city}/${category}/${pro.slug}`,
      },
    })),
  };

  return (
    <>
      {/* Schema.org ItemList & Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Breadcrumb Navigation Bar */}
        <nav className="flex items-center text-xs font-semibold text-gray-500 gap-2 overflow-x-auto whitespace-nowrap py-1">
          <Link href={`/${lang}/pk/karachi`} className="hover:text-emerald-800 transition-colors">
            {dict.nav.home}
          </Link>
          <span>/</span>
          <Link href={`/${lang}/${country}/${city}`} className="hover:text-emerald-800 transition-colors">
            {cityName}
          </Link>
          <span>/</span>
          <span className="text-emerald-800 font-bold">{categoryName}</span>
        </nav>

        {/* Category Header Banner */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
              <span className="material-symbols-outlined text-[32px]">{catObj?.icon || 'work'}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{cityName} Services</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs text-gray-500 font-medium">{providers.length} {dict.common.verified}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mt-1">
                {categoryName} <span className="text-gray-400 font-medium">in {cityName}</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                {dict.category.subtitleTemplate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href={`/${lang}/${country}/${city}`}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors shrink-0"
            >
              ← {dict.common.allCategories}
            </Link>
          </div>
        </section>

        {/* Main Content Area */}
        {providers.length > 0 ? (
          /* Active Providers Grid */
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((pro) => (
              <article
                key={pro.id}
                className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-600 hover:shadow-md transition-all gap-5"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <img
                      src={pro.avatar_url}
                      alt={pro.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-50 bg-gray-100 shrink-0"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h2 className="font-bold text-lg text-gray-900 truncate">{pro.name}</h2>
                        <span className="text-xs bg-emerald-50 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full shrink-0">
                          ★ {pro.rating}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-700 font-bold truncate mt-0.5">
                        {pro.trade_title}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <span className="material-symbols-outlined text-[15px] text-gray-400">location_on</span>
                        <span className="truncate">{pro.district}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mt-4">
                    {pro.short_bio}
                  </p>

                  {/* Coverage tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {pro.service_area.slice(0, 3).map((area) => (
                      <span
                        key={area}
                        className="bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                      >
                        {area}
                      </span>
                    ))}
                    {pro.service_area.length > 3 && (
                      <span className="text-[11px] text-gray-400 font-medium px-1">
                        +{pro.service_area.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-gray-400 font-medium block">{dict.profile.pricingFrom}</span>
                    <span className="text-sm font-extrabold text-gray-900">
                      Rs. {pro.starting_price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${lang}/${country}/${city}/${category}/${pro.slug}`}
                      className="py-2.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors"
                    >
                      {dict.common.viewProfile}
                    </Link>
                    <a
                      href={`https://wa.me/${pro.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${pro.name}, I found your ${categoryName} profile on Baseera ${cityName}. Are you available?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#006948] hover:bg-[#00855d] text-white py-2.5 px-3.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>{dict.common.chatWhatsApp}</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          /* 🚨 SMART EMPTY STATE: HTTP 200 Lead Catching Logic (Zero 404 for SEO) */
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-100 shadow-sm text-center flex flex-col items-center max-w-3xl mx-auto gap-6 my-4">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center ring-8 ring-emerald-50/50">
              <span className="material-symbols-outlined text-[40px]">handyman</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="inline-block bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider self-center border border-amber-200">
                🚀 Coming Soon to {cityName}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
                {dict.emptyState.title.replace('{category}', categoryName).replace('{city}', cityName)}
              </h2>
              <p className="text-sm text-gray-600 max-w-xl mx-auto font-medium leading-relaxed">
                {dict.emptyState.description.replace('{category}', categoryName).replace('{city}', cityName)}
              </p>
            </div>

            {/* Provider Quick Registration Box */}
            <div className="w-full bg-[#f9f9ff] rounded-2xl p-6 border border-gray-200 text-start flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700 text-[20px]">verified</span>
                <span className="font-bold text-sm text-gray-900">
                  {dict.emptyState.ctaVendor}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Join our verified vendor network before public launch in {cityName}. Zero onboarding fees, direct customer WhatsApp leads.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <input
                  type="text"
                  placeholder="Your Name / Business Name"
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp Number (e.g. +923001234567)"
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <a
                href={`https://wa.me/923332145890?text=${encodeURIComponent(`Hello Baseera Team, I am a ${categoryName} in ${cityName} and I want to list my services on Baseera.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#006948] hover:bg-[#00855d] text-white py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors self-center sm:self-end mt-1 shadow-sm"
              >
                <span>{dict.emptyState.ctaVendor} via WhatsApp</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>

            {/* Alternative categories suggestion */}
            <div className="w-full pt-4 border-t border-gray-100 flex flex-col gap-3">
              <span className="text-xs font-semibold text-gray-500">
                Looking for other verified services in {cityName}?
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {CATEGORIES.slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    href={`/${lang}/${country}/${city}/${c.slug}`}
                    className="text-xs bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 font-semibold px-3 py-1.5 rounded-full transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </>
  );
}
