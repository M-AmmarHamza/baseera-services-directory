import '../globals.css';
import React from 'react';
import Link from 'next/link';
import { getDictionary } from '@/lib/get-dictionary';

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Logo & Locality */}
            <div className="flex items-center gap-3">
              <Link href={`/${lang}/pk/karachi`} className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-[#006948] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-[#00855d] transition-colors">
                  ب
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg text-gray-950 tracking-tight leading-none">
                    {dict.common.brand}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
                    {dict.common.tagline}
                  </span>
                </div>
              </Link>
            </div>

            {/* Language & Regional Switcher (i18n Pill) */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center bg-gray-100 p-1 rounded-full text-xs font-semibold">
                <Link
                  href="/en/pk/karachi"
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    lang === 'en' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  EN
                </Link>
                <Link
                  href="/ur/pk/karachi"
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    lang === 'ur' ? 'bg-white text-emerald-800 shadow-xs font-urdu' : 'text-gray-600 hover:text-gray-900 font-urdu'
                  }`}
                >
                  اردو
                </Link>
                <Link
                  href="/ar/ae/dubai"
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    lang === 'ar' ? 'bg-white text-emerald-800 shadow-xs font-arabic' : 'text-gray-600 hover:text-gray-900 font-arabic'
                  }`}
                >
                  العربية
                </Link>
              </div>

              {/* Vendor Studio Link */}
              <Link
                href="/provider-dashboard.html"
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
              <span className="font-bold text-gray-900">{dict.common.brand}</span>
              <span>•</span>
              <span>{dict.common.zeroCommission}</span>
            </div>

            {/* Cross-Region Links */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <Link href="/en/pk/karachi" className="hover:text-emerald-700">Karachi (PK)</Link>
              <Link href="/en/pk/lahore" className="hover:text-emerald-700">Lahore (PK)</Link>
              <Link href="/ar/ae/dubai" className="hover:text-emerald-700">Dubai (AE)</Link>
              <Link href="/en/ae/sharjah/electrician" className="hover:text-emerald-700">Sharjah (AE)</Link>
              <Link href="/ar/sa/riyadh" className="hover:text-emerald-700">Riyadh (SA)</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
