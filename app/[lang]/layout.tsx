import '../globals.css';
import React from 'react';
import Link from 'next/link';
import { getDictionary } from '@/lib/get-dictionary';
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
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
            
            {/* Logo & Locality */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <Link href={`/${lang}`} className="flex items-center gap-2.5 group shrink-0">
                <img
                  alt="Baseera Logo"
                  className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1VifhEhAnyGcIMAzyuf5f1JiVQATzvcwJzkzN2D-g0gIhjkGPPHeQREP_6GXBi6qybDjnH1LpSOIiSsTUAUXGJxnyUWu4N8xlrBq6aC66NMIaHPa5Gcghl7Cayh0drMuGxb7JnbeMzXIYNY2GAaFw7XfnX36ysQ37W_WDJ0XXRu7EXEz0YyabfgENet5RdeIkW4OGCMK00BuGwq07GuCnFh2NtO3g4vUFFUjgwvkpndlGWwfV8ALvSw_3Q"
                />
                <div className="hidden sm:flex flex-col">
                  <span className="font-extrabold text-lg text-gray-950 tracking-tight leading-none">
                    Baseera
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
                    Directory
                  </span>
                </div>
              </Link>

              {/* Dynamic Global City & Country Selector */}
              <CitySelector lang={lang} />
            </div>

            {/* Language & Regional Switcher (i18n Pill) */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center bg-gray-100 p-1 rounded-full text-xs font-semibold">
                <Link
                  href="/en"
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    lang === 'en' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  EN
                </Link>
                <Link
                  href="/ur"
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    lang === 'ur' ? 'bg-white text-emerald-800 shadow-xs font-urdu' : 'text-gray-600 hover:text-gray-900 font-urdu'
                  }`}
                >
                  اردو
                </Link>
                <Link
                  href="/ar"
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    lang === 'ar' ? 'bg-white text-emerald-800 shadow-xs font-arabic' : 'text-gray-600 hover:text-gray-900 font-arabic'
                  }`}
                >
                  العربية
                </Link>
              </div>

              {/* Vendor Studio Link */}
              <Link
                href={`/${lang}/join`}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-[#006948] px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <span>{dict.nav.vendorStudio}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full">{children}</main>

        {/* Global Footer with Cross-Region Hreflang Links */}
        <footer className="bg-white border-t border-gray-200 py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">Baseera</span>
              <span>•</span>
              <span>{dict.common.zeroCommission}</span>
            </div>

            {/* Cross-Region Links */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <span className="text-gray-400">Global Hubs:</span>
              <Link href="/en/pk/karachi" className="hover:text-emerald-700">🇵🇰 Karachi</Link>
              <Link href="/en/pk/lahore" className="hover:text-emerald-700">🇵🇰 Lahore</Link>
              <Link href="/en/ae/dubai" className="hover:text-emerald-700">🇦🇪 Dubai</Link>
              <Link href="/en/ae/sharjah/electrician" className="hover:text-emerald-700">🇦🇪 Sharjah</Link>
              <Link href="/en/sa/riyadh" className="hover:text-emerald-700">🇸🇦 Riyadh</Link>
            </div>
          </div>
        </footer>

        {/* Persistent Mobile Bottom Navigation Bar (Legacy Fidelity) */}
        <BottomNav lang={lang} />
      </body>
    </html>
  );
}
