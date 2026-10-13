import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';
import { CATEGORIES, COUNTRIES, CITIES } from '@/lib/db';
import {
  CategoryIcon,
  MapPin,
  BadgeCheck,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Globe,
  WhatsAppIcon,
} from '@/components/Icons';

interface LocalePageProps {
  params: Promise<{
    lang: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Baseera - Global Direct Local Services Directory | Pakistan, UAE, Saudi Arabia',
    description: 'Find ID-verified electricians, plumbers, AC technicians, and local specialists across Karachi, Lahore, Dubai, Sharjah, and Riyadh. Zero commission.',
    alternates: {
      canonical: `${DOMAIN}/${lang}`,
      languages: {
        'en-PK': `${DOMAIN}/en/pk/karachi`,
        'ur-PK': `${DOMAIN}/ur/pk/karachi`,
        'ar-AE': `${DOMAIN}/ar/ae/dubai`,
        'en-AE': `${DOMAIN}/en/ae/dubai`,
        'x-default': `${DOMAIN}/en`,
      },
    },
  };
}

export default async function GlobalPortalPage({ params }: LocalePageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const countryCards = [
    {
      country: 'Pakistan',
      code: 'pk',
      flag: '🇵🇰',
      badge: 'Active & Verified',
      cities: [
        { slug: 'karachi', name: 'Karachi', status: 'Live (42+ Pros)', isPrimary: true },
        { slug: 'lahore', name: 'Lahore', status: 'Active Network', isPrimary: false },
        { slug: 'islamabad', name: 'Islamabad', status: 'Capital Region', isPrimary: false },
      ],
    },
    {
      country: 'United Arab Emirates',
      code: 'ae',
      flag: '🇦🇪',
      badge: 'Certified Technicians',
      cities: [
        { slug: 'dubai', name: 'Dubai', status: 'Live (HVAC & AC)', isPrimary: true },
        { slug: 'sharjah', name: 'Sharjah', status: 'Coming Soon', isPrimary: false },
        { slug: 'abu-dhabi', name: 'Abu Dhabi', status: 'Corporate Hub', isPrimary: false },
      ],
    },
    {
      country: 'Saudi Arabia',
      code: 'sa',
      flag: '🇸🇦',
      badge: 'Regional Network',
      cities: [
        { slug: 'riyadh', name: 'Riyadh', status: 'Capital City', isPrimary: true },
        { slug: 'jeddah', name: 'Jeddah', status: 'Coastal Specialists', isPrimary: false },
      ],
    },
  ];

  return (
    <div className="bg-[#f9f9ff] min-h-screen text-[#141b2b]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-16 flex flex-col gap-12">
        
        {/* Global Hero Section */}
        <section className="flex flex-col items-center text-center pt-6 md:pt-12 pb-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006948] text-xs font-bold border border-emerald-200">
              <Globe className="w-3.5 h-3.5 text-[#006948]" />
              Global Local Services Directory
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
              3 Countries • 8 Cities
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl text-gray-950 tracking-tight font-extrabold leading-tight mt-1 mb-4">
            Find Trusted Local Services Across Borders
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl">
            Direct WhatsApp connection with verified electricians, AC specialists, plumbers, and technicians across Pakistan, UAE, and Saudi Arabia without agency commissions.
          </p>

          {/* Quick Country Hub Pills */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href={`/${lang}/pk/karachi`}
              className="px-5 py-2.5 rounded-2xl bg-[#006948] text-white text-sm font-bold shadow-sm hover:bg-[#00855d] transition-all flex items-center gap-2"
            >
              <span>🇵🇰</span>
              <span>Pakistan (Karachi)</span>
            </Link>
            <Link
              href={`/${lang}/ae/dubai`}
              className="px-5 py-2.5 rounded-2xl bg-white text-gray-800 text-sm font-bold border border-gray-200 shadow-2xs hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <span>🇦🇪</span>
              <span>UAE (Dubai)</span>
            </Link>
            <Link
              href={`/${lang}/sa/riyadh`}
              className="px-5 py-2.5 rounded-2xl bg-white text-gray-800 text-sm font-bold border border-gray-200 shadow-2xs hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <span>🇸🇦</span>
              <span>Saudi Arabia (Riyadh)</span>
            </Link>
          </div>
        </section>

        {/* Global Regional Directories Grid */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
                Select Your City & Region
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Choose your locality to view locally ID-screened technicians
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {countryCards.map((c) => (
              <div
                key={c.code}
                className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between gap-5 hover:border-[#006948] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{c.flag}</span>
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-950">{c.country}</h3>
                        <span className="text-xs text-gray-400 font-medium">{c.code.toUpperCase()} Hub</span>
                      </div>
                    </div>
                    <span className="text-[11px] bg-emerald-50 text-[#006948] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
                      {c.badge}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                    {c.cities.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/${lang}/${c.code}/${city.slug}`}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                          city.isPrimary
                            ? 'bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/60'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#006948]" />
                          <span className="font-bold text-sm text-gray-900 group-hover:text-[#006948] transition-colors">
                            {city.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          {city.status}
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/${lang}/${c.code}/${c.cities[0].slug}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-[#006948] hover:text-white text-gray-800 text-xs font-bold transition-all text-center"
                >
                  Explore {c.country} Directory →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Global Specialties Directory */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
                Global Service Specialties
              </h2>
              <p className="text-xs text-gray-500">
                Verified community professionals ready for direct dispatch
              </p>
            </div>
            <span className="text-xs text-[#006948] font-bold">
              {CATEGORIES.length} Categories
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/${lang}/pk/karachi/${cat.slug}`}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white hover:border-[#006948] border border-gray-200/80 shadow-2xs hover:shadow-sm transition-all text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-[#006948] group-hover:text-white transition-all">
                  <CategoryIcon id={cat.id} className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-gray-900 group-hover:text-[#006948] transition-colors leading-tight">
                  {cat.name}
                </span>
                <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                  Verified
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust & Zero Commission Banner */}
        <section className="bg-gradient-to-br from-[#006948] to-[#004e35] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold self-start border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              100% Direct Model
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Zero Intermediary Commissions. Direct WhatsApp Leads.
            </h3>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Baseera never takes a cut of technician wages or customer invoices. You connect directly with screened independent workers in your area.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href={`/${lang}/pk/karachi`}
              className="px-6 py-3 rounded-xl bg-white text-[#006948] font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm"
            >
              Start in Karachi
            </Link>
            <Link
              href={`/${lang}/ae/dubai`}
              className="px-6 py-3 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-xs border border-white/20 transition-colors"
            >
              Start in Dubai
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
