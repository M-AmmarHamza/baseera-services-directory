import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
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
  PartyPopper,
  Truck,
  Star,
  BadgeCheck,
  MapPin,
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import HomepageSearchBar from '@/components/HomepageSearchBar';
import { getAllProviders, CATEGORIES } from '@/lib/db';

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

// Dynamic Icon Mapping for Lucide Icons
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
  PartyPopper,
  Truck,
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Find Trusted Local Services | Baseera Directory',
    description: 'Connect directly with verified electricians, plumbers, AC technicians, and local specialists. Zero platform commissions, 100% direct contact.',
    alternates: {
      canonical: `${DOMAIN}/${lang}`,
      languages: {
        en: `${DOMAIN}/en`,
        ur: `${DOMAIN}/ur`,
        ar: `${DOMAIN}/ar`,
      },
    },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  const providers = await getAllProviders();

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20 md:pb-12">
      {/* 1. HERO SECTION */}
      <section className="border-b border-gray-200 bg-white pt-10 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            Direct Karigar &amp; Specialist Directory
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.15] mb-4">
            Find Trusted Local Services
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Connect directly with verified specialists in your area. Zero booking fees, direct WhatsApp communication, and verified ratings.
          </p>

          {/* Large Search Bar with Fuzzy Concept & Location Chip */}
          <HomepageSearchBar lang={lang} defaultLocation="Karachi, PK" />
        </div>
      </section>

      {/* 2. BROWSE BY SPECIALTY (PREMIUM HORIZONTAL SCROLLABLE SECTION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Browse by Specialty
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Verified community technicians &amp; specialists worldwide
            </p>
          </div>
          <div className="text-sm font-semibold text-emerald-700 whitespace-nowrap shrink-0">
            {CATEGORIES.length} Categories
          </div>
        </div>

        {/* Horizontal Scrollable Container */}
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => {
            const IconComponent = CATEGORY_ICON_MAP[cat.icon] || Wrench;
            return (
              <Link
                key={cat.id}
                href={`/${lang}/pk/karachi/${cat.slug}`}
                className="bg-white border border-gray-200 rounded-xl min-w-[140px] w-[140px] p-4 flex flex-col items-center justify-center text-center transition-all hover:border-emerald-600 snap-start shrink-0 group cursor-pointer"
              >
                {/* Soft circular background behind icon */}
                <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-emerald-50 transition-colors">
                  <IconComponent className="text-emerald-700 w-6 h-6" />
                </div>

                {/* Two-line clamped Title */}
                <span className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 h-9 flex items-center justify-center">
                  {cat.name}
                </span>

                {/* Active provider count Subtext */}
                <span className="text-xs text-gray-500 mt-1">
                  {cat.count}+ Active
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. HORIZONTALLY SCROLLING FEATURED PROVIDERS */}
      <section className="border-t border-gray-200 bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Featured Providers
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
                  Verified
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Top-rated specialists ready for immediate direct booking
              </p>
            </div>
            <Link
              href={`/${lang}/vendors`}
              className="text-xs font-semibold text-[#059669] hover:underline flex items-center gap-1"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Horizontal Scroll Track */}
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
            {providers.map((provider) => {
              const cleanPhone = provider.whatsapp_number.replace(/[^0-9]/g, '');
              const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hello ${provider.name}, I saw your verified profile on Baseera. I need service assistance.`
              )}`;

              return (
                <div
                  key={provider.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 min-w-[280px] sm:min-w-[320px] max-w-[340px] snap-start flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Name & Verified Badge */}
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={provider.avatar_url}
                        alt={provider.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-neutral-900 truncate">
                            {provider.name}
                          </h3>
                          {provider.is_verified && (
                            <BadgeCheck className="w-4 h-4 text-[#059669] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
                          {provider.trade_title}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{provider.rating.toFixed(1)}</span>
                          <span className="text-gray-400 font-normal">({provider.review_count})</span>
                        </div>
                      </div>
                    </div>

                    {/* Coverage area */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{provider.district}, Karachi</span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                      {provider.short_bio}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Visiting</span>
                      <span className="text-xs font-bold text-neutral-900">Rs. {provider.starting_price}</span>
                    </div>

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FLAT VALUE PROPOSITION */}
      <section className="border-t border-gray-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 border border-gray-200 rounded-xl bg-white">
              <ShieldCheck className="w-6 h-6 text-[#059669] mb-3" />
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Direct Verified Karigars</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Specialists submit national identification and technical proof before receiving the green verified badge.
              </p>
            </div>

            <div className="p-5 border border-gray-200 rounded-xl bg-white">
              <CheckCircle2 className="w-6 h-6 text-[#059669] mb-3" />
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Zero Platform Commission</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                No middleman fee or surcharge. 100% of your payment goes directly to the service specialist upon completion.
              </p>
            </div>

            <div className="p-5 border border-gray-200 rounded-xl bg-white">
              <Clock className="w-6 h-6 text-[#059669] mb-3" />
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Instant WhatsApp Connection</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Chat or call specialists directly to discuss fault descriptions, share photos, and agree on timing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
