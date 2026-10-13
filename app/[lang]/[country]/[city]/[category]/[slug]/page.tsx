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
    slug: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateMetadata({ params }: ProviderPageProps): Promise<Metadata> {
  const { lang, country, city, category, slug } = await params;
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
        'en-AE': `${DOMAIN}/en/ae/${city}/${category}/${slug}`,
        'x-default': `${DOMAIN}/en/pk/${city}/${category}/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Baseera',
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'profile',
      images: [
        {
          url: provider.avatar_url,
          width: 800,
          height: 800,
          alt: provider.name,
        },
      ],
    },
  };
}

export default async function ProviderProfilePage({ params }: ProviderPageProps) {
  const { lang, country, city, category, slug } = await params;
  const dict = await getDictionary(lang);
  const provider = await getProviderBySlug(city, category, slug);

  if (!provider) {
    notFound();
  }

  const catObj = getCategoryBySlug(category);
  const categoryName = catObj ? catObj.name : category;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const countryName = country.toUpperCase() === 'PK' ? 'Pakistan' : country.toUpperCase() === 'AE' ? 'UAE' : country.toUpperCase();

  // Structured Data: Schema.org LocalBusiness JSON-LD
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: provider.name,
    image: provider.avatar_url,
    telephone: provider.whatsapp_number,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: provider.district,
      addressCountry: country.toUpperCase(),
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 24.8607,
      longitude: 67.0011,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: provider.rating,
      reviewCount: provider.review_count,
    },
    url: `${DOMAIN}/${lang}/${country}/${city}/${category}/${slug}`,
  };

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum ${provider.name}, I found your verified profile on Baseera (${cityName}). I need electrical/repair assistance.`
  );

  // Gallery photos
  const galleryPhotos = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDh_sRw3hmV3-7S4eNUd-jVO6bSyp0hVjmvJnXG1oQgcAzN4VP_eIJmZkl_MPu4cn6bdK2L8vqRh-o3t5WJiZO5TxWY_sqrtZ3IEN0Z--_cgbhxjNDSjvWO-GU0eiTs0MbgHl_RKimCrBYqcVeAFD5itfUXN0BPc3h_RqJ7QxAG6T4a8tmK_zj2jjST6iDrmQLd7bRv5r8IvN6HyGLW7O7OZgikD5SLl5PGm5qg8hoKu1pyQ2C9_2vX',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC2l4P0wqkni4JXap4ad5Xf4HBbfy1jyDHX3FUdMUrFo0396vlt_xfNg48P99hWFZE-TfWOW8xbOZ9wTZBmkBIz6h6b3dlmcr_B_dxRSiddrF71x29Ia7h2L7mo-1vBv2CzpQwSr_h5VXoM-AFpvpuUudH-fkzbk01Jf_tEy8wB3_C_mYqB23LbrEJlKaJ_qIeVMnySPeESilDDoyKX3XwKFzWuhJSG2QGH2NRvAqye0WBFQ9LEBL63',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuACSlVNm3bhLWBv4knbPMshpC0z6XDbCFHO9owIwla9r13zDyShNaVeE-6_SV5oOIus3Cv-E8e4_PrNq7vOIzw5rUB0yeL5janUJd5hf3iFGQRMuB87CEt72e-FOdn_hVetda96_-HFtpknnr2Yh5m7-rlh9txcmU0X8cZjac4KfWkX0iTyq-5PMDqRBsFBGaEWN-UO3g3JU71qGhooDGtBY6u8-NHtsoNyy7x53jqBr-HLdaitF7Jv',
  ];

  // Specific specializations for provider
  const specializations = provider.category_id === 'plumbing' ? [
    { title: 'Underground Leakage Detection', desc: 'Acoustic pipeline acoustic testing, concealed wall seepage tracing and thermal camera inspection.' },
    { title: 'Submersible Water Motor Installation', desc: 'Boring deep-well motor lowering, magnetic float switch and automatic tank control setup.' },
    { title: 'PPRC & UPVC Sanitary Piping', desc: 'High-pressure heat-fusion hot/cold water pipeline fittings and bathroom sanitary remodeling.' },
    { title: 'Gas & Electric Geyser Installation', desc: 'Safe exhaust ventilation, non-return safety valve fitting and pressure pump calibration.' },
  ] : [
    { title: 'Wiring & Premise Rewiring', desc: 'Concealed cabling, copper load distribution, and full-premise residential rewiring.' },
    { title: 'Inverter & Generator Transfer Switches', desc: 'Automatic (ATS) and manual changeover panels for solar, UPS, and generators.' },
    { title: 'Circuit Breaker Tripping Diagnosis', desc: 'Earthing testing, short-circuit localization, and main DB panel load balancing.' },
    { title: 'Ceiling Fan & Heavy Fixture Fitting', desc: 'Secure anchor point ceiling brackets, heavy chandelier suspension, and dimmer setups.' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      <div className="bg-[#f9f9ff] min-h-screen text-[#141b2b]">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-16">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center text-xs font-medium text-gray-500 gap-1.5 overflow-x-auto whitespace-nowrap py-2 mb-2">
            <Link href={`/${lang}/pk/karachi`} className="hover:text-emerald-700 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <Link href={`/${lang}/${country}/${city}`} className="hover:text-emerald-700 transition-colors">
              {cityName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <Link href={`/${lang}/${country}/${city}/${category}`} className="hover:text-emerald-700 transition-colors">
              {categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <span className="text-[#006948] font-bold truncate max-w-[200px]">{provider.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            
            {/* Left 2-Columns: Original Provider Profile Content */}
            <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
              
              {/* 1. Top Gallery Carousel */}
              <section className="relative w-full bg-gray-100 overflow-hidden">
                <div className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar">
                  {galleryPhotos.map((photoUrl, idx) => (
                    <div key={idx} className="min-w-full snap-start relative aspect-[16/9]">
                      <img
                        alt={`Work sample ${idx + 1}`}
                        className="w-full h-full object-cover"
                        src={photoUrl}
                      />
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-semibold">
                        {idx + 1} / {galleryPhotos.length}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2. Profile Identity Section with Overlapping Avatar */}
              <section className="px-6 pt-3 pb-5 bg-white">
                <div className="flex items-start justify-between">
                  <div className="relative -mt-12 mb-2">
                    <div className="w-24 h-24 rounded-full p-1 bg-white shadow-md">
                      <img
                        alt={provider.name}
                        className="w-full h-full rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA84TvpKa_OrpS-BmIb4qthfCfN90ePqFFE1w3zZ1W1t0QnCDE01ml3JvyvWooDh3UeVYxH1zJrpixrUq7VK41FnMwB4a3wKAnb4y_XIl5SXCd463My2u_Ai2RbIVoLrxNQf_7bmcpESeI7zTERnyNGBfKMLwoxwEq48LOPm9fevQtc_gTZm77hqmbz8m2swCu1dC5-LKhe7KnSfZBv0pvKTS4LQBmPiXCFDDo1iw5tBxTxbrbNqwjw"
                      />
                    </div>
                    <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#00855d] flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </span>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full text-[#006948] text-xs font-semibold border border-emerald-100">
                      <ShieldCheck className="w-4 h-4 text-[#006948]" />
                      ID Verified
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100/70 px-2.5 py-1 rounded-full text-[#006948] text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
                      Available
                    </span>
                  </div>
                </div>

                {/* Name, Trade, Rating */}
                <div className="mt-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                    {provider.name}
                  </h1>
                  <p className="text-sm font-semibold text-gray-600 mt-0.5">
                    {provider.trade_title}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1 font-bold text-gray-900">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span>{provider.rating.toFixed(1)}</span>
                      <span className="text-gray-500 font-normal">({provider.review_count} reviews)</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>12+ Years Experience</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                    {provider.short_bio}
                  </p>
                </div>
              </section>

              <div className="h-[1px] w-full bg-gray-100"></div>

              {/* 3. Original 3 Trust Highlights */}
              <section className="px-6 py-4 grid grid-cols-3 gap-3 bg-gray-50/60">
                <div className="bg-white p-3 rounded-xl flex flex-col items-center text-center border border-gray-100 shadow-2xs">
                  <Zap className="w-5 h-5 text-[#006948] mb-1" />
                  <span className="text-xs font-bold text-gray-900">3-Phase Ready</span>
                  <span className="text-[11px] text-gray-500">Certified Specialist</span>
                </div>
                <div className="bg-white p-3 rounded-xl flex flex-col items-center text-center border border-gray-100 shadow-2xs">
                  <Clock className="w-5 h-5 text-[#006948] mb-1" />
                  <span className="text-xs font-bold text-gray-900">Quick Response</span>
                  <span className="text-[11px] text-gray-500">Within 45 mins</span>
                </div>
                <div className="bg-white p-3 rounded-xl flex flex-col items-center text-center border border-gray-100 shadow-2xs">
                  <BadgeCheck className="w-5 h-5 text-[#006948] mb-1" />
                  <span className="text-xs font-bold text-gray-900">Work Guarantee</span>
                  <span className="text-[11px] text-gray-500">Clean Handover</span>
                </div>
              </section>

              <div className="h-[1px] w-full bg-gray-100"></div>

              {/* 4. Core Specializations Section */}
              <section className="px-6 py-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900">Core Specializations</h2>
                  <span className="text-xs text-[#006948] font-bold">Residential & Commercial</span>
                </div>
                <div className="flex flex-col gap-3">
                  {specializations.map((spec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                      <CheckCircle2 className="w-5 h-5 text-[#006948] shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{spec.title}</h3>
                        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{spec.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="h-[1px] w-full bg-gray-100"></div>

              {/* 5. Service Coverage Area */}
              <section className="px-6 py-5 bg-white">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-4 h-4 text-[#006948]" />
                  <h2 className="text-base font-bold text-gray-900">Service Coverage Area</h2>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Available for emergency callouts and planned audits across:
                </p>
                <div className="flex flex-wrap gap-2">
                  {provider.service_area.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </section>

              {/* 6. Neighborhood Map Preview Banner */}
              <section className="px-6 pb-6 bg-white">
                <div
                  className="w-full h-32 rounded-xl bg-cover bg-center overflow-hidden relative flex items-center justify-center border border-gray-200"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA6PwUZCUmp6D6HbkjRk_D89vQQN-zkP1-5eaEx1uTcxIoKVdonmphricwLTpKMeqyFiQZ2kqs9OCisWzawiaoznMynyfRCNg-zATU7snVoBUjELS7nyNYSy95LN2exsgj3B_qUU_a_IJ5GAHOll-TYQEcHA6CVPysq1OC6s0ZsyvcOdmmfA9ieOhV05VV-Iwyk87pCsXMpp8R6mXZxip84dSreNiDTh8uwCyPhXcfakjNsPikfliNI')`,
                  }}
                >
                  <div className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2 text-gray-900 shadow-sm border border-gray-200 text-xs font-bold">
                    <MapPin className="w-4 h-4 text-[#006948]" />
                    <span>{cityName} Coverage Area</span>
                  </div>
                </div>
              </section>

              {/* 7. Customer Reviews Section */}
              <section className="px-6 py-6 bg-white border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Customer Reviews</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="font-bold text-xs text-gray-900">4.9</span>
                      <span className="text-xs text-gray-400">({provider.review_count} verified ratings)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900">Saad Ahmed (PECHS Block 2)</span>
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                        Verified Job
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Tariq bhai arrived within 25 minutes during a midnight phase trip. Fixed our main breaker safely with proper diagnostic tools. Highly recommended for Karachi residents.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900">Dr. Arshad (DHA Phase 5)</span>
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                        Verified Job
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Very professional, clean installation for our hybrid solar load distribution. Transparent pricing without any hidden charges.
                    </p>
                  </div>
                </div>
              </section>

            </div>

            {/* Right 1-Column: Sticky Booking & WhatsApp Box (Desktop) */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-md flex flex-col gap-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-semibold">
                      Standard Inspection
                    </span>
                    <span className="text-xl text-[#006948] font-black">
                      Rs. {provider.starting_price} - 1,200
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#006948] px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
                    Available Today
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-[#006948] shrink-0" />
                    <span>Karachi Verified ID & Police Clearance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#006948] shrink-0" />
                    <span>Covers {provider.service_area.slice(0, 3).join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#006948] shrink-0" />
                    <span>Average 25 - 45 min arrival for emergencies</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <a
                    href={`https://wa.me/${provider.whatsapp_number.replace(/\+/g, '')}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white transition-all rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm shadow-sm"
                  >
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                    <span>Direct WhatsApp Inquiry</span>
                  </a>

                  <a
                    href={`tel:${provider.whatsapp_number}`}
                    className="w-full h-11 border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-colors"
                  >
                    <Phone className="w-4 h-4 text-gray-700" />
                    <span>Call Direct ({provider.whatsapp_number})</span>
                  </a>
                </div>

                <p className="text-[11px] text-gray-400 text-center leading-normal">
                  Zero intermediary fee. 100% direct deal between customer & specialist.
                </p>
              </div>
            </aside>

          </div>
        </main>

        {/* Sticky Bottom Conversion Bar (Mobile Only) */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <a
              href={`https://wa.me/${provider.whatsapp_number.replace(/\+/g, '')}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 bg-[#25D366] active:bg-[#20ba59] text-white transition-all rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm shadow-md"
            >
              <WhatsAppIcon className="w-5 h-5 text-white" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </>
  );
}
