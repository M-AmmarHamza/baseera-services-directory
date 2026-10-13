'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  lang: string;
}

export default function BottomNav({ lang }: Props) {
  const pathname = usePathname();

  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const isSearch = pathname.includes('/search') || pathname.includes('/electrician') || pathname.includes('/plumbing');

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] md:hidden">
      <div className="flex justify-around items-center h-16 max-w-[480px] mx-auto px-2">
        <Link
          href={`/${lang}`}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isHome ? 'text-[#006948] font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-5 h-5" fill={isHome ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[11px] mt-1">Home</span>
        </Link>

        <Link
          href={`/${lang}/pk/karachi/electrician`}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isSearch ? 'text-[#006948] font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[11px] mt-1">Search</span>
        </Link>

        <Link
          href={`/${lang}#global-directories`}
          className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[11px] mt-1">Worldwide</span>
        </Link>

        <Link
          href={`/${lang}/join`}
          className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-[#006948] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[11px] mt-1">Vendors</span>
        </Link>
      </div>
    </nav>
  );
}
