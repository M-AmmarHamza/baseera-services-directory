import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';
import { CATEGORIES, COUNTRIES, getAllProviders } from '@/lib/db';
import GlobalCountryExplorer from '@/components/GlobalCountryExplorer';
import {
  CategoryIcon,
  MapPin,
  BadgeCheck,
  ShieldCheck,
  Star,
  Globe,
  WhatsAppIcon,
  SlidersHorizontal,
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
    title: 'Baseera - Global Direct Local Services Directory | All Countries Worldwide',
    description: 'Find ID-verified electricians, plumbers, AC technicians, and local specialists across all countries and cities globally. Zero commission, direct WhatsApp.',
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
    openGraph: {
      title: 'Baseera - Global Direct Local Services Directory',
      description: 'Connect directly with verified local specialists across the globe without intermediaries or commissions.',
      url: `${DOMAIN}/${lang}`,
      siteName: 'Baseera',
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'website',
    },
  };
}

const PROVIDER_PHOTOS: Record<string, string> = {
  'tariq-mahmood': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK9qWTJzXQzuvOCxeaY9oaT5QnMSIE_WRvPrYq3ndOxqfGwgRJiuusiLQI6ptKnL9aXydagk97uFwsxC7j-gxTH2VH5N_HAJpsT3T0CG_IE0OBqsRNY1C_6XY0VC8sNDh1YBotW-weRk3E7XwleN6ZT1cvkRynmWL_e-anI_it8xQNPs3oqJRRO7Xrk7PfW-P6i2RwcClJxEboVmdY8ZF6bL0HcCJgGu5qW0x9sje5DlC6qn7x4H7V',
  'kashif-ali': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrVEOf4Kmm3ZmFg2SVyQFHc7CD8jvopigKY9y06BL7csj1WLTVWDmQqVt9BLA-VImJWY1FnjTlOTMBdLORMVFgTEdwQKPPqGcSnJWhS5AriQLENY6vHirxqBOzQHMWyqZjRyr6tgRG-1ieePqu9nM2GIZj-GUmMil3H8fWsOahBKbVJj1EXc7oGAdad_P_Cb1e1CbAKo9FYlkkU-0dpz0biB1i9POZASr1lFg6dTIGFODNEO_8u9eb',
  'farzana-kitchen': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZZ3jFfYAUp1f6ZwaA3bw9DUYqcbD067tf2DiX2SWLVRwTUhafGFCOzOzsUTICpmDPFe91mBv1GRm3r-qyUJZbnBeN57VtXsCuKHMVsXx1aioXkyo3Sw6_yQg78DkkPYzj3soUYY7YS49NK-hbHVquzL-bkNCxoWMINuv2OS5c5kG0a8JFOI5irxZcGHL_fDVrQ4YMj7ltf8FV7Xr-DHs1rDSBoxy0sTlo2SIaOGOn_DXV-DBQ1RiE',
  'saleem-master-plumber': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh_sRw3hmV3-7S4eNUd-jVO6bSyp0hVjmvJnXG1oQgcAzN4VP_eIJmZkl_MPu4cn6bdK2L8vqRh-o3t5WJiZO5TxWY_sqrtZ3IEN0Z--_cgbhxjNDSjvWO-GU0eiTs0MbgHl_RKimCrBYqcVeAFD5itfUXN0BPc3h_RqJ7QxAG6T4a8tmK_zj2jjST6iDrmQLd7bRv5r8IvN6HyGLW7O7OZgikD5SLl5PGm5qg8hoKu1pyQ2C9_2vX',
  'rashid-al-nuaimi': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2l4P0wqkni4JXap4ad5Xf4HBbfy1jyDHX3FUdMUrFo0396vlt_xfNg48P99hWFZE-TfWOW8xbOZ9wTZBmkBIz6h6b3dlmcr_B_dxRSiddrF71x29Ia7h2L7mo-1vBv2CzpQwSr_h5VXoM-AFpvpuUudH-fkzbk01Jf_tEy8wB3_C_mYqB23LbrEJlKaJ_qIeVMnySPeESilDDoyKX3XwKFzWuhJSG2QGH2NRvAqye0WBFQ9LEBL63',
  'asif-electric-works': 'https://lh3.googleusercontent.com/aida-public/AB6AXuACSlVNm3bhLWBv4knbPMshpC0z6XDbCFHO9owIwla9r13zDyShNaVeE-6_SV5oOIus3Cv-E8e4_PrNq7vOIzw5rUB0yeL5janUJd5hf3iFGQRMuB87CEt72e-FOdn_hVetda96_-HFtpknnr2Yh5m7-rlh9txcmU0X8cZjac4KfWkX0iTyq-5PMDqRBsFBGaEWN-UO3g3JU71qGhooDGtBY6u8-NHtsoNyy7x53jqBr-HLdaitF7Jv',
};

