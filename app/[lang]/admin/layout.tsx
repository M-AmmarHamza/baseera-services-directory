'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Layers,
  BarChart3,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Globe,
  Sparkles,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'en';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If on login route, bypass admin shell sidebar
  const isLoginPage = pathname?.includes('/admin/login');
  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    {
      title: 'Overview',
      href: `/${lang}/admin`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Providers',
      href: `/${lang}/admin/providers`,
      icon: Users,
      exact: false,
    },
    {
      title: 'Locations',
      href: `/${lang}/admin/locations`,
      icon: MapPin,
      exact: false,
    },
    {
      title: 'Categories',
      href: `/${lang}/admin/categories`,
      icon: Layers,
      exact: false,
    },
    {
      title: 'Analytics',
      href: `/${lang}/admin/analytics`,
      icon: BarChart3,
      exact: false,
    },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push(`/${lang}/admin/login`);
      router.refresh();
    } catch {
      router.push(`/${lang}/admin/login`);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname?.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href={`/${lang}/admin`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#006948] text-white flex items-center justify-center font-bold text-sm">
            ب
          </div>
          <span className="font-extrabold text-base tracking-tight text-neutral-900">
            Baseera<span className="text-[#006948]">.Admin</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 start-0 z-40 w-64 bg-white border-e border-gray-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-gray-100 hidden md:flex items-center justify-between">
            <Link href={`/${lang}/admin`} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#006948] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                ب
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-neutral-900 block leading-tight">
                  Baseera<span className="text-[#006948]">.Admin</span>
                </span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  Operations Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Core Management
            </div>
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#006948] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-500'}`} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Session Info & Logout */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          {/* Public Site Link */}
          <Link
            href={`/${lang}`}
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-[#006948] hover:bg-emerald-50/70 border border-gray-200/80 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#006948]" />
              <span>Public Directory</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>

          {/* Current Admin User Badge */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-200/70 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-xs shrink-0">
              A
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-gray-900 truncate block">
                Super Admin
              </span>
              <span className="text-[11px] text-gray-400 truncate block">
                admin@baseera.com
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-gray-500" />
            <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 md:ms-64 min-w-0">
        {/* Top Header Bar for Desktop */}
        <header className="bg-white border-b border-gray-200/80 px-6 py-3.5 hidden md:flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3 text-gray-400 rtl:rotate-180" />
            <span className="text-gray-900 font-semibold capitalize">
              {pathname?.split('/').pop() || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#006948] border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse" />
              <span>Production Live</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 text-xs font-bold text-gray-600">
              <Link
                href={`/en${pathname.replace(/^\/(en|ur|ar)/, '')}`}
                className={`px-2 py-1 rounded-md transition-all ${lang === 'en' ? 'bg-white shadow-2xs text-[#006948]' : 'hover:text-gray-900'}`}
              >
                EN
              </Link>
              <Link
                href={`/ur${pathname.replace(/^\/(en|ur|ar)/, '')}`}
                className={`px-2 py-1 rounded-md transition-all ${lang === 'ur' ? 'bg-white shadow-2xs text-[#006948]' : 'hover:text-gray-900'}`}
              >
                اردو
              </Link>
              <Link
                href={`/ar${pathname.replace(/^\/(en|ur|ar)/, '')}`}
                className={`px-2 py-1 rounded-md transition-all ${lang === 'ar' ? 'bg-white shadow-2xs text-[#006948]' : 'hover:text-gray-900'}`}
              >
                العربية
              </Link>
            </div>
          </div>
        </header>

        {/* Sub-view Page Body */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
