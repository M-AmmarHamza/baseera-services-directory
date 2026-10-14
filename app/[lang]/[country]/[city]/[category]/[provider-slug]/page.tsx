import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';
import { getProviderBySlug, getCategoryBySlug } from '@/lib/db';
import {
  BadgeCheck,
  ShieldCheck,
  Star,
  Phone,
  Clock,
  CheckCircle2,
  MapPin,
  ChevronRight,
  WhatsAppIcon,
  Zap,
  Wrench,
  Sparkles,
} from '@/components/Icons';

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

export default async function DynamicProviderPage({ params }: ProviderPageProps) {
  const resolvedParams = await params;
  const { lang, country, city, category } = resolvedParams;
  const slug = resolvedParams['provider-slug'];

  const provider = await getProviderBySlug(city, category, slug);
  const categoryInfo = getCategoryBySlug(category);
  const dict = await getDictionary(lang);

  if (!provider) {
    notFound();
  }

  const cleanPhone = provider.whatsapp_number.replace(/[^0-9+]/g, '');
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum ${provider.name}, I found your profile on Baseera directory in ${cityName}. I need consultation for ${provider.trade_title}. Are you available today?`
  );
  const directWhatsAppUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] pb-24 md:pb-16 font-sans">
      {/* Breadcrumbs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href={`/${lang}/${country}/${city}`} className="hover:text-emerald-700 font-medium">
              {cityName}
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
            <Link href={`/${lang}/${country}/${city}/${category}`} className="hover:text-emerald-700 font-medium capitalize">
              {categoryInfo?.name || category}
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-gray-900 font-semibold truncate">{provider.name}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Profile Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Profile Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative shrink-0">
                  <img
                    src={provider.avatar_url}
                    alt={provider.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-500/20 shadow"
                  />
                  {provider.is_verified && (
                    <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-1 shadow">
                      <BadgeCheck className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                      {provider.name}
                    </h1>
                    {provider.is_available && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Available Today
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-emerald-800 mt-1">
                    {provider.trade_title}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{provider.rating.toFixed(1)}</span>
                      <span className="text-gray-400 font-normal">({provider.review_count} reviews)</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{provider.district}, {cityName}</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-500">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{provider.total_leads}+ Inquiries</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio & Description */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">About & Services</h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {provider.short_bio}
                </p>
              </div>

              {/* Service Areas */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Service Coverage Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.service_area.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900">Verified Specialist</div>
                  <div className="text-[11px] text-gray-500">Identity & Trade Approved</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900">Zero Commission</div>
                  <div className="text-[11px] text-gray-500">Direct Karigar Pricing</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                <Clock className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900">Fast Response</div>
                  <div className="text-[11px] text-gray-500">Direct WhatsApp Chat</div>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Contact Sticky Action Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md sticky top-20">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs uppercase font-bold text-gray-500">Inspection & Visiting</span>
                <span className="text-2xl font-black text-emerald-700">Rs. {provider.starting_price}</span>
              </div>

              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Connect directly with {provider.name}. Pay upon completion without any platform surcharge.
              </p>

              <div className="space-y-3">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 px-4 rounded-xl shadow transition-all active:scale-[0.98]"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-current" />
                  <span>WhatsApp Specialist</span>
                </a>

                <a
                  href={`tel:${cleanPhone}`}
                  className="w-full flex items-center justify-center gap-2.5 bg-gray-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-xl transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Directly</span>
                </a>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Baseera Guaranteed Direct Contact</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
