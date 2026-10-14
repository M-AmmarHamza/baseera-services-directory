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
import FeaturedProvidersSlider from '@/components/FeaturedProvidersSlider';
import { getAllProviders, CATEGORIES, getCategoryName } from '@/lib/db';
import { getDictionary } from '@/lib/get-dictionary';

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
  const dict = await getDictionary(lang);
  const brand = dict?.header?.brandName || 'Baseera';
  const title = dict?.home?.heroTitle ? `${dict.home.heroTitle} | ${brand}` : 'Find Trusted Local Services | Baseera Directory';
  const description = dict?.home?.heroSubtitle || 'Connect directly with verified electricians, plumbers, AC technicians, and local specialists. Zero platform commissions, 100% direct contact.';

  return {
    title,
    description,
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
  const dict = await getDictionary(lang);
  const providers = await getAllProviders();
  const defaultLocation = lang === 'ur' ? 'کراچی، پاکستان' : lang === 'ar' ? 'دبي، الإمارات' : 'Karachi, PK';

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20 md:pb-12">
      {/* 1. HERO SECTION */}
      <section className="border-b border-gray-200 bg-white pt-10 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <span>{dict.home?.badge || 'Direct Karigar & Specialist Directory'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 leading-tight mb-4">
            {dict.home?.heroTitle || 'Find Trusted Local Services'}
          </h1>

          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            {dict.home?.heroSubtitle || 'Connect directly with verified specialists in your area. Zero booking fees, direct WhatsApp communication, and verified ratings.'}
          </p>

          {/* Large Search Bar with Fuzzy Concept & Location Chip */}
          <HomepageSearchBar lang={lang} defaultLocation={defaultLocation} />
        </div>
      </section>

      {/* 2. BROWSE BY SPECIALTY (PREMIUM HORIZONTAL SCROLLABLE SECTION) */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 overflow-hidden scroll-mt-20">
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold leading-snug tracking-tight text-neutral-900">
              {dict.home?.browseBySpecialty || 'Browse by Specialty'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {dict.home?.specialtySubtitle || 'Verified community technicians & specialists worldwide'}
            </p>
          </div>
          <div className="text-sm font-semibold text-emerald-700 whitespace-nowrap shrink-0">
            {CATEGORIES.length} {dict.home?.categoriesCount || 'Categories'}
          </div>
        </div>

        {/* Full Specialty Categories Grid (All 24 Categories in 3 Rows on Desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-3.5">
          {CATEGORIES.map((cat) => {
            const IconComponent = CATEGORY_ICON_MAP[cat.icon] || Wrench;
            return (
              <Link
                key={cat.id}
                href={`/${lang}/pk/karachi/${cat.slug}`}
                className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white hover:border-[#006948] border border-gray-200/80 shadow-2xs hover:shadow-sm transition-all text-center group cursor-pointer"
              >
                {/* Soft circular background behind icon */}
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-[#006948] group-hover:text-white transition-all">
                  <IconComponent className="w-5 h-5" />
                </div>

                {/* Two-line clamped Title */}
                <span className={`font-bold text-xs text-gray-900 group-hover:text-[#006948] transition-colors leading-tight line-clamp-2 ${lang === 'ur' ? 'min-h-[2.5rem] py-0.5' : 'h-8 sm:h-9'} flex items-center justify-center`}>
                  {getCategoryName(cat, lang)}
                </span>

                {/* Active provider count Subtext */}
                <span className="text-xs text-gray-500 font-medium mt-0.5">
                  {cat.count}+ {dict.home?.activeCount || 'Active'}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. CONTINUOUS SLIDING 20 FEATURED PROVIDERS */}
      <section className="border-t border-gray-200 bg-white py-10 sm:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-semibold leading-snug tracking-tight text-neutral-900">
                  {dict.home?.featuredProviders || 'Featured Providers'}
                </h2>
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
                  {dict.home?.verified || 'Verified (20 Specialists)'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {dict.home?.featuredSubtitle || 'Top-rated specialists ready for immediate direct booking'}
              </p>
            </div>
          </div>

          {/* Smooth Auto-Sliding Infinite Carousel with Direct Profile Navigation */}
          <FeaturedProvidersSlider providers={providers} lang={lang} />
        </div>
      </section>

      {/* 4. FLAT VALUE PROPOSITION */}
      <section className="border-t border-gray-200 bg-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 border border-gray-200 rounded-xl bg-white">
              <ShieldCheck className="w-6 h-6 text-[#059669] mb-3" />
              <h3 className="text-lg font-semibold leading-snug text-neutral-900 mb-1.5">{dict.home?.valProp1Title || 'Direct Verified Karigars'}</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                {dict.home?.valProp1Desc || 'Specialists submit national identification and technical proof before receiving the green verified badge.'}
              </p>
            </div>

            <div className="p-4 sm:p-5 border border-gray-200 rounded-xl bg-white">
              <CheckCircle2 className="w-6 h-6 text-[#059669] mb-3" />
              <h3 className="text-lg font-semibold leading-snug text-neutral-900 mb-1.5">{dict.home?.valProp2Title || 'Zero Platform Commission'}</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                {dict.home?.valProp2Desc || 'No middleman fee or surcharge. 100% of your payment goes directly to the service specialist upon completion.'}
              </p>
            </div>

            <div className="p-4 sm:p-5 border border-gray-200 rounded-xl bg-white">
              <Clock className="w-6 h-6 text-[#059669] mb-3" />
              <h3 className="text-lg font-semibold leading-snug text-neutral-900 mb-1.5">{dict.home?.valProp3Title || 'Instant WhatsApp Connection'}</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                {dict.home?.valProp3Desc || 'Chat or call specialists directly to discuss fault descriptions, share photos, and agree on timing.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
