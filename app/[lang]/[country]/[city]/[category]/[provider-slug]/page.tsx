import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  BadgeCheck,
  ShieldCheck,
  Star,
  MapPin,
  ChevronRight,
  Clock,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { getDictionary } from '@/lib/get-dictionary';
import { getProviderBySlug, getCategoryBySlug } from '@/lib/db';
import ProviderImageSlider from '@/components/ProviderImageSlider';
import ProviderContactFAB from '@/components/ProviderContactFAB';

interface ProviderPageProps {
  params: Promise<{
    lang: string;
    country: string;
    city: string;
    category: string;
    'provider-slug': string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateMetadata({ params }: ProviderPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { lang, country, city, category } = resolvedParams;
  const slug = resolvedParams['provider-slug'];
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
  const description = `${provider.short_bio.slice(0, 160)}... Rated ${provider.rating}★ (${provider.review_count} reviews). Contact directly without platform fees.`;
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
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Baseera Local Services Directory',
      images: [
        {
          url: provider.avatar_url,
          width: 800,
          height: 600,
          alt: provider.name,
        },
      ],
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'profile',
    },
  };
}

export default async function DynamicProviderProfilePage({ params }: ProviderPageProps) {
  const resolvedParams = await params;
  const { lang, country, city, category } = resolvedParams;
  const slug = resolvedParams['provider-slug'];

  const provider = await getProviderBySlug(city, category, slug);
  const categoryInfo = getCategoryBySlug(category);
  const dict = await getDictionary(lang);

  if (!provider) {
    notFound();
  }

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const countryCode = country.toUpperCase();
  const canonicalUrl = `${DOMAIN}/${lang}/${country}/${city}/${category}/${slug}`;

  // 1. DYNAMIC JSON-LD LOCALBUSINESS SCHEMA MARKUP
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': canonicalUrl,
    name: provider.name,
    image: [provider.avatar_url],
    telephone: provider.whatsapp_number,
    url: canonicalUrl,
    priceRange: `Rs. ${provider.starting_price}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: cityName,
      addressCountry: countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '24.8607',
      longitude: '67.0011',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: provider.rating.toFixed(1),
      reviewCount: provider.review_count.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '22:00',
      },
    ],
  };

  // Mock portfolio photos from database or default
  const portfolioPhotos = [
    provider.avatar_url,
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-28 font-sans">
      {/* Dynamic JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* Breadcrumbs Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href={`/${lang}`} className="hover:text-[#059669] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link href={`/${lang}/${country}/${city}`} className="hover:text-[#059669] transition-colors">
              {cityName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link href={`/${lang}/${country}/${city}/${category}`} className="hover:text-[#059669] transition-colors capitalize">
              {categoryInfo?.name || category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-neutral-900 font-semibold truncate">{provider.name}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* TOP IMAGE SLIDER (Next.js Image unoptimized={true}) */}
        <ProviderImageSlider images={portfolioPhotos} providerName={provider.name} />

        {/* OVERLAPPING AVATAR & BASIC DETAILS */}
        <div className="relative px-2 sm:px-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            {/* Circular Overlapping Avatar */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white overflow-hidden shrink-0">
              <img
                src={provider.avatar_url}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Availability Pill */}
            {provider.is_available && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <span>Available for Service Today</span>
              </div>
            )}
          </div>

          {/* Name & Trade Title */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {provider.name}
              </h1>
              {provider.is_verified && (
                <span title="Verified by Baseera" className="inline-flex items-center text-[#059669]">
                  <BadgeCheck className="w-6 h-6 fill-emerald-50 text-[#059669]" />
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-[#059669]">
              {provider.trade_title}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
              <div className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{provider.rating.toFixed(1)}</span>
                <span className="text-gray-400 font-normal">({provider.review_count} client reviews)</span>
              </div>

              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{provider.district}, {cityName}</span>
              </div>

              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-[#059669]" />
                <span>{provider.total_leads}+ Client Connections</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE BODY & SERVICE AREAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 px-2 sm:px-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="p-6 border border-gray-200 rounded-2xl bg-white">
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2">
                About & Professional Experience
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {provider.short_bio}
              </p>
            </div>

            {/* Service Area Tags */}
            <div className="p-6 border border-gray-200 rounded-2xl bg-white">
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">
                Service Area Coverage in {cityName}
              </h2>
              <div className="flex flex-wrap gap-2">
                {provider.service_area.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-xl bg-white flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#059669] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-neutral-900">Verified Specialist</div>
                  <div className="text-[11px] text-gray-500">ID & Trade Approved</div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-white flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-neutral-900">Direct Pay</div>
                  <div className="text-[11px] text-gray-500">No Booking Fees</div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-white flex items-center gap-3">
                <Clock className="w-6 h-6 text-[#059669] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-neutral-900">Fast Response</div>
                  <div className="text-[11px] text-gray-500">Direct WhatsApp</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Guarantee Box */}
          <div className="space-y-6">
            <div className="p-6 border border-gray-200 rounded-2xl bg-white">
              <span className="text-xs uppercase font-bold text-gray-400 block mb-1">
                Visiting / Inspection Fee
              </span>
              <div className="text-3xl font-black text-[#059669] mb-3">
                Rs. {provider.starting_price}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Pay directly upon completion of work. No online payment or card deduction required.
              </p>

              <div className="text-xs text-gray-600 space-y-2 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span>Free cancellation before specialist arrival</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span>Negotiate major repairs on-site directly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CRITICAL UI: STICKY FLOATING ACTION BUTTON (FAB) ANCHORED BOTTOM-RIGHT */}
      <ProviderContactFAB
        providerId={provider.id}
        providerName={provider.name}
        contactMethod="whatsapp"
        contactValue={provider.whatsapp_number}
        categoryTitle={categoryInfo?.name || category}
        cityName={cityName}
      />
    </div>
  );
}
