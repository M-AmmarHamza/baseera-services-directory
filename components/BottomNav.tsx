'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bookmark, User } from 'lucide-react';

interface Props {
  lang: string;
}

export default function BottomNav({ lang }: Props) {
  const pathname = usePathname();

  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const isSearch = pathname.includes('/search') || pathname.includes('/vendors');
  const isSaved = pathname.includes('/saved');
  const isProfile = pathname.includes('/join') || pathname.includes('/profile');

  const navItems = [
    {
      label: 'Home',
      href: `/${lang}`,
      icon: Home,
      isActive: isHome,
    },
    {
      label: 'Search',
      href: `/${lang}/vendors`,
      icon: Search,
      isActive: isSearch,
    },
    {
      label: 'Saved',
      href: `/${lang}/saved`,
      icon: Bookmark,
      isActive: isSaved,
    },
    {
      label: 'Profile',
      href: `/${lang}/join`,
      icon: User,
      isActive: isProfile,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200/90 md:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-lg">
      <div className="flex justify-around items-center h-14 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                item.isActive ? 'text-[#059669] font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.8]'} transition-transform`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
