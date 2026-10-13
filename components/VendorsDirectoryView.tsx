'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Provider, CATEGORIES } from '@/lib/db';
import {
  BadgeCheck,
  Star,
  MapPin,
  WhatsAppIcon,
  Search,
  ChevronRight,
  ArrowRight,
  SlidersHorizontal,
} from '@/components/Icons';

interface Props {
  initialProviders: Provider[];
  lang: string;
}

const PROVIDER_PHOTOS: Record<string, string> = {
  'tariq-mahmood': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK9qWTJzXQzuvOCxeaY9oaT5QnMSIE_WRvPrYq3ndOxqfGwgRJiuusiLQI6ptKnL9aXydagk97uFwsxC7j-gxTH2VH5N_HAJpsT3T0CG_IE0OBqsRNY1C_6XY0VC8sNDh1YBotW-weRk3E7XwleN6ZT1cvkRynmWL_e-anI_it8xQNPs3oqJRRO7Xrk7PfW-P6i2RwcClJxEboVmdY8ZF6bL0HcCJgGu5qW0x9sje5DlC6qn7x4H7V',
  'kashif-ali': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrVEOf4Kmm3ZmFg2SVyQFHc7CD8jvopigKY9y06BL7csj1WLTVWDmQqVt9BLA-VImJWY1FnjTlOTMBdLORMVFgTEdwQKPPqGcSnJWhS5AriQLENY6vHirxqBOzQHMWyqZjRyr6tgRG-1ieePqu9nM2GIZj-GUmMil3H8fWsOahBKbVJj1EXc7oGAdad_P_Cb1e1CbAKo9FYlkkU-0dpz0biB1i9POZASr1lFg6dTIGFODNEO_8u9eb',
  'farzana-kitchen': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZZ3jFfYAUp1f6ZwaA3bw9DUYqcbD067tf2DiX2SWLVRwTUhafGFCOzOzsUTICpmDPFe91mBv1GRm3r-qyUJZbnBeN57VtXsCuKHMVsXx1aioXkyo3Sw6_yQg78DkkPYzj3soUYY7YS49NK-hbHVquzL-bkNCxoWMINuv2OS5c5kG0a8JFOI5irxZcGHL_fDVrQ4YMj7ltf8FV7Xr-DHs1rDSBoxy0sTlo2SIaOGOn_DXV-DBQ1RiE',
  'saleem-master-plumber': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh_sRw3hmV3-7S4eNUd-jVO6bSyp0hVjmvJnXG1oQgcAzN4VP_eIJmZkl_MPu4cn6bdK2L8vqRh-o3t5WJiZO5TxWY_sqrtZ3IEN0Z--_cgbhxjNDSjvWO-GU0eiTs0MbgHl_RKimCrBYqcVeAFD5itfUXN0BPc3h_RqJ7QxAG6T4a8tmK_zj2jjST6iDrmQLd7bRv5r8IvN6HyGLW7O7OZgikD5SLl5PGm5qg8hoKu1pyQ2C9_2vX',
  'rashid-al-nuaimi': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2l4P0wqkni4JXap4ad5Xf4HBbfy1jyDHX3FUdMUrFo0396vlt_xfNg48P99hWFZE-TfWOW8xbOZ9wTZBmkBIz6h6b3dlmcr_B_dxRSiddrF71x29Ia7h2L7mo-1vBv2CzpQwSr_h5VXoM-AFpvpuUudH-fkzbk01Jf_tEy8wB3_C_mYqB23LbrEJlKaJ_qIeVMnySPeESilDDoyKX3XwKFzWuhJSG2QGH2NRvAqye0WBFQ9LEBL63',
  'asif-electric-works': 'https://lh3.googleusercontent.com/aida-public/AB6AXuACSlVNm3bhLWBv4knbPMshpC0z6XDbCFHO9owIwla9r13zDyShNaVeE-6_SV5oOIus3Cv-E8e4_PrNq7vOIzw5rUB0yeL5janUJd5hf3iFGQRMuB87CEt72e-FOdn_hVetda96_-HFtpknnr2Yh5m7-rlh9txcmU0X8cZjac4KfWkX0iTyq-5PMDqRBsFBGaEWN-UO3g3JU71qGhooDGtBY6u8-NHtsoNyy7x53jqBr-HLdaitF7Jv',
};

