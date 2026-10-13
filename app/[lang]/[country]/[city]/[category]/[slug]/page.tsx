import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';
import { getProviderBySlug, getCategoryBySlug } from '@/lib/db';

interface ProviderPageProps {
  params: Promise<{
    lang: string;
    country: string;
    city: string;
    category: string;
    slug: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateMetadata({ params }: ProviderPageProps): Promise<Metadata> {
  const { lang, country, city, category, slug } = await params;
  const provider = await getProviderBySlug(city, category, slug);

  if (!provider) {
    return {
      title: 'Provider Not Found | Baseera',
    };
  }

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const countryCode = country.toUpperCase();
  const countryName = countryCode === 'PK' ? 'Pakistan' : countryCode === 'AE' ? 'United Arab Emirates' : countryCode;

  const title = `${provider.name} - Verified ${provider.trade_title} in ${cityName}, ${countryName} | Baseera`;
  const description = `${provider.short_bio.slice(0, 160)}... Rated ${provider.rating}★ (${provider.review_count} reviews). Contact directly on WhatsApp without agency commission.`;
  const canonicalUrl = `${DOMAIN}/${lang}/${country}/${city}/${category}/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-PK': `${DOMAIN}/en/pk/${city}/${category}/${slug}`,
        'ur-PK': `${DOMAIN}/ur/pk/${city}/${category}/${slug}`,
        'ar-AE': `${DOMAIN}/ar/ae/${city}/${category}/${slug}`,
        'en-AE': `${DOMAIN}/en/ae/${city}/${category}/${slug}`,
        'x-default': `${DOMAIN}/en/pk/${city}/${category}/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Baseera',
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'profile',
      images: [
        {
          url: provider.avatar_url,
          width: 800,
          height: 800,
          alt: provider.name,
        },
      ],
    },
  };
}

export default async function ProviderProfilePage({ params }: ProviderPageProps) {
  const { lang, country, city, category, slug } = await params;
  const dict = await getDictionary(lang);
  const provider = await getProviderBySlug(city, category, slug);

  if (!provider) {
    notFound();
  }

  const catObj = getCategoryBySlug(category);
  const categoryName = catObj ? catObj.name : category;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const countryName = country.toUpperCase() === 'PK' ? 'Pakistan' : country.toUpperCase() === 'AE' ? 'UAE' : country.toUpperCase();

  // Structured Data: Schema.org LocalBusiness JSON-LD
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: provider.name,
    image: provider.avatar_url,
    telephone: provider.whatsapp_number,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: provider.district,
      addressCountry: country.toUpperCase(),
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 24.8607,
      longitude: 67.0011,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: provider.rating,
      reviewCount: provider.review_count,
    },
    url: `${DOMAIN}/${lang}/${country}/${city}/${category}/${slug}`,
  };

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
      {
        '@type': 'ListItem',
        position: 5,
        name: provider.name,
        item: `${DOMAIN}/${lang}/${country}/${city}/${category}/${slug}`,
      },
    ],
  };

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum ${provider.name}, I saw your verified profile on Baseera (${cityName}). I have a query regarding your service.`
  );

  return (
    <>
      {/* Schema.org LocalBusiness & Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs font-semibold text-gray-500 gap-2 overflow-x-auto whitespace-nowrap py-1">
          <Link href={`/${lang}/pk/karachi`} className="hover:text-emerald-800 transition-colors">
            {dict.nav.home}
          </Link>
          <span>/</span>
          <Link href={`/${lang}/${country}/${city}`} className="hover:text-emerald-800 transition-colors">
            {cityName}
          </Link>
          <span>/</span>
          <Link href={`/${lang}/${country}/${city}/${category}`} className="hover:text-emerald-800 transition-colors">
            {categoryName}
          </Link>
          <span>/</span>
          <span className="text-emerald-800 font-bold truncate max-w-[180px]">{provider.name}</span>
        </nav>

        {/* Profile Card Header */}
        <article className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start gap-6">
          <div className="relative shrink-0">
            <img
              src={provider.avatar_url}
              alt={provider.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-emerald-50 bg-gray-100"
            />
            {provider.is_available && (
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                {dict.common.availableNow}
              </span>
            )}
          </div>

          <div className="flex flex-col flex-1 min-w-0 gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                  {provider.name}
                </h1>
                {provider.is_verified && (
                  <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                    <span className="material-symbols-outlined text-[15px] text-emerald-700">verified</span>
                    {dict.common.verified}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-sm bg-emerald-50 text-emerald-900 font-extrabold px-3 py-1 rounded-xl">
                <span>★</span>
                <span>{provider.rating}</span>
                <span className="text-xs text-gray-500 font-medium">({provider.review_count} {dict.profile.customerReviews})</span>
              </div>
            </div>

            <p className="text-sm sm:text-base font-semibold text-emerald-700">
              {provider.trade_title}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
                {provider.district}, {cityName}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-gray-400">badge</span>
                {provider.profile_type === 'shop' ? 'Registered Workshop' : 'Independent Specialist'}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-gray-400">trending_up</span>
                {provider.total_leads}+ Successful Connects
              </span>
            </div>
          </div>
        </article>

        {/* Details Grid: Left Content + Right Action Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Bio, Areas, Credentials */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* About / Bio */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-3">
              <h2 className="text-base font-bold text-gray-900">
                {dict.profile.coreServices}
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {provider.short_bio}
              </p>
            </div>

            {/* Service Coverage Areas */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  {dict.profile.coverageAreas}
                </h2>
                <span className="text-xs text-emerald-700 font-semibold">{cityName} Coverage</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {provider.service_area.map((area) => (
                  <span
                    key={area}
                    className="bg-emerald-50 text-emerald-900 border border-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Verification Guarantee Banner */}
            <div className="bg-emerald-900 text-white rounded-2xl p-6 flex items-start gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px] text-emerald-300">verified_user</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-sm text-white">
                  Baseera Verification Check
                </h3>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  This technician&apos;s national ID (CNIC / Emirates ID) and local references have been screened. Baseera provides 100% direct connection with zero hidden broker commissions.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Lead Action & Pricing Box */}
          <div className="flex flex-col gap-6">
            
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-600 shadow-sm flex flex-col gap-5 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {dict.profile.pricingFrom}
                </span>
                <span className="text-2xl font-black text-gray-950">
                  Rs. {provider.starting_price}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={`https://wa.me/${provider.whatsapp_number.replace(/\+/g, '')}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#006948] hover:bg-[#00855d] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  <span>{dict.common.chatWhatsApp}</span>
                </a>

                <a
                  href={`tel:${provider.whatsapp_number}`}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  <span>{provider.whatsapp_number}</span>
                </a>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-500 flex flex-col gap-1">
                <span className="font-semibold text-gray-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                  Direct Customer-to-Worker Connection
                </span>
                <span>No commission taken from either party. Pay technician directly after task completion.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </>
  );
}
