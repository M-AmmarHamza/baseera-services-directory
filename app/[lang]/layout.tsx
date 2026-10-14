import '../globals.css';
import React from 'react';
import Link from 'next/link';
import { getDictionary } from '@/lib/get-dictionary';
import { Plus } from 'lucide-react';
import CitySelector from '@/components/CitySelector';
import BottomNav from '@/components/BottomNav';

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
    <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </head>
      <body className="bg-[#f9f9ff] text-[#141b2b] min-h-screen flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {/* Global Desktop & Mobile Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
            
            {/* Logo & Locality */}
            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              <Link href={`/${lang}`} className="flex items-center gap-2.5 group shrink-0">
                {/* Modern Crisp Geometric SVG Brand Icon (Zero broken image, instant retina load) */}
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
                    Baseera
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold tracking-widest uppercase mt-0.5">
                    Directory
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
                Home
              </Link>
              <Link
                href={`/${lang}/vendors`}
                className="text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors"
              >
                Find Services
              </Link>
              <Link
                href={`/${lang}/blog`}
                className="text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors"
              >
                Blog
              </Link>
            </nav>

            {/* Language & Action Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Language Switcher Pill */}
              <div className="flex items-center bg-gray-100/90 border border-gray-200/80 p-0.5 rounded-full text-xs font-semibold">
                <Link
                  href="/en"
                  className={`px-2 sm:px-2.5 py-1 rounded-full text-xs transition-all ${
                    lang === 'en'
                      ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  EN
                </Link>
                <Link
                  href="/ur"
                  className={`px-2 sm:px-2.5 py-1 rounded-full text-xs transition-all ${
                    lang === 'ur'
                      ? 'bg-white text-emerald-800 font-bold shadow-2xs font-urdu'
                      : 'text-gray-500 hover:text-gray-900 font-urdu'
                  }`}
                >
                  اردو
                </Link>
                <Link
                  href="/ar"
                  className={`px-2 sm:px-2.5 py-1 rounded-full text-xs transition-all ${
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
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#059669] hover:bg-[#047857] text-white px-3 sm:px-4 py-2 rounded-full transition-all active:scale-95 shadow-2xs hover:shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="whitespace-nowrap hidden sm:inline">List Service</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full">{children}</main>

        {/* Global Footer with Tagline, Legal Pages & Cross-Region Hreflang Links */}
        <footer className="bg-white border-t border-gray-200 pt-10 pb-20 md:pb-10 mt-16 font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top row: Brand & Tagline + Institutional Legal Pages */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
              {/* Brand & Tagline */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="font-extrabold text-neutral-900 tracking-tight">Baseera</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600 font-medium">
                  Zero intermediary commission. 100% direct connection.
                </span>
              </div>

              {/* Legal & Directory Links */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-500">
                <Link href={`/${lang}/about`} className="hover:text-emerald-700 transition-colors">
                  About Us
                </Link>
                <Link href={`/${lang}/privacy`} className="hover:text-emerald-700 transition-colors">
                  Privacy Policy
                </Link>
                <Link href={`/${lang}/terms`} className="hover:text-emerald-700 transition-colors">
                  Terms &amp; Conditions
                </Link>
                <Link href={`/${lang}/join`} className="hover:text-emerald-700 font-semibold text-[#059669] transition-colors">
                  + List Service
                </Link>
              </div>
            </div>

            {/* Bottom row: Global Hubs & Copyright */}
            <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-gray-400">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-gray-500">Global Hubs:</span>
                <Link href={`/${lang}/pk/karachi`} className="hover:text-emerald-700 transition-colors">
                  Karachi (PK)
                </Link>
                <Link href={`/${lang}/pk/lahore`} className="hover:text-emerald-700 transition-colors">
                  Lahore (PK)
                </Link>
                <Link href={`/${lang}/pk/islamabad`} className="hover:text-emerald-700 transition-colors">
                  Islamabad (PK)
                </Link>
                <Link href={`/${lang}/ae/dubai`} className="hover:text-emerald-700 transition-colors">
                  Dubai (AE)
                </Link>
                <Link href={`/${lang}/sa/riyadh`} className="hover:text-emerald-700 transition-colors">
                  Riyadh (SA)
                </Link>
              </div>

              <div>
                &copy; {new Date().getFullYear()} Baseera Local Services Directory. All rights reserved.
              </div>
            </div>
          </div>
        </footer>

        {/* Persistent Mobile Bottom Navigation Bar (Legacy Fidelity) */}
        <BottomNav lang={lang} />
      </body>
    </html>
  );
}
