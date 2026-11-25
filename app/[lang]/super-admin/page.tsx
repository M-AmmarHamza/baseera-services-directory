'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Users,
  Clock,
  Sparkles,
  Eye,
  MessageSquare,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Plus,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Globe2,
  Activity,
  Layers,
  MapPin,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/Icons';

interface KpiStats {
  totalProviders: number;
  pendingApprovals: number;
  publishedProviders: number;
  suspendedProviders: number;
  premiumProviders: number;
  featuredProviders: number;
  verifiedProviders: number;
  indexedProviders: number;
  totalProfileViews: number;
  totalWhatsappClicks: number;
}

interface Ga4Data {
  propertyId: string;
  status: string;
  activeUsersRealtime: number;
  pageviewsLast28Days: number;
  whatsappConversionRate: string;
  bounceRate: string;
  topTrafficCities: Array<{ city: string; country: string; share: number; sessions: number }>;
}

interface AuditLog {
  id: string;
  adminId: string;
  adminEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  createdAt: string;
}

export default function SuperAdminOverviewPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const [isDenied, setIsDenied] = useState(false);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<KpiStats>({
    totalProviders: 0,
    pendingApprovals: 0,
    publishedProviders: 0,
    suspendedProviders: 0,
    premiumProviders: 0,
    featuredProviders: 0,
    verifiedProviders: 0,
    indexedProviders: 0,
    totalProfileViews: 0,
    totalWhatsappClicks: 0,
  });
  const [ga4, setGa4] = useState<Ga4Data | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.kpis) setStats(data.kpis);
        if (data.ga4) setGa4(data.ga4);
        if (data.recentLogs) setRecentLogs(data.recentLogs);
      }
    } catch (err) {
      console.error('Failed to load super admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search);
      if (q.get('denied') === 'super_admin_only') {
        setIsDenied(true);
      }
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Super Admin Privileges Required Alert */}
      {isDenied && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between shadow-lg shadow-rose-950/40 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-xs">Access Restricted: Super Admin Only</p>
              <p className="text-[11px] text-rose-300 mt-0.5">
                The section you attempted to access (SEO, Ads, or Staff) requires full Super Admin privileges. Moderator accounts have operational access to Providers, Categories, Locations, and FAQs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Overview
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Production
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Global directory health, provider onboarding KPIs, and traffic acquisition telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>

          <Link
            href={`/${lang}/super-admin/providers`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Providers</span>
          </Link>
        </div>
      </div>

      {/* 5 Core Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Providers */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Providers
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white tracking-tight">
              {stats.totalProviders.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">{stats.publishedProviders} active</span>
              <span>•</span>
              <span className="text-rose-400">{stats.suspendedProviders} suspended</span>
            </div>
          </div>
        </div>

        {/* 2. Pending Approvals */}
        <Link
          href={`/${lang}/super-admin/providers?status=pending`}
          className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 hover:border-amber-500/50 transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-amber-400 tracking-tight">
              {stats.pendingApprovals}
            </div>
            <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
              <span>Requires moderator triage</span>
              <ArrowUpRight className="w-3 h-3 text-amber-400" />
            </p>
          </div>
        </Link>

        {/* 3. Premium Providers */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Premium Tier
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white tracking-tight">
              {stats.premiumProviders}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              <span className="text-purple-400 font-semibold">{stats.featuredProviders} featured</span> on city hubs
            </p>
          </div>
        </div>

        {/* 4. Total Profile Views */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Profile Views
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white tracking-tight">
              {stats.totalProfileViews.toLocaleString()}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Verified organic impressions</p>
          </div>
        </div>

        {/* 5. Total WhatsApp Clicks */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              WhatsApp Leads
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <WhatsAppIcon className="w-4 h-4 fill-emerald-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              {stats.totalWhatsappClicks.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct customer inquiries</span>
            </div>
          </div>
        </div>
      </div>

      {/* GA4 Analytics Widget Placeholder & City Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GA4 Widget Main Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Google Analytics 4 Telemetry
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {ga4?.status || 'Active Stream'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Measurement ID: <span className="font-mono text-slate-300">{ga4?.propertyId}</span>
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Activity className="w-3 h-3 animate-pulse" />
              {ga4?.activeUsersRealtime || 18} users online now
            </span>
          </div>

          {/* Sub KPI Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                28-Day Pageviews
              </span>
              <span className="text-xl font-bold text-white mt-1 block">
                {ga4?.pageviewsLast28Days.toLocaleString() || '14,850'}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5 mt-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> +14.2% vs prev
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Lead Conversion
              </span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">
                {ga4?.whatsappConversionRate || '18.4%'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">View to WhatsApp</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Avg Bounce Rate
              </span>
              <span className="text-xl font-bold text-white mt-1 block">
                {ga4?.bounceRate || '34.8%'}
              </span>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">High intent retention</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Search Engine Indexed
              </span>
              <span className="text-xl font-bold text-blue-400 mt-1 block">
                {stats.indexedProviders}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Profiles in sitemap</span>
            </div>
          </div>

          {/* Top Traffic Cities */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Geographic Traffic Concentration
            </h3>
            <div className="space-y-3">
              {(ga4?.topTrafficCities || []).map((item) => (
                <div key={item.city} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">
                      {item.city}, {item.country}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {item.sessions.toLocaleString()} sessions ({item.share}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Launch & Platform Shortcuts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Administrative Actions
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Direct access to directory configuration and provider lifecycle.
            </p>

            <div className="mt-4 space-y-2.5">
              <Link
                href={`/${lang}/super-admin/providers`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white group-hover:text-emerald-300">
                      Create New Provider
                    </p>
                    <p className="text-[11px] text-slate-400">Full 15-field profile registration</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
              </Link>

              <Link
                href={`/${lang}/super-admin/providers`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white group-hover:text-blue-300">
                      Bulk CSV Import
                    </p>
                    <p className="text-[11px] text-slate-400">Batch ingest with auto public IDs</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
              </Link>

              <Link
                href={`/${lang}/super-admin/staff-logs`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white group-hover:text-purple-300">
                      Audit Trail & Logs
                    </p>
                    <p className="text-[11px] text-slate-400">Review all administrative mutations</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Directory Architecture</span>
              <span className="font-mono text-emerald-400">Baseera v2.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Audit Activity Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Recent Administrative Activity
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit records of all provider modifications, toggles, and bulk operations.
            </p>
          </div>
          <Link
            href={`/${lang}/super-admin/staff-logs`}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View Full Trail</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No audit records recorded yet in this session.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 mt-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-slate-300 font-bold text-[10px]">
                    {log.action.includes('DELETE') ? '🗑️' : log.action.includes('CREATE') ? '➕' : '✏️'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-200 truncate">
                      <span className="text-emerald-400">{log.action}</span>
                      <span className="text-slate-400 font-normal"> on {log.entityType}</span>{' '}
                      <span className="text-slate-300 font-mono text-[11px]">#{log.entityId.slice(0, 8)}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Admin: <span className="text-slate-300">{log.adminEmail || log.adminId}</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-[11px] text-slate-400 font-mono">
                  {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
