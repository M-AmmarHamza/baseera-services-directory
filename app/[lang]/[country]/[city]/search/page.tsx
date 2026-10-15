import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';
import { CATEGORIES, getCategoryBySlug, getCategoryName } from '@/lib/db';
import { searchProviders } from '@/lib/search';
import { formatVisitingPrice } from '@/lib/currencies';
import SearchBar from '@/components/SearchBar';
import {
  MapPin,
  BadgeCheck,
  WhatsAppIcon,
  Star,
  Search,
  SlidersHorizontal,
  Headphones,
  ArrowRight,
  AlertCircle,
  ChevronRight,
} from '@/components/Icons';

interface SearchPageProps {
  params: Promise<{
    lang: string;
    country: string;
    city: string;
  }>;
  searchParams: Promise<{
    q?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { city } = await params;
  const { q } = await searchParams;
  const query = q || '';
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  return {
    title: query
      ? `Results for "${query}" in ${cityName} | Baseera`
      : `Search Verified Technicians in ${cityName} | Baseera`,
    description: `Search verified plumbers, electricians, AC technicians, and home chefs across ${cityName}. Direct WhatsApp contact with zero platform fee.`,
  };
}

export default async function SearchResultsPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { lang, country, city } = await params;
  const { q } = await searchParams;
  const dict = await getDictionary(lang);
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  const analysis = await searchProviders(city, q || '');
  const {
    originalQuery,
    detectedCategoryId,
    detectedCategoryName,
    detectedArea,
    exactMatches,
    nearbyCityMatches,
  } = analysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center text-xs font-semibold text-gray-500 gap-1.5 overflow-x-auto whitespace-nowrap py-1">
        <Link href={`/${lang}/pk/karachi`} className="hover:text-emerald-800 transition-colors">
          {dict.header?.home || dict.nav?.home || "Home"}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
        <Link href={`/${lang}/${country}/${city}`} className="hover:text-emerald-800 transition-colors">
          {cityName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
        <span className="text-emerald-800 font-bold">Search</span>
      </nav>

      {/* Search Header Banner */}
      <section className="bg-gradient-to-br from-[#006948] via-[#005a3e] to-[#004e35] text-white rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Search className="w-3.5 h-3.5" />
            <span>Search Results in {cityName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {originalQuery ? (
              <span>
                Search: &ldquo;<span className="text-emerald-200">{originalQuery}</span>&rdquo;
              </span>
            ) : (
              <span>Search Verified Local Technicians</span>
            )}
          </h1>
        </div>

        {/* Live Search Bar */}
        <div className="mt-1">
          <SearchBar
            lang={lang}
            country={country}
            city={city}
            defaultValue={originalQuery}
            placeholder={dict.common.searchPlaceholder}
            searchButtonText={dict.common.search}
          />
        </div>

        {/* Filter Pills Showing What Was Detected */}
        {(detectedCategoryName || detectedArea) && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-emerald-200 font-medium">Smart Filter Detected:</span>
            {detectedCategoryName && (
              <span className="bg-emerald-400/20 text-white border border-emerald-300/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Category: {detectedCategoryName}
              </span>
            )}
            {detectedArea && (
              <span className="bg-emerald-400/20 text-white border border-emerald-300/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Area: {detectedArea}
              </span>
            )}
          </div>
        )}
      </section>

      {/* Main Results Listing */}
      {exactMatches.length > 0 ? (
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug">
                Verified Specialists Matching Your Query
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {exactMatches.length} verified technician{exactMatches.length > 1 ? 's' : ''} directly available on WhatsApp
              </p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              {exactMatches.length} Found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exactMatches.map((pro) => {
              const initials = pro.name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0]?.toUpperCase())
              const catObj = getCategoryBySlug(pro.category_id);
              const categoryName = catObj ? getCategoryName(catObj, lang) : pro.category_id;

              return (
                <article
                  key={pro.id}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between hover:border-emerald-600 hover:shadow-md transition-all gap-5"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-emerald-50 bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-white shrink-0">
                        {pro.avatar_url && !pro.avatar_url.includes('googleusercontent') ? (
                          <img
                            src={pro.avatar_url}
                            alt={pro.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-base font-bold">{initials || 'BP'}</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 truncate leading-snug">{pro.name}</h3>
                            {pro.is_verified && (
                              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 font-extrabold px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            {pro.rating}
                          </span>
                        </div>
                        <span className={`text-xs sm:text-sm text-emerald-800 font-bold truncate mt-0.5 ${lang === 'ur' ? 'font-urdu leading-[2.2]' : ''}`}>
                          {categoryName}
                        </span>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate font-medium text-emerald-800">{pro.district}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-base text-gray-600 line-clamp-3 leading-relaxed mt-4">
                      {pro.short_bio}
                    </p>

                    {/* Coverage tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {pro.service_area.slice(0, 4).map((area) => {
                        const isTargetArea = detectedArea && area.toLowerCase().includes(detectedArea.toLowerCase());
                        return (
                          <span
                            key={area}
                            className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                              isTargetArea
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {area}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-gray-500 font-medium block">{dict.profile.pricingFrom}</span>
                      <span className="text-base font-extrabold text-gray-900">
                        {formatVisitingPrice(pro.starting_price, pro.country_code || country)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${lang}/${country}/${city}/${pro.category_id}/${pro.slug}`}
                        className="py-2.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors"
                      >
                        {dict.common.viewProfile}
                      </Link>
                      <a
                        href={`https://wa.me/${pro.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${pro.name}, I found your profile on Baseera ${cityName}. I am looking for service in ${detectedArea || pro.district}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
                        <span>{dict.common.chatWhatsApp}</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        /* 🚨 ZERO RESULTS FOR THIS AREA/CATEGORY: Smart Empty State (Never Show Misleading Unrelated Pros) */
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 text-center flex flex-col items-center max-w-3xl mx-auto gap-6 my-2 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center ring-8 ring-amber-50/50">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-gray-950 tracking-tight">
              No Verified {detectedCategoryName || 'Technicians'} Found Specifically in &ldquo;{detectedArea || originalQuery}&rdquo;
            </h2>
            <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
              We did not find a registered {detectedCategoryName ? detectedCategoryName.toLowerCase() : 'service provider'} with dedicated service coverage in {detectedArea || 'this specific neighborhood'} yet.
            </p>
          </div>

          {/* Lead Catching CTA */}
          <div className="w-full bg-[#f9f9ff] rounded-2xl p-6 border border-emerald-100 text-start flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-emerald-700" />
              <span className="font-bold text-sm text-gray-900">
                Need urgent assistance in {detectedArea || cityName}?
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our regional coordinator can arrange a mobile verified specialist from a neighboring sector for your task.
            </p>

            <a
              href={`https://wa.me/923332145890?text=${encodeURIComponent(`Assalam-o-Alaikum Baseera, I need a verified ${detectedCategoryName || 'technician'} in ${detectedArea || originalQuery} (${cityName}). Can you help connect me?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all self-start shadow-sm"
            >
              <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
              <span>Request {detectedCategoryName || 'Specialist'} via WhatsApp Coordinator</span>
              <ArrowRight className="w-4 h-4 text-white shrink-0 rtl:rotate-180" />
            </a>
          </div>

          {/* Nearby City Providers in the Same Category */}
          {nearbyCityMatches.length > 0 && (
            <div className="w-full pt-6 border-t border-gray-100 flex flex-col gap-4 text-start">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Verified {detectedCategoryName} in Other Areas of {cityName}
                </h3>
                <p className="text-xs text-gray-500">
                  These verified experts operate in neighboring districts and may travel to {detectedArea || 'your area'} on advance booking:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nearbyCityMatches.map((pro) => (
                  <div
                    key={pro.id}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                        {pro.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-gray-900 truncate">{pro.name}</span>
                        <span className="text-xs text-gray-500 truncate">{pro.district}</span>
                      </div>
                    </div>
                    <Link
                      href={`/${lang}/${country}/${city}/${pro.category_id}/${pro.slug}`}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-white shrink-0 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explore all categories */}
          <div className="w-full pt-4 border-t border-gray-100 flex flex-wrap justify-center items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Browse All Categories:</span>
            {CATEGORIES.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/${lang}/${country}/${city}/${c.slug}`}
                className="text-xs bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 font-semibold px-3 py-1 rounded-full transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
