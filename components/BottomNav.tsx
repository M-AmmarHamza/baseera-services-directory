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
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                item.isActive ? 'text-[#059669] font-medium' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
