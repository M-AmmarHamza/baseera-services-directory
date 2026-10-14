'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const pathname = usePathname() || `/${currentLang}`;

  const getLocalizedPath = (targetLang: string) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return `/${targetLang}`;
    segments[0] = targetLang;
    return `/${segments.join('/')}`;
  };

  return (
    <div className="flex items-center bg-gray-100/90 border border-gray-200/80 p-0.5 rounded-full text-xs font-semibold">
      <Link
        href={getLocalizedPath('en')}
        className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all ${
          currentLang === 'en'
            ? 'bg-white text-emerald-800 font-bold shadow-2xs'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        EN
      </Link>
      <Link
        href={getLocalizedPath('ur')}
        className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all ${
          currentLang === 'ur'
            ? 'bg-white text-emerald-800 font-bold shadow-2xs font-tajawal'
            : 'text-gray-500 hover:text-gray-900 font-tajawal'
        }`}
      >
        اردو
      </Link>
      <Link
        href={getLocalizedPath('ar')}
        className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all ${
          currentLang === 'ar'
            ? 'bg-white text-emerald-800 font-bold shadow-2xs font-tajawal'
            : 'text-gray-500 hover:text-gray-900 font-tajawal'
        }`}
      >
        العربية
      </Link>
    </div>
  );
}
