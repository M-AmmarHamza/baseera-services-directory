'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Layers,
  MapPin,
  HelpCircle,
  DollarSign,
  Compass,
  FileText,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'en';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        console.warn('Failed to load admin user session:', err);
      }
    }
    loadUser();
  }, []);

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

  const navItems = [
    {
      title: 'Overview',
      href: `/${lang}/super-admin`,
      icon: LayoutDashboard,
      exact: true,
      phase: 1,
    },
    {
      title: 'Providers',
      href: `/${lang}/super-admin/providers`,
      icon: Users,
      exact: false,
      phase: 1,
    },
    {
      title: 'Categories',
      href: `/${lang}/super-admin/categories`,
      icon: Layers,
      exact: false,
      phase: 2,
    },
    {
      title: 'Locations',
      href: `/${lang}/super-admin/locations`,
      icon: MapPin,
      exact: false,
      phase: 2,
    },
    {
      title: 'FAQs',
      href: `/${lang}/super-admin/faqs`,
      icon: HelpCircle,
      exact: false,
      phase: 2,
    },
    {
      title: 'Ads & Pricing',
      href: `/${lang}/super-admin/ads`,
      aliasHref: `/${lang}/super-admin/ads-pricing`,
      icon: DollarSign,
      exact: false,
      phase: 3,
      restricted: true,
    },
    {
      title: 'SEO & Redirects',
      href: `/${lang}/super-admin/seo`,
      aliasHref: `/${lang}/super-admin/seo-redirects`,
      icon: Compass,
      exact: false,
      phase: 3,
      restricted: true,
    },
    {
      title: 'Staff & Logs',
      href: `/${lang}/super-admin/staff`,
      aliasHref: `/${lang}/super-admin/staff-logs`,
      icon: FileText,
      exact: false,
      phase: 3,
      restricted: true,
    },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return (
      pathname?.startsWith(item.href) ||
      (item.aliasHref && pathname?.startsWith(item.aliasHref))
    );
  };

  const role = currentUser?.role?.toUpperCase() || 'SUPER_ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-emerald-500 selection:text-white">
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">Baseera</span>
            <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase block -mt-0.5">
              Super Admin
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:w-64 lg:w-72 shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-800 px-6 flex items-center justify-between">
          <Link
            href={`/${lang}/super-admin`}
            className="flex items-center gap-3 group focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                Baseera
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ROOT
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">
                Super Admin Panel
              </p>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity / Role Pill */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-emerald-400">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {currentUser?.email || 'admin@baseera.com'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center px-1.5 py-0.2 text-[10px] font-bold rounded uppercase tracking-wider ${
                    isSuperAdmin
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <Shield className="w-2.5 h-2.5 mr-1" />
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Control Center
          </div>

          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>
                {item.restricted && !isSuperAdmin ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    Root
                  </span>
                ) : active ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/40">
          <Link
            href={`/${lang}`}
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-800"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Directory</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>{isLoggingOut ? 'Logging out...' : 'Sign Out Session'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen bg-slate-950">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