export default function VendorsDirectoryView({ initialProviders, lang }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'shop'>('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  const filteredProviders = useMemo(() => {
    return initialProviders.filter((pro) => {
      // Category filter
      if (selectedCat !== 'all' && pro.category_id !== selectedCat) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'all' && pro.profile_type !== typeFilter) {
        return false;
      }
      // Availability filter
      if (availableOnly && !pro.is_available) {
        return false;
      }
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = pro.name.toLowerCase().includes(q);
        const matchTitle = pro.trade_title.toLowerCase().includes(q);
        const matchBio = pro.short_bio.toLowerCase().includes(q);
        const matchDistrict = pro.district.toLowerCase().includes(q);
        const matchCity = pro.city_slug.toLowerCase().includes(q);
        const matchArea = pro.service_area.some((a) => a.toLowerCase().includes(q));
        if (!matchName && !matchTitle && !matchBio && !matchDistrict && !matchCity && !matchArea) {
          return false;
        }
      }
      return true;
    });
  }, [initialProviders, selectedCat, typeFilter, availableOnly, search]);

  return (
    <div className="bg-[#f9f9ff] min-h-screen text-[#141b2b]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-16 flex flex-col gap-6">
        
        {/* Top Header Section - Exact Legacy Categories Style */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-1.5 text-[#006948] font-bold text-xs uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
              <span>Verified Service Specialists</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
              All Listed Vendors &amp; Specialists
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Browse community technicians, electricians, plumbers, and local specialists. Connect directly on WhatsApp with zero agency commissions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/${lang}/join`}
              className="px-4 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>+ List Your Service (Free)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Search Bar */}
        <div className="relative w-full">
          <div className="flex items-center w-full bg-white rounded-2xl px-4 py-3 shadow-2xs border border-gray-200/80 focus-within:border-[#006948] focus-within:ring-1 focus-within:ring-[#006948] transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendor by name, specialty, neighborhood, or city (e.g. Tariq, PECHS, AC repair)..."
              className="w-full bg-transparent text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips Bar - Exact Legacy Style */}
        <div className="flex flex-col gap-2.5">
          {/* Classification & Availability Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => {
                setTypeFilter('all');
                setAvailableOnly(false);
                setSelectedCat('all');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === 'all' && !availableOnly && selectedCat === 'all'
                  ? 'bg-[#006948] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
              }`}
            >
              All Vendors ({initialProviders.length})
            </button>

            <button
              onClick={() => setTypeFilter(typeFilter === 'individual' ? 'all' : 'individual')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === 'individual'
                  ? 'bg-[#006948] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
              }`}
            >
              Individual Karigars
            </button>

            <button
              onClick={() => setTypeFilter(typeFilter === 'shop' ? 'all' : 'shop')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === 'shop'
                  ? 'bg-[#006948] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
              }`}
            >
              Agencies &amp; Shops
            </button>

            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                availableOnly
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Available Today</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(selectedCat === cat.id ? 'all' : cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCat === cat.id
                    ? 'bg-[#006948] text-white shadow-2xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/70'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Listing Grid */}
        {filteredProviders.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {filteredProviders.map((pro) => {
              const coverImg =
                PROVIDER_PHOTOS[pro.slug] ||
                pro.avatar_url ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBK9qWTJzXQzuvOCxeaY9oaT5QnMSIE_WRvPrYq3ndOxqfGwgRJiuusiLQI6ptKnL9aXydagk97uFwsxC7j-gxTH2VH5N_HAJpsT3T0CG_IE0OBqsRNY1C_6XY0VC8sNDh1YBotW-weRk3E7XwleN6ZT1cvkRynmWL_e-anI_it8xQNPs3oqJRRO7Xrk7PfW-P6i2RwcClJxEboVmdY8ZF6bL0HcCJgGu5qW0x9sje5DlC6qn7x4H7V';

              const profileLink = `/${lang}/${pro.country_code}/${pro.city_slug}/${pro.category_id}/${pro.slug}`;
              const defaultTags =
                pro.service_area && pro.service_area.length > 0
                  ? pro.service_area.slice(0, 3)
                  : ['Quick Response', 'Work Guarantee', 'Verified'];

              return (
                <article
                  key={pro.id}
                  className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex flex-col justify-between hover:border-[#006948] hover:shadow-md transition-all gap-4"
                >
                  <div>
                    {/* Cover photo with rating and verified badge */}
                    <Link
                      href={profileLink}
                      className="block relative w-full h-36 rounded-xl overflow-hidden mb-3 bg-gray-100 group"
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
                          {pro.is_available ? 'Available Now' : 'Quick Reply'}
                        </span>
                      </div>
                      <p className="text-xs text-[#006948] font-semibold mt-0.5 truncate">
                        {pro.trade_title}
                      </p>
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{pro.district}, {pro.city_slug.toUpperCase()}</span>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-2">
                        {pro.short_bio}
                      </p>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1 mt-2.5 mb-1">
                        {defaultTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200/70 text-gray-700 text-[11px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Full Width WhatsApp Button + View Profile Link */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <a
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[#006948] text-white text-xs font-bold active:opacity-90 transition-all hover:bg-[#00855d] shadow-2xs"
                      href={`https://wa.me/${pro.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(`Salam ${pro.name}, saw your profile on Baseera directory.`)}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-white fill-current" />
                      <span>Chat on WhatsApp</span>
                    </a>
                    <Link
                      href={profileLink}
                      className="h-10 px-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center justify-center transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          /* Empty Search State */
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200/80 max-w-lg mx-auto flex flex-col items-center gap-4 my-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                No vendors found matching your filters
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Try clearing search terms or selected category filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCat('all');
                setTypeFilter('all');
                setAvailableOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Vendor Onboarding Sticky CTA Banner */}
        <section className="bg-gradient-to-br from-[#006948] to-[#004e35] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm mt-4">
          <div className="flex flex-col gap-1.5 max-w-xl">
            <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider">
              Are you a service specialist?
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              List Your Services on Baseera (100% Free)
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Create your verified public profile page in under 2 minutes. Receive direct customer inquiries on WhatsApp with zero commissions.
            </p>
          </div>
          <Link
            href={`/${lang}/join`}
            className="px-6 py-3 rounded-xl bg-white text-[#006948] font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm shrink-0"
          >
            Create Your Vendor Listing →
          </Link>
        </section>

      </main>
    </div>
  );
}