export default async function GlobalPortalPage({ params }: LocalePageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const allPros = await getAllProviders();
  const featuredPros = allPros.slice(0, 6);

  return (
    <div className="bg-[#f9f9ff] min-h-screen text-[#141b2b]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 md:pb-16 flex flex-col gap-12">
        
        {/* Exact Legacy Centered Hero Section */}
        <section className="flex flex-col items-center text-center pt-4 md:pt-8 pb-2 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006948] text-xs font-bold border border-emerald-200">
              <Globe className="w-3.5 h-3.5 text-[#006948]" />
              Worldwide Local Directory
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
              Direct WhatsApp Inquiries
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl text-gray-950 tracking-tight font-extrabold leading-tight mt-1 mb-3">
            Find Trusted Local Services Worldwide
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 max-w-2xl">
            Connect directly with verified local specialists across the globe without intermediaries, commissions, or delay.
          </p>

          {/* Search Box - Exact Legacy Style */}
          <div className="relative w-full max-w-2xl">
            <div className="flex items-center w-full bg-[#f1f3ff] rounded-2xl px-4 py-3.5 shadow-2xs transition-all focus-within:bg-white focus-within:shadow-md border border-gray-200/80">
              <span className="text-gray-400 mr-3 select-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                id="serviceSearch"
                placeholder="Search electrician, plumber, AC repair, home chef in your city..."
                type="text"
              />
              <button
                aria-label="Filter"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-200/60 text-gray-700 ml-1 hover:bg-gray-300/80 transition-colors"
                type="button"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Hub Filter Chips */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <Link
              href={`/${lang}`}
              className="px-3.5 py-1.5 rounded-full bg-[#006948] text-white text-xs font-semibold shadow-xs"
            >
              All Countries
            </Link>
            <Link
              href={`/${lang}/pk/karachi`}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors flex items-center gap-1.5"
            >
              <span>🇵🇰</span>
              <span>Pakistan</span>
            </Link>
            <Link
              href={`/${lang}/ae/dubai`}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors flex items-center gap-1.5"
            >
              <span>🇦🇪</span>
              <span>UAE</span>
            </Link>
            <Link
              href={`/${lang}/sa/riyadh`}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors flex items-center gap-1.5"
            >
              <span>🇸🇦</span>
              <span>Saudi Arabia</span>
            </Link>
            <Link
              href={`/${lang}/gb/london`}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors flex items-center gap-1.5"
            >
              <span>🇬🇧</span>
              <span>UK</span>
            </Link>
            <Link
              href={`/${lang}/us/new-york`}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors flex items-center gap-1.5"
            >
              <span>🇺🇸</span>
              <span>USA</span>
            </Link>
            <Link
              href={`/${lang}/ca/toronto`}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors flex items-center gap-1.5"
            >
              <span>🇨🇦</span>
              <span>Canada</span>
            </Link>
            <Link
              href={`/${lang}/au/sydney`}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors flex items-center gap-1.5"
            >
              <span>🇦🇺</span>
              <span>Australia</span>
            </Link>
          </div>
        </section>

        {/* Exact Legacy Browse by Specialty Grid */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
                Browse by Specialty
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Verified community technicians & specialists worldwide
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
                <div className="w-12 h-12 rounded-full bg-[#f1f3ff] text-[#006948] flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-[#006948] group-hover:text-white transition-all shadow-2xs">
                  <CategoryIcon id={cat.id} className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-gray-900 group-hover:text-[#006948] transition-colors leading-tight">
                  {cat.name}
                </span>
                <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                  {cat.count}+ Active
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Global Country & City Explorer (Supports Every Country) */}
        <GlobalCountryExplorer lang={lang} />

        {/* Featured Verified Specialists - Exact Legacy Card Style */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
                Featured Verified Providers
              </h2>
              <p className="text-xs text-gray-500">
                Screened identity and local residential credentials
              </p>
            </div>
            <Link
              href={`/${lang}/pk/karachi`}
              className="text-xs text-[#006948] font-bold hover:underline"
            >
              View All Directory →
            </Link>
          </div>

          {/* Cards: Horizontal Scroll on Mobile, 3-Col Grid on Desktop */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pt-0.5 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible">
            {featuredPros.map((pro) => {
              const coverImg =
                PROVIDER_PHOTOS[pro.slug] ||
                pro.avatar_url ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBK9qWTJzXQzuvOCxeaY9oaT5QnMSIE_WRvPrYq3ndOxqfGwgRJiuusiLQI6ptKnL9aXydagk97uFwsxC7j-gxTH2VH5N_HAJpsT3T0CG_IE0OBqsRNY1C_6XY0VC8sNDh1YBotW-weRk3E7XwleN6ZT1cvkRynmWL_e-anI_it8xQNPs3oqJRRO7Xrk7PfW-P6i2RwcClJxEboVmdY8ZF6bL0HcCJgGu5qW0x9sje5DlC6qn7x4H7V';

              const profileLink = `/${lang}/${pro.country_code}/${pro.city_slug}/${pro.category_id}/${pro.slug}`;
              const defaultTags = pro.service_area && pro.service_area.length > 0 
                ? pro.service_area.slice(0, 3) 
                : ['3-Phase Wiring', 'Short Circuit', 'Maintenance'];

              return (
                <div
                  key={pro.id}
                  className="flex flex-col w-[290px] shrink-0 md:w-auto md:shrink bg-[#f1f3ff]/60 rounded-2xl p-4 shadow-2xs justify-between hover:shadow-md transition-all border border-gray-200/70"
                >
                  <div>
                    {/* Cover photo with rating and verified badge - Exact Legacy */}
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
                        <span className="text-[11px] text-gray-500">({pro.review_count})</span>
                      </div>
                      {pro.is_verified && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-[#006948] text-white px-2 py-0.5 rounded-md text-[11px] font-bold shadow-xs">
                          <BadgeCheck className="w-3.5 h-3.5 text-white" />
                          <span>Verified Pro</span>
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <Link
                          href={profileLink}
                          className="font-bold text-base text-gray-950 truncate hover:text-[#006948] transition-colors"
                        >
                          {pro.name}
                        </Link>
                        <span className="text-[11px] text-[#006948] font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          {pro.is_available ? 'Available' : 'Quick Reply'}
                        </span>
                      </div>
                      <p className="text-xs text-[#006948] font-semibold mt-0.5 truncate">
                        {pro.trade_title}
                      </p>
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{pro.district}, {pro.city_slug.toUpperCase()}</span>
                      </div>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1 mt-2.5 mb-3.5">
                        {defaultTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-white border border-gray-200/70 text-gray-700 text-[11px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Direct Action Button - Exact Legacy Full Width */}
                  <a
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#006948] text-white text-xs font-bold active:opacity-90 transition-all hover:bg-[#00855d] shadow-2xs"
                    href={`https://wa.me/${pro.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(`Salam ${pro.name}, found your profile on Baseera directory.`)}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-white fill-current" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* Exact Legacy Trust & Resource Banners */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 flex items-start gap-4 border border-gray-200/80 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#006948]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-gray-950">Zero Commission, Direct Contact</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Baseera does not charge middlemen fees. Discuss requirements, timing, and rates directly with technicians over WhatsApp in any country.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-start gap-4 border border-gray-200/80 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-100/50 text-[#006948] flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6 text-[#006948]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-gray-950">Worldwide Local Directory</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Empowering independent technicians and local service providers in every neighborhood across Asia, Middle East, Europe, Americas, and beyond.
              </p>
              <Link
                href={`/${lang}/pk/karachi`}
                className="inline-flex items-center gap-1 text-xs text-[#006948] font-bold mt-2 hover:underline"
              >
                <span>View Resident Directory</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
