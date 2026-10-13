import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';
import { getProviders, CATEGORIES } from '@/lib/db';
import SearchBar from '@/components/SearchBar';
import { CategoryIcon, MapPin, WhatsAppIcon, Star, BadgeCheck } from '@/components/Icons';

interface PageProps {
  params: Promise<{
    lang: string;
    country: string;
    city: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, country, city } = await params;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const countryCode = country.toUpperCase();
  const countryName = countryCode === 'PK' ? 'Pakistan' : countryCode === 'AE' ? 'United Arab Emirates' : countryCode;

  const title = `Verified Local Services & Technicians in ${cityName}, ${countryName} | Baseera`;
  const description = `Find verified electricians, AC repair specialists, plumbers, and home chefs across ${cityName}. Contact directly on WhatsApp with zero middleman fee.`;
  const canonicalUrl = `${DOMAIN}/${lang}/${country}/${city}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-PK': `${DOMAIN}/en/pk/${city}`,
        'ur-PK': `${DOMAIN}/ur/pk/${city}`,
        'ar-AE': `${DOMAIN}/ar/ae/${city}`,
        'en-AE': `${DOMAIN}/en/ae/${city}`,
        'x-default': `${DOMAIN}/en/pk/karachi`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Baseera',
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'website',
    },
  };
}

export default async function CityHomePage({ params }: PageProps) {
  const { lang, country, city } = await params;
  const dict = await getDictionary(lang);
  const providers = await getProviders(city);

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const countryName = country.toUpperCase() === 'PK' ? 'Pakistan' : country.toUpperCase();

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
    ],
  };

  return (
    <>
      {/* Schema.org Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#006948] via-[#005a3e] to-[#004e35] text-white rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl flex flex-col gap-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold self-start border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{cityName}, {countryName} Directory</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {dict.home.heroTitle} <span className="underline decoration-emerald-400 decoration-wavy underline-offset-8">{cityName}</span>
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-medium">
              {dict.home.heroSubtitle}
            </p>

            {/* Quick Interactive Search Bar */}
            <div className="mt-4">
              <SearchBar
                lang={lang}
                country={country}
                city={city}
                placeholder={dict.common.searchPlaceholder}
                searchButtonText={dict.common.search}
              />
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {dict.home.popularSpecialties}
            </h2>
            <span className="text-xs font-semibold text-emerald-700">{CATEGORIES.length} {dict.common.categories}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/${lang}/${country}/${city}/${cat.slug}`}
                className="bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-emerald-600 hover:shadow-sm transition-all group flex flex-col items-start gap-2.5"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <CategoryIcon id={cat.id} className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm text-gray-900 group-hover:text-emerald-800 transition-colors mt-1">
                  {cat.name}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {cat.count}+ {dict.common.availableNow}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Verified Specialists in this City */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {dict.home.featuredPros} in {cityName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {dict.common.zeroCommission}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.map((pro) => {
              const initials = pro.name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0]?.toUpperCase())
                .join('');

              return (
                <article
                  key={pro.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-600 hover:shadow-md transition-all gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-emerald-50 bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-white shrink-0">
                      {pro.avatar_url && !pro.avatar_url.includes('googleusercontent') ? (
                        <img
                          src={pro.avatar_url}
                          alt={pro.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold">{initials || 'BP'}</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="font-bold text-base text-gray-900 truncate">{pro.name}</h3>
                          {pro.is_verified && (
                            <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 font-extrabold px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          {pro.rating}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-800 font-semibold truncate mt-0.5">
                        {pro.trade_title}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {pro.district}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {pro.short_bio}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <a
                      href={`https://wa.me/${pro.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${pro.name}, I found your profile on Baseera ${cityName}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
                      <span>{dict.common.chatWhatsApp}</span>
                    </a>
                    <Link
                      href={`/${lang}/${country}/${city}/${pro.category_id}/${pro.slug}`}
                      className="py-2.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors"
                    >
                      {dict.common.viewProfile}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

      </div>
    </>
  );
}
