import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';
import { getProviders, CATEGORIES } from '@/lib/db';
import SearchBar from '@/components/SearchBar';
import {
  CategoryIcon,
  MapPin,
  WhatsAppIcon,
  Star,
  BadgeCheck,
  Clock,
} from '@/components/Icons';

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

  const title = `Baseera ${cityName} - Direct Local Services Directory`;
  const description = `Connect directly with verified local specialists across ${cityName} without intermediaries, commissions, or delay.`;
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
  const countryCode = country.toUpperCase();

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
        name: countryCode,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-[#f9f9ff] min-h-screen text-[#141b2b]">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 md:pb-16 flex flex-col gap-10">
          
          {/* Original Centered Hero Section */}
          <section className="flex flex-col items-center text-center pt-4 md:pt-8 pb-4 max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006948] text-xs font-semibold border border-emerald-100">
                <MapPin className="w-3.5 h-3.5 text-[#006948]" />
                {cityName}, {countryCode}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
                Direct WhatsApp Inquiries
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl text-gray-950 tracking-tight font-extrabold leading-tight mt-1 mb-3">
              Find Trusted Local Services in {cityName}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 max-w-2xl">
              Connect directly with verified local specialists across {cityName} without intermediaries, commissions, or delay.
            </p>

            {/* Centered Search Bar */}
            <div className="w-full max-w-2xl">
              <SearchBar
                lang={lang}
                country={country}
                city={city}
                placeholder="Search electrician, plumber, AC repair, home chef..."
                searchButtonText="Search"
              />
            </div>

            {/* Quick District Filter Chips */}
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <Link
                href={`/${lang}/${country}/${city}`}
                className="px-3.5 py-1.5 rounded-full bg-[#006948] text-white text-xs font-semibold shadow-xs"
              >
                All Districts
              </Link>
              <Link
                href={`/${lang}/${country}/${city}/search?q=dha`}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors"
              >
                DHA & Clifton
              </Link>
              <Link
                href={`/${lang}/${country}/${city}/search?q=gulshan`}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors"
              >
                Gulshan-e-Iqbal
              </Link>
              <Link
                href={`/${lang}/${country}/${city}/search?q=pechs`}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors"
              >
                PECHS
              </Link>
              <Link
                href={`/${lang}/${country}/${city}/search?q=orangi`}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors"
              >
                Orangi Town
              </Link>
              <Link
                href={`/${lang}/${country}/${city}/search?q=nazimabad`}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors"
              >
                North Nazimabad
              </Link>
            </div>
          </section>

          {/* Original Browse by Specialty Grid */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
                  Browse by Specialty
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Verified community technicians & cooks
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
                  href={`/${lang}/${country}/${city}/${cat.slug}`}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white hover:border-[#006948] border border-gray-200/80 shadow-2xs hover:shadow-sm transition-all text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-[#006948] group-hover:text-white transition-all">
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

          {/* Featured Community Specialists */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
                  Featured Verified Specialists
                </h2>
                <p className="text-xs text-gray-500">
                  Direct connection with zero intermediary commissions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {providers.map((pro) => (
                <article
                  key={pro.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-[#006948] hover:shadow-md transition-all gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-full p-0.5 bg-white shadow-sm ring-1 ring-gray-200 shrink-0">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA84TvpKa_OrpS-BmIb4qthfCfN90ePqFFE1w3zZ1W1t0QnCDE01ml3JvyvWooDh3UeVYxH1zJrpixrUq7VK41FnMwB4a3wKAnb4y_XIl5SXCd463My2u_Ai2RbIVoLrxNQf_7bmcpESeI7zTERnyNGBfKMLwoxwEq48LOPm9fevQtc_gTZm77hqmbz8m2swCu1dC5-LKhe7KnSfZBv0pvKTS4LQBmPiXCFDDo1iw5tBxTxbrbNqwjw"
                        alt={pro.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="font-bold text-base text-gray-900 truncate">{pro.name}</h3>
                          {pro.is_verified && (
                            <BadgeCheck className="w-4 h-4 text-[#006948] shrink-0" />
                          )}
                        </div>
                        <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 font-extrabold px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          {pro.rating}
                        </span>
                      </div>
                      <span className="text-xs text-[#006948] font-bold truncate mt-0.5">
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
                      <span>Chat on WhatsApp</span>
                    </a>
                    <Link
                      href={`/${lang}/${country}/${city}/${pro.category_id}/${pro.slug}`}
                      className="py-2.5 px-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

        </main>
      </div>
    </>
  );
}
