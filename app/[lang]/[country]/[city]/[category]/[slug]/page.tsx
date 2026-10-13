import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';
import { getProviderBySlug, getCategoryBySlug } from '@/lib/db';
import {
  BadgeCheck,
  MapPin,
  Building2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Phone,
  ChevronRight,
  Star,
  Clock,
  Sparkles,
  WhatsAppIcon,
} from '@/components/Icons';

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
    `Assalam-o-Alaikum ${provider.name}, I found your verified profile on Baseera (${cityName}). I need assistance with ${categoryName}.`
  );

  const initials = provider.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

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

      <div className="min-h-screen bg-slate-50/70 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 flex flex-col gap-6">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-slate-500 gap-1.5 overflow-x-auto whitespace-nowrap py-1">
            <Link href={`/${lang}/pk/karachi`} className="hover:text-emerald-700 transition-colors">
              {dict.nav.home}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 rtl:rotate-180" />
            <Link href={`/${lang}/${country}/${city}`} className="hover:text-emerald-700 transition-colors">
              {cityName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 rtl:rotate-180" />
            <Link href={`/${lang}/${country}/${city}/${category}`} className="hover:text-emerald-700 transition-colors">
              {categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 rtl:rotate-180" />
            <span className="text-emerald-800 font-semibold truncate max-w-[200px]">{provider.name}</span>
          </nav>

          {/* Profile Card Header */}
          <article className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start gap-6 relative overflow-hidden">
            {/* Subtle decorative background gradient */}
            <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-emerald-50/60 to-transparent pointer-events-none rounded-tr-3xl" />

            {/* Avatar & Online Badge */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-slate-100 bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-white shadow-sm">
                {provider.avatar_url && !provider.avatar_url.includes('googleusercontent') ? (
                  <img
                    src={provider.avatar_url}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-black tracking-wider uppercase">
                    {initials || 'BP'}
                  </span>
                )}
              </div>
              {provider.is_available && (
                <span className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full ring-2 ring-white flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {dict.common.availableNow}
                </span>
              )}
            </div>

            {/* Info Column */}
            <div className="flex flex-col flex-1 min-w-0 gap-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {provider.name}
                  </h1>
                  {provider.is_verified && (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                      <BadgeCheck className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" />
                      <span>{dict.common.verified} Pro</span>
                    </span>
                  )}
                </div>

                {/* Rating Badge */}
                <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200/70 font-extrabold px-3 py-1 rounded-xl text-sm shadow-2xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>{provider.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    ({provider.review_count} {dict.profile.customerReviews})
                  </span>
                </div>
              </div>

              {/* Trade Title */}
              <p className="text-sm sm:text-base font-semibold text-emerald-800">
                {provider.trade_title}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{provider.district}, {cityName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{provider.profile_type === 'shop' ? 'Registered Workshop' : 'Independent Specialist'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{provider.total_leads}+ Direct Connections</span>
                </div>
              </div>
            </div>
          </article>

          {/* Details Grid: Left Content + Right Action Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Bio, Areas, Credentials */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* About / Core Services */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col gap-3.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h2>{dict.profile.coreServices}</h2>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {provider.short_bio}
                </p>
              </div>

              {/* Service Coverage Areas */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <h2>{dict.profile.coverageAreas}</h2>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
                    {cityName} Coverage
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {provider.service_area.map((area) => (
                    <span
                      key={area}
                      className="bg-emerald-50/70 text-emerald-900 border border-emerald-200/60 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Baseera Verification Trust Banner */}
              <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl p-6 sm:p-7 flex items-start gap-4 shadow-sm border border-emerald-800/40">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <ShieldCheck className="w-6 h-6 text-emerald-300" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    Baseera Verification Check
                    <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                      ID Screened
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    This technician&apos;s national ID (CNIC / Emirates ID) and local references have been screened. Baseera provides 100% direct connection with zero hidden broker commissions or middleman markups.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Action & Pricing Box */}
            <div className="flex flex-col gap-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-600/30 shadow-md shadow-emerald-950/5 flex flex-col gap-5 sticky top-24">
                
                {/* Price Header */}
                <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {dict.profile.pricingFrom}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Rs. {provider.starting_price}
                    </span>
                    <span className="block text-[11px] text-slate-400 font-medium">Starting visit charge</span>
                  </div>
                </div>

                {/* Response Time Indicator */}
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/80 px-3 py-2 rounded-xl font-medium border border-emerald-100">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Typically responds within 15 minutes</span>
                </div>

                {/* Primary Action: Official WhatsApp CTA */}
                <div className="flex flex-col gap-3">
                  <a
                    href={`https://wa.me/${provider.whatsapp_number.replace(/\+/g, '')}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md shadow-emerald-600/15"
                  >
                    <WhatsAppIcon className="w-5 h-5 text-white shrink-0" />
                    <span>{dict.common.chatWhatsApp}</span>
                  </a>

                  {/* Secondary Action: Call Directly */}
                  <a
                    href={`tel:${provider.whatsapp_number}`}
                    className="w-full bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-800 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200/60"
                  >
                    <Phone className="w-4 h-4 text-slate-700 shrink-0" />
                    <span>{provider.whatsapp_number}</span>
                  </a>
                </div>

                {/* Trust Guarantee Box */}
                <div className="bg-slate-50 rounded-2xl p-4 text-[11px] text-slate-600 flex flex-col gap-2 border border-slate-200/60">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct Customer-to-Worker Connection</span>
                  </div>
                  <p className="leading-normal text-slate-500">
                    No booking fees or commission taken from either party. Pay the technician directly upon job completion.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}
