import '../globals.css';
import React from 'react';
import Link from 'next/link';
import { getDictionary } from '@/lib/get-dictionary';
import { Plus } from 'lucide-react';
import CitySelector from '@/components/CitySelector';
import BottomNav from '@/components/BottomNav';
import { tajawal, inter } from '@/app/fonts';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ur' }, { lang: 'ar' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'en';
  const isRTL = lang === 'ur' || lang === 'ar';
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'} className={`${tajawal.variable} ${inter.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </head>
      <body className={`${isRTL ? 'font-tajawal' : 'font-sans'} bg-[#f9f9ff] text-[#141b2b] min-h-screen flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900`}>
        {/* Global Desktop & Mobile Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-2xs">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Logo & Locality */}
            <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
              <Link href={`/${lang}`} className="flex items-center gap-2 group shrink-0">
                {/* Modern Crisp Geometric SVG Brand Icon */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                  </svg>
                </div>

                <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-base sm:text-lg text-gray-900 tracking-tight">
                    {dict.header?.brandName || 'Baseera'}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold tracking-widest uppercase mt-0.5 hidden xs:inline">
                    {dict.header?.directory || 'Directory'}
                  </span>
                </div>
              </Link>

              {/* Dynamic Global City & Country Selector */}
              <CitySelector lang={lang} />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={`/${lang}`}
                className="text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors"
              >
                {dict.header?.home || 'Home'}
              </Link>
              <Link
                href={`/${lang}/vendors`}
                className="text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors"
              >
                {dict.header?.findServices || 'Find Services'}
              </Link>
              <Link
                href={`/${lang}/blog`}
                className="text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors"
              >
                {dict.header?.blog || 'Blog'}
              </Link>
            </nav>

            {/* Language & Action Button */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Language Switcher Pill */}
              <div className="flex items-center bg-gray-100/90 border border-gray-200/80 p-0.5 rounded-full text-[11px] sm:text-xs font-semibold">
                <Link
                  href="/en"
                  className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all ${
                    lang === 'en'
                      ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  EN
                </Link>
                <Link
                  href="/ur"
                  className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all ${
                    lang === 'ur'
                      ? 'bg-white text-emerald-800 font-bold shadow-2xs font-urdu'
                      : 'text-gray-500 hover:text-gray-900 font-urdu'
                  }`}
                >
                  اردو
                </Link>
                <Link
                  href="/ar"
                  className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all ${
                    lang === 'ar'
                      ? 'bg-white text-emerald-800 font-bold shadow-2xs font-arabic'
                      : 'text-gray-500 hover:text-gray-900 font-arabic'
                  }`}
                >
                  العربية
                </Link>
              </div>

              {/* Prominent List Your Service Action Button */}
              <Link
                href={`/${lang}/join`}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-[#059669] hover:bg-[#047857] text-white p-2 sm:px-4 sm:py-2 rounded-full transition-all active:scale-95 shadow-2xs hover:shadow-xs"
                title={dict.header?.listService || 'List Service'}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="whitespace-nowrap hidden sm:inline">{dict.header?.listService || 'List Service'}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full">{children}</main>

        {/* Global Professional Unified Footer */}
        <footer className="bg-white border-t border-gray-200/90 pt-12 pb-24 md:pb-12 mt-20 text-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-10 border-b border-gray-100">
              {/* Brand & Mission Column (2 cols wide on desktop) */}
              <div className="sm:col-span-2 space-y-3">
                <Link href={`/${lang}`} className="inline-flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                    <svg
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-extrabold text-base text-gray-900 tracking-tight">
                      {dict.header?.brandName || 'Baseera'}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold tracking-widest uppercase mt-0.5">
                      {dict.header?.directory || 'Directory'}
                    </span>
                  </div>
                </Link>

                <p className="text-xs sm:text-sm font-semibold text-neutral-900">
                  {dict.footer?.tagline || 'Zero intermediary commission. 100% direct connection.'}
                </p>

                <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                  {dict.footer?.aboutDesc || 'Connecting verified local specialists and households with direct WhatsApp communication and zero platform markups.'}
                </p>

                <div className="pt-1">
                  <Link
                    href={`/${lang}/join`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#059669] hover:bg-[#047857] text-white px-3.5 py-1.5 rounded-full transition-all shadow-2xs"
                  >
                    <span>{dict.footer?.listServiceBtn || '+ List Your Service'}</span>
                  </Link>
                </div>
              </div>

              {/* Column 2: Directory */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {dict.footer?.colDirectory || 'Directory'}
                </h3>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li>
                    <Link href={`/${lang}`} className="hover:text-emerald-700 transition-colors">
                      {dict.footer?.home || 'Home'}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/vendors`} className="hover:text-emerald-700 transition-colors">
                      {dict.footer?.findSpecialists || 'Find Specialists'}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/blog`} className="hover:text-emerald-700 transition-colors">
                      {dict.footer?.guides || 'Guides & Articles'}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/join`} className="hover:text-emerald-700 transition-colors">
                      {dict.footer?.providerRegistration || 'Provider Registration'}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Company & Legal */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {dict.footer?.colCompany || 'Company & Legal'}
                </h3>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li>
                    <Link href={`/${lang}/about`} className="hover:text-emerald-700 transition-colors">
                      {dict.footer?.aboutUs || 'About Us'}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/privacy`} className="hover:text-emerald-700 transition-colors">
                      {dict.footer?.privacyPolicy || 'Privacy Policy'}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/terms`} className="hover:text-emerald-700 transition-colors">
                      {dict.footer?.terms || 'Terms & Conditions'}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Top Cities */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {dict.footer?.colTopCities || 'Top Cities'}
                </h3>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li>
                    <Link href={`/${lang}/pk/karachi`} className="hover:text-emerald-700 transition-colors">
                      {lang === 'ur' ? 'کراچی' : lang === 'ar' ? 'كراتشي' : 'Karachi'}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/pk/lahore`} className="hover:text-emerald-700 transition-colors">
                      {lang === 'ur' ? 'لاہور' : lang === 'ar' ? 'لاهور' : 'Lahore'}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/pk/islamabad`} className="hover:text-emerald-700 transition-colors">
                      {lang === 'ur' ? 'اسلام آباد' : lang === 'ar' ? 'إسلام آباد' : 'Islamabad'}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/ae/dubai`} className="hover:text-emerald-700 transition-colors">
                      {lang === 'ur' ? 'دبئی' : lang === 'ar' ? 'دبي' : 'Dubai'}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/sa/riyadh`} className="hover:text-emerald-700 transition-colors">
                      {lang === 'ur' ? 'ریاض' : lang === 'ar' ? 'الرياض' : 'Riyadh'}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Copyright & Single Clean Subline */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
              <p>
                &copy; {new Date().getFullYear()} {dict.footer?.copyright || 'Baseera Local Services Directory. All rights reserved.'}
              </p>
              <p className="text-[11px] text-gray-400">
                {dict.footer?.subline || 'Direct Karigar Directory • Zero Intermediary Fees'}
              </p>
            </div>
          </div>
        </footer>

        {/* Persistent Mobile Bottom Navigation Bar (Legacy Fidelity) */}
        <BottomNav lang={lang} />
      </body>
    </html>
  );
}
